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
