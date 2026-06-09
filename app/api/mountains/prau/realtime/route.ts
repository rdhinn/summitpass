import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(request: Request) {
  try {
    // 1. Fetch Mountain data from local database
    const mountain = await prisma.mountain.findFirst({
      where: { name: { contains: "Prau" } },
    });

    if (!mountain) {
      return NextResponse.json({ 
        message: "Data Gunung Prau tidak ditemukan di database." 
      }, { status: 404 });
    }

    // 2. Fetch all active bookings for today to compute registered hikers dynamically
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const bookingsToday = await prisma.booking.findMany({
      where: {
        mountain_id: mountain.mountain_id,
        booking_date: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ["Pending", "Diproses", "Selesai"],
        },
      },
    });

    let registeredHikers = 0;
    for (const b of bookingsToday) {
      try {
        const bHikers = typeof b.hikers === "string" ? JSON.parse(b.hikers) : b.hikers;
        if (Array.isArray(bHikers)) {
          registeredHikers += bHikers.length;
        }
      } catch (e) {
        console.error("Error parsing hikers JSON for real-time API:", e);
      }
    }

    // 3. Calculate dynamic occupancy metrics
    const quota = mountain.quota;
    const remainingQuota = Math.max(quota - registeredHikers, 0);

    // Determine crowd level based on quota utilization
    const occupancyRate = registeredHikers / quota;
    let crowdLevel = "Sepi";
    if (occupancyRate > 0.7) {
      crowdLevel = "Ramai";
    } else if (occupancyRate > 0.3) {
      crowdLevel = "Sedang";
    }

    // 4. Structured Output
    // This payload layout allows developers to easily replace this block with direct 
    // fetch/axios calls to official park management APIs once available.
    const realTimeAPIResult = {
      mountain_id: mountain.mountain_id,
      name: mountain.name,
      location: mountain.location,
      height: mountain.height,
      difficulty: mountain.difficulty,
      price: mountain.price,
      
      // Dynamic live stats
      quota: quota,
      registered_hikers: registeredHikers,
      remaining_quota: remainingQuota,
      status_jalur: "Buka", // Mocked, easily integrated with official system
      estimasi_keramaian: crowdLevel, // Computed dynamically
      cuaca: "Cerah Berawan", // Simulated weather
      suhu_camp: 12, // typical night temperature
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(realTimeAPIResult);
  } catch (error) {
    console.error("Real-time Prau API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server!" }, { status: 500 });
  }
}
