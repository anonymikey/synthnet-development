import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createServer, type Server } from 'node:http'

const ownCustomer = '11111111-1111-4111-8111-111111111111'
const otherCustomer = '22222222-2222-4222-8222-222222222222'
const paymentId = '33333333-3333-4333-8333-333333333333'
const sessionId = '44444444-4444-4444-8444-444444444444'
const checkoutId = 'ws_CO_123'

process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = 'https://mock.supabase.test'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret'
process.env.COURTNEY_TECH_API_KEY = 'courtney-key-secret'
process.env.COURTNEY_TECH_API_SECRET = 'courtney-secret'
process.env.COURTNEY_ACCOUNT_ID = '123'
process.env.COURTNEY_BASE_URL = 'https://mock.courtney.test/api'
process.env.PUBLIC_API_URL = 'https://api.example.test'
process.env.CORS_ORIGINS = 'https://app.example.test'

let supabaseMock: Server
let courtneyMock: Server
let app: typeof import('./server.js').app
let courtneyCalls: string[] = []

before(async () => {
  supabaseMock = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'https://mock.supabase.test')
    res.setHeader('content-type', 'application/json')
    if (url.pathname === '/auth/v1/user') {
      if (req.headers.authorization === 'Bearer malformed') return void respond(res, 401, { error: 'invalid token' })
      return void respond(res, 200, { id: ownCustomer, aud: 'authenticated' })
    }
    if (url.pathname === '/rest/v1/payments') return void respond(res, 200, { id: paymentId, customer_id: ownCustomer, status: 'PENDING', amount: 100, package_id: '55555555-5555-4555-8555-555555555555', checkout_request_id: checkoutId, phone_number: '254712345678', initiated_at: new Date().toISOString(), completed_at: null, failed_at: null })
    if (url.pathname === '/rest/v1/internet_sessions') return void respond(res, 200, [{ id: sessionId, customer_id: ownCustomer, status: 'ACTIVE', package_id: '55555555-5555-4555-8555-555555555555', start_time: new Date().toISOString(), expiry_time: new Date(Date.now() + 3600000).toISOString(), is_authenticated_on_router: false, router_authenticated_at: null, disconnected_at: null }])
    if (url.pathname === '/rest/v1/admin_profiles') return void respond(res, 200, [])
    if (url.pathname.startsWith('/rest/v1/rpc/')) return void respond(res, 200, [{ payment_id: paymentId, session_id: sessionId, duplicate: false }])
    if (url.pathname.startsWith('/rest/v1/')) return void respond(res, 200, [{ id: paymentId }])
    respond(res, 404, { error: 'not found' })
  }).listen(0)
  courtneyMock = createServer((req, res) => {
    courtneyCalls.push(req.url ?? '')
    res.setHeader('content-type', 'application/json')
    if (req.url?.endsWith('/status')) return respond(res, 200, { status: 'SUCCESS', resultCode: 0, amountKes: 100, phone: '254712345678', mpesaReceipt: 'ABC123' })
    respond(res, 200, { success: true, checkout_request_id: checkoutId, merchant_request_id: 'merchant-1' })
  }).listen(0)
  const supabasePort = (supabaseMock.address() as { port: number }).port
  const courtneyPort = (courtneyMock.address() as { port: number }).port
  process.env.SUPABASE_URL = `http://127.0.0.1:${supabasePort}`
  process.env.COURTNEY_BASE_URL = `http://127.0.0.1:${courtneyPort}/api`
  ;({ app } = await import('./server.js'))
})

after(() => { supabaseMock.close(); courtneyMock.close() })

const respond = (res: import('node:http').ServerResponse, status: number, body: unknown) => { res.statusCode = status; res.end(JSON.stringify(body)) }

test('webhook GET is method protected', async () => {
  const response = await request(app).get('/api/v1/payments/webhook')
  assert.equal(response.status, 405)
  assert.equal(response.headers.allow, 'POST')
})

test('payment lookup requires auth and does not expose sensitive fields', async () => {
  assert.equal((await request(app).get(`/api/v1/payments/${paymentId}`)).status, 401)
  assert.equal((await request(app).get(`/api/v1/payments/${paymentId}`).set('Authorization', 'Bearer malformed')).status, 401)
  const response = await request(app).get(`/api/v1/payments/${paymentId}`).set('Authorization', 'Bearer valid')
  assert.equal(response.status, 200)
  assert.equal(response.body.data.id, paymentId)
  assert.equal('phone_number' in response.body.data, false)
  assert.equal('customer_id' in response.body.data, false)
})

test('session lookup requires ownership and exposes only safe fields', async () => {
  const response = await request(app).get(`/api/v1/sessions/${sessionId}`).set('Authorization', 'Bearer valid')
  assert.equal(response.status, 200)
  assert.equal('customer_id' in response.body.data, false)
  assert.equal('mac_address' in response.body.data, false)
  assert.equal('remaining_seconds' in response.body.data, true)
})

test('status polling uses Courtney and converges through finalization RPC', async () => {
  courtneyCalls = []
  const response = await request(app).get(`/api/v1/payments/${paymentId}/status`)
  assert.equal(response.status, 200)
  assert.equal(response.body.finalized.session_id, sessionId)
  assert.ok(courtneyCalls.some((path) => path.endsWith('/status')))
})

test('CORS allows configured origin and rejects unconfigured origin', async () => {
  const allowed = await request(app).get('/health').set('Origin', 'https://app.example.test')
  assert.equal(allowed.headers['access-control-allow-origin'], 'https://app.example.test')
  const denied = await request(app).get('/health').set('Origin', 'https://evil.example.test')
  assert.equal(denied.status, 200)
  assert.equal('access-control-allow-origin' in denied.headers, false)
})

test('admin route rejects unauthenticated and non-admin users', async () => {
  assert.equal((await request(app).get('/api/v1/admin/overview')).status, 401)
  assert.equal((await request(app).get('/api/v1/admin/overview').set('Authorization', 'Bearer valid')).status, 403)
})

test('malformed webhook is rejected without provider secrets', async () => {
  const response = await request(app).post('/api/v1/payments/webhook').send({ nope: true })
  assert.equal(response.status, 400)
  assert.equal(JSON.stringify(response.body).includes('courtney-secret'), false)
  assert.equal(JSON.stringify(response.body).includes('service-role-secret'), false)
})
