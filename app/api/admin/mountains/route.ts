import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getAuthSession } from "@/app/lib/auth";

export async function GET(request: Request) {
  try {
    const mountains = await prisma.mountain.findMany();
    return NextResponse.json({ mountains });
  } catch (error) {
    console.error("Get mountains error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getAuthSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "Tidak terotorisasi" }, { status: 401 });
    }

    const body = await request.json();
    const { mountainId, name, location, height, price, quota, difficulty } = body;

    if (!mountainId || !name || !location || height === undefined || price === undefined || quota === undefined || !difficulty) {
      return NextResponse.json({ message: "Data tidak lengkap!" }, { status: 400 });
    }

    const updatedMountain = await prisma.mountain.update({
      where: { mountain_id: mountainId },
      data: {
        name,
        location,
        height: parseInt(height.toString()),
        price: parseInt(price.toString()),
        quota: parseInt(quota.toString()),
        difficulty,
      },
    });

    return NextResponse.json({
      message: "Data gunung berhasil diperbarui!",
      mountain: updatedMountain,
    });
  } catch (error) {
    console.error("Admin update mountain error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
