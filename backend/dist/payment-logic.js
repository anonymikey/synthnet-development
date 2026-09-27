export const normalizeKenyanPhone = (value) => {
    const compact = value.replace(/[\s-]/g, '');
    const canonical = compact.startsWith('+254') ? compact.slice(1) : compact.startsWith('0') ? `254${compact.slice(1)}` : compact;
    if (!/^254(?:7|1)\d{8}$/.test(canonical))
        throw new Error('Invalid Kenyan phone number');
    return canonical;
};
export const parseCourtneyStatus = (value) => {
    const providerStatus = String(value.status ?? value.result ?? '').toLowerCase();
    const explicitCode = value.resultCode ?? value.result_code;
    const resultCode = explicitCode !== undefined
        ? Number(explicitCode)
        : ['completed', 'success', 'paid'].includes(providerStatus) ? 0 : undefined;
    return {
        providerStatus,
        resultCode: Number.isInteger(resultCode) ? resultCode : undefined,
        amount: value.amountKes ?? value.amount,
        phone: typeof value.phone === 'string' ? value.phone : undefined,
        receipt: typeof value.mpesaReceipt === 'string' ? value.mpesaReceipt : typeof value.mpesa_receipt === 'string' ? value.mpesa_receipt : undefined,
        description: typeof value.resultDesc === 'string' ? value.resultDesc : typeof value.message === 'string' ? value.message : providerStatus || 'Payment status update',
    };
};
export const authorizeSessionJobKey = (sessionId) => `AUTHORIZE_SESSION:${sessionId}`;
export class IdempotentPaymentFinalizer {
    completed = false;
    sessionCount = 0;
    jobKeys = new Set();
    finalize(sessionId) {
        if (this.completed)
            return { duplicate: true, sessions: this.sessionCount, jobs: this.jobKeys.size };
        this.completed = true;
        this.sessionCount += 1;
        this.jobKeys.add(authorizeSessionJobKey(sessionId));
        return { duplicate: false, sessions: this.sessionCount, jobs: this.jobKeys.size };
    }
}
