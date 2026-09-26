import { apiFetch } from './client'

export type NetworkPackage = { id: string; name: string; description: string | null; price: number; duration_minutes: number; download_speed_mbps: number; upload_speed_mbps: number }

export function getPackages() {
  return apiFetch<{ data: NetworkPackage[] }>('/api/v1/packages')
}
