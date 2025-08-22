import { NextResponse } from "next/server";

function buildLogoutResponse() {
  const res = NextResponse.json(
    { message: "Logout successful", success: true, redirect: "/login" },
    { status: 200 }
  );

  // Clear JWT cookie
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return res;
}

export async function GET() {
  try {
    return buildLogoutResponse();
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Logout failed" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    return buildLogoutResponse();
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Logout failed" },
      { status: 500 }
    );
  }
}
