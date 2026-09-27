'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check, Clock3, LoaderCircle, ShieldCheck, Smartphone, X, Zap } from 'lucide-react'
import { getPackages, type NetworkPackage } from '@/lib/api/packages'
import { checkAdminAccess, startAdminPaymentTest, checkAdminPaymentStatus, type AdminPaymentTestResult } from '@/lib/api/client'

type Step = { label: string; state: 'pending' | 'active' | 'complete' | 'failed' }

const maskCheckout = (value?: string | null) => value ? `${value.slice(0, 5)}•••${value.slice(-4)}` : '—'
const formatMoney = (value: number) => `KSh ${value.toLocaleString('en-KE')}`

export function PaymentSandbox() {
  const [packages, setPackages] = useState<NetworkPackage[]>([])
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [phone, setPhone] = useState('')
  const [packageId, setPackageId] = useState('')
  const [payment, setPayment] = useState<AdminPaymentTestResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { checkAdminAccess().then(() => { setAuthorized(true); return getPackages() }).then(({ data }) => { setPackages(data); setPackageId(data[0]?.id ?? '') }).catch(() => setAuthorized(false)) }, [])
  useEffect(() => {
    if (!payment || payment.status !== 'PENDING') return
    const timer = window.setInterval(async () => { try { const next = await checkAdminPaymentStatus(payment.id); setPayment((current) => ({ ...current, ...next })) } catch { /* keep the waiting state; the next poll retries */ } }, 5000)
    return () => window.clearInterval(timer)
  }, [payment])

  const selected = useMemo(() => packages.find((item) => item.id === packageId), [packages, packageId])
  const steps: Step[] = [
    { label: 'Payment request created', state: payment ? 'complete' : 'pending' },
    { label: 'Courtney accepted STK request', state: payment ? 'complete' : 'pending' },
    { label: 'STK popup received on test phone', state: payment?.status === 'PENDING' ? 'active' : payment?.status === 'COMPLETED' ? 'complete' : payment?.status === 'FAILED' ? 'failed' : 'pending' },
    { label: 'Payment completed on phone', state: payment?.status === 'COMPLETED' ? 'complete' : payment?.status === 'FAILED' ? 'failed' : 'pending' },
    { label: 'Courtney callback received', state: payment?.status === 'COMPLETED' || payment?.status === 'FAILED' ? 'complete' : 'pending' },
    { label: 'Internet session created', state: payment?.sessionId ? 'complete' : 'pending' },
    { label: 'Trusted device association preserved', state: payment?.sessionId ? 'complete' : 'pending' },
    { label: 'AUTHORIZE_SESSION job created', state: payment?.routerJobCreated ? 'complete' : payment?.status === 'COMPLETED' ? 'active' : 'pending' },
    { label: 'Duplicate callback did not duplicate records', state: payment?.duplicate === true ? 'complete' : 'pending' },
  ]

  if (authorized === null) return <div className="panel empty-state"><LoaderCircle className="spin" /><h3>Checking admin access</h3><p>Payment controls are restricted to active administrators.</p></div>
  if (!authorized) return <div className="panel empty-state"><ShieldCheck /><h3>Admin access required</h3><p>Customers cannot access the Payment Sandbox.</p></div>

  const start = async () => { setError(''); setLoading(true); try { setPayment(await startAdminPaymentTest({ phone, packageId })); setConfirmOpen(false) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to initiate the payment test') } finally { setLoading(false) } }

  return <div className="page-stack">
    <div className="page-intro"><div><div className="eyebrow">ADMIN ONLY / LIVE PROVIDER TEST</div><h2>Payment Sandbox</h2><p>Use this console to test the SynthNet → Courtney → STK payment flow.</p></div><div className="admin-test-badge"><ShieldCheck /> ADMIN PAYMENT TEST</div></div>
    <div className="warning-banner"><AlertTriangle /><div><strong>This initiates an actual Courtney STK payment.</strong><span>Enter a phone you control and complete the prompt on the device. This is not a simulated payment.</span></div></div>
    <div className="sandbox-grid"><section className="panel sandbox-form"><div className="panel-header"><div><div className="panel-kicker">LIVE PAYMENT CONTROL</div><h2>Start a payment test</h2><p>Amount is always derived from the selected active package.</p></div></div><label className="field-label">TEST PHONE NUMBER<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0712 345 678" inputMode="tel" /></label><label className="field-label">PACKAGE<select value={packageId} onChange={(event) => setPackageId(event.target.value)}>{packages.map((item) => <option key={item.id} value={item.id}>{item.name} · {formatMoney(item.price)} · {item.duration_minutes} min</option>)}</select></label>{selected && <div className="package-preview"><Zap /><div><strong>{selected.name}</strong><span>{formatMoney(selected.price)} · {selected.duration_minutes} minutes · {selected.download_speed_mbps} Mbps down</span></div></div>}<button className="primary-button full" disabled={loading || !phone || !selected} onClick={() => setConfirmOpen(true)}><Smartphone />{loading ? 'Starting STK request...' : 'Start Payment Test'}</button>{error && <div className="error-alert"><X /><span>{error}</span></div>}<p className="security-note"><ShieldCheck /> Admin-only endpoint. Provider credentials and raw callbacks never reach the browser.</p></section>
      <section className="panel"><div className="panel-header"><div><div className="panel-kicker">VERIFICATION CHECKLIST</div><h2>Test evidence</h2><p>These items reflect backend evidence, not button clicks.</p></div></div><div className="checklist">{steps.map((step) => <div className={`check-item ${step.state}`} key={step.label}><span className="check-icon">{step.state === 'complete' ? <Check /> : step.state === 'active' ? <LoaderCircle className="spin" /> : step.state === 'failed' ? <X /> : <Clock3 />}</span><span>{step.label}</span></div>)}</div></section></div>
    {payment && <section className={`panel test-result ${payment.status.toLowerCase()}`}><div className="result-heading"><div className={`result-icon ${payment.status.toLowerCase()}`}>{payment.status === 'COMPLETED' ? <Check /> : payment.status === 'FAILED' ? <X /> : <Clock3 />}</div><div><div className="panel-kicker">{payment.status === 'COMPLETED' ? 'PAYMENT TEST SUCCESSFUL' : payment.status === 'FAILED' ? 'PAYMENT TEST FAILED' : 'WAITING FOR PAYMENT'}</div><h2>{payment.status === 'PENDING' ? 'Waiting for STK confirmation...' : payment.status === 'COMPLETED' ? 'Your Courtney STK payment was completed successfully.' : payment.resultDescription ?? 'Payment request failed.'}</h2></div></div><div className="result-grid"><div><span>PACKAGE</span><strong>{selected?.name ?? '—'}</strong></div><div><span>AMOUNT</span><strong>{selected ? formatMoney(selected.price) : '—'}</strong></div><div><span>STATUS</span><strong>{payment.status}</strong></div><div><span>CHECKOUT ID</span><strong className="mono">{maskCheckout(payment.checkoutRequestId)}</strong></div><div><span>SESSION</span><strong>{payment.sessionId ? 'CREATED' : '—'}</strong></div><div><span>ROUTER JOB</span><strong>{payment.routerJobCreated ? 'CREATED' : '—'}</strong></div></div>{payment.status === 'PENDING' && <p className="pending-note"><Smartphone /> An STK request was sent to the test phone. Complete the payment from the phone to continue.</p>}</section>}
    {confirmOpen && <div className="modal-backdrop"><div className="confirm-modal"><button className="modal-close" onClick={() => setConfirmOpen(false)} aria-label="Close"><X /></button><div className="modal-icon danger"><AlertTriangle /></div><h3>Initiate an actual payment?</h3><p>ADMIN PAYMENT TEST — This will initiate an actual Courtney STK payment request to <strong>{phone}</strong>.</p><div className="modal-details"><span>{selected?.name}</span><span>{selected ? formatMoney(selected.price) : '—'}</span><span>Phone: {phone}</span></div><div className="modal-actions"><button className="outline-button" onClick={() => setConfirmOpen(false)}>Cancel</button><button className="danger-button" onClick={start}>Confirm & Send STK</button></div></div></div>}
  </div>
}
