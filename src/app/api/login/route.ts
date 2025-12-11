import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { username, password } = body as {
    username?: string;
    password?: string;
  };

  if (
    !username ||
    !password ||
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });

  const token =
    process.env.ADMIN_SESSION_TOKEN ?? "default-admin-session";

  res.cookies.set("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return res;
}
