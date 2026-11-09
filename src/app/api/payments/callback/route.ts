import { POST as completePayment } from "@/app/api/payment/webhook/route";

export async function POST(request: Request) {
  return completePayment(request);
}
