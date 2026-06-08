"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Hiker {
  nama: string;
  no_ktp: string;
  no_hp: string;
  kontak_darurat: string;
}

interface Mountain {
  mountain_id: string;
  name: string;
  location: string;
  price: number;
  height: number;
}

export default function RegisterBookingPage() {
  const router = useRouter();
  
  // State
  const [user, setUser] = useState<any>(null);
  const [mountain, setMountain] = useState<Mountain | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Primary Hiker State
  const [primaryHiker, setPrimaryHiker] = useState<Hiker>({
    nama: "",
    no_ktp: "",
    no_hp: "",
    kontak_darurat: "",
  });

  // Team Members State
  const [teamMembers, setTeamMembers] = useState<Hiker[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const initBookingPage = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch user session
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/register");
          return;
        }
        const meData = await meRes.json();
        const currentUser = meData.user;
        setUser(currentUser);

        // Pre-fill primary hiker details
        setPrimaryHiker({
          nama: currentUser.nama || "",
          no_ktp: currentUser.profile?.no_ktp || "",
          no_hp: currentUser.no_hp || "",
          kontak_darurat: currentUser.profile?.kontak_darurat || "",
        });

        // 2. Fetch mountains to find Gunung Prau
        const mountainRes = await fetch("/api/admin/mountains");
        if (mountainRes.ok) {
          const mountainData = await mountainRes.json();
          const prau = mountainData.mountains?.find((m: any) => m.name.includes("Prau")) || mountainData.mountains?.[0];
          setMountain(prau);
        }

        // 3. Read date from localStorage
        const storedDate = localStorage.getItem("summitpass_booking_date");
        if (storedDate) {
          setSelectedDate(storedDate);
        } else {
          // Fallback to default
          setSelectedDate("2024-09-06");
        }

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initBookingPage();
  }, [router]);

  // Add a new empty team member field
  const handleAddMember = () => {
    setTeamMembers([
      ...teamMembers,
      { nama: "", no_ktp: "", no_hp: "", kontak_darurat: "" },
    ]);
  };

  // Remove a team member field
  const handleRemoveMember = (index: number) => {
    const updated = [...teamMembers];
    updated.splice(index, 1);
    setTeamMembers(updated);
  };

  // Handle team member input change
  const handleMemberChange = (index: number, field: keyof Hiker, value: string) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  // Submit handler
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setValidationErrors({});

    if (!mountain) {
      setErrorMessage("Data gunung tidak tersedia.");
      return;
    }

    const errors: { [key: string]: string } = {};

    // Validate primary hiker
    if (!primaryHiker.nama || primaryHiker.nama.length < 3) {
      errors.primaryNama = "Nama lengkap wajib diisi (min 3 karakter).";
    }
    if (primaryHiker.no_ktp.length !== 16) {
      errors.primaryKtp = "Nomor KTP wajib 16 digit.";
    }
    if (primaryHiker.no_hp.length < 10) {
      errors.primaryHp = "Nomor HP wajib diisi (min 10 digit).";
    }
    if (primaryHiker.kontak_darurat.length < 10) {
      errors.primaryEmergency = "Kontak darurat wajib diisi (min 10 digit).";
    }

    // Validate team members
    teamMembers.forEach((member, index) => {
      if (!member.nama || member.nama.length < 3) {
        errors[`member_${index}_nama`] = "Nama lengkap wajib diisi.";
      }
      if (member.no_ktp.length !== 16) {
        errors[`member_${index}_ktp`] = "KTP harus 16 digit.";
      }
      if (member.no_hp.length < 10) {
        errors[`member_${index}_hp`] = "HP harus 10 digit.";
      }
      if (member.kontak_darurat.length < 10) {
        errors[`member_${index}_emergency`] = "Kontak darurat harus 10 digit.";
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Combine primary and team members into one array
    const allHikers = [primaryHiker, ...teamMembers];

    setSubmitLoading(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mountainId: mountain.mountain_id,
          bookingDate: selectedDate,
          hikers: allHikers,
        }),
      });

      const data = await res.json();
      setSubmitLoading(false);

      if (!res.ok) {
        setErrorMessage(data.message || "Gagal melakukan pemesanan.");
        return;
      }

      // Redirect to payment with booking ID
      router.push(`/booking/payment?bookingId=${data.booking.booking_id}`);
    } catch (err) {
      setSubmitLoading(false);
      setErrorMessage("Koneksi gagal. Silakan periksa database Anda.");
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-32 flex flex-col items-center justify-center min-h-screen">
        <span className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></span>
        <p className="mt-4 text-on-surface-variant font-medium text-sm">Menyiapkan Pemesanan...</p>
      </div>
    );
  }

  const hikerCount = 1 + teamMembers.length;
  const totalPrice = mountain ? mountain.price * hikerCount : 0;

  return (
    <div className="pt-24 pb-32 px-6 max-w-4xl mx-auto">
      {/* Progress Stepper */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.1rem] text-secondary">
            Langkah 2 dari 3
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.1rem] text-on-surface-variant">
            Pendaftaran Pendaki
          </span>
        </div>
        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden flex">
          <div className="h-full bg-tertiary/40 w-1/3 border-r border-background"></div>
          <div className="h-full forest-gradient w-1/3"></div>
          <div className="h-full w-1/3"></div>
        </div>
      </section>

      {/* Page Hero */}
      <div className="mb-12 relative h-48 rounded-3xl overflow-hidden shadow-sm">
        <img
          alt="Barisan Gunung"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDahOVSTR5FWxPHw7k1CZ81kbZBzKNebDFPEqF2wjYPw2wZu1jzA1GdnOWCK95uVhKTLjMlbXfmIWPlMA_AxO5lG8T-tZASaxlGIXcKtZJ0bLTf27UPsoE2DTLQ-c4SMluIWsTpQYoyWCxEyTF4L9veoaLfoyQk096x3__bGLIeyMKRa9Yc2b-m6uLknWJyFkJzcQQUjUp2HQsGgD_wtGFfq8vWuufNBld8CVQAfBiInLdbzTXt8RnteFGaYueK8RpLpb1fPNhvcRk"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent flex items-end p-8">
          <div>
            <h1 className="font-headline text-4xl font-bold text-white tracking-tight">
              Pendaftaran Pendakian {mountain?.name}
            </h1>
            <p className="text-white/80 text-xs font-semibold mt-1">
              Tanggal terpilih: <span className="bg-primary/40 text-white px-2 py-0.5 rounded font-mono font-bold">
                {new Date(selectedDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleBookingSubmit} className="space-y-8">
        {errorMessage && (
          <div className="bg-error/10 border border-error/30 text-error p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-fadeIn">
            <span className="material-symbols-outlined">warning</span>
            {errorMessage}
          </div>
        )}

        {/* Hiker Data Card (Primary Member) */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full forest-gradient"></div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-xl font-bold text-primary">
              Pendaki Utama
            </h2>
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Wajib
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                Nama Lengkap
              </label>
              <input
                className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-on-surface font-semibold text-sm"
                placeholder="Budi Santoso"
                type="text"
                value={primaryHiker.nama}
                onChange={(e) => setPrimaryHiker({ ...primaryHiker, nama: e.target.value })}
              />
              {validationErrors.primaryNama && <p className="text-xs text-error font-medium">{validationErrors.primaryNama}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                Nomor KTP (16 Digit)
              </label>
              <input
                className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-on-surface font-mono font-semibold text-sm"
                placeholder="3301xxxxxxxxxxxx"
                type="text"
                maxLength={16}
                value={primaryHiker.no_ktp}
                onChange={(e) => setPrimaryHiker({ ...primaryHiker, no_ktp: e.target.value.replace(/\D/g, "").slice(0, 16) })}
              />
              {validationErrors.primaryKtp && <p className="text-xs text-error font-medium">{validationErrors.primaryKtp}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                Nomor HP (WhatsApp aktif)
              </label>
              <input
                className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-on-surface font-semibold text-sm"
                placeholder="0812xxxxxxxx"
                type="tel"
                value={primaryHiker.no_hp}
                onChange={(e) => setPrimaryHiker({ ...primaryHiker, no_hp: e.target.value })}
              />
              {validationErrors.primaryHp && <p className="text-xs text-error font-medium">{validationErrors.primaryHp}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                Kontak Darurat (Keluarga)
              </label>
              <input
                className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-on-surface font-semibold text-sm"
                placeholder="Nomor HP Keluarga"
                type="tel"
                value={primaryHiker.kontak_darurat}
                onChange={(e) => setPrimaryHiker({ ...primaryHiker, kontak_darurat: e.target.value })}
              />
              {validationErrors.primaryEmergency && <p className="text-xs text-error font-medium">{validationErrors.primaryEmergency}</p>}
            </div>
          </div>
        </div>

        {/* Dynamic Team Members Section */}
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden animate-fadeIn"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary"></div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline text-xl font-bold text-secondary">
                Anggota Tim #{idx + 1}
              </h2>
              <button
                type="button"
                onClick={() => handleRemoveMember(idx)}
                className="text-error border border-error/30 hover:bg-error/5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Hapus
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                  Nama Lengkap
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-all text-on-surface text-sm"
                  placeholder="Contoh: Rian Hidayat"
                  type="text"
                  value={member.nama}
                  onChange={(e) => handleMemberChange(idx, "nama", e.target.value)}
                />
                {validationErrors[`member_${idx}_nama`] && (
                  <p className="text-xs text-error font-medium">{validationErrors[`member_${idx}_nama`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                  Nomor KTP (16 Digit)
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-all text-on-surface font-mono text-sm"
                  placeholder="3301xxxxxxxxxxxx"
                  type="text"
                  maxLength={16}
                  value={member.no_ktp}
                  onChange={(e) => handleMemberChange(idx, "no_ktp", e.target.value.replace(/\D/g, "").slice(0, 16))}
                />
                {validationErrors[`member_${idx}_ktp`] && (
                  <p className="text-xs text-error font-medium">{validationErrors[`member_${idx}_ktp`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                  Nomor HP (WhatsApp)
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-all text-on-surface text-sm"
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                  value={member.no_hp}
                  onChange={(e) => handleMemberChange(idx, "no_hp", e.target.value)}
                />
                {validationErrors[`member_${idx}_hp`] && (
                  <p className="text-xs text-error font-medium">{validationErrors[`member_${idx}_hp`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                  Kontak Darurat (Keluarga)
                </label>
                <input
                  className="w-full bg-surface-container/40 border border-outline-variant/40 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-all text-on-surface text-sm"
                  placeholder="Nomor HP Keluarga"
                  type="tel"
                  value={member.kontak_darurat}
                  onChange={(e) => handleMemberChange(idx, "kontak_darurat", e.target.value)}
                />
                {validationErrors[`member_${idx}_emergency`] && (
                  <p className="text-xs text-error font-medium">{validationErrors[`member_${idx}_emergency`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Bento Layout for Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Team Member Card */}
          <button
            onClick={handleAddMember}
            className="md:col-span-2 group bg-surface-container/60 hover:bg-secondary-container/20 transition-all rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 active:scale-[0.98] duration-200 border border-outline-variant/20 cursor-pointer"
            type="button"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform border border-outline-variant/10">
              <span className="material-symbols-outlined font-bold">
                person_add
              </span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface">
                Tambah Anggota Tim
              </h3>
              <p className="text-xs text-on-surface-variant">
                Ingin mendaftarkan lebih dari satu pendaki? Klik di sini untuk menambah baris.
              </p>
            </div>
          </button>

          {/* Pricing Info Card */}
          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 flex flex-col justify-between shadow-sm">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                Rincian Biaya
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Rp{mountain?.price.toLocaleString("id-ID")} x {hikerCount} pendaki
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-primary/10">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Total Biaya Pendakian
              </span>
              <span className="font-headline font-black text-2xl text-primary">
                Rp{totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Transactional CTA */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full forest-gradient text-white font-headline font-bold text-lg py-5 rounded-3xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.97] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {submitLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Memproses Pemesanan...</span>
              </>
            ) : (
              <>
                <span>Ajukan Pemesanan Sekarang</span>
                <span className="material-symbols-outlined">payments</span>
              </>
            )}
          </button>
          <p className="text-center mt-4 text-xs text-on-surface-variant font-medium">
            Dengan melanjutkan, Anda menyetujui Protokol Keselamatan Ketinggian dan Surat Pernyataan Tanggung Jawab.
          </p>
        </div>
      </form>
    </div>
  );
}
