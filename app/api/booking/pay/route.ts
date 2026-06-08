import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getAuthSession } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    const session = getAuthSession(request);
    if (!session || session.role !== "user") {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ message: "ID Pemesanan wajib diisi!" }, { status: 400 });
    }

    // Verify booking belongs to user
    const booking = await prisma.booking.findUnique({
      where: { booking_id: bookingId },
      include: { mountain: true },
    });

    if (!booking || booking.user_id !== session.userId) {
      return NextResponse.json({ message: "Pemesanan tidak ditemukan!" }, { status: 404 });
    }

    // Update status to "Diproses" (Paid & Processing review)
    const updatedBooking = await prisma.booking.update({
      where: { booking_id: bookingId },
      data: { status: "Diproses" },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        user_id: session.userId,
        title: "Pembayaran Berhasil Diajukan",
        message: `Pembayaran tiket pendakian ${booking.mountain.name} telah diterima. Tiket Anda saat ini dalam status: Diproses (Menunggu Verifikasi Admin).`,
      },
    });

    return NextResponse.json({
      message: "Pembayaran berhasil dikonfirmasi!",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Confirm payment API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server!" }, { status: 500 });
  }
}
