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

    if (no_hp.length < 10) {
      return NextResponse.json({ message: "Nomor HP minimal harus 10 digit!" }, { status: 400 });
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

    return NextResponse.json({
      message: "Registrasi berhasil! OTP dikirim.",
      user: {
        user_id: newUser.user_id,
        nama: newUser.nama,
        email: newUser.email,
        no_hp: newUser.no_hp,
        status_akun: newUser.status_akun,
      },
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server!" }, { status: 500 });
  }
}
