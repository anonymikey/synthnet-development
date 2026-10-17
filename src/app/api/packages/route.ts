import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PackageInput = {
  name?: unknown;
  price?: unknown;
  duration_minutes?: unknown;
  speed_limit_down_mbps?: unknown;
  speed_limit_up_mbps?: unknown;
};

function validate(input: PackageInput) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const price = Number(input.price);
  const duration_minutes = Number(input.duration_minutes);
  const speed_limit_down_mbps = Number(input.speed_limit_down_mbps);
  const speed_limit_up_mbps = Number(input.speed_limit_up_mbps);
  if (!name || name.length > 80 || !Number.isFinite(price) || price < 0 || !Number.isInteger(duration_minutes) || duration_minutes <= 0 || !Number.isInteger(speed_limit_down_mbps) || speed_limit_down_mbps <= 0 || !Number.isInteger(speed_limit_up_mbps) || speed_limit_up_mbps <= 0) return null;
  return { name, price, duration_minutes, speed_limit_down_mbps, speed_limit_up_mbps };
}

export async function GET() {
  const { data, error } = await createAdminClient().from("packages").select("id,name,price,duration_minutes,speed_limit_down_mbps,speed_limit_up_mbps,created_at").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Unable to load packages" }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const input = validate((await request.json()) as PackageInput);
  if (!input) return NextResponse.json({ error: "Enter a valid name, price, duration, and speed limits." }, { status: 400 });
  const { data, error } = await createAdminClient().from("packages").insert(input).select("id,name,price,duration_minutes,speed_limit_down_mbps,speed_limit_up_mbps,created_at").single();
  if (error) return NextResponse.json({ error: "Unable to create package" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as PackageInput & { id?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  const input = validate(body);
  if (!id || !input) return NextResponse.json({ error: "Enter valid package details." }, { status: 400 });
  const { data, error } = await createAdminClient().from("packages").update(input).eq("id", id).select("id,name,price,duration_minutes,speed_limit_down_mbps,speed_limit_up_mbps,created_at").single();
  if (error) return NextResponse.json({ error: "Unable to update package" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Package id is required." }, { status: 400 });
  const { error } = await createAdminClient().from("packages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Unable to delete package" }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
