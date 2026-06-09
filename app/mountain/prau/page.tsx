import type { Metadata } from "next";
import Link from "next/link";
import CalendarWidget from "./CalendarWidget";
import TrailMap from "@/app/components/TrailMap";

export const metadata: Metadata = {
  title: "Gunung Prau - SummitPass | Pengalaman Golden Sunrise",
  description:
    "Rencanakan pendakian Anda ke Gunung Prau di Dieng, Jawa Tengah. Pilih tanggal pendakian, lihat ketersediaan langsung, dan pesan pengalaman golden sunrise Anda di ketinggian 2.565m.",
};

export default function MountPrauPage() {
  return (
    <div className="pt-16 pb-32">
      {/* Hero Section */}
      <section className="relative h-[480px] w-full overflow-hidden animate-fade-in">
        <img
          alt="Gunung Prau"
          className="absolute inset-0 w-full h-full object-cover"
          src="/images/prau.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-black/20 to-black/40"></div>

        {/* Floating HUD Data */}
        <div className="absolute bottom-12 left-6 right-6 flex flex-col items-start">
          <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Sangat Cocok untuk Pemula
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-md font-headline">
            Gunung Prau
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-white/95">
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
              <span className="material-symbols-outlined text-sm">
                location_on
              </span>
              <span className="text-xs font-bold uppercase">
                Dieng, Jawa Tengah
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
              <span className="material-symbols-outlined text-sm">
                altitude
              </span>
              <span className="text-xs font-bold uppercase">2.565m</span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
              <span className="material-symbols-outlined text-sm">
                schedule
              </span>
              <span className="text-xs font-bold uppercase">3-4 Jam</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Canvas */}
      <div className="px-6 -mt-8 relative z-10 space-y-8 max-w-5xl mx-auto">
        {/* Overview Bento Card */}
        <div className="bg-white p-8 rounded-xl card-shadow border border-surface-variant/20 interactive-card animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-primary font-headline">
                Mengapa Gunung Prau?
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                Dikenal memiliki pemandangan matahari terbit terbaik di Pulau Jawa, Gunung Prau
                adalah pendakian wajib bagi pendaki pemula maupun berpengalaman. Dataran tinggi
                puncaknya menampilkan Bukit Teletubbies yang ikonik serta menyajikan pemandangan
                luar biasa dari puncak ganda—Gunung Sindoro dan Gunung Sumbing.
              </p>
            </div>
            <div className="bg-surface-variant/30 p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-widest text-secondary">
                  Tingkat Kesulitan
                </span>
                <span className="text-primary font-bold">Mudah - Sedang</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-widest text-secondary">
                  Jalur Utama
                </span>
                <span className="text-on-surface font-medium">
                  Patakbanteng
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-widest text-secondary">
                  Izin SIMAKSI
                </span>
                <span className="text-on-surface font-medium">
                  Termasuk SIMAKSI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Golden Sunrise Section */}
          <div className="bg-white p-6 rounded-xl border border-surface-variant/30 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary p-2 bg-primary-container rounded-lg">
                light_mode
              </span>
              <h3 className="text-xl font-bold text-primary font-headline">
                Pengalaman Golden Sunrise
              </h3>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Puncak Prau menghadap tepat ke arah Timur, sejajar sempurna untuk melihat
              Golden Sunrise terbaik. Anda akan menyaksikan langit berubah dari ungu tua
              menjadi jingga keemasan yang menawan, memperlihatkan siluet megah Gunung Sindoro,
              Sumbing, Merapi, dan Merbabu di kejauhan.
            </p>
          </div>

          {/* Best Time Section */}
          <div className="bg-white p-6 rounded-xl border border-surface-variant/30 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary p-2 bg-primary-container rounded-lg">
                calendar_month
              </span>
              <h3 className="text-xl font-bold text-primary font-headline">
                Waktu Terbaik Berkunjung
              </h3>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Musim terbaik adalah dari{" "}
              <span className="font-bold text-secondary">
                Mei hingga September
              </span>{" "}
              selama musim kemarau. Untuk pemandangan terjelas dan fenomena embun upas (rumput es)
              di Dieng, targetkan bulan Juli dan Agustus. Jalur pendakian biasanya ditutup untuk
              konservasi dari Januari hingga Maret.
            </p>
          </div>
        </div>

        {/* Facilities Grid */}
        <section className="animate-fade-in-up">
          <h3 className="text-sm font-bold uppercase tracking-[0.15rem] text-secondary mb-4 px-2">
            Fasilitas Ekspedisi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "hiking", label: "Pemandu Lokal" },
              { icon: "home_work", label: "Basecamp Wates" },
              { icon: "coffee", label: "Kopi Dieng Hangat" },
              { icon: "health_and_safety", label: "Asuransi Jiwa" },
            ].map((facility) => (
              <div
                key={facility.label}
                className="bg-primary-container/20 p-5 rounded-xl flex flex-col items-center text-center gap-3 border border-primary-container/30"
              >
                <span className="material-symbols-outlined text-primary text-3xl">
                  {facility.icon}
                </span>
                <span className="text-xs font-bold text-on-secondary-container">
                  {facility.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Trail Map & Live Tracking */}
        <TrailMap />

        {/* Date Selection Widget */}
        <CalendarWidget />
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full glass-panel border-t border-surface-variant/30 p-6 z-50">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-6">
          <div className="hidden md:block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">
              Biaya Paket Standar
            </span>
            <span className="text-2xl font-black text-primary">
              Rp650.000{" "}
              <span className="text-sm font-normal text-on-surface-variant">
                / orang
              </span>
            </span>
          </div>
          <Link
            href="/booking/register"
            className="flex-1 md:flex-none forest-gradient text-white py-4 px-12 rounded-xl font-bold text-lg shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3 interactive-btn"
          >
            <span>Pesan Pendakian Sekarang</span>
            <span className="material-symbols-outlined">mountain_flag</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
