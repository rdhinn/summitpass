"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  user_id: string;
  nama: string;
  email: string;
  no_hp: string;
  tanggal_daftar: string;
  status_akun: string;
  profile?: {
    no_ktp: string;
    tanggal_lahir: string;
    golongan_darah: string;
    kontak_darurat: string;
  } | null;
}

interface Booking {
  booking_id: string;
  booking_date: string;
  status: "Pending" | "Diproses" | "Selesai";
  total_price: number;
  created_at: string;
  user: {
    nama: string;
    email: string;
    no_hp: string;
  };
  mountain: {
    name: string;
  };
  hikers: Array<{
    nama: string;
    no_ktp: string;
    no_hp: string;
  }>;
}

interface Mountain {
  mountain_id: string;
  name: string;
  location: string;
  height: number;
  price: number;
  quota: number;
  difficulty: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [mountains, setMountains] = useState<Mountain[]>([]);
  
  const [activeTab, setActiveTab] = useState<"bookings" | "users" | "mountains">("bookings");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Edit Mountain State
  const [editingMountain, setEditingMountain] = useState<Mountain | null>(null);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      // 1. Fetch admin session
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/admin");
        return;
      }
      const meData = await meRes.json();
      if (meData.role !== "admin") {
        router.push("/admin");
        return;
      }
      setAdminUser(meData.user);

      // 2. Fetch all bookings
      const bookingsRes = await fetch("/api/admin/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
      }

      // 3. Fetch all users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // 4. Fetch all mountains
      const mountainsRes = await fetch("/api/admin/mountains");
      if (mountainsRes.ok) {
        const mountainsData = await mountainsRes.json();
        setMountains(mountainsData.mountains || []);
      }

    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle Update Booking Status
  const handleUpdateStatus = async (bookingId: string, nextStatus: string) => {
    setIsUpdating(true);
    setFeedbackMessage("");
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: nextStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage("Status booking berhasil diperbarui!");
        // Update local state
        setBookings(bookings.map(b => b.booking_id === bookingId ? { ...b, status: nextStatus as any } : b));
      } else {
        alert(data.message || "Gagal memperbarui status.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Edit Mountain Quota/Details
  const handleSaveMountain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMountain) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/mountains", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMountain),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage("Data gunung berhasil diperbarui!");
        setMountains(mountains.map(m => m.mountain_id === editingMountain.mountain_id ? editingMountain : m));
        setEditingMountain(null);
      } else {
        alert(data.message || "Gagal memperbarui data gunung.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.dispatchEvent(new Event("summitpass_auth"));
      router.push("/admin");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string, nama: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus akun Hiker "${nama}" secara permanen? Semua data profil, booking, dan notifikasi miliknya akan terhapus.`);
    if (!confirmDelete) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage(`Akun Hiker "${nama}" berhasil dihapus.`);
        fetchAdminData();
      } else {
        alert(data.message || "Gagal menghapus user.");
      }
    } catch (e) {
      console.error("Delete user error:", e);
      alert("Terjadi kesalahan koneksi saat menghapus user.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-32 flex flex-col items-center justify-center min-h-screen">
        <span className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></span>
        <p className="mt-4 text-on-surface-variant font-medium text-sm">Memuat Dasbor Admin...</p>
      </div>
    );
  }

  // Count Statistics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === "Pending").length;
  const totalHikers = users.length;
  const mainMountain = mountains[0]; // Gunung Prau

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Welcome & Logout Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/5 p-8 rounded-3xl border border-secondary/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest font-mono">Panel Administrator</span>
            <h1 className="text-3xl font-headline font-black text-on-surface mt-0.5">
              {adminUser?.nama}
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              Email: {adminUser?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white border border-outline-variant/60 text-error px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm hover:bg-error/5 active:scale-95 transition-all flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Keluar Admin
        </button>
      </section>

      {/* Global Admin Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl font-bold">confirmation_number</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Total Booking</span>
            <span className="text-2xl font-black font-headline text-on-surface">{totalBookings}</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Awaiting Verifikasi</span>
            <span className="text-2xl font-black font-headline text-on-surface text-amber-700">{pendingBookings}</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-2xl">groups</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Hiker Terdaftar</span>
            <span className="text-2xl font-black font-headline text-on-surface">{totalHikers}</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/30 flex items-center justify-center text-tertiary-fixed-dim shrink-0">
            <span className="material-symbols-outlined text-2xl">mountain_flag</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Kuota Harian (Prau)</span>
            <span className="text-2xl font-black font-headline text-on-surface">{mainMountain?.quota || 0} Pax</span>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-fadeIn">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {feedbackMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-6">
        <button
          onClick={() => { setActiveTab("bookings"); setFeedbackMessage(""); }}
          className={`pb-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "bookings" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Manajemen Booking
        </button>
        <button
          onClick={() => { setActiveTab("users"); setFeedbackMessage(""); }}
          className={`pb-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "users" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Daftar Hiker
        </button>
        <button
          onClick={() => { setActiveTab("mountains"); setFeedbackMessage(""); }}
          className={`pb-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "mountains" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Manajemen Gunung
        </button>
      </div>

      {/* -------------------- TAB 1: BOOKINGS MANAGEMENT -------------------- */}
      {activeTab === "bookings" && (
        <div className="bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
          <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low">
            <h3 className="font-headline font-bold text-lg">Semua Pengajuan Tiket SIMAKSI</h3>
            <p className="text-xs text-on-surface-variant">
              Lihat, evaluasi, dan ubah status pengajuan tiket pendakian rombongan hiker.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-medium">
              <thead>
                <tr className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant/30 font-bold">
                  <th className="p-4">Tanggal Daftar</th>
                  <th className="p-4">Hiker / Pemesan</th>
                  <th className="p-4">Gunung &amp; Tanggal Mendaki</th>
                  <th className="p-4">Rombongan</th>
                  <th className="p-4">Harga Total</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-surface-container-lowest/40 transition-colors">
                      <td className="p-4 font-mono text-[10px] text-on-surface-variant">
                        {new Date(booking.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-on-surface">{booking.user.nama}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">{booking.user.email}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">{booking.user.no_hp}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-primary">{booking.mountain.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">
                          Mendaki: {new Date(booking.booking_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <p className="font-bold text-on-surface">{booking.hikers.length} Pendaki</p>
                        <p className="text-[10px] text-on-surface-variant truncate" title={booking.hikers.map(h=>h.nama).join(", ")}>
                          {booking.hikers.map(h => h.nama).join(", ")}
                        </p>
                      </td>
                      <td className="p-4 font-bold text-on-surface">
                        Rp{booking.total_price.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase inline-block ${
                            booking.status === "Pending" ? "bg-amber-100 text-amber-800" :
                            booking.status === "Diproses" ? "bg-blue-100 text-blue-800" :
                            "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-1.5 justify-end w-full">
                          {booking.status !== "Diproses" && (
                            <button
                              onClick={() => handleUpdateStatus(booking.booking_id, "Diproses")}
                              disabled={isUpdating}
                              className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[10px] uppercase"
                            >
                              Proses
                            </button>
                          )}
                          {booking.status !== "Selesai" && (
                            <button
                              onClick={() => handleUpdateStatus(booking.booking_id, "Selesai")}
                              disabled={isUpdating}
                              className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[10px] uppercase"
                            >
                              Selesai
                            </button>
                          )}
                          {booking.status !== "Pending" && (
                            <button
                              onClick={() => handleUpdateStatus(booking.booking_id, "Pending")}
                              disabled={isUpdating}
                              className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[10px] uppercase"
                            >
                              Pending
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant italic">
                      Belum ada rombongan hiker yang memesan tiket pendakian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- TAB 2: HIKER DIRECTORY -------------------- */}
      {activeTab === "users" && (
        <div className="bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm animate-fadeIn">
          <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low">
            <h3 className="font-headline font-bold text-lg">Daftar Pendaki Terdaftar</h3>
            <p className="text-xs text-on-surface-variant">
              Daftar seluruh hiker terverifikasi beserta identitas KTP dan kontak darurat.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-medium">
              <thead>
                <tr className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant/30 font-bold">
                  <th className="p-4">Hiker</th>
                  <th className="p-4">ID Pendaki</th>
                  <th className="p-4">Nomor KTP</th>
                  <th className="p-4">Lahir / Gol. Darah</th>
                  <th className="p-4">Kontak Darurat</th>
                  <th className="p-4">Tanggal Bergabung</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-surface-container-lowest/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container flex items-center justify-center text-primary font-bold">
                            {u.nama[0]}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{u.nama}</p>
                            <p className="text-[10px] text-on-surface-variant font-mono">{u.email}</p>
                            <p className="text-[10px] text-on-surface-variant font-mono">{u.no_hp}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-secondary truncate max-w-[120px]" title={u.user_id}>
                        {u.user_id}
                      </td>
                      <td className="p-4 font-mono font-bold text-on-surface">
                        {u.profile?.no_ktp || <span className="text-error italic font-sans font-medium text-[10px]">Belum Lengkap</span>}
                      </td>
                      <td className="p-4">
                        {u.profile ? (
                          <>
                            <p className="font-bold text-on-surface">
                              {new Date(u.profile.tanggal_lahir).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-[10px] text-on-surface-variant font-bold">Golongan Darah: {u.profile.golongan_darah}</p>
                          </>
                        ) : (
                          <span className="text-error italic text-[10px]">Belum Lengkap</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-on-surface">
                        {u.profile?.kontak_darurat || <span className="text-error italic font-sans font-medium text-[10px]">Belum Lengkap</span>}
                      </td>
                      <td className="p-4 font-mono text-[10px] text-on-surface-variant">
                        {new Date(u.tanggal_daftar).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.user_id, u.nama)}
                          disabled={isUpdating}
                          className="bg-error/10 hover:bg-error/20 text-error px-3 py-2 rounded-xl font-bold transition-all cursor-pointer text-[10px] uppercase inline-flex items-center gap-1 ml-auto"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant italic">
                      Belum ada Hiker yang mendaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- TAB 3: MOUNTAIN & QUOTA CONFIG -------------------- */}
      {activeTab === "mountains" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          {/* Mountains List */}
          <div className="lg:col-span-7 bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low">
              <h3 className="font-headline font-bold text-lg">Daftar Gunung &amp; Kuota Harian</h3>
              <p className="text-xs text-on-surface-variant">
                Kelola data ketinggian, harga tiket SIMAKSI, tingkat kesulitan, dan batas kuota rombongan harian.
              </p>
            </div>

            <div className="divide-y divide-outline-variant/20">
              {mountains.map((m) => (
                <div key={m.mountain_id} className="p-6 flex justify-between items-center gap-6 hover:bg-surface-container-lowest/40 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-headline font-black text-xl text-primary">{m.name}</h4>
                    <p className="text-xs text-on-surface-variant font-medium">Ketinggian: <span className="font-bold text-on-surface">{m.height}m</span> | Kesulitan: <span className="font-bold text-on-surface">{m.difficulty}</span></p>
                    <p className="text-xs text-on-surface-variant font-medium">Tiket SIMAKSI: <span className="font-bold text-primary">Rp{m.price.toLocaleString("id-ID")}</span></p>
                    <div className="mt-2 inline-flex items-center gap-1 bg-primary-container/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                      <span className="material-symbols-outlined text-xs">event_available</span>
                      Kuota Harian: {m.quota} Pendaki
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingMountain(m); setFeedbackMessage(""); }}
                    className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary-container hover:text-on-primary-container px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit Kuota
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Mountain Form (Dynamic Sidebar) */}
          <div className="lg:col-span-5">
            {editingMountain ? (
              <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-6 animate-scaleUp">
                <div className="border-b border-outline-variant/20 pb-3 flex justify-between items-center">
                  <h3 className="font-headline font-bold text-lg text-primary">Edit Data {editingMountain.name}</h3>
                  <button
                    onClick={() => setEditingMountain(null)}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>

                <form onSubmit={handleSaveMountain} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nama Gunung</label>
                    <input
                      type="text"
                      required
                      value={editingMountain.name}
                      onChange={(e) => setEditingMountain({ ...editingMountain, name: e.target.value })}
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tinggi (meter)</label>
                      <input
                        type="number"
                        required
                        value={editingMountain.height}
                        onChange={(e) => setEditingMountain({ ...editingMountain, height: parseInt(e.target.value) || 0 })}
                        className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Kuota Harian</label>
                      <input
                        type="number"
                        required
                        value={editingMountain.quota}
                        onChange={(e) => setEditingMountain({ ...editingMountain, quota: parseInt(e.target.value) || 0 })}
                        className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Harga Tiket SIMAKSI (Rp)</label>
                    <input
                      type="number"
                      required
                      value={editingMountain.price}
                      onChange={(e) => setEditingMountain({ ...editingMountain, price: parseInt(e.target.value) || 0 })}
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary font-mono font-bold text-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tingkat Kesulitan</label>
                    <input
                      type="text"
                      required
                      value={editingMountain.difficulty}
                      onChange={(e) => setEditingMountain({ ...editingMountain, difficulty: e.target.value })}
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full forest-gradient text-white py-4 rounded-2xl font-headline font-bold text-sm shadow-md hover:opacity-95 transition-all flex justify-center items-center gap-2 cursor-pointer mt-6"
                  >
                    {isUpdating ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">save</span>
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-surface-container/40 border border-outline-variant/30 rounded-3xl p-8 text-center space-y-4 shadow-sm h-full flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-secondary/40 text-5xl">edit_note</span>
                <p className="text-xs text-on-surface-variant max-w-[240px] leading-relaxed font-medium">
                  Pilih salah satu gunung di daftar untuk mengedit rincian tiket, ketinggian, atau kuota pendakian.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
