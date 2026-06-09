import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { sendWhatsAppOTP, isValidIndonesianPhoneNumber } from "@/app/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ message: "ID User wajib diisi!" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan!" }, { status: 404 });
    }

    if (!isValidIndonesianPhoneNumber(user.no_hp)) {
      return NextResponse.json({ 
        message: "Nomor WhatsApp User tidak valid! Gunakan format nomor Indonesia (e.g., 08xxxxxxxxx)." 
      }, { status: 400 });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save OTP to database
    await prisma.otp.create({
      data: {
        user_id: userId,
        code: otpCode,
        expires_at: expiresAt,
        verified: false,
      },
    });

    // Send OTP code via WhatsApp API
    const sendResult = await sendWhatsAppOTP(user.no_hp, otpCode);

    if (!sendResult.success) {
      return NextResponse.json({
        message: `OTP tersimpan di database tetapi gagal terkirim via WhatsApp: ${sendResult.error}`,
        userId,
        provider: sendResult.provider,
        // In local development, we expose the OTP for easier testing when no API key is available
        otpCode: process.env.NODE_ENV !== "production" ? otpCode : undefined,
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "OTP berhasil dikirim ke WhatsApp Anda!",
      userId,
      provider: sendResult.provider,
      otpCode: process.env.NODE_ENV !== "production" ? otpCode : undefined,
    });
  } catch (error) {
    console.error("Send OTP API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server!" }, { status: 500 });
  }
}
