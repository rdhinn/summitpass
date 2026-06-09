"use client";

import { useEffect, useState } from "react";

interface RealtimeData {
  quota: number;
  registered_hikers: number;
  remaining_quota: number;
  status_jalur: string;
  estimasi_keramaian: string;
  cuaca: string;
  suhu_camp: number;
  last_updated: string;
}

export default function RealtimeStatus() {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRealtimeData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch("/api/mountains/prau/realtime");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch real-time mountain data:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();
    const interval = setInterval(() => {
      fetchRealtimeData(true);
    }, 30000); // 30 seconds auto-refresh

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 flex flex-col justify-center items-center gap-3 min-h-[180px]">
        <span className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></span>
        <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
          Menghubungkan Ke Pos Pantau...
        </span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-primary/5 p-6 rounded-xl border border-primary/15 space-y-4 animate-scale-up relative overflow-hidden">
      {isRefreshing && (
        <span className="absolute top-0 right-0 left-0 h-0.5 bg-primary/20 overflow-hidden">
          <span className="block h-full bg-primary w-1/3 animate-ping"></span>
        </span>
      )}

      <div className="flex justify-between items-center border-b border-primary/10 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] animate-pulse text-error">sensors</span>
          Status Live Gunung
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
          data.status_jalur === "Buka" 
            ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
            : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          Jalur {data.status_jalur}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-bold text-secondary">
        <div className="bg-white p-3 rounded-xl border border-primary/5 shadow-sm">
          <span className="block text-[8px] uppercase tracking-wider text-outline mb-1">Sisa Kuota Hari Ini</span>
          <span className="text-xl font-black text-primary font-mono">{data.remaining_quota}</span>
          <span className="text-[9px] text-outline font-normal"> / {data.quota} org</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-primary/5 shadow-sm">
          <span className="block text-[8px] uppercase tracking-wider text-outline mb-1">Kepadatan Jalur</span>
          <span className={`text-sm font-black block mt-1 ${
            data.estimasi_keramaian === "Ramai" ? "text-error" : 
            data.estimasi_keramaian === "Sedang" ? "text-amber-600" : "text-emerald-700"
          }`}>
            {data.estimasi_keramaian}
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-primary/5 shadow-sm">
          <span className="block text-[8px] uppercase tracking-wider text-outline mb-1">Cuaca Terkini</span>
          <span className="text-xs font-black text-on-surface block mt-1 truncate">{data.cuaca}</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-primary/5 shadow-sm">
          <span className="block text-[8px] uppercase tracking-wider text-outline mb-1">Suhu Puncak</span>
          <span className="text-xs font-black text-on-surface block mt-1 font-mono">{data.suhu_camp}°C</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-[8px] text-outline font-medium pt-1">
        <button 
          onClick={() => fetchRealtimeData(false)}
          className="text-primary hover:underline cursor-pointer flex items-center gap-0.5"
        >
          <span className="material-symbols-outlined text-[10px]">refresh</span> Refresh
        </button>
        <span>
          Update: {new Date(data.last_updated).toLocaleTimeString("id-ID")}
        </span>
      </div>
    </div>
  );
}
