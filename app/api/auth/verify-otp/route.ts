import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "summitpass-super-secret-jwt-key-2026";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, otpCode } = body;

    if (!userId || !otpCode) {
      return NextResponse.json({ message: "ID User dan Kode OTP harus diisi!" }, { status: 400 });
    }

    if (otpCode !== "123456") {
      return NextResponse.json({ message: "Kode OTP salah! Gunakan kode dummy: 123456" }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan!" }, { status: 404 });
    }

    // Update user status to Aktif
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: { status_akun: "Aktif" },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: updatedUser.user_id, role: "user" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Verifikasi OTP berhasil, akun aktif!",
      user: {
        user_id: updatedUser.user_id,
        nama: updatedUser.nama,
        email: updatedUser.email,
        no_hp: updatedUser.no_hp,
        status_akun: updatedUser.status_akun,
      },
    });

    // Set cookie
    response.cookies.set("summitpass_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
