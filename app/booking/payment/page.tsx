"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Hiker {
  nama: string;
  no_ktp: string;
  no_hp: string;
  kontak_darurat: string;
}

interface BookingRecord {
  booking_id: string;
  booking_date: string;
  status: string;
  total_price: number;
  mountain: {
    name: string;
    location: string;
    height: number;
    price: number;
  };
  hikers: Hiker[];
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"bank" | "qris">("bank");
  const [selectedBank, setSelectedBank] = useState("bca");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("ID Pemesanan tidak valid.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch("/api/booking");
        if (!res.ok) {
          router.push("/register");
          return;
        }

        const data = await res.json();
        const found = data.bookings?.find((b: BookingRecord) => b.booking_id === bookingId);

        if (found) {
          setBooking(found);
        } else {
          setError("Pemesanan tidak ditemukan.");
        }
      } catch (err) {
        console.error("Error loading payment booking details:", err);
        setError("Koneksi gagal. Silakan periksa database Anda.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, router]);

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/booking/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (res.ok) {
        // Redirect to confirmation page
        router.push(`/booking/confirmation?bookingId=${bookingId}`);
      } else {
        const data = await res.json();
        alert(data.message || "Gagal mengonfirmasi pembayaran.");
      }
    } catch (err) {
      alert("Koneksi internet bermasalah atau server mati.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-32 flex flex-col items-center justify-center min-h-screen">
        <span className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></span>
        <p className="mt-4 text-on-surface-variant font-medium text-sm">Menyiapkan Rincian Pembayaran...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-32 pb-32 px-6 max-w-md mx-auto text-center space-y-6 min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-error text-6xl">error</span>
        <h1 className="text-2xl font-bold font-headline text-on-surface">Pemesanan Tidak Ditemukan</h1>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {error || "Rincian pemesanan Anda tidak dapat dimuat."}
        </p>
        <Link
          href="/dashboard"
          className="forest-gradient text-white font-bold py-3 px-8 rounded-2xl text-sm shadow-md inline-block w-full cursor-pointer"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(booking.booking_date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pt-32 pb-24 flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-wide">
          Halaman Pembayaran
        </h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Selesaikan pembayaran Anda untuk memproses izin SIMAKSI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Payment Form & Instructions */}
        <div className="md:col-span-7 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="flex border-b border-outline-variant/20">
              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === "bank"
                    ? "bg-primary/5 text-primary border-b-2 border-primary"
                    : "text-secondary/60 hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-sm">account_balance</span>
                Transfer Bank
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === "qris"
                    ? "bg-primary/5 text-primary border-b-2 border-primary"
                    : "text-secondary/60 hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-sm">qr_code_2</span>
                QRIS / E-Wallet
              </button>
            </div>

            <div className="p-6">
              {paymentMethod === "bank" ? (
                <div className="space-y-6">
                  <div>
                    <span className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-3">Pilih Rekening Tujuan</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "bca", name: "BCA" },
                        { id: "mandiri", name: "Mandiri" },
                        { id: "bni", name: "BNI" },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`py-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                            selectedBank === bank.id
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-outline-variant/50 text-secondary/70 hover:border-primary/50"
                          }`}
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface-container/40 p-4 rounded-xl border border-outline-variant/20 space-y-3">
                    <div>
                      <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Nomor Rekening</span>
                      <span className="text-lg font-black text-primary font-mono tracking-wider flex items-center gap-2">
                        {selectedBank === "bca" && "8291039840"}
                        {selectedBank === "mandiri" && "1310029304958"}
                        {selectedBank === "bni" && "0829103849"}
                        <button
                          type="button"
                          onClick={() => {
                            const num = selectedBank === "bca" ? "8291039840" : selectedBank === "mandiri" ? "1310029304958" : "0829103849";
                            navigator.clipboard.writeText(num);
                            alert("Nomor rekening berhasil disalin!");
                          }}
                          className="material-symbols-outlined text-sm hover:text-primary-dark cursor-pointer text-secondary/60"
                        >
                          content_copy
                        </button>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Nama Pemilik Rekening</span>
                      <span className="text-xs font-bold text-on-surface">PT SummitPass Indonesia</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Jumlah Transfer</span>
                      <span className="text-base font-black text-primary font-mono">
                        {rupiahFormatter.format(booking.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-inner flex flex-col items-center">
                    <span className="text-[10px] font-black text-secondary tracking-widest uppercase mb-1">QRIS STANDAR NASIONAL</span>
                    {/* Mock QR Code */}
                    <div className="w-48 h-48 bg-surface-container-high rounded-xl border-4 border-primary/20 flex flex-col justify-center items-center relative overflow-hidden">
                      <span className="material-symbols-outlined text-6xl text-primary opacity-60">qr_code_2</span>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-lg border border-outline-variant/30 shadow-md">
                        <span className="text-[10px] font-black text-primary font-headline">SP</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-on-surface-variant mt-2">Pindai QR di atas menggunakan GoPay, OVO, DANA, dll.</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Total Pembayaran</span>
                    <span className="text-xl font-black text-primary font-mono">{rupiahFormatter.format(booking.total_price)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleConfirmPayment} className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-6">
            <h3 className="font-headline font-bold text-sm text-secondary uppercase tracking-widest border-b border-outline-variant/20 pb-2">
              Bukti Transaksi
            </h3>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Upload Bukti Transfer / SS QRIS</label>
              
              <div className="border-2 border-dashed border-outline-variant/50 hover:border-primary/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center bg-surface-container/20 text-center relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceiptFile(e.target.files[0]);
                    }
                  }}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="material-symbols-outlined text-secondary/60 text-4xl mb-2">upload_file</span>
                {receiptFile ? (
                  <div>
                    <p className="text-xs font-bold text-primary">{receiptFile.name}</p>
                    <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-on-surface">Klik untuk memilih gambar atau seret file ke sini</p>
                    <p className="text-[10px] text-on-surface-variant/85 mt-1">Mendukung format PNG, JPG, JPEG maks 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !receiptFile}
              className={`w-full py-4 rounded-xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting || !receiptFile
                  ? "bg-outline-variant/65 cursor-not-allowed"
                  : "forest-gradient hover:opacity-95 active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Memverifikasi Pembayaran...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">verified</span>
                  <span>Konfirmasi Pembayaran &amp; Unduh Tiket</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Invoice Summary */}
        <div className="md:col-span-5">
          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            <h2 className="text-xs font-bold text-secondary uppercase tracking-[0.1rem] border-b border-outline-variant/20 pb-2">
              Ringkasan Tagihan
            </h2>

            <div className="space-y-4">
              <div>
                <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Gunung Tujuan</span>
                <span className="text-base font-black text-on-surface font-headline">{booking.mountain.name}</span>
                <span className="block text-[10px] text-on-surface-variant mt-0.5">{booking.mountain.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-outline-variant/20 py-3">
                <div>
                  <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Tanggal</span>
                  <span className="text-xs font-bold text-primary">{formattedDate}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Jumlah Anggota</span>
                  <span className="text-xs font-bold text-primary font-mono">{booking.hikers.length} Orang</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Daftar Rombongan</span>
                <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {booking.hikers.map((hiker, idx) => (
                    <li key={idx} className="bg-white/60 p-2 rounded-lg border border-outline-variant/15 text-xs flex justify-between items-center">
                      <span className="font-bold text-on-surface truncate max-w-[120px]">{hiker.nama}</span>
                      <span className="text-[10px] text-on-surface-variant/80 font-mono">KTP: {hiker.no_ktp.substring(0, 4)}...</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center mt-4">
                <div>
                  <span className="block text-[9px] font-bold text-primary uppercase tracking-wider">TOTAL TAGIHAN</span>
                  <span className="text-lg font-black text-primary font-mono">
                    {rupiahFormatter.format(booking.total_price)}
                  </span>
                </div>
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                  Belum Bayar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="pt-32 pb-32 flex flex-col items-center justify-center min-h-screen">
        <span className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></span>
        <p className="mt-4 text-on-surface-variant font-medium text-sm font-headline">Memuat Halaman Pembayaran...</p>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
