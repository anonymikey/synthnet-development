import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PlanInput = {
  id?: unknown;
  name?: unknown;
  price?: unknown;
  durationMinutes?: unknown;
  speedMbps?: unknown;
  dataCapMb?: unknown;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validatePlan(plan: PlanInput) {
  const name = typeof plan.name === "string" ? plan.name.trim() : "";
  const price = Number(plan.price);
  const duration_minutes = Number(plan.durationMinutes);
  const speed = Number(plan.speedMbps);
  const dataCapMb = plan.dataCapMb == null || plan.dataCapMb === "" ? null : Number(plan.dataCapMb);

  if (
    !name ||
    name.length > 80 ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(duration_minutes) ||
    duration_minutes <= 0 ||
    !Number.isInteger(speed) ||
    speed <= 0 ||
    (dataCapMb !== null && (!Number.isInteger(dataCapMb) || dataCapMb <= 0))
  ) {
    return null;
  }

  return {
    id: typeof plan.id === "string" && UUID_PATTERN.test(plan.id) ? plan.id : undefined,
    name,
    price,
    duration_minutes,
    speed_limit_down_mbps: speed,
    speed_limit_up_mbps: speed,
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { plans?: unknown };
  if (!Array.isArray(body.plans)) {
    return NextResponse.json({ error: "Plans must be an array." }, { status: 400 });
  }

  const plans = body.plans.map((plan) => validatePlan((plan ?? {}) as PlanInput));
  if (plans.some((plan) => !plan)) {
    return NextResponse.json({ error: "Every plan must have a valid name, price, duration, and speed." }, { status: 400 });
  }

  const admin = createAdminClient();
  const validPlans = plans.filter((plan): plan is NonNullable<typeof plan> => Boolean(plan));
  const { data: existing, error: existingError } = await admin.from("packages").select("id");
  if (existingError) return NextResponse.json({ error: "Unable to read packages." }, { status: 500 });

  const incomingIds = new Set(validPlans.flatMap((plan) => (plan.id ? [plan.id] : [])));
  const idsToDelete = (existing ?? []).map((row) => row.id).filter((id) => !incomingIds.has(id));
  if (idsToDelete.length > 0) {
    const { error } = await admin.from("packages").delete().in("id", idsToDelete);
    if (error) return NextResponse.json({ error: "Unable to remove deleted plans." }, { status: 500 });
  }

  for (const plan of validPlans) {
    const { id, ...values } = plan;
    const query = id
      ? admin.from("packages").update(values).eq("id", id)
      : admin.from("packages").insert(values);
    const { error } = await query;
    if (error) return NextResponse.json({ error: "Unable to save all plans." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
