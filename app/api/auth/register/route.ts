import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "summitpass-super-secret-jwt-key-2026";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, no_hp, password } = body;

    // Validations
    if (!nama || !email || !no_hp || !password) {
      return NextResponse.json({ message: "Semua kolom harus diisi!" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password minimal harus 6 karakter!" }, { status: 400 });
    }

    const { isValidIndonesianPhoneNumber, sendWhatsAppOTP } = require("@/app/lib/whatsapp");
    if (!isValidIndonesianPhoneNumber(no_hp)) {
      return NextResponse.json({ 
        message: "Nomor WhatsApp tidak valid! Gunakan format nomor Indonesia yang benar (e.g., 08xxxxxxxxxx)." 
      }, { status: 400 });
    }

    // Check if user already exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar!" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with status 'Tertunda'
    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        no_hp,
        password: hashedPassword,
        status_akun: "Tertunda",
      },
    });

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save to Otp table
    await prisma.otp.create({
      data: {
        user_id: newUser.user_id,
        code: otpCode,
        expires_at: expiresAt,
        verified: false,
      },
    });

    // Send OTP via WhatsApp
    const sendResult = await sendWhatsAppOTP(newUser.no_hp, otpCode);

    return NextResponse.json({
      message: sendResult.success 
        ? "Registrasi berhasil! Kode OTP telah dikirim ke WhatsApp Anda." 
        : `Registrasi berhasil! OTP tersimpan tetapi gagal mengirim WhatsApp: ${sendResult.error}`,
      user: {
        user_id: newUser.user_id,
        nama: newUser.nama,
        email: newUser.email,
        no_hp: newUser.no_hp,
        status_akun: newUser.status_akun,
      },
      provider: sendResult.provider,
      otpCode: process.env.NODE_ENV !== "production" ? otpCode : undefined,
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server!" }, { status: 500 });
  }
}
