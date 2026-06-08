"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserName(data.user.nama);
        setIsAdmin(data.role === "admin");
      } else {
        setUserName(null);
        setIsAdmin(false);
      }
    } catch (e) {
      setUserName(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen to custom event for immediate session updates
    window.addEventListener("summitpass_auth", checkAuth);
    return () => {
      window.removeEventListener("summitpass_auth", checkAuth);
    };
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md flex justify-between items-center px-6 py-4 shadow-sm border-b border-surface-container">
      <div className="flex items-center gap-4">
        <button className="active:scale-95 duration-200 text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <Link href="/">
          <span className="text-2xl font-black text-primary uppercase tracking-wider font-headline">
            SummitPass
          </span>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {userName ? (
          <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 group">
            <span className="hidden md:inline text-sm font-semibold text-primary">
              Halo, {userName.split(" ")[0]}
            </span>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container bg-surface-container-high group-hover:border-primary transition-all">
              <img
                alt="Foto Profil Pendaki"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVIdhlHt_abCB2b30N_jdc1D7L7q-mR1Ul4EiVLrsmaCU-UuxHTk5m2qnQrCxUWAB_4PmXWg6ZCeJnVz1QZxl3dP0YMG6M4LcvpD1bkA8AdoG2qkqnqgYPS7q6isDy4nYsmqxyUf6TrQNkHxi9RUNaNJ9OEC0-vW5iIwpC9E6rMdQptjxVmjgvvvosJd6685mD9ZySzUxSpbEQVoyFN9eQrlRfyeanpbYHKVbYFmu33kVkfnSclyLjpH65HTT8kIexUjd3Vgj-OUI"
              />
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="forest-gradient text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
