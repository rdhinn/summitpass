import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "summitpass-super-secret-jwt-key-2026";

interface DecodedToken {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get("cookie") || "";
    // Simple cookie parser helper
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => c.trim().split("="))
    );
    const token = cookies["summitpass_token"];

    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    // Verify JWT
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (err) {
      return NextResponse.json({ message: "Token tidak valid atau kedaluwarsa" }, { status: 401 });
    }

    // 1. If Admin role
    if (decoded.role === "admin") {
      const admin = await prisma.admin.findUnique({
        where: { admin_id: decoded.userId },
      });

      if (!admin) {
        return NextResponse.json({ message: "Admin tidak ditemukan" }, { status: 401 });
      }

      return NextResponse.json({
        authenticated: true,
        role: "admin",
        user: {
          user_id: admin.admin_id,
          nama: admin.nama,
          email: admin.email,
          username: admin.username,
        },
      });
    }

    // 2. If Hiker / User role
    if (decoded.role === "user") {
      const user = await prisma.user.findUnique({
        where: { user_id: decoded.userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return NextResponse.json({ message: "User tidak ditemukan" }, { status: 401 });
      }

      // Hide password
      const { password, ...userWithoutPassword } = user;

      return NextResponse.json({
        authenticated: true,
        role: "user",
        user: userWithoutPassword,
      });
    }

    return NextResponse.json({ message: "Role tidak dikenali" }, { status: 401 });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => c.trim().split("="))
    );
    const token = cookies["summitpass_token"];

    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (err) {
      return NextResponse.json({ message: "Token tidak valid atau kedaluwarsa" }, { status: 401 });
    }

    if (decoded.role !== "user") {
      return NextResponse.json({ message: "Hanya Hiker yang dapat menghapus akunnya sendiri" }, { status: 403 });
    }

    // Delete related OTP records and User record in transaction
    await prisma.$transaction([
      prisma.otp.deleteMany({ where: { user_id: decoded.userId } }),
      prisma.user.delete({ where: { user_id: decoded.userId } }),
    ]);

    // Clear session cookie
    const response = NextResponse.json({ message: "Akun berhasil dihapus permanen" });
    response.cookies.set("summitpass_token", "", { maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    console.error("Delete user account error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
