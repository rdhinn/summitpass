"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Hiker {
  nama: string;
  no_ktp: string;
  no_hp: string;
  kontak_darurat: string;
}

interface BookingRecord {
  booking_id: string;
  booking_date: string;
  status: "Pending" | "Diproses" | "Selesai";
  total_price: number;
  mountain: {
    name: string;
    location: string;
    height: number;
    price: number;
  };
  hikers: Hiker[];
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("ID Pemesanan tidak valid atau kosong.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch all user bookings and filter for the specific bookingId
        const res = await fetch("/api/booking");
        if (!res.ok) {
          router.push("/register");
          return;
        }

        const data = await res.json();
        const found = data.bookings?.find((b: BookingRecord) => b.booking_id === bookingId);

        if (found) {
          setBooking(found);
        } else {
          setError("Pemesanan tidak ditemukan di akun Anda.");
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError("Koneksi gagal. Silakan periksa database Anda.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, router]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-32 flex flex-col items-center justify-center min-h-screen">
        <span className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></span>
        <p className="mt-4 text-on-surface-variant font-medium text-sm">Memuat Rincian Tiket...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-32 pb-32 px-6 max-w-md mx-auto text-center space-y-6 min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-error text-6xl">error</span>
        <h1 className="text-2xl font-bold font-headline text-on-surface">Terjadi Kesalahan</h1>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {error || "Pemesanan tidak ditemukan."}
        </p>
        <Link
          href="/dashboard"
          className="forest-gradient text-white font-bold py-3 px-8 rounded-2xl text-sm shadow-md inline-block w-full cursor-pointer"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(booking.booking_date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const ticketId = `SP-${booking.booking_id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center animate-fadeIn">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-primary text-on-primary rounded-full flex items-center justify-center mb-6 shadow-md shadow-primary/10">
        <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface text-center mb-4 tracking-tight font-headline">
        Pendakian Diajukan
      </h1>
      <p className="text-on-surface-variant text-center max-w-md mb-12 font-medium text-sm">
        Pemesanan Anda telah tercatat di database dengan status <strong className="text-primary">{booking.status}</strong>. Tim admin akan segera memproses izin SIMAKSI Anda.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
        {/* Left Column - Details */}
        <section className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            <h2 className="text-sm font-bold text-secondary uppercase tracking-[0.1rem] mb-6 border-b border-outline-variant/20 pb-2">
              Detail Pemesanan
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary mt-1">landscape</span>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    Tujuan Gunung
                  </p>
                  <p className="text-lg font-bold text-on-surface font-headline">
                    {booking.mountain.name} ({booking.mountain.height}m)
                  </p>
                  <p className="text-xs text-on-surface-variant">{booking.mountain.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">calendar_today</span>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      Tanggal Pendakian
                    </p>
                    <p className="text-base font-bold text-on-surface font-headline">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">groups</span>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      Jumlah Anggota
                    </p>
                    <p className="text-base font-bold text-on-surface font-headline">
                      {booking.hikers.length} Pendaki
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary mt-1">payments</span>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    Total Biaya (Lunas)
                  </p>
                  <p className="text-lg font-black text-primary font-headline">
                    Rp{booking.total_price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="border-t border-outline-variant/30 pt-4">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Daftar Anggota Rombongan
                </p>
                <ul className="space-y-1.5 text-xs text-on-surface font-medium">
                  {booking.hikers.map((h, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-surface-container/40 px-3 py-2 rounded-xl border border-outline-variant/10">
                      <span>{idx === 0 ? "👑 " : "👤 "} {h.nama}</span>
                      <span className="font-mono text-on-surface-variant text-[10px]">KTP: {h.no_ktp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Weather Forecast */}
          <div className="bg-surface-container-low rounded-3xl p-6 flex items-center justify-between border border-outline-variant/20 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-outline-variant/10">
                <span className="material-symbols-outlined">cloudy_snowing</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Prakiraan Cuaca
                </p>
                <p className="font-bold text-on-surface text-sm">
                  12°C • Langit Cerah Berawan
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary/40">chevron_right</span>
          </div>
        </section>

        {/* Right Column - Digital Ticket */}
        <section className="md:col-span-5">
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-md border border-outline-variant/30 flex flex-col items-center">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-[0.1rem] mb-6 text-center">
              E-Tiket Digital
            </h2>

            {/* QR Code */}
            <div className="relative p-4 bg-white rounded-3xl mb-6 ring-1 ring-outline-variant/40 shadow-sm">
              <img
                alt="Tiket Kode QR"
                className="w-48 h-48 md:w-52 md:h-52"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD33OBC450VKt6YKc8wVSTC48uGqUXjjn19aBMlAx-gGhEhccd9I47Q5dktPu-X1qh0vqKHaS-mhO40ln4_9xEsNFOXcS9l4lpEU7xw15QgnBR91Nq4C-WqIhxoA-qfaTAuSlEC6QU9suvbj7l7TqQwdU398yokZ0W5boS2eXFmu4gHEuZ-vWbQ_PgN1FQ5ok8k5fryesKLiS5Mq6c0kiqYLyGir-dBRcvjMGXNAV8B8bXUgWbnnYlPP8Za_6p6ab02iq6zYgONks"
              />
              <div className="absolute inset-0 border-2 border-primary/10 rounded-3xl pointer-events-none"></div>
            </div>

            {/* Ticket ID */}
            <div className="text-center mb-6">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2rem] mb-1">
                ID Pemesanan
              </p>
              <p className="text-lg font-mono font-black text-primary">
                {ticketId}
              </p>
            </div>

            {/* Tear Line */}
            <div className="w-full h-[1px] bg-surface-container-high mb-6 relative">
              <div className="absolute -left-10 -top-2 w-4 h-4 bg-background rounded-full border-r border-outline-variant/20"></div>
              <div className="absolute -right-10 -top-2 w-4 h-4 bg-background rounded-full border-l border-outline-variant/20"></div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 ${
                booking.status === "Pending"
                  ? "bg-amber-100 text-amber-800"
                  : booking.status === "Diproses"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              STATUS: {booking.status}
            </span>

            <p className="text-center text-[10px] text-on-surface-variant leading-relaxed font-medium">
              Pindai kode QR ini di loket registrasi basecamp untuk validasi izin masuk SIMAKSI online Anda.
            </p>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link
          href="/dashboard"
          className="px-8 py-4 bg-primary text-white rounded-2xl font-bold font-headline flex items-center justify-center gap-3 transition-all hover:bg-primary/95 active:scale-95 shadow-md shadow-primary/10 cursor-pointer text-sm"
        >
          <span className="material-symbols-outlined text-base">dashboard</span>
          Buka Dashboard Saya
        </Link>
        <Link
          href="/"
          className="px-8 py-4 text-on-surface font-bold font-headline flex items-center justify-center gap-2 border border-outline-variant/50 hover:bg-surface-container-high/40 transition-all active:scale-95 rounded-2xl text-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">home</span>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 pb-32 flex flex-col items-center justify-center min-h-screen">
          <span className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></span>
          <p className="mt-4 text-on-surface-variant font-medium text-sm">Memuat Halaman Konfirmasi...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
