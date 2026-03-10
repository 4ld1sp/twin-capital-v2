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

### 3.5. Media & Branding Panel (Media Page)
Platform manajemen konten dan *personal branding* yang terintegrasi untuk menjalankan strategi monetisasi multi-platform.

#### 3.5.1. Overview Dashboard
- **Quick Stats Row:** 4 kartu metrik utama (Total Followers, Engagement Rate, Affiliate Revenue, Monthly Posts) dengan indikator persentase pertumbuhan.
- **Followers Growth Chart:** Visualisasi grafik batang pertumbuhan followers per platform (YouTube, Twitter, LinkedIn) — ditampilkan berdampingan dengan Engagement Rate.
- **Engagement Rate Bars:** Progress bar per tipe konten (Video Content, Articles, Infographics).
- **Pipeline Status (Full-Width):** Ringkasan status Kanban pipeline (Backlog, In Progress, Review, Go Live) dalam grid horizontal 4 kolom, beserta Quick Actions (New Post, Analytics).

#### 3.5.2. Content Pipeline (Jira-Style Kanban Board)
- **Kolom Kanban 4-Tingkat:** Backlog → In Progress → Review → Go Live.
- **Drag-and-Drop:** Kartu task bisa dipindahkan antar kolom secara interaktif.
- **Auto-Pilot Timer:** Task yang sudah mencapai `targetTime` otomatis dipindahkan ke kolom "Go Live" setiap 10 detik.
- **CRUD Lengkap:** Kartu bisa diklik untuk membuka modal *Edit* dengan data pre-populated, termasuk tombol Delete dengan konfirmasi estetik (*glassmorphism popup*).

#### 3.5.3. Cross-Posting Studio (Modal)
- **Composition Area:** *Textarea* dengan penghitung karakter untuk menulis konten.
- **Target Post Time & Pipeline Status:** Input waktu target dan dropdown status pipeline (Backlog, In Progress, Review, Go Live) dengan *custom glassmorphism dropdown*.
- **Platform Toggle Switches:** Toggle untuk 6 platform sosial media (X/Twitter, Instagram, TikTok, YouTube Shorts, LinkedIn, Telegram) dengan ikon dan warna brand masing-masing platform.
- **Affiliate Link Injection:** Toggle otomatis injeksi link afiliasi ke dalam konten.
- **Multi-Media Attachments:** Mendukung lampiran beberapa media sekaligus (contoh: 2 gambar + 1 video) dalam galeri grid 3 kolom, dengan badge tipe media (🖼️/🎬), tombol hapus per-item, dan "Clear All".
- **Video Player Preview:** Overlay pemutar video simulasi dengan kontrol Play/Pause, progress bar yang bisa di-scrub, timer (0:00 / 0:15), serta ikon volume dan fullscreen — memungkinkan review video sebelum posting.

#### 3.5.4. AI Content Generator
- **3 Tab Media Type:** Text, Image, dan Video.
- **Text Generation:** Input prompt → animasi mengetik konten otomatis → preview → "Use This Content" mengisi textarea utama.
- **Image Generation:** Input deskripsi → loading spinner → preview gambar AI → "Use This Image" / Retry / Discard.
- **Video Generation:** Input deskripsi → loading spinner → preview thumbnail dengan overlay play button dan badge durasi "0:15" → "Use This Video" / Retry / Discard.
- **Library Aset AI:** 4 gambar pre-generated bertema crypto/trading (trading chart, bull run, market analysis, signal alert).

#### 3.5.5. Growth Analytics
- Visualisasi lengkap metrik dan grafik pertumbuhan followers serta engagement rate.

#### 3.5.6. Affiliates
- **Affiliate Funnel:** Visualisasi funnel konversi afiliasi.
- **Network Management:** Placeholder untuk integrasi API partner (coming soon).

#### 3.5.7. Revenue Streams
- Placeholder modul untuk agregasi pendapatan dari Adsense, Sponsorships, dan monetisasi langsung (coming soon).

### 3.6. Profil Pengguna (Profile Page)
- Kartu Nama dan avatar penyesuaian detail karyawan.
- Pengaturan integrasi kata kunci kunci akses (API) pertukaran.
- Modul pemberitahuan pengaturan sandi / privasi antarmuka.

---

## 4. Rencana Ekspansi yang Belum Dimulai (Next Steps / Evaluasi)

1. **Pengembangan Backend Server/Middleware:** Saat ini semua operasional data transaksi masih menggunakan *mock state* sisi-*client*. Agar fungsi *Force Close* & integrasi *Websocket* dapat berjalan di tingkat organisasi, diperlukan arsitektur *backend* (Node.js, Python FastAPI, dll).
2. **Database Sinkronisasi (Persistence):** Menyimpan pengaturan seperti *Favorites Tabs*, data pipeline, dan konfigurasi bot ke pangkalan data relasional (PostgreSQL) atau dokumen (MongoDB).
3. **Autentikasi Aman Berbasis Kriptografi (JWT/OAuth):** *Logout* asli dan verifikasi identitas di bawah sesi token yang divalidasi oleh *backend*.
4. **Eksekusi Order Pertukaran Privat:** Membangun API spesifik Bybit/Binance "Privat" (meminta status kepemilikan dompet) dengan menghubungkan pengaturan di profil ke jembatan perintah tombol tabel Trading Bot.
5. **Integrasi AI API Nyata:** Menghubungkan AI Content Generator ke API seperti OpenAI (DALL-E, GPT), Midjourney, atau Runway untuk generasi konten teks, gambar, dan video yang benar-benar unik.
6. **OAuth Social Media API:** Integrasi OAuth 2.0 sesungguhnya ke platform sosial media (Twitter API, Instagram Graph API, TikTok API, YouTube Data API, LinkedIn API, Telegram Bot API) untuk auto-posting konten secara nyata.
7. **Analytics & Revenue Tracking:** Mengintegrasikan Google Analytics, Adsense API, dan affiliate partner API untuk data revenue dan growth yang real-time.
8. **Responsif / Desain Mobile:** Pengoptimalan resolusi ponsel karena UI Dashboard saat ini berfokus pada resolusi aplikasi terminal Desktop tinggi (*Executive View*).
