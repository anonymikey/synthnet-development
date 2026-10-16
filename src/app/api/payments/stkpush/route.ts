import { NextResponse } from "next/server";

const PHONE_PATTERN = /^(?:\+?254|0)[17]\d{8}$/;

function normalizePhone(value: unknown) {
  return String(value ?? "").replace(/[\s-]/g, "").replace(/^0/, "254").replace(/^\+/, "");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  const amount = Number(body?.amount);
  const reference = String(body?.reference ?? "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 12);

  if (!PHONE_PATTERN.test(phone) || !Number.isInteger(amount) || amount < 1 || amount > 70000 || !reference) {
    return NextResponse.json({ error: "Enter valid payment details." }, { status: 400 });
  }

  const baseUrl = process.env.COURTNEY_BASE_URL;
  const apiKey = process.env.COURTNEY_API_KEY;
  const apiSecret = process.env.COURTNEY_API_SECRET;
  const accountId = Number(process.env.COURTNEY_ACCOUNT_ID);

  if (!baseUrl || !apiKey || !apiSecret || !Number.isInteger(accountId)) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v2/stkpush`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "X-API-Secret": apiSecret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_account_id: accountId,
      phone,
      amount,
      reference,
      description: "WiFi access",
      callback_url: `${origin}/api/payments/callback`,
      success_callback_url: `${origin}/api/payments/success`,
      confirmation_url: `${origin}/api/payments/confirm`,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.checkout_request_id) {
    return NextResponse.json({ error: "We could not start the M-Pesa prompt." }, { status: 502 });
  }

  return NextResponse.json({ checkoutRequestId: data.checkout_request_id });
}
