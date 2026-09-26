import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

const env = z.object({
  PORT: z.coerce.number().int().positive().default(10000),
  NODE_ENV: z.enum(['development','test','production']).default('production'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  COURTNEY_TECH_API_SECRET: z.string().min(1),
  CORS_ORIGINS: z.string().optional(),
}).parse(process.env)

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
const app = express()
app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGINS?.split(',').map((item) => item.trim()) ?? true }))
app.use(express.json({ limit: '256kb' }))
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }))

const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => handler(req, res).catch(next)
const error = (status: number, message: string) => Object.assign(new Error(message), { status })
const authHeader = (req: Request) => req.header('authorization')?.replace(/^Bearer\s+/i, '')
const requireAdmin = asyncRoute(async (req, _res) => {
  const token = authHeader(req)
  if (!token) throw error(401, 'Authentication required')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) throw error(401, 'Authentication required')
  const { data: profile } = await supabase.from('admin_profiles').select('id,role,is_active').eq('id', user.id).maybeSingle()
  if (!profile?.is_active) throw error(403, 'Admin access required')
  ;(req as Request & { adminId?: string }).adminId = user.id
})

app.get('/health', asyncRoute(async (_req, res) => {
  const { error: dbError } = await supabase.from('packages').select('id').limit(1)
  res.status(dbError ? 503 : 200).json({ status: dbError ? 'degraded' : 'ok', service: 'synthnet-billing-backend', database: dbError ? 'unavailable' : 'connected', timestamp: new Date().toISOString() })
}))

app.get('/api/v1/packages', asyncRoute(async (_req, res) => {
  const { data, error: dbError } = await supabase.from('packages').select('id,name,description,price,duration_minutes,download_speed_mbps,upload_speed_mbps').eq('is_active', true).eq('status', 'ACTIVE').order('price')
  if (dbError) throw dbError
  res.json({ data })
}))

const webhookSchema = z.object({ CheckoutRequestID: z.string().min(1), Amount: z.coerce.number().nonnegative(), MpesaReceiptNumber: z.string().min(1).optional(), ResultCode: z.coerce.number().int(), ResultDesc: z.string().optional(), Phone: z.string().min(7).optional() }).passthrough()
const secretMatches = (provided: string | undefined) => { if (!provided) return false; const a = Buffer.from(provided); const b = Buffer.from(env.COURTNEY_TECH_API_SECRET); return a.length === b.length && timingSafeEqual(a, b) }

app.post('/api/v1/payments/webhook', asyncRoute(async (req, res) => {
  if (!secretMatches(req.header('x-courtney-secret') ?? req.header('x-api-secret'))) throw error(401, 'Invalid webhook credentials')
  const payload = webhookSchema.parse(req.body)
  const { data: payment, error: lookupError } = await supabase.from('payments').select('id,checkout_request_id,status').eq('checkout_request_id', payload.CheckoutRequestID).maybeSingle()
  if (lookupError) throw lookupError
  if (!payment) throw error(404, 'Payment not found')
  if (payload.ResultCode !== 0) {
    const { data, error: rpcError } = await supabase.rpc('mark_failed_payment', { p_payment_id: payment.id, p_result_code: payload.ResultCode, p_result_description: payload.ResultDesc ?? 'Payment failed', p_raw_callback: payload })
    if (rpcError) throw rpcError
    res.json({ acknowledged: true, failed: data })
    return
  }
  const { data, error: rpcError } = await supabase.rpc('process_successful_payment', { p_payment_id: payment.id, p_checkout_request_id: payload.CheckoutRequestID, p_amount: payload.Amount, p_mpesa_code: payload.MpesaReceiptNumber ?? null, p_phone: payload.Phone ?? null, p_raw_callback: payload, p_result_code: payload.ResultCode, p_result_description: payload.ResultDesc ?? 'Success' })
  if (rpcError) throw rpcError
  res.json({ acknowledged: true, result: data?.[0] ?? null })
}))

app.get('/api/v1/payments/:id', asyncRoute(async (req, res) => {
  const id = z.string().uuid().parse(req.params.id)
  const { data, error: dbError } = await supabase.from('payments').select('id,status,amount,phone_number,package_id,initiated_at,completed_at,failed_at').eq('id', id).maybeSingle()
  if (dbError) throw dbError
  if (!data) throw error(404, 'Payment not found')
  res.json({ data })
}))

app.get('/api/v1/sessions/:id', asyncRoute(async (req, res) => {
  const id = z.string().uuid().parse(req.params.id)
  const { data, error: dbError } = await supabase.from('internet_sessions').select('id,status,package_id,start_time,expiry_time,is_authenticated_on_router,router_authenticated_at,disconnected_at').eq('id', id).maybeSingle()
  if (dbError) throw dbError
  if (!data) throw error(404, 'Session not found')
  const remainingSeconds = Math.max(0, Math.floor((new Date(data.expiry_time).getTime() - Date.now()) / 1000))
  res.json({ data: { ...data, remaining_seconds: remainingSeconds } })
}))

app.get('/api/v1/admin/overview', requireAdmin, asyncRoute(async (_req, res) => {
  const [payments, sessions, routers] = await Promise.all([supabase.from('payments').select('id,status,amount,created_at').order('created_at', { ascending: false }).limit(100), supabase.from('internet_sessions').select('id,status,expiry_time').in('status', ['ACTIVE','PENDING']), supabase.from('router_devices').select('id,name,status,last_heartbeat_at,active_clients')])
  if (payments.error || sessions.error || routers.error) throw payments.error ?? sessions.error ?? routers.error
  res.json({ data: { payments: payments.data, active_sessions: sessions.data, routers: routers.data } })
}))

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => { const status = typeof err === 'object' && err && 'status' in err && typeof err.status === 'number' ? err.status : 500; res.status(status).json({ error: status === 500 ? 'Internal server error' : err instanceof Error ? err.message : 'Request failed' }) })

app.listen(env.PORT, '0.0.0.0', () => console.log(JSON.stringify({ level: 'info', operation: 'server_started', port: env.PORT })))
