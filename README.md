# SummitPass - Platform Registrasi Pendakian Gunung Online (MVP Startup)

**SummitPass** adalah platform digital berbasis SaaS/MVP yang dirancang untuk mempermudah pendaftaran pendakian gunung dan pengurusan izin SIMAKSI secara online bagi pendaki (*Hikers*), sekaligus menyediakan panel kontrol komprehensif bagi administrator (*Admins*) kehutanan/taman nasional.

Proyek ini telah dikembangkan menjadi produk Full-Stack MVP yang layak dipresentasikan kepada investor/stakeholder dengan backend API dinamis, database relasional terintegrasi, dan autentikasi aman berbasis JWT.

---

## 🚀 Fitur Utama

1. **Autentikasi & Otorisasi Peran (Role-based Auth)**:
   - Sistem login dan registrasi terpadu untuk Hiker dan Admin.
   - Keamanan kata sandi tinggi dengan enkripsi hashing `bcryptjs`.
   - Manajemen sesi aman menggunakan token JWT yang disimpan dalam **HTTP-Only Cookie** (`summitpass_token`) untuk mencegah pencurian token via JavaScript (XSS).
   - **Next.js Middleware** terintegrasi untuk proteksi rute halaman `/dashboard` (hanya Hiker) dan `/admin/dashboard` (hanya Admin).

2. **Alur Onboarding Hiker Multi-Step**:
   - Pengisian kredensial dasar akun.
   - Simulasi verifikasi kode OTP 6-Digit via WhatsApp (Kode dummy: `123456`).
   - Aktivasi akun secara instan dengan visualisasi record data yang tersimpan di tabel database.
   - Pelengkapan profil pendaki (KTP 16-Digit, tanggal lahir, golongan darah, kontak darurat keluarga).

3. **Sistem Booking & Validasi Kuota**:
   - Pemilihan gunung (Gunung Prau) dan penentuan tanggal pendakian langsung di kalender interaktif.
   - Formulir pendaftaran rombongan pendaki dengan penambahan/penghapusan anggota tim secara dinamis.
   - Validasi sisa kuota harian gunung secara real-time berdasarkan total rombongan yang terdaftar pada tanggal tersebut.
   - Kalkulasi otomatis total biaya pendakian dan pencetakan digital E-Ticket/receipt transaksi.

4. **Dasbor Hiker (Personal Dashboard)**:
   - Kartu Pendaki Digital interaktif dengan QR Code untuk validasi pemindaian di basecamp.
   - Statistik ringkasan (Total Booking, Booking Aktif, dan Selesai Mendaki).
   - Riwayat pemesanan tiket terperinci beserta status verifikasinya (*Pending*, *Diproses*, *Selesai*).
   - Visualisasi tabel database langsung (LIVE SQL) yang membaca isi tabel `users`, `hiker_profiles`, dan `bookings` langsung dari database backend.

5. **Panel Admin (Admin Dashboard)**:
   - Dashboard statistik global (jumlah transaksi, menunggu verifikasi, total hiker terdaftar).
   - Manajemen transaksi (memproses tiket dan menyetujui izin pendakian hiker).
   - Manajemen direktori pendaki (melihat detail identitas KTP dan kontak darurat hiker).
   - Pengaturan kuota harian, tinggi gunung, lokasi, kesulitan, dan harga tiket SIMAKSI secara dinamis.

6. **Self-Seeding Database**:
   - Inisialisasi otomatis data gunung pertama (Gunung Prau) dan akun administrator utama (`admin` / `admin123`) ketika aplikasi dijalankan jika database dalam keadaan kosong.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend & Routing**: Next.js 16.2.4 (App Router), React 19.2.4, TypeScript.
- **Styling**: TailwindCSS v4, Google Material Symbols (Ikon).
- **Backend API & Middleware**: Next.js Serverless Route Handlers & Next.js Edge Middleware.
- **Database & ORM**: Prisma Client v5.22.0 dengan driver database **PostgreSQL** (default) / **SQLite**.
- **Kriptografi & Sesi**: `bcryptjs` (Password hashing) & `jsonwebtoken` (Token-based Session).

---

## 📂 Struktur Folder Proyek

```
SummitPass/
├── app/
│   ├── admin/                # Halaman Login Admin & Dashboard Admin
│   ├── api/                  # Backend API Route Handlers
│   │   ├── admin/            # API khusus Administrator (Bookings, Mountains, Users)
│   │   ├── auth/             # API Autentikasi (Login, Register, Logout, Me, Verify OTP)
│   │   └── booking/          # API Transaksi Tiket (GET & POST)
│   ├── booking/              # Halaman pendaftaran rombongan & E-Tiket konfirmasi
│   ├── components/           # Komponen UI global (Header, BottomNav, PartnerSection)
│   ├── dashboard/            # Dasbor Hiker (Kartu Pendaki & Live SQL database)
│   ├── mountain/             # Detail Gunung & Widget Kalender interaktif
│   ├── globals.css           # Konfigurasi TailwindCSS v4 & tema warna forest green
│   ├── layout.tsx            # Struktur cangkang utama & load Google Fonts
│   └── page.tsx              # Halaman Beranda (Landing Page & Menu Kemitraan)
├── prisma/
│   └── schema.prisma         # Skema relasional database (tabel-tabel relasi)
├── middleware.ts             # Proteksi rute halaman JWT (Edge Runtime)
├── .env.example              # Template variabel lingkungan
└── package.json              # Dependensi proyek Next.js + Prisma v5
```

---

## ⚙️ Cara Instalasi & Menjalankan Proyek

### 1. Klon Repositori & Instal Dependensi
Pastikan Node.js (versi 18+) telah terinstal di komputer Anda.
```bash
npm install
```

### 2. Konfigurasi Variabel Lingkungan
Salin file `.env.example` menjadi `.env` di direktori utama proyek:
```bash
copy .env.example .env
```
Isi variabel di dalam berkas `.env`:
- `JWT_SECRET`: Kunci enkripsi bebas untuk JWT.
- `DATABASE_URL`: URL koneksi ke PostgreSQL Anda. Contoh:
  `DATABASE_URL="postgresql://postgres:password@localhost:5432/summitpass?schema=public"`

> 💡 **Tips Pengujian Instan Tanpa Setup PostgreSQL**:
> Jika Anda ingin mencoba secara cepat tanpa menginstal PostgreSQL, ubah provider database menjadi **SQLite**:
> 1. Buka berkas `prisma/schema.prisma` dan ubah `provider = "postgresql"` menjadi `provider = "sqlite"`.
> 2. Buka berkas `.env` dan ganti URL koneksi menjadi: `DATABASE_URL="file:./dev.db"`.

### 3. Migrasi Skema Database
Jalankan sinkronisasi skema tabel database dengan Prisma:
```bash
npx prisma db push
```
*Perintah ini akan membuat semua tabel (`users`, `hiker_profiles`, `mountains`, `bookings`, `notifications`, `admins`) di database Anda.*

### 4. Jalankan Aplikasi
Jalankan server pengembangan lokal:
```bash
npm run dev
```
Buka browser Anda dan kunjungi: **`http://localhost:3000`**

---

## 🔑 Informasi Akun Default untuk Pengujian

- **Akun Admin (Administrator)**:
  - **Username/Email**: `admin` atau `admin@summitpass.com`
  - **Password**: `admin123`
  - **Akses Portal**: `http://localhost:3000/admin`

- **Akun Hiker (Pendaki)**:
  - Silakan mendaftar akun baru lewat tombol **Daftar** di beranda (`http://localhost:3000/register`) untuk mencoba alur onboarding lengkap, verifikasi OTP WhatsApp (Gunakan kode: **`123456`**), pengisian KTP, pemesanan tiket Gunung Prau, hingga pencetakan E-Tiket digital.
