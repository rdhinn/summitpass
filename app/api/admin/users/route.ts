import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getAuthSession } from "@/app/lib/auth";

export async function GET(request: Request) {
  try {
    const session = getAuthSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "Tidak terotorisasi" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        tanggal_daftar: "desc",
      },
    });

    // Remove passwords from response
    const safeUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getAuthSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "Tidak terotorisasi" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "ID User wajib diisi!" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan!" }, { status: 404 });
    }

    // Delete related OTP records and User record in transaction
    await prisma.$transaction([
      prisma.otp.deleteMany({ where: { user_id: userId } }),
      prisma.user.delete({ where: { user_id: userId } }),
    ]);

    return NextResponse.json({
      message: "Akun Hiker berhasil dihapus permanen oleh Admin",
      userEmail: user.email,
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
