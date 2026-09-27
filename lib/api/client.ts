import { getAccessToken } from './auth'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''

async function adminHeaders() {
  const token = await getAccessToken()
  if (!token) throw new Error('Admin authentication required')
  return { Authorization: `Bearer ${token}` }
}

export type AdminPaymentTestResult = { id: string; checkoutRequestId?: string; status: string; sessionId?: string; routerJobCreated?: boolean; duplicate?: boolean; resultDescription?: string }

export type PaymentRequest = { customer_id: string; package_id: string; phone: string; amount: number; reference: string; description?: string }

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  const body = (await response.json().catch(() => null)) as { error?: string } & T
  if (!response.ok) throw new Error(body?.error ?? 'API request failed')
  return body
}

export function initiatePayment(input: PaymentRequest) {
  return apiFetch<{ data: { id: string; checkout_request_id: string; status: string } }>('/api/v1/payments', { method: 'POST', body: JSON.stringify(input) })
}

export async function checkPaymentStatus(paymentId: string) {
  return apiFetch<{ data: Record<string, unknown>; finalized?: { payment_id?: string; session_id?: string; duplicate?: boolean } }>(`/api/v1/payments/${paymentId}/status`, { method: 'POST', headers: await adminHeaders() })
}

export async function checkAdminAccess() {
  await apiFetch('/api/v1/admin/overview', { headers: await adminHeaders() })
}

export async function startAdminPaymentTest(input: { phone: string; packageId: string }) {
  const body = await apiFetch<{ data: { id: string; checkout_request_id: string; status: string } }>('/api/v1/admin/payment-tests', { method: 'POST', headers: await adminHeaders(), body: JSON.stringify(input) })
  return { id: body.data.id, checkoutRequestId: body.data.checkout_request_id, status: body.data.status } satisfies AdminPaymentTestResult
}

export async function checkAdminPaymentStatus(paymentId: string): Promise<AdminPaymentTestResult> {
  const response = await checkPaymentStatus(paymentId)
  const finalized = response.finalized
  return { id: paymentId, status: finalized?.session_id ? 'COMPLETED' : String(response.data?.status ?? 'PENDING').toUpperCase(), sessionId: finalized?.session_id, duplicate: finalized?.duplicate, routerJobCreated: Boolean(finalized?.session_id), resultDescription: typeof response.data?.resultDesc === 'string' ? response.data.resultDesc : undefined }
}
