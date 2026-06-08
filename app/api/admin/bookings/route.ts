import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getAuthSession } from "@/app/lib/auth";

export async function GET(request: Request) {
  try {
    const session = getAuthSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "Tidak terotorisasi" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        mountain: true,
        user: {
          select: {
            user_id: true,
            nama: true,
            email: true,
            no_hp: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const parsedBookings = bookings.map((b) => {
      try {
        return {
          ...b,
          hikers: typeof b.hikers === "string" ? JSON.parse(b.hikers) : b.hikers,
        };
      } catch (e) {
        return { ...b, hikers: [] };
      }
    });

    return NextResponse.json({ bookings: parsedBookings });
  } catch (error) {
    console.error("Admin get bookings error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getAuthSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "Tidak terotorisasi" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ message: "ID Pemesanan dan Status wajib diisi!" }, { status: 400 });
    }

    if (!["Pending", "Diproses", "Selesai"].includes(status)) {
      return NextResponse.json({ message: "Status tidak valid!" }, { status: 400 });
    }

    // Fetch booking to verify existence and get user info
    const booking = await prisma.booking.findUnique({
      where: { booking_id: bookingId },
      include: { mountain: true },
    });

    if (!booking) {
      return NextResponse.json({ message: "Pemesanan tidak ditemukan!" }, { status: 404 });
    }

    // Update status
    const updatedBooking = await prisma.booking.update({
      where: { booking_id: bookingId },
      data: { status },
    });

    // Create notification for Hiker
    await prisma.notification.create({
      data: {
        user_id: booking.user_id,
        title: "Pembaruan Status Booking",
        message: `Status pemesanan pendakian ${booking.mountain.name} untuk tanggal ${new Date(
          booking.booking_date
        ).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })} telah diubah menjadi: ${status}.`,
      },
    });

    return NextResponse.json({
      message: "Status pemesanan berhasil diperbarui!",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Admin update booking status error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
