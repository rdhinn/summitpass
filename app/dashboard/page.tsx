"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserRecord {
  user_id: string;
  nama: string;
  email: string;
  no_hp: string;
  tanggal_daftar: string;
  status_akun: string;
}

interface ProfileRecord {
  profile_id: string;
  user_id: string;
  no_ktp: string;
  tanggal_lahir: string;
  golongan_darah: string;
  kontak_darurat: string;
}

interface BookingRecord {
  booking_id: string;
  booking_date: string;
  status: "Pending" | "Diproses" | "Selesai";
  total_price: number;
  created_at: string;
  mountain: {
    name: string;
    location: string;
    height: number;
  };
  hikers: Array<{
    nama: string;
    no_ktp: string;
    no_hp: string;
    kontak_darurat: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"card" | "history" | "db">("card");
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // 1. Fetch user session
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/register");
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);
      setProfile(meData.user.profile);

      // 2. Fetch bookings
      const bookingRes = await fetch("/api/booking");
      if (bookingRes.ok) {
        const bookingData = await bookingRes.json();
        const bList = bookingData.bookings || [];
        setBookings(bList);

        // Calculate stats
        const total = bList.length;
        const active = bList.filter((b: BookingRecord) => b.status === "Pending" || b.status === "Diproses").length;
        const completed = bList.filter((b: BookingRecord) => b.status === "Selesai").length;
        setStats({ total, active, completed });
      }
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.dispatchEvent(new Event("summitpass_auth"));
      router.push("/register");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-32 flex flex-col items-center justify-center min-h-screen">
        <span className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></span>
        <p className="mt-4 text-on-surface-variant font-medium text-sm">Memuat Dashboard Pendaki...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary/5 p-8 rounded-3xl border border-primary/10 shadow-sm">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest">Dashboard Hiker</span>
          <h1 className="text-3xl font-headline font-black text-on-surface mt-1">
            Selamat Datang, {user.nama}!
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Status Akun: <span className="bg-primary-container text-primary px-3 py-0.5 rounded-full font-bold text-xs">{user.status_akun}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/mountain/prau"
            className="forest-gradient text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">hiking</span>
            Pesan Pendakian
          </Link>
          <button
            onClick={handleLogout}
            className="bg-white border border-outline-variant/60 text-error px-5 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-error/5 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Keluar Sesi
          </button>
        </div>
      </section>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl">confirmation_number</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-on-surface-variant font-bold">Total Booking</span>
            <span className="text-2xl font-black font-headline text-on-surface">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-2xl animate-pulse">explore</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-on-surface-variant font-bold">Booking Aktif</span>
            <span className="text-2xl font-black font-headline text-on-surface">{stats.active}</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/30 flex items-center justify-center text-tertiary-fixed-dim shrink-0">
            <span className="material-symbols-outlined text-2xl">task_alt</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-on-surface-variant font-bold">Selesai Mendaki</span>
            <span className="text-2xl font-black font-headline text-on-surface">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-6">
        <button
          onClick={() => setActiveTab("card")}
          className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "card"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Kartu Pendaki
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Riwayat Tiket
        </button>
        <button
          onClick={() => setActiveTab("db")}
          className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "db"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Status Database Live
        </button>
      </div>

      {/* Tab Content 1: Hiker Pass */}
      {activeTab === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fadeIn">
          {/* Hiker Pass Card */}
          <div className="md:col-span-7">
            {profile ? (
              <div className="forest-gradient rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[380px] card-shadow">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                
                <div className="flex justify-between items-start z-10">
                  <div>
                    <h3 className="font-headline font-black text-2xl tracking-widest uppercase">SUMMITPASS</h3>
                    <span className="text-[9px] tracking-[0.2em] opacity-80 uppercase font-bold">KARTU PENDAKI DIGITAL</span>
                  </div>
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase border border-white/25">
                    STATUS: {user.status_akun}
                  </span>
                </div>

                <div className="my-8 flex items-center gap-6 z-10">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 bg-white/10 shrink-0">
                    <img
                      alt="Foto Profil"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVIdhlHt_abCB2b30N_jdc1D7L7q-mR1Ul4EiVLrsmaCU-UuxHTk5m2qnQrCxUWAB_4PmXWg6ZCeJnVz1QZxl3dP0YMG6M4LcvpD1bkA8AdoG2qkqnqgYPS7q6isDy4nYsmqxyUf6TrQNkHxi9RUNaNJ9OEC0-vW5iIwpC9E6rMdQptjxVmjgvvvosJd6685mD9ZySzUxSpbEQVoyFN9eQrlRfyeanpbYHKVbYFmu33kVkfnSclyLjpH65HTT8kIexUjd3Vgj-OUI"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-bold font-headline leading-none truncate max-w-[220px]">{user.nama}</p>
                    <p className="text-[10px] opacity-75 font-mono">ID: {user.user_id}</p>
                    <p className="text-[10px] opacity-75 font-mono">NIK: {profile.no_ktp}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20 flex justify-between items-end z-10 font-mono text-[10px]">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span className="block opacity-60">GOL. DARAH</span>
                      <span className="font-bold text-sm">{profile.golongan_darah}</span>
                    </div>
                    <div>
                      <span className="block opacity-60">LAHIR</span>
                      <span className="font-bold">
                        {new Date(profile.tanggal_lahir).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block opacity-60">TGL DAFTAR</span>
                    <span className="font-bold">
                      {new Date(user.tanggal_daftar).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                <span className="material-symbols-outlined text-primary text-5xl">badge</span>
                <h3 className="text-lg font-bold">Profil Pendaki Belum Lengkap</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                  Lengkapi profil pendaki Anda sekarang untuk mencetak Kartu Pendaki Digital dan memvalidasi SIMAKSI online.
                </p>
                <button
                  onClick={() => {
                    // Trigger Step 4 flow in register page or complete profile directly
                    router.push("/register");
                  }}
                  className="forest-gradient text-white px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md"
                >
                  Lengkapi Profil Sekarang
                </button>
              </div>
            )}
          </div>

          {/* Validation QR & Information */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4">Validasi SIMAKSI Digital</span>
              <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 mb-4">
                <img
                  alt="QR Code Validation"
                  className="w-32 h-32"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD33OBC450VKt6YKc8wVSTC48uGqUXjjn19aBMlAx-gGhEhccd9I47Q5dktPu-X1qh0vqKHaS-mhO40ln4_9xEsNFOXcS9l4lpEU7xw15QgnBR91Nq4C-WqIhxoA-qfaTAuSlEC6QU9suvbj7l7TqQwdU398yokZ0W5boS2eXFmu4gHEuZ-vWbQ_PgN1FQ5ok8k5fryesKLiS5Mq6c0kiqYLyGir-dBRcvjMGXNAV8B8bXUgWbnnYlPP8Za_6p6ab02iq6zYgONks"
                />
              </div>
              <p className="text-xs text-on-surface-variant max-w-[200px] leading-relaxed font-medium">
                Pindai kode QR ini di basecamp pendakian resmi untuk validasi izin masuk.
              </p>
            </div>

            <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 space-y-4 shadow-sm text-sm">
              <h4 className="font-bold text-xs text-secondary uppercase tracking-wider border-b border-outline-variant/20 pb-2">Kontak Informasi</h4>
              <div className="grid grid-cols-3 text-xs">
                <span className="text-on-surface-variant font-medium">No. HP:</span>
                <span className="col-span-2 text-on-surface font-bold font-mono">{user.no_hp}</span>
              </div>
              <div className="grid grid-cols-3 text-xs">
                <span className="text-on-surface-variant font-medium">Email:</span>
                <span className="col-span-2 text-on-surface font-bold break-all">{user.email}</span>
              </div>
              {profile && (
                <div className="grid grid-cols-3 text-xs">
                  <span className="text-on-surface-variant font-medium">Darurat:</span>
                  <span className="col-span-2 text-on-surface font-bold font-mono">{profile.kontak_darurat}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Booking History */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-fadeIn">
          {bookings.length === 0 ? (
            <div className="bg-white border border-outline-variant/30 rounded-3xl p-10 text-center space-y-4 shadow-sm">
              <span className="material-symbols-outlined text-primary text-5xl">calendar_today</span>
              <h3 className="text-lg font-bold text-on-surface">Belum Ada Pemesanan</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Anda belum pernah memesan tiket pendakian. Rencanakan perjalanan pertama Anda sekarang!
              </p>
              <Link
                href="/mountain/prau"
                className="forest-gradient text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md inline-block cursor-pointer"
              >
                Pesan Tiket Gunung Prau
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-headline font-black text-xl text-primary">
                        {booking.mountain.name}
                      </h4>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          booking.status === "Pending"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : booking.status === "Diproses"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-6 text-xs text-on-surface-variant font-medium">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        <span>
                          {new Date(booking.booking_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        <span>{booking.hikers.length} Pendaki</span>
                      </div>
                      <div className="flex items-center gap-1 col-span-2 md:col-span-1">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        <span className="font-bold text-on-surface">
                          Rp{booking.total_price.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-on-surface-variant/80 border-t border-outline-variant/20 pt-2 mt-2">
                      <span className="font-bold">Pendaki: </span>
                      {booking.hikers.map((h, idx) => (
                        <span key={idx}>
                          {h.nama} (KTP: {h.no_ktp})
                          {idx < booking.hikers.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/booking/confirmation?bookingId=${booking.booking_id}`}
                    className="bg-surface-container-high border border-outline-variant/40 hover:bg-primary-container hover:text-on-primary-container px-4 py-2.5 rounded-2xl text-xs font-bold text-secondary-fixed transition-all flex items-center gap-1 shadow-sm shrink-0 w-full md:w-auto justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">receipt_long</span>
                    E-Tiket
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Live SQL Database Visualization */}
      {activeTab === "db" && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-surface-container/30 border border-outline-variant/30 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">database</span>
              <div>
                <h3 className="font-headline font-bold text-xl">Visualisasi Database Live (PostgreSQL)</h3>
                <p className="text-xs text-on-surface-variant">
                  Berikut adalah record data asli yang ditarik dari database relasional Anda secara real-time.
                </p>
              </div>
            </div>

            {/* Table Users */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-primary/10 px-4 py-2.5 rounded-xl border border-primary/20">
                <span className="font-mono text-xs font-bold text-primary">TABLE: users</span>
                <span className="bg-white text-primary px-2 py-0.5 rounded text-[10px] font-bold font-mono">1 Record</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-white shadow-inner">
                <table className="w-full text-left border-collapse font-mono text-[10px]">
                  <thead>
                    <tr className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant/30">
                      <th className="p-3 font-bold">user_id (PK)</th>
                      <th className="p-3 font-bold">nama</th>
                      <th className="p-3 font-bold">email</th>
                      <th className="p-3 font-bold">no_hp</th>
                      <th className="p-3 font-bold">password</th>
                      <th className="p-3 font-bold">status_akun</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-outline-variant/20 hover:bg-surface-container-low/40">
                      <td className="p-3 font-bold text-primary truncate max-w-[120px]">{user.user_id}</td>
                      <td className="p-3 text-on-surface font-bold">{user.nama}</td>
                      <td className="p-3 text-on-surface-variant">{user.email}</td>
                      <td className="p-3 text-on-surface-variant">{user.no_hp}</td>
                      <td className="p-3 text-on-surface-variant italic">******** (bcrypt_hashed)</td>
                      <td className="p-3 font-bold">
                        <span className="text-primary bg-primary-container px-2.5 py-0.5 rounded-full text-[9px] uppercase font-sans font-bold">
                          {user.status_akun}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Hiker Profiles */}
            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-center bg-secondary/10 px-4 py-2.5 rounded-xl border border-secondary/20">
                <span className="font-mono text-xs font-bold text-secondary">TABLE: hiker_profiles</span>
                <span className="bg-white text-secondary px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                  {profile ? "1 Record" : "0 Record"}
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-white shadow-inner">
                <table className="w-full text-left border-collapse font-mono text-[10px]">
                  <thead>
                    <tr className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant/30">
                      <th className="p-3 font-bold">profile_id (PK)</th>
                      <th className="p-3 font-bold">user_id (FK)</th>
                      <th className="p-3 font-bold">no_ktp</th>
                      <th className="p-3 font-bold">tanggal_lahir</th>
                      <th className="p-3 font-bold">golongan_darah</th>
                      <th className="p-3 font-bold">kontak_darurat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile ? (
                      <tr className="border-b border-outline-variant/20 hover:bg-surface-container-low/40">
                        <td className="p-3 font-bold text-secondary truncate max-w-[120px]">{profile.profile_id}</td>
                        <td className="p-3 text-primary truncate max-w-[120px]">{profile.user_id}</td>
                        <td className="p-3 text-on-surface-variant">{profile.no_ktp}</td>
                        <td className="p-3 text-on-surface-variant">{profile.tanggal_lahir}</td>
                        <td className="p-3 text-on-surface font-black text-center">{profile.golongan_darah}</td>
                        <td className="p-3 text-on-surface-variant">{profile.kontak_darurat}</td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-on-surface-variant italic">
                          Belum ada record data. Harap lengkapi profil pendaki.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Bookings */}
            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-center bg-tertiary-container/30 px-4 py-2.5 rounded-xl border border-outline-variant/20">
                <span className="font-mono text-xs font-bold text-secondary-fixed">TABLE: bookings</span>
                <span className="bg-white text-secondary-fixed px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                  {bookings.length} Record
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-white shadow-inner">
                <table className="w-full text-left border-collapse font-mono text-[10px]">
                  <thead>
                    <tr className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant/30">
                      <th className="p-3 font-bold">booking_id (PK)</th>
                      <th className="p-3 font-bold">mountain_id (FK)</th>
                      <th className="p-3 font-bold">booking_date</th>
                      <th className="p-3 font-bold">status</th>
                      <th className="p-3 font-bold">total_price</th>
                      <th className="p-3 font-bold">hikers (JSON)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length > 0 ? (
                      bookings.map((b) => (
                        <tr key={b.booking_id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/40">
                          <td className="p-3 font-bold text-secondary-fixed truncate max-w-[120px]">{b.booking_id}</td>
                          <td className="p-3 text-on-surface-variant truncate max-w-[120px]">prau-id-f823</td>
                          <td className="p-3 text-on-surface-variant">
                            {new Date(b.booking_date).toISOString().split("T")[0]}
                          </td>
                          <td className="p-3 font-bold">{b.status}</td>
                          <td className="p-3 text-on-surface font-bold">Rp{b.total_price.toLocaleString("id-ID")}</td>
                          <td className="p-3 text-on-surface-variant truncate max-w-[200px]" title={JSON.stringify(b.hikers)}>
                            {JSON.stringify(b.hikers)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-on-surface-variant italic">
                          Belum ada data pemesanan pendakian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
