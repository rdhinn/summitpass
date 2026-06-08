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
    const { mountainId, bookingDate, hikers } = body;

    if (!mountainId || !bookingDate || !hikers || !Array.isArray(hikers) || hikers.length === 0) {
      return NextResponse.json({ message: "Data pemesanan tidak lengkap!" }, { status: 400 });
    }

    // Fetch mountain details
    const mountain = await prisma.mountain.findUnique({
      where: { mountain_id: mountainId },
    });

    if (!mountain) {
      return NextResponse.json({ message: "Gunung tidak ditemukan!" }, { status: 404 });
    }

    // Validate and parse date
    const targetDate = new Date(bookingDate);
    // Set hours to 0 to compare dates accurately
    targetDate.setHours(0, 0, 0, 0);

    // Calculate sisa kuota (check all bookings on that date)
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const bookingsOnDate = await prisma.booking.findMany({
      where: {
        mountain_id: mountainId,
        booking_date: {
          gte: targetDate,
          lt: nextDay,
        },
        status: {
          in: ["Pending", "Diproses", "Selesai"],
        },
      },
    });

    let currentBookedHikers = 0;
    for (const b of bookingsOnDate) {
      try {
        const bHikers = typeof b.hikers === "string" ? JSON.parse(b.hikers) : b.hikers;
        if (Array.isArray(bHikers)) {
          currentBookedHikers += bHikers.length;
        }
      } catch (e) {
        console.error("Error parsing hikers JSON for quota calculation:", e);
      }
    }

    const availableQuota = mountain.quota - currentBookedHikers;
    if (hikers.length > availableQuota) {
      return NextResponse.json(
        {
          message: `Kuota penuh untuk tanggal terpilih! Sisa kuota hanya ${availableQuota} pendaki.`,
          availableQuota,
        },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPrice = mountain.price * hikers.length;

    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        user_id: session.userId,
        mountain_id: mountainId,
        booking_date: targetDate,
        status: "Pending",
        total_price: totalPrice,
        hikers: JSON.stringify(hikers),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        user_id: session.userId,
        title: "Pengajuan Tiket Pendakian",
        message: `Pemesanan pendakian ${mountain.name} untuk tanggal ${targetDate.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })} berhasil diajukan dengan status Pending. Harap tunggu verifikasi dari Admin.`,
      },
    });

    return NextResponse.json({
      message: "Pemesanan berhasil diajukan!",
      booking: {
        ...newBooking,
        hikers: hikers,
      },
    });
  } catch (error) {
    console.error("Create booking API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server!" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = getAuthSession(request);
    if (!session || session.role !== "user") {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { user_id: session.userId },
      include: {
        mountain: true,
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
    console.error("Get bookings API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server!" }, { status: 500 });
  }
}
