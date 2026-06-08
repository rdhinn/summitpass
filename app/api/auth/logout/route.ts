import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout berhasil!" });
  
  // Clear cookie by setting maxAge to 0
  response.cookies.set("summitpass_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
