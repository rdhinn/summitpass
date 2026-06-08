import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "summitpass-super-secret-jwt-key-2026";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json({ message: "Semua kolom harus diisi!" }, { status: 400 });
    }

    // 1. Check if it's an Admin (by username or email)
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: emailOrUsername },
          { email: emailOrUsername }
        ]
      }
    });

    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (isPasswordValid) {
        // Generate Admin JWT
        const token = jwt.sign(
          { userId: admin.admin_id, role: "admin" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        const response = NextResponse.json({
          message: "Login Admin berhasil!",
          role: "admin",
          user: {
            user_id: admin.admin_id,
            nama: admin.nama,
            email: admin.email,
            username: admin.username,
          },
        });

        // Set HTTP-Only Cookie
        response.cookies.set("summitpass_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        });

        return response;
      }
    }

    // 2. Check if it's a Hiker / User (by email)
    const user = await prisma.user.findUnique({
      where: { email: emailOrUsername },
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // Generate Hiker JWT
        const token = jwt.sign(
          { userId: user.user_id, role: "user" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        const response = NextResponse.json({
          message: "Login berhasil!",
          role: "user",
          user: {
            user_id: user.user_id,
            nama: user.nama,
            email: user.email,
            no_hp: user.no_hp,
            status_akun: user.status_akun,
          },
        });

        // Set HTTP-Only Cookie
        response.cookies.set("summitpass_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        });

        return response;
      }
    }

    return NextResponse.json({ message: "Email/Username atau password salah!" }, { status: 400 });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server!" }, { status: 500 });
  }
}
