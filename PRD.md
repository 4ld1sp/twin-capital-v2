# Product Requirements Document (PRD) - Twin Capital Command Center

## 1. Pendahuluan
- **Nama Produk:** Twin Capital Command Center
- **Tujuan Produk:** Menyediakan antarmuka dashboard eksekutif dan operasional (*web application*) yang komprehensif bagi tim internal untuk memantau aktivitas *trading bot*, menganalisis data pasar (*real-time*), dan mengelola eksekusi strategi portofolio kripto.
- **Target Pengguna:** Administrator, Eksekutif, Quant Trader, dan Portfolio Manager internal.
- **Platform:** Aplikasi *Single Page Application* (SPA) berbasis web (Desktop-first).

---

## 2. Arsitektur & Teknologi Utama
- **Frontend Framework:** React + Vite (Aplikasi *Client-Side* berkinerja tinggi).
- **Styling:** Tailwind CSS (Mode Gelap /*Dark Mode* bawaan, palet warna *Emerald/Teal* khusus perusahaan, *Glassmorphism/Frosty*).
- **Routing:** React Router DOM (Mendukung perlindungan rute, dilarang masuk tanpa sesi berizin).
- **Visualisasi Data:** Chart.js melalui antarmuka `react-chartjs-2`.
- **Integrasi Pihak Ketiga (Data Real-Time):**
  - Bybit V5 Public WebSocket (*Spot* & *Linear*) untuk koneksi langsung *tick-by-tick* harga aset.
  - Glint API (`api-v2.glint.trade`) & Integrasi antarmuka/struktur metrik Polymarket (peluang peluang *Yes/No* pasaran prediksi).

---

## 3. Fitur Utama yang Telah Selesai (Saat Ini)

### 3.1. Autentikasi & Keamanan Dasar
- **Login Portal:** Antarmuka masuk responsif yang dilindungi oleh autentikasi awal. Jika kredensial dimasukkan, sesi pengguna diberikan.
- **Guarded Routes:** Menolak rute navigasi publik jika pengguna tidak berhasil *login*.

### 3.2. Dashboard Utama (Home)
- **Top Metrics:** Indikator panel berisi metrik harian ditarik dari struktur API Glint (contoh: *Signals Caught*, *Fast Movers*).
- **Contextual Intel (Polymarket Layout):** Panel intelijen informasi pasar yang kontekstual, dengan visual elemen *progress-bar* peluang probabilitas dinamis berbasis variabel `best_catch.related_market`.
- **Portfolio & Asset Chart:** Visual grafik aset dalam portofolio (Garis waktu kumulatif total dan alokasi instrumen per koin).

### 3.3. Command Center (Trading Page)
- **Bot Status Matrix:** 
  - Array interaktif dari bot yang sedang beroperasi.
  - Berfluktuasi secara langsung dengan simulasi laba/rugi berdetak interval per-detik.
  - Opsi perintah lokal via *Dropdown Menu* untuk **Pause Strategy** (menghentikan simulasi *tick* pada agen tertentu) atau **Force Close Bot** (fitur melikuidasi bot jika kondisi tidak aman).
- **Backtest Hub / Evaluasi:** Panel tempat pengguna menguji pengaturan metrik lama beserta persentase risiko.
- **Live Execution Logs:** *Terminal/console* bergaya peretas untuk memonitor baris-baris sinyal *order execution* dari API luar.
- **Strategy Modals:** Formulir *popup* yang memungkinkan Anda mengunci/menyesuaikan pengaturan seperti alokasi modal dan sebaran bot ke instrumen pasar.

### 3.4. Markets Overview (Feed Page)
- **Koneksi Tunggal & Fleksibel ke Bybit:** Menangani API publik *WebSocket* untuk menghadirkan terminal profesional.
- **Dynamic Flashing UI:** Tabel yang otomatis mengamankan perbedaan angka; layar berkedip hijau jika tren beli naik, dan merah ketika terjadi volatilitas turun per milidetik.
- **Tab Isolasi Berbanyak (Dynamic Switching):** Rute dienkapsulasi untuk memuat beragam struktur langganan terpisah (Favorites, Spot, Derivatives/Linear, TradFi, Newly Listed).
- **Sektor Peringkat Sentimen Atas:** Takometer Sentimen Pasar, Volume *Trading*, dan klasifikasi Aset Berdasarkan Nilai Sentimen Sektor.

### 3.5. Pipeline Riset (Media Page)
- **Jira-Style Kanban Board:** Antarmuka dengan sistem blok fungsional *Drag-and-Drop* yang dilambangkan seperti Jira yang mewadahi pelacakan riset konten spesifik kepada tiga tingkatan (*In Progress*, *Review/To Do*, *Published*).

### 3.6. Profil Pengguna (Profile Page)
- Kartu Nama dan avatar penyesuaian detail karyawan.
- Pengaturan integrasi kata kunci kunci akses (API) pertukaran.
- Modul pemberitahuan pengaturan sandi / privasi antarmuka.

---

## 4. Rencana Ekspansi yang Belum Dimulai (Next Steps / Evaluasi)

1. **Pengembangan Backend Server/Middleware:** Saat ini semua operasional data transaksi masih menggunakan *mock state* sisi-*client*. Agar fungsi *Force Close* & integrasi *Websocket* dapat berjalan di tingkat organisasi, Anda memerlukan arsitektur *backend* (menggunakan Node.js, Python FastAPI, dll).
2. **Database Sinkronisasi (Persistence):** Menyimpan pengaturan seperti *Favorites Tabs* yang ditambahkan pengguna atau bot yang dimatikan ke pangkalan data relasional (contoh: PostgreSQL) atau dokumen (MongoDB).
3. **Autentikasi Aman Berbasis Kriptografi (JWT/OAuth):** *Logout* asli dan verifikasi identitas di bawah sesi token yang divalidasi oleh *backend*.
4. **Eksekusi Order Pertukaran Privat:** Membangun API spesifik Bybit/Binance "Privat" (meminta status kepemilikan dompet) dengan menghubungkan pengaturan di profil ke jembatan perintah tombol tabel Trading Bot Anda.
5. **Responsif / Desain Mobile:** Pengoptimalan resolusi ponsel karena UI Dashboard saat ini berfokus pada resolusi aplikasi terminal Desktop tinggi (*Executive View*).
