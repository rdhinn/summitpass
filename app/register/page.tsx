"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterFlow() {
  const router = useRouter();

  // Mode state: login vs register flow
  const [isLogin, setIsLogin] = useState(false);

  // Current Register Step: 1 = Register Form, 2 = OTP Verification, 3 = Account Active, 4 = Complete Profile
  const [step, setStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Form State - Register Form
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form State - Login Form
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form State - OTP Verification
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  // Form State - Profil Pendaki Table
  const [noKtp, setNoKtp] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [golonganDarah, setGolonganDarah] = useState("O");
  const [kontakDarurat, setKontakDarurat] = useState("");

  // Saved User ID after Step 1
  const [userId, setUserId] = useState("");
  const [tanggalDaftar, setTanggalDaftar] = useState("");

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isLogin && step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer, isLogin]);

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!emailOrUsername || !loginPassword) {
      setErrors({ login: "Email/Username dan Password wajib diisi!" });
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password: loginPassword }),
      });

      const data = await res.json();
      setIsValidating(false);

      if (!res.ok) {
        setErrors({ login: data.message || "Email/Username atau password salah!" });
        return;
      }

      // Dispatch event to update Header & BottomNav
      window.dispatchEvent(new Event("summitpass_auth"));

      // Redirect based on role
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setIsValidating(false);
      setErrors({ login: "Koneksi ke server gagal. Harap periksa database Anda." });
    }
  };

  // Validate and submit Step 1 (Register Form)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (nama.trim().length < 3) {
      newErrors.nama = "Nama lengkap harus diisi (minimal 3 karakter).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Format email tidak valid.";
    }
    const phoneRegex = /^[0-9]{10,14}$/;
    if (!phoneRegex.test(noHp)) {
      newErrors.noHp = "Nomor HP harus berupa angka 10-14 digit.";
    }
    if (password.length < 6) {
      newErrors.password = "Kata sandi minimal 6 karakter.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsValidating(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, no_hp: noHp, password }),
      });

      const data = await res.json();
      setIsValidating(false);

      if (!res.ok) {
        setErrors({ submit: data.message || "Gagal melakukan registrasi." });
        return;
      }

      setUserId(data.user.user_id);
      setTanggalDaftar(
        new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setIsValidating(false);
      setErrors({ submit: "Gagal menghubungkan ke database. Pastikan database Anda berjalan!" });
    }
  };

  // Validate and submit Step 2 (OTP Verification)
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setOtpError("Kode OTP wajib diisi!");
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otpCode }),
      });

      const data = await res.json();
      setIsValidating(false);

      if (!res.ok) {
        setOtpError(data.message || "Kode OTP salah.");
        return;
      }

      setOtpError("");
      setStep(3); // Go to Active Account screen
    } catch (err) {
      setIsValidating(false);
      setOtpError("Terjadi kesalahan koneksi server.");
    }
  };

  // Handle Resend OTP
  const handleResendOtp = () => {
    setResendTimer(60);
    setOtpCode("");
    setOtpError("");
    alert("Simulasi: Kode OTP baru telah dikirim via WhatsApp ke " + noHp + " (Gunakan kode: 123456)");
  };

  // Validate and submit Step 4 (Complete Hiker Profile Form)
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const ktpRegex = /^[0-9]{16}$/;
    if (!ktpRegex.test(noKtp)) {
      newErrors.noKtp = "Nomor KTP harus tepat 16 digit angka.";
    }
    if (!tanggalLahir) {
      newErrors.tanggalLahir = "Tanggal lahir wajib diisi.";
    }
    const contactRegex = /^[0-9]{10,14}$/;
    if (!contactRegex.test(kontakDarurat)) {
      newErrors.kontakDarurat = "Kontak darurat harus berupa nomor HP aktif (10-14 digit).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsValidating(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noKtp,
          tanggalLahir,
          golonganDarah,
          kontakDarurat,
        }),
      });

      const data = await res.json();
      setIsValidating(false);

      if (!res.ok) {
        setErrors({ submitProfile: data.message || "Gagal menyimpan data profil." });
        return;
      }

      // Dispatch event to update Header & BottomNav
      window.dispatchEvent(new Event("summitpass_auth"));

      // Go to dashboard
      router.push("/dashboard");
    } catch (err) {
      setIsValidating(false);
      setErrors({ submitProfile: "Gagal menghubungkan ke database." });
    }
  };

  return (
    <div className="pt-28 pb-32 px-6 max-w-2xl mx-auto min-h-screen flex flex-col justify-center">
      {/* Progress Tracker Widget (only shown in register mode) */}
      {!isLogin && (
        <div className="mb-8 animate-fadeIn">
          <div className="flex justify-between items-center text-xs font-bold text-secondary uppercase tracking-widest mb-2">
            <span>Langkah {step} dari 4</span>
            <span>
              {step === 1 && "Registrasi Akun"}
              {step === 2 && "Verifikasi OTP"}
              {step === 3 && "Akun Aktif!"}
              {step === 4 && "Lengkapi Profil Pendaki"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden flex gap-0.5">
            <div className={`h-full flex-1 transition-all duration-300 ${step >= 1 ? "forest-gradient" : "bg-surface-variant/40"}`}></div>
            <div className={`h-full flex-1 transition-all duration-300 ${step >= 2 ? "forest-gradient" : "bg-surface-variant/40"}`}></div>
            <div className={`h-full flex-1 transition-all duration-300 ${step >= 3 ? "forest-gradient" : "bg-surface-variant/40"}`}></div>
            <div className={`h-full flex-1 transition-all duration-300 ${step >= 4 ? "forest-gradient" : "bg-surface-variant/40"}`}></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 card-shadow border border-outline-variant/20 relative overflow-hidden transition-all duration-300">
        {/* Decorative Green Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 forest-gradient"></div>

        {/* -------------------- LOGIN MODE -------------------- */}
        {isLogin ? (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <span className="material-symbols-outlined text-primary text-5xl mb-2">vpn_key</span>
              <h1 className="text-3xl font-headline font-black text-on-surface">Masuk ke SummitPass</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Gunakan kredensial Hiker atau Admin Anda untuk mengakses dasbor.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {errors.login && (
                <div className="bg-error/10 border border-error/30 text-error p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
                  <span className="material-symbols-outlined">warning</span>
                  {errors.login}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                  Email atau Username
                </label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="alex@gmail.com atau admin"
                  className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                  disabled={isValidating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                  disabled={isValidating}
                />
              </div>

              <button
                type="submit"
                disabled={isValidating}
                className="w-full forest-gradient text-white py-4 rounded-2xl font-headline font-bold text-base shadow-lg shadow-primary/10 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 mt-6 cursor-pointer"
              >
                {isValidating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Mengautentikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-xs text-on-surface-variant">
                Belum memiliki akun?{" "}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setStep(1);
                    setErrors({});
                  }}
                  className="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none"
                >
                  Daftar di sini
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* -------------------- REGISTER MODE -------------------- */
          <div>
            {/* Step 1: Registration Form */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-8">
                  <span className="material-symbols-outlined text-primary text-5xl mb-2">person_add</span>
                  <h1 className="text-3xl font-headline font-black text-on-surface">Daftar Akun Baru</h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Langkah awal untuk memulai petualangan mendaki gunung dengan SIMAKSI online.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  {errors.submit && (
                    <div className="bg-error/10 border border-error/30 text-error p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
                      <span className="material-symbols-outlined">warning</span>
                      {errors.submit}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      disabled={isValidating}
                    />
                    {errors.nama && <p className="text-xs text-error font-medium ml-1">{errors.nama}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="budi@gmail.com"
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      disabled={isValidating}
                    />
                    {errors.email && <p className="text-xs text-error font-medium ml-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Nomor HP
                    </label>
                    <input
                      type="tel"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="081234567890"
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      disabled={isValidating}
                    />
                    {errors.noHp && <p className="text-xs text-error font-medium ml-1">{errors.noHp}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      disabled={isValidating}
                    />
                    {errors.password && <p className="text-xs text-error font-medium ml-1">{errors.password}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isValidating}
                    className="w-full forest-gradient text-white py-4 rounded-2xl font-headline font-bold text-base shadow-lg shadow-primary/10 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 mt-6 cursor-pointer"
                  >
                    {isValidating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Mendaftarkan User...</span>
                      </>
                    ) : (
                      <>
                        <span>Lanjutkan Pendaftaran</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <p className="text-xs text-on-surface-variant">
                    Sudah memiliki akun?{" "}
                    <button
                      onClick={() => {
                        setIsLogin(true);
                        setErrors({});
                      }}
                      className="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none"
                    >
                      Masuk di sini
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary-container/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-primary text-3xl">sms</span>
                  </div>
                  <h1 className="text-3xl font-headline font-black text-on-surface">Verifikasi OTP</h1>
                  <p className="text-sm text-on-surface-variant mt-2">
                    Masukkan 6 digit kode OTP yang kami kirimkan ke nomor WhatsApp <span className="font-bold text-on-surface">{noHp}</span>.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-secondary-container/40 text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Simulasi OTP: Gunakan kode <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-secondary-container">123456</span>
                  </div>
                </div>

                <form onSubmit={handleOtpVerify} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="Masukkan 6 Digit OTP"
                        className="w-full text-center tracking-[0.4em] font-mono text-2xl bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-black placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal"
                        maxLength={6}
                        disabled={isValidating}
                      />
                    </div>
                    {otpError && <p className="text-xs text-error font-medium text-center">{otpError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isValidating}
                    className="w-full forest-gradient text-white py-4 rounded-2xl font-headline font-bold text-base shadow-lg shadow-primary/10 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isValidating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Verifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>Verifikasi Kode OTP</span>
                        <span className="material-symbols-outlined">verified_user</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-8">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-on-surface-variant font-medium">
                      Kirim ulang kode dalam <span className="text-primary font-bold">{resendTimer} detik</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none"
                    >
                      <span className="material-symbols-outlined text-xs">replay</span>
                      Kirim Ulang OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Account Active */}
            {step === 3 && (
              <div className="text-center animate-fadeIn">
                <div className="w-20 h-20 bg-primary text-on-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-primary/10 animate-bounce">
                  <span className="material-symbols-outlined !text-4xl">check</span>
                </div>

                <h1 className="text-3xl font-headline font-black text-on-surface">Akun Anda Aktif!</h1>
                <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
                  Sistem telah memverifikasi OTP Anda. Record baru telah dimasukkan ke dalam <span className="font-bold text-primary">Tabel Users</span>.
                </p>

                {/* Simulated Users Table Entry */}
                <div className="my-6 bg-surface-container/70 border border-outline-variant/30 rounded-2xl p-6 text-left space-y-3 font-mono text-xs shadow-inner">
                  <div className="border-b border-outline-variant/30 pb-2 flex justify-between items-center">
                    <span className="font-bold text-secondary text-[10px] uppercase">Data Tersimpan (Tabel Users)</span>
                    <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[8px] font-bold">SQL INSERT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-on-surface-variant">user_id:</span>
                    <span className="col-span-2 text-on-surface font-bold truncate">{userId}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-on-surface-variant">nama:</span>
                    <span className="col-span-2 text-on-surface font-bold">{nama}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-on-surface-variant">email:</span>
                    <span className="col-span-2 text-on-surface font-bold">{email}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-on-surface-variant">no_hp:</span>
                    <span className="col-span-2 text-on-surface font-bold">{noHp}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-on-surface-variant">tanggal_daftar:</span>
                    <span className="col-span-2 text-on-surface font-bold">{tanggalDaftar}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-on-surface-variant">status_akun:</span>
                    <span className="col-span-2 text-primary font-black uppercase">Aktif</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="w-full forest-gradient text-white py-4 rounded-2xl font-headline font-bold text-base shadow-lg shadow-primary/10 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  <span>Lengkapi Profil Pendaki</span>
                  <span className="material-symbols-outlined">badge</span>
                </button>
              </div>
            )}

            {/* Step 4: Complete Hiker Profile */}
            {step === 4 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-8">
                  <span className="material-symbols-outlined text-primary text-5xl mb-2">id_card</span>
                  <h1 className="text-3xl font-headline font-black text-on-surface">Profil Pendaki</h1>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Lengkapi identitas fisik Anda untuk kebutuhan keamanan evakuasi & izin SIMAKSI Kehutanan.
                  </p>
                </div>

                <form onSubmit={handleCompleteProfile} className="space-y-5">
                  {errors.submitProfile && (
                    <div className="bg-error/10 border border-error/30 text-error p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
                      <span className="material-symbols-outlined">warning</span>
                      {errors.submitProfile}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Nomor KTP (16 Digit)
                    </label>
                    <input
                      type="text"
                      value={noKtp}
                      onChange={(e) => setNoKtp(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      placeholder="Contoh: 330102xxxxxxxxxx"
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      maxLength={16}
                      disabled={isValidating}
                    />
                    {errors.noKtp && <p className="text-xs text-error font-medium ml-1">{errors.noKtp}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      disabled={isValidating}
                    />
                    {errors.tanggalLahir && <p className="text-xs text-error font-medium ml-1">{errors.tanggalLahir}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Golongan Darah
                    </label>
                    <select
                      value={golonganDarah}
                      onChange={(e) => setGolonganDarah(e.target.value)}
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      disabled={isValidating}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                      Kontak Darurat (No HP Keluarga/Kerabat)
                    </label>
                    <input
                      type="tel"
                      value={kontakDarurat}
                      onChange={(e) => setKontakDarurat(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      disabled={isValidating}
                    />
                    {errors.kontakDarurat && <p className="text-xs text-error font-medium ml-1">{errors.kontakDarurat}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isValidating}
                    className="w-full forest-gradient text-white py-4 rounded-2xl font-headline font-bold text-base shadow-lg shadow-primary/10 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 mt-6 cursor-pointer"
                  >
                    {isValidating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Menyimpan Profil...</span>
                      </>
                    ) : (
                      <>
                        <span>Simpan Profil & Buka Dashboard</span>
                        <span className="material-symbols-outlined">dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
