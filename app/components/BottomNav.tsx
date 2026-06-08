"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setIsAdmin(data.role === "admin");
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch (e) {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };
    checkAuth();
    window.addEventListener("summitpass_auth", checkAuth);
    return () => {
      window.removeEventListener("summitpass_auth", checkAuth);
    };
  }, []);

  const navItems = [
    { href: "/", icon: "landscape", label: "Gunung" },
    { href: "/mountain/prau", icon: "map", label: "Jalur" },
    {
      href: "/booking/register",
      icon: "confirmation_number",
      label: "Pemesanan",
    },
    { 
      href: isLoggedIn ? (isAdmin ? "/admin/dashboard" : "/dashboard") : "/register", 
      icon: "person", 
      label: isLoggedIn ? "Dashboard" : "Daftar" 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-lg flex justify-around items-center px-4 pb-6 pt-3 rounded-t-3xl shadow-[0_-4px_24px_rgba(26,36,33,0.06)] border-t border-surface-container">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center active:scale-90 duration-200 ${
              isActive
                ? "text-primary font-bold"
                : "text-secondary/60 hover:text-primary transition-all"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl mb-1"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.05rem]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
