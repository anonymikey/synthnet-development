import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
const env = z.object({
    PORT: z.coerce.number().int().positive().default(10000),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    COURTNEY_TECH_API_KEY: z.string().min(1),
    COURTNEY_TECH_API_SECRET: z.string().min(1),
    COURTNEY_ACCOUNT_ID: z.coerce.number().int().positive(),
    COURTNEY_BASE_URL: z.string().url().default('https://courtneytech.xyz/api'),
    PUBLIC_API_URL: z.string().url().optional(),
    CORS_ORIGINS: z.string().optional(),
}).parse(process.env);
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS?.split(',').map((item) => item.trim()) ?? true }));
app.use(express.json({ limit: '256kb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));
const asyncRoute = (handler) => (req, res, next) => handler(req, res).catch(next);
const error = (status, message) => Object.assign(new Error(message), { status });
const authHeader = (req) => req.header('authorization')?.replace(/^Bearer\s+/i, '');
const requireAdmin = asyncRoute(async (req, _res) => {
    const token = authHeader(req);
    if (!token)
        throw error(401, 'Authentication required');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user)
        throw error(401, 'Authentication required');
    const { data: profile } = await supabase.from('admin_profiles').select('id,role,is_active').eq('id', user.id).maybeSingle();
    if (!profile?.is_active)
        throw error(403, 'Admin access required');
    req.adminId = user.id;
});
app.get('/health', asyncRoute(async (_req, res) => {
    const { error: dbError } = await supabase.from('packages').select('id').limit(1);
    res.status(dbError ? 503 : 200).json({ status: dbError ? 'degraded' : 'ok', service: 'synthnet-billing-backend', database: dbError ? 'unavailable' : 'connected', timestamp: new Date().toISOString() });
}));
app.get('/api/v1/packages', asyncRoute(async (_req, res) => {
    const { data, error: dbError } = await supabase.from('packages').select('id,name,description,price,duration_minutes,download_speed_mbps,upload_speed_mbps').eq('is_active', true).eq('status', 'ACTIVE').order('price');
    if (dbError)
        throw dbError;
    res.json({ data });
}));
const paymentRequestSchema = z.object({ customer_id: z.string().uuid(), package_id: z.string().uuid(), phone: z.string().regex(/^(?:254|0)7\d{8}$/), amount: z.number().int().positive().max(70000), reference: z.string().regex(/^[A-Za-z0-9-]{1,12}$/), description: z.string().max(13).optional() });
const courtneyHeaders = { 'X-API-Key': env.COURTNEY_TECH_API_KEY, 'X-API-Secret': env.COURTNEY_TECH_API_SECRET, 'Content-Type': 'application/json' };
const courtneyUrl = (path) => `${env.COURTNEY_BASE_URL.replace(/\/$/, '')}${path}`;
app.post('/api/v1/payments', asyncRoute(async (req, res) => {
    const input = paymentRequestSchema.parse(req.body);
    const { data: packageRow, error: packageError } = await supabase.from('packages').select('id,price').eq('id', input.package_id).eq('is_active', true).eq('status', 'ACTIVE').single();
    if (packageError || !packageRow)
        throw error(400, 'Package not found');
    if (Number(packageRow.price) !== input.amount)
        throw error(400, 'Amount does not match package price');
    const { data: payment, error: insertError } = await supabase.from('payments').insert({ customer_id: input.customer_id, package_id: input.package_id, phone_number: input.phone, amount: input.amount, status: 'PENDING' }).select('id').single();
    if (insertError || !payment)
        throw insertError ?? error(500, 'Could not create payment');
    const callbackBase = env.PUBLIC_API_URL ?? `http://localhost:${env.PORT}`;
    const response = await fetch(courtneyUrl('/v2/stkpush'), { method: 'POST', headers: courtneyHeaders, body: JSON.stringify({ payment_account_id: env.COURTNEY_ACCOUNT_ID, phone: input.phone, amount: input.amount, reference: input.reference, description: input.description ?? 'SynthNet payment', callback_url: `${callbackBase}/api/v1/payments/webhook`, success_callback_url: `${callbackBase}/api/v1/payments/webhook`, confirmation_url: `${callbackBase}/api/v1/payments/webhook` }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success || !result.checkout_request_id) {
        await supabase.from('payments').update({ status: 'FAILED', result_description: result.message ?? 'Courtney Tech request failed', failed_at: new Date().toISOString() }).eq('id', payment.id);
        throw error(response.status >= 400 ? response.status : 502, result.message ?? 'Payment request failed');
    }
    const { error: updateError } = await supabase.from('payments').update({ checkout_request_id: result.checkout_request_id, merchant_request_id: result.merchant_request_id ?? null }).eq('id', payment.id);
    if (updateError)
        throw updateError;
    res.status(201).json({ data: { id: payment.id, checkout_request_id: result.checkout_request_id, status: 'PENDING' } });
}));
app.post('/api/v1/payments/:id/status', asyncRoute(async (req, res) => {
    const id = z.string().uuid().parse(req.params.id);
    const { data: payment, error: lookupError } = await supabase.from('payments').select('id,checkout_request_id,status').eq('id', id).single();
    if (lookupError || !payment?.checkout_request_id)
        throw error(404, 'Payment request not found');
    const response = await fetch(courtneyUrl('/v2/status'), { method: 'POST', headers: courtneyHeaders, body: JSON.stringify({ checkout_request_id: payment.checkout_request_id }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok)
        throw error(response.status, result.message ?? 'Could not check payment status');
    res.json({ data: result });
}));
const rawWebhookSchema = z.object({ CheckoutRequestID: z.string().min(1), Amount: z.coerce.number().nonnegative(), MpesaReceiptNumber: z.string().min(1).optional(), ResultCode: z.coerce.number().int(), ResultDesc: z.string().optional(), Phone: z.string().min(7).optional() }).passthrough();
const eventWebhookSchema = z.object({ event: z.string(), data: z.object({ transactionId: z.string().min(1), checkoutRequestId: z.string().optional(), amountKes: z.coerce.number().nonnegative().optional(), mpesaReceipt: z.string().nullable().optional(), phone: z.string().optional(), resultCode: z.coerce.number().int().optional(), resultDesc: z.string().optional(), status: z.string().optional() }).passthrough() }).passthrough();
app.post('/api/v1/payments/webhook', asyncRoute(async (req, res) => {
    const eventPayload = eventWebhookSchema.safeParse(req.body);
    const rawPayload = rawWebhookSchema.safeParse(req.body);
    if (!eventPayload.success && !rawPayload.success)
        throw error(400, 'Invalid payment callback');
    const normalized = eventPayload.success
        ? { checkoutId: eventPayload.data.data.checkoutRequestId ?? eventPayload.data.data.transactionId, amount: eventPayload.data.data.amountKes ?? 0, receipt: eventPayload.data.data.mpesaReceipt ?? undefined, phone: eventPayload.data.data.phone, code: eventPayload.data.data.resultCode ?? (eventPayload.data.data.status === 'completed' ? 0 : 1), description: eventPayload.data.data.resultDesc ?? eventPayload.data.event }
        : { checkoutId: rawPayload.data.CheckoutRequestID, amount: rawPayload.data.Amount, receipt: rawPayload.data.MpesaReceiptNumber, phone: rawPayload.data.Phone, code: rawPayload.data.ResultCode, description: rawPayload.data.ResultDesc };
    const { data: payment, error: lookupError } = await supabase.from('payments').select('id,checkout_request_id,status').eq('checkout_request_id', normalized.checkoutId).maybeSingle();
    if (lookupError)
        throw lookupError;
    if (!payment) {
        res.status(200).json({ acknowledged: true });
        return;
    }
    if (normalized.code !== 0) {
        const { data, error: rpcError } = await supabase.rpc('mark_failed_payment', { p_payment_id: payment.id, p_result_code: normalized.code, p_result_description: normalized.description ?? 'Payment failed', p_raw_callback: req.body });
        if (rpcError)
            throw rpcError;
        res.json({ acknowledged: true, failed: data });
        return;
    }
    const { data, error: rpcError } = await supabase.rpc('process_successful_payment', { p_payment_id: payment.id, p_checkout_request_id: normalized.checkoutId, p_amount: normalized.amount, p_mpesa_code: normalized.receipt ?? null, p_phone: normalized.phone ?? null, p_raw_callback: req.body, p_result_code: normalized.code, p_result_description: normalized.description ?? 'Success' });
    if (rpcError)
        throw rpcError;
    res.json({ acknowledged: true, result: data?.[0] ?? null });
}));
app.get('/api/v1/payments/:id', asyncRoute(async (req, res) => {
    const id = z.string().uuid().parse(req.params.id);
    const { data, error: dbError } = await supabase.from('payments').select('id,status,amount,phone_number,package_id,initiated_at,completed_at,failed_at').eq('id', id).maybeSingle();
    if (dbError)
        throw dbError;
    if (!data)
        throw error(404, 'Payment not found');
    res.json({ data });
}));
app.get('/api/v1/sessions/:id', asyncRoute(async (req, res) => {
    const id = z.string().uuid().parse(req.params.id);
    const { data, error: dbError } = await supabase.from('internet_sessions').select('id,status,package_id,start_time,expiry_time,is_authenticated_on_router,router_authenticated_at,disconnected_at').eq('id', id).maybeSingle();
    if (dbError)
        throw dbError;
    if (!data)
        throw error(404, 'Session not found');
    const remainingSeconds = Math.max(0, Math.floor((new Date(data.expiry_time).getTime() - Date.now()) / 1000));
    res.json({ data: { ...data, remaining_seconds: remainingSeconds } });
}));
app.get('/api/v1/admin/overview', requireAdmin, asyncRoute(async (_req, res) => {
    const [payments, sessions, routers] = await Promise.all([supabase.from('payments').select('id,status,amount,created_at').order('created_at', { ascending: false }).limit(100), supabase.from('internet_sessions').select('id,status,expiry_time').in('status', ['ACTIVE', 'PENDING']), supabase.from('router_devices').select('id,name,status,last_heartbeat_at,active_clients')]);
    if (payments.error || sessions.error || routers.error)
        throw payments.error ?? sessions.error ?? routers.error;
    res.json({ data: { payments: payments.data, active_sessions: sessions.data, routers: routers.data } });
}));
app.use((err, _req, res, _next) => { const status = typeof err === 'object' && err && 'status' in err && typeof err.status === 'number' ? err.status : 500; res.status(status).json({ error: status === 500 ? 'Internal server error' : err instanceof Error ? err.message : 'Request failed' }); });
app.listen(env.PORT, '0.0.0.0', () => console.log(JSON.stringify({ level: 'info', operation: 'server_started', port: env.PORT })));
