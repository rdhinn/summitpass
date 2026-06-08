import type { Metadata } from "next";
import Link from "next/link";
import PartnerSection from "./components/PartnerSection";

export const metadata: Metadata = {
  title: "Gunung Prau - Golden Sunrise Terbaik Dieng | SummitPass",
  description:
    "Pesan ekspedisi Anda ke Gunung Prau, mahkota Dataran Tinggi Dieng. Terkenal dengan golden sunrise terbaik di Asia Tenggara. Ketinggian 2.565m, bersahabat untuk pemula.",
};

export default function HomePage() {
  return (
    <div className="pt-24 pb-8 max-w-5xl mx-auto space-y-10">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[450px] flex flex-col justify-end p-8 mx-6">
        <div className="absolute inset-0 z-0">
          <img
            alt="Golden Sunrise Gunung Prau"
            className="w-full h-full object-cover"
            src="/images/prau.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/30 to-transparent"></div>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full text-primary-fixed-dim text-xs font-bold uppercase tracking-widest border border-primary/30">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            Puncak Unggulan
          </div>
          <h1 className="text-5xl font-headline font-extrabold text-white leading-tight tracking-tight max-w-2xl">
            Rasakan Keajaiban Gunung Prau
          </h1>
          <p className="text-surface-bright/80 text-lg max-w-md font-medium">
            Permata mahkota dari Dataran Tinggi Dieng. Terkenal dengan pemandangan golden sunrise terbaik di Asia Tenggara.
          </p>
          <div className="pt-4">
            <Link
              href="/mountain/prau"
              className="forest-gradient text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 transition-all inline-flex items-center gap-2 group"
            >
              Pesan Ekspedisi Anda
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Intro Section */}
      <section className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/30 mx-6">
        <div className="max-w-3xl">
          <h2 className="font-headline font-bold text-2xl tracking-tight text-primary mb-4">
            Temukan Puncak Paling Ikonik di Dieng
          </h2>
          <p className="text-on-surface-variant leading-relaxed mb-6">
            Berdiri setinggi <strong>2.565 meter</strong> di atas permukaan laut,{" "}
            <strong>Gunung Prau di Dieng, Jawa Tengah</strong> menawarkan salah satu
            pengalaman pendaki yang paling mudah diakses namun sangat berkesan di Indonesia.
            Dikenal dengan jalurnya yang relatif bersahabat, ini adalah destinasi sempurna
            bagi <strong>pendaki pemula</strong> maupun pencinta fotografi alam.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">
                  wb_sunny
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Golden Sunrise</h3>
                <p className="text-sm text-on-surface-variant">
                  Saksikan langit berubah menjadi warna jingga dan emas di atas samudra awan yang memukau.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">
                  landscape
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Bukit Teletubbies</h3>
                <p className="text-sm text-on-surface-variant">
                  Padang rumput hijau luas dan bukit-bukit bergelombang cantik yang menyerupai lanskap negeri dongeng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expedition Detail */}
      <section className="space-y-6 mx-6">
        <h2 className="font-headline font-bold text-xl tracking-tight">
          Detail Ekspedisi
        </h2>
        <div className="bg-surface-container-low rounded-3xl overflow-hidden shadow-sm border border-outline-variant/20">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-[4/3] md:aspect-auto relative overflow-hidden">
              <img
                alt="Padang Rumput Gunung Prau"
                className="w-full h-full object-cover"
                src="/images/prau.jpg"
              />
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-[16px] text-tertiary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="text-sm font-bold">4.9 (2.4k Ulasan)</span>
              </div>
            </div>
            <div className="p-8 space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <span className="text-primary font-bold text-sm uppercase tracking-widest">
                  Jalur Patak Banteng
                </span>
                <h3 className="font-headline font-bold text-3xl">
                  Petualangan Gunung Prau 2H1M
                </h3>
                <p className="text-on-surface-variant">
                  Paket all-inclusive terpopuler kami. Kami menyediakan semua perlengkapan, makanan, dan perizinan sehingga Anda dapat menikmati perjalanan tanpa beban.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-bright p-3 rounded-2xl border border-outline-variant/30">
                  <span className="block text-xs uppercase text-on-surface-variant mb-1">
                    Ketinggian
                  </span>
                  <span className="font-bold">2.565m</span>
                </div>
                <div className="bg-surface-bright p-3 rounded-2xl border border-outline-variant/30">
                  <span className="block text-xs uppercase text-on-surface-variant mb-1">
                    Tingkat Kesulitan
                  </span>
                  <span className="font-bold">Sedang</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                <div>
                  <span className="block text-xs uppercase tracking-widest text-on-surface-variant">
                    Harga mulai dari
                  </span>
                  <span className="text-primary font-black text-3xl">
                    Rp650.000
                    <span className="text-sm font-medium text-on-surface-variant">
                      /org
                    </span>
                  </span>
                </div>
                <Link
                  href="/mountain/prau"
                  className="earth-gradient text-white px-6 py-3 rounded-xl font-bold"
                >
                  Detail
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <PartnerSection />

      {/* Live Conditions HUD */}
      <section className="bg-surface-bright/70 backdrop-blur-xl border border-outline-variant/30 rounded-3xl p-6 flex flex-wrap justify-around gap-6 shadow-sm mx-6">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary block mb-1">
            altitude
          </span>
          <span className="block text-2xl font-bold font-headline">
            2.565m
          </span>
          <span className="text-[10px] uppercase tracking-[0.05rem] text-on-surface-variant">
            Tinggi Puncak
          </span>
        </div>
        <div className="w-px h-12 bg-outline-variant/30 hidden sm:block"></div>
        <div className="text-center">
          <span className="material-symbols-outlined text-primary block mb-1">
            thermostat
          </span>
          <span className="block text-2xl font-bold font-headline">12°C</span>
          <span className="text-[10px] uppercase tracking-[0.05rem] text-on-surface-variant">
            Suhu Camp
          </span>
        </div>
        <div className="w-px h-12 bg-outline-variant/30 hidden sm:block"></div>
        <div className="text-center">
          <span className="material-symbols-outlined text-primary block mb-1">
            hiking
          </span>
          <span className="block text-2xl font-bold font-headline">
            3-4 Jam
          </span>
          <span className="text-[10px] uppercase tracking-[0.05rem] text-on-surface-variant">
            Estimasi Mendaki
          </span>
        </div>
      </section>

      {/* Floating Booking Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <Link
          href="/mountain/prau"
          className="forest-gradient w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all duration-200"
        >
          <span className="material-symbols-outlined">calendar_today</span>
        </Link>
      </div>
    </div>
  );
}
