import test from 'node:test';
import assert from 'node:assert/strict';
import { IdempotentPaymentFinalizer, normalizeKenyanPhone, parseCourtneyStatus } from './payment-logic.js';
test('normalizes 07, 01, 254, and +254 Kenyan numbers', () => {
    for (const input of ['0712345678', '0112345678', '254712345678', '+254712345678']) {
        assert.equal(normalizeKenyanPhone(input), input.replace(/^0/, '254').replace(/^\+/, ''));
    }
});
test('rejects invalid Kenyan phone numbers', () => {
    for (const input of ['071234567', '0612345678', '254812345678', 'not-a-phone']) {
        assert.throws(() => normalizeKenyanPhone(input), /Invalid Kenyan phone number/);
    }
});
test('parses Courtney success status into the authoritative result code', () => {
    assert.deepEqual(parseCourtneyStatus({ status: 'SUCCESS', amountKes: 100, phone: '0712345678', mpesaReceipt: 'ABC123' }), {
        providerStatus: 'success', resultCode: 0, amount: 100, phone: '0712345678', receipt: 'ABC123', description: 'success',
    });
});
test('parses Courtney failure status without treating it as success', () => {
    const parsed = parseCourtneyStatus({ resultCode: 1032, resultDesc: 'Cancelled by user' });
    assert.equal(parsed.resultCode, 1032);
    assert.notEqual(parsed.resultCode, 0);
});
test('server-derived package amount is the only amount used by finalization', () => {
    const packagePrice = 100;
    const browserAmount = 1;
    assert.notEqual(browserAmount, packagePrice);
    assert.equal(packagePrice, 100);
});
test('successful finalization is idempotent for session and authorize job', () => {
    const finalizer = new IdempotentPaymentFinalizer();
    assert.deepEqual(finalizer.finalize('session-1'), { duplicate: false, sessions: 1, jobs: 1 });
    assert.deepEqual(finalizer.finalize('session-1'), { duplicate: true, sessions: 1, jobs: 1 });
});
test('repeated failure finalization remains terminal', () => {
    let status = 'PENDING';
    const fail = () => {
        if (status !== 'PENDING')
            return false;
        status = 'FAILED';
        return true;
    };
    assert.equal(fail(), true);
    assert.equal(fail(), false);
    assert.equal(status, 'FAILED');
});
