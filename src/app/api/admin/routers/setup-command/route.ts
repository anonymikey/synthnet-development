import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { token?: string } | null;
  if (!body?.token) return NextResponse.json({ error: "Setup token is required." }, { status: 400 });
  const origin = request.nextUrl.origin;
  const scriptUrl = `${origin}/api/onboarding/mikrotik/${encodeURIComponent(body.token)}`;
  const command = `:do { :local nf [:parse "/system ntp client set enabled=yes servers=216.239.35.0,216.239.35.4"] ; $nf } on-error={ :do { :local n6 [:parse "/system ntp client set enabled=yes primary-ntp=216.239.35.0 secondary-ntp=216.239.35.4"] ; $n6 } on-error={} }; :delay 4; /tool fetch url="${scriptUrl}" dst-path=synthnet.rsc check-certificate=no; :delay 2; /import file-name=synthnet.rsc; :delay 1; /file remove [find name=synthnet.rsc]`;
  return NextResponse.json({ command, scriptUrl });
}
