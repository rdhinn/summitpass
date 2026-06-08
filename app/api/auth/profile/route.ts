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
    const { noKtp, tanggalLahir, golonganDarah, kontakDarurat } = body;

    if (!noKtp || !tanggalLahir || !golonganDarah || !kontakDarurat) {
      return NextResponse.json({ message: "Semua kolom profil wajib diisi!" }, { status: 400 });
    }

    if (noKtp.length !== 16) {
      return NextResponse.json({ message: "Nomor KTP harus tepat 16 digit!" }, { status: 400 });
    }

    // Check if profile already exists for this user
    const existingProfile = await prisma.hikerProfile.findUnique({
      where: { user_id: session.userId },
    });

    let profile;
    if (existingProfile) {
      profile = await prisma.hikerProfile.update({
        where: { user_id: session.userId },
        data: {
          no_ktp: noKtp,
          tanggal_lahir: tanggalLahir,
          golongan_darah: golonganDarah,
          kontak_darurat: kontakDarurat,
        },
      });
    } else {
      profile = await prisma.hikerProfile.create({
        data: {
          user_id: session.userId,
          no_ktp: noKtp,
          tanggal_lahir: tanggalLahir,
          golongan_darah: golonganDarah,
          kontak_darurat: kontakDarurat,
        },
      });
    }

    return NextResponse.json({
      message: "Profil pendaki berhasil disimpan!",
      profile,
    });
  } catch (error) {
    console.error("Save profile API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
