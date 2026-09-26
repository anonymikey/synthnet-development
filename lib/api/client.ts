const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''

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

export function checkPaymentStatus(paymentId: string) {
  return apiFetch<{ data: Record<string, unknown> }>(`/api/v1/payments/${paymentId}/status`, { method: 'POST' })
}
