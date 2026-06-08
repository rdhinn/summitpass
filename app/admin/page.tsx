"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailOrUsername || !password) {
      setError("Username/Email dan Password wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setError(data.message || "Gagal melakukan login.");
        return;
      }

      if (data.role !== "admin") {
        setError("Akses ditolak. Anda bukan Administrator!");
        // Log out immediately to clear cookie
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }

      // Dispatch auth state event
      window.dispatchEvent(new Event("summitpass_auth"));

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setIsLoading(false);
      setError("Koneksi gagal. Pastikan database Anda aktif.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 card-shadow border border-outline-variant/30 relative overflow-hidden animate-fadeIn">
        {/* Top green accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 forest-gradient"></div>

        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-primary text-5xl mb-2 font-bold">admin_panel_settings</span>
          <h1 className="text-3xl font-headline font-black text-on-surface">Admin Portal</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Masuk ke panel administrasi sistem SummitPass.
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error p-4 rounded-2xl flex items-center gap-3 text-sm font-medium mb-6">
            <span className="material-symbols-outlined text-base">warning</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
              Username atau Email
            </label>
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-2xl px-4 py-3.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full forest-gradient text-white py-4 rounded-2xl font-headline font-bold text-base shadow-lg shadow-primary/10 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 mt-6 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Mengautentikasi Admin...</span>
              </>
            ) : (
              <>
                <span>Masuk Dashboard Admin</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-xs">arrow_back</span>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
