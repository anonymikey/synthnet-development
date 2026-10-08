'use client'

import { useEffect, useState } from 'react'
import { Activity, ArrowDown, ArrowRight, Check, ChevronRight, Cloud, Command, Cpu, Globe2, LockKeyhole, Menu, Network, Radio, Router, Server, ShieldCheck, Smartphone, Sparkles, Zap } from 'lucide-react'

const workflow = [
  ['01', 'Customer connects', 'A nearby client joins the SynthNet access network.', Smartphone],
  ['02', 'Captive portal', 'A focused entry point makes access simple and clear.', Globe2],
  ['03', 'Choose a package', 'The right bandwidth and duration are selected.', Network],
  ['04', 'STK Push', 'A secure payment prompt lands on the customer’s phone.', Smartphone],
  ['05', 'Confirmation', 'A callback confirms the payment event server-side.', Check],
  ['06', 'Internet session', 'A timed session is created and tracked.', Activity],
  ['07', 'Authorization', 'A controlled router job applies the network policy.', Router],
  ['08', 'Internet access', 'The customer is online with the right limits.', Zap],
] as const

const states = ['PENDING', 'PROCESSING', 'AUTHORIZED', 'ACTIVE', 'EXPIRING', 'EXPIRED']
type GatewayType = 'OMADA' | 'MIKROTIK'

function getGatewayType(search: string): GatewayType {
  const params = new URLSearchParams(search)
  return params.has('clientMac') && params.has('apMac') ? 'OMADA' : 'MIKROTIK'
}

function gatewayLabel(gatewayType: GatewayType) {
  return gatewayType === 'OMADA' ? 'TP-LINK OMADA' : 'MIKROTIK'
}

function Node({ icon: Icon, label, tone = '' }: { icon: typeof Globe2; label: string; tone?: string }) {
  return <div className={`landing-node ${tone}`}><div className="landing-node-icon"><Icon /></div><span>{label}</span></div>
}

function PacketLine({ vertical = false }: { vertical?: boolean }) {
  return <div className={`packet-line ${vertical ? 'vertical' : ''}`}><i /><i /><i /></div>
}

function ArchitectureVisual({ gatewayType = 'MIKROTIK' }: { gatewayType?: GatewayType }) {
  return <div className="architecture-visual" data-gateway={gatewayType.toLowerCase()} aria-label={`Animated SynthNet ${gatewayLabel(gatewayType)} network architecture diagram`}>
    <div className="arch-column physical"><div className="arch-caption">PHYSICAL NETWORK</div><Node icon={Globe2} label="Internet" /><PacketLine vertical /><Node icon={Radio} label="ISP / LTE / 5G" tone="blue" /><PacketLine vertical /><Node icon={Router} label={`${gatewayLabel(gatewayType)} gateway`} tone="green" /><PacketLine vertical /><Node icon={WifiIcon} label="Access point" tone="purple" /><div className="client-row"><Node icon={Smartphone} label="Client" /><Node icon={Smartphone} label="Client" /><Node icon={Smartphone} label="Client" /></div></div>
    <div className="arch-bridge"><span>CONTROL PLANE</span><PacketLine /><Sparkles /></div>
    <div className="arch-column cloud"><div className="arch-caption">SYNTHNET CONTROL PLANE</div><Node icon={Command} label="SynthNet" tone="green" /><div className="cloud-grid"><Node icon={Cloud} label="Vercel" /><Node icon={Server} label="Render" /><Node icon={ShieldCheck} label="Supabase" /><Node icon={Cpu} label="Courtney" /></div><PacketLine vertical /><Node icon={Radio} label="M-Pesa" tone="amber" /></div>
  </div>
}

function WifiIcon() { return <Radio /> }

function PaymentDemo() {
  const [step, setStep] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => setStep(current => (current + 1) % 7), 2200); return () => window.clearInterval(timer) }, [])
  const labels = ['PACKAGE', 'PHONE', 'STK PUSH', 'PAYMENT', 'CALLBACK', 'SESSION', 'ACCESS']
  return <div className="payment-demo"><div className="phone-shell"><div className="phone-speaker" /><div className="phone-screen"><div className="phone-top"><span>9:41</span><span>•••</span></div><div className="mpesa-mark">M</div><strong>STK Push request</strong><span className="phone-muted">SynthNet · 1 Hour Turbo</span><div className="phone-amount">KSh 10</div><div className="phone-input">Enter M-Pesa PIN <span>••••</span></div><div className="phone-button">Confirm payment</div></div></div><div className="payment-rail">{labels.map((label, index) => <div key={label} className={`payment-step ${step === index ? 'active' : index < step ? 'done' : ''}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong>{index < labels.length - 1 && <ArrowRight />}</div>)}</div></div>
}

export default function SynthnetLanding() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [gatewayType, setGatewayType] = useState<GatewayType>('MIKROTIK')

  useEffect(() => {
    setGatewayType(getGatewayType(window.location.search))
  }, [])

  return <main className="landing-page" data-gateway={gatewayType.toLowerCase()}>
    <nav className="landing-nav"><a href="#top" className="landing-brand"><span><Network /></span><b>SYNTHNET</b><small>NETWORK CONTROL</small></a><div className={`landing-links ${menuOpen ? 'open' : ''}`}><a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a><a href="#architecture" onClick={() => setMenuOpen(false)}>Architecture</a><a href="#security" onClick={() => setMenuOpen(false)}>Security</a><a href="#scale" onClick={() => setMenuOpen(false)}>Future scale</a></div><div className="landing-nav-actions"><a className="nav-admin-link" href="/admin">Admin sign in <ArrowRight /></a><button className="landing-menu" onClick={() => setMenuOpen(value => !value)} aria-label="Toggle navigation"><Menu /></button></div></nav>
    <section className="landing-hero" id="top"><div className="hero-grid" /><div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" /><div className="hero-copy"><div className="landing-eyebrow"><span className="pulse-dot" />PRIVATE NETWORK OPERATIONS PLATFORM</div><h1>Connect.<br /><em>Control.</em><br />Automate.</h1><p>SynthNet coordinates network access, customer payments, internet sessions, and router authorization in one intelligent control plane.</p><div className="hero-actions"><a className="landing-button primary" href="#workflow">Explore SynthNet <ArrowDown /></a><a className="landing-button secondary" href="/admin">Admin sign in <ArrowRight /></a></div><div className="hero-note"><LockKeyhole /> Built for our network today. Designed to scale beyond it.</div></div><div className="hero-visual"><ArchitectureVisual /></div><div className="scroll-cue"><span>SCROLL TO EXPLORE</span><ArrowDown /></div></section>
    <section className="landing-section workflow-section" id="workflow"><div className="section-heading"><div><div className="landing-eyebrow">THE ACCESS LIFECYCLE</div><h2>From first connection<br /><span>to internet access.</span></h2></div><p>Every handoff is visible, controlled, and designed to keep the customer experience moving.</p></div><div className="workflow-grid">{workflow.map(([number, title, description, Icon], index) => <div className="workflow-card" key={number}><div className="workflow-number">{number}</div><div className="workflow-icon"><Icon /></div><h3>{title}</h3><p>{description}</p>{index < workflow.length - 1 && <div className="workflow-connector"><ArrowRight /></div>}</div>)}</div></section>
    <section className="landing-section architecture-section" id="architecture"><div className="section-heading centered"><div><div className="landing-eyebrow">ONE COORDINATED SYSTEM</div><h2>Infrastructure that<br /><span>moves as one.</span></h2></div><p>Physical network operations and cloud control stay in sync without exposing the complexity to the customer.</p></div><ArchitectureVisual gatewayType={gatewayType} /></section>
    <section className="landing-section payment-section"><div className="section-heading"><div><div className="landing-eyebrow">VISUAL DEMONSTRATION · NO LIVE REQUESTS</div><h2>A payment flow<br /><span>with no blind spots.</span></h2></div><p>This interactive visual shows the experience from package selection to authorization. It is a presentation only — no provider, payment, or customer data is connected.</p></div><PaymentDemo /></section>
    <section className="landing-section lifecycle-section"><div className="section-heading centered"><div><div className="landing-eyebrow">SESSION INTELLIGENCE</div><h2>Every session has<br /><span>a clear state.</span></h2></div></div><div className="lifecycle-track">{states.map((state, index) => <div className={`lifecycle-state state-${index}`} key={state}><div className="lifecycle-dot"><span /></div><strong>{state}</strong><small>{['Request received', 'Payment in flight', 'Policy approved', 'Access is live', 'Time is running out', 'Access closed'][index]}</small>{index < states.length - 1 && <div className="lifecycle-connector" />}</div>)}</div></section>
    <section className="landing-section control-section"><div className="control-copy"><div className="landing-eyebrow">OPERATOR CONTROL CENTER</div><h2>A clear view of<br /><span>the whole network.</span></h2><p>One focused workspace for sessions, payments, packages, router jobs, and network health. The admin dashboard stays protected behind authenticated access.</p><a className="landing-button secondary" href="/admin">Open admin dashboard <ArrowRight /></a></div><div className="dashboard-preview"><div className="preview-top"><span className="preview-dots">● ● ●</span><span>SYNTHNET / OPERATIONS</span><span className="preview-live"><i />ALL SYSTEMS OPERATIONAL</span></div><div className="preview-body"><div className="preview-sidebar"><b><Network /> SYNTHNET</b><span className="selected">Dashboard Overview</span><span>Router Controller</span><span>M-Pesa Ledger</span><span>Bandwidth Profiles</span></div><div className="preview-main"><div className="preview-heading"><small>SATURDAY · 12:48 PM EAT</small><h3>Dashboard Overview</h3></div><div className="preview-metrics"><div><small>ACTIVE USERS</small><strong>24</strong><i className="lime" /></div><div><small>ONLINE SESSIONS</small><strong>21</strong><i className="blue" /></div><div><small>ROUTER STATUS</small><strong>ONLINE</strong><i className="purple" /></div></div><div className="preview-chart"><span /><span /><span /><span /><span /><span /><span /><span /></div></div></div></div></section>
    <section className="landing-section security-section" id="security"><div className="security-panel"><div className="security-intro"><div className="landing-eyebrow">SECURITY BY DESIGN</div><h2>Powerful controls.<br /><span>Protected boundaries.</span></h2><p>SynthNet keeps sensitive actions on the server and gives operators the visibility they need without compromising customer or provider data.</p></div><div className="security-list"><div><ShieldCheck /><span><b>Authenticated administration</b><small>Operator access is verified before protected tools appear.</small></span></div><div><LockKeyhole /><span><b>Server-side authorization</b><small>Payment and router boundaries are never trusted to the browser.</small></span></div><div><Command /><span><b>Idempotent processing</b><small>Callbacks and controlled jobs are designed for safe retries.</small></span></div><div><Radio /><span><b>Trusted device association</b><small>Network access is tied to an intentional customer context.</small></span></div></div></div></section>
    <section className="landing-section scale-section" id="scale"><div className="scale-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><Network /><span>ONE<br />NETWORK</span></div><div className="orbit-label label-one">ROUTERS</div><div className="orbit-label label-two">LOCATIONS</div><div className="orbit-label label-three">PACKAGES</div></div><div className="scale-copy"><div className="landing-eyebrow">THE LONG VIEW</div><h2>Built for one network.<br /><span>Ready for many.</span></h2><p>Today, SynthNet is focused on operating our own network with clarity and discipline. The architecture is intentionally shaped so future networks, routers, locations, packages, customers, and reporting can grow into the same control plane.</p><div className="future-tags"><span>Multiple operators</span><span>Multiple locations</span><span>Independent packages</span><span>Unified reporting</span></div></div></section>
    <footer className="landing-footer"><a href="#top" className="landing-brand"><span><Network /></span><b>SYNTHNET</b><small>NETWORK CONTROL</small></a><span>NETWORK OPERATIONS / ACCESS / AUTOMATION</span><a href="/admin">Admin sign in <ChevronRight /></a></footer>
  </main>
}
