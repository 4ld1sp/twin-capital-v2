# Product Requirements Document (PRD) - Twin Capital Command Center

## 1. Pendahuluan
- **Nama Produk:** Twin Capital Command Center
- **Tujuan Produk:** Menyediakan antarmuka dashboard eksekutif dan operasional (*web application*) yang komprehensif bagi tim internal untuk memantau aktivitas *trading bot*, menganalisis data pasar (*real-time*), dan mengelola eksekusi strategi portofolio kripto.
- **Target Pengguna:** Administrator, Eksekutif, Quant Trader, dan Portfolio Manager internal.
- **Platform:** Aplikasi *Single Page Application* (SPA) berbasis web (Desktop-first).

---

## 2. Arsitektur & Teknologi Utama
- **Frontend Framework:** React + Vite (Aplikasi *Client-Side* berkinerja tinggi).
- **Styling:** Tailwind CSS dengan sistem tema ganda (*Dual Theme*). Mode Terang (*Light Mode*) menggunakan efek *Glassmorphism* (`backdrop-blur`) pada kartu transparan di atas latar `#f2f2f7`. Mode Gelap (*Dark Mode*) menggunakan kartu solid `#1c1c1e` di atas latar hitam `#000000`, terinspirasi dari desain iOS. Toggle tema tersimpan di `localStorage`.
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
- **Growth Performance Card**: Visualisasi interactive grafik batang pertumbuhan followers per platform (YouTube, Twitter, Instagram, dll) — dilengkapi filter platform fungsional, indikator "Top Performer", dan tren pertumbuhan rata-rata.
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

#### 3.5.5. Growth Analytics (Sub-Menu)
- **Dedicated Sub-Page**: Menu terpisah yang menyajikan metrik pertumbuhan mendalam.
- **Platform Breakdown**: Kartu statistik per-platform (X, Instagram, YouTube, Facebook) dengan status follower/subscriber real-time sesuai API Key yang terkoneksi.
- **Performance Summary**: Tabel ringkasan performa lintas platform dengan metrik efisiensi dan pertumbuhan.

#### 3.5.6. Affiliates
- **Affiliate Funnel:** Visualisasi funnel konversi afiliasi.
- **Network Management:** Placeholder untuk integrasi API partner (coming soon).

#### 3.5.7. Revenue Streams
- Placeholder modul untuk agregasi pendapatan dari Adsense, Sponsorships, dan monetisasi langsung (coming soon).

### 3.6. Profil Pengguna (Profile Page) & Pengaturan (Settings)
- **Dynamic Profile State:** Halaman profil yang terpusat state-nya, memungkinkan pengeditan iteraktif untuk Nama, Peran, Email, dan Avatar melalui Modal Edit pop-up.
- **API Connections Manager**: Antarmuka pengelola *API Keys* yang dinamis untuk Bursa Trading (Trading Exchanges), Media Sosial, dan AI Models.
- **Generic Connections**: Opsi "Other" untuk menambahkan koneksi platform di luar list standar, yang akan otomatis muncul di seluruh dashboard terkait.
- **Dynamic Platform Matching**: Dropdown dan list platform (seperti di Add Task Media) otomatis menyesuaikan dengan daftar API yang telah berhasil terkoneksi di Settings.
- **Generic Webhooks**: Integrasi *Custom Webhook* yang general (tidak hanya terbatas pada OpenClaw) untuk menerima sinyal/data eksternal.
- **Security Check Gate (Test Connection):** Sebelum koneksi API baru (atau Webhook) dapat ditambahkan, pengguna diwajibkan melakukan *Test Connection* hingga status terverifikasi (Verified) untuk mencegah credential invalid.
- **Edit Connection Data:** Kemampuan untuk mengubah (*update*) API Key, Secret, atau Password dari koneksi yang sudah ditambahkan dengan tombol konfirmasi Hapus (Delete Confirmation Modal) yang aman.
- **Security Settings:** Modul pemberitahuan pengaturan sandi / privasi antarmuka, dilengkapi toggle fungsional seperti Two-Factor Authentication.

### 3.7. Sistem Tema iOS (*iOS Theme Overhaul*)
Sistem tema visual menyeluruh yang terinspirasi dari desain iOS, diterapkan secara konsisten di **seluruh halaman** aplikasi.

#### 3.7.1. Arsitektur Tema
- **CSS Variables:** Variabel warna terpusat (`:root` untuk gelap, `[data-theme='light']` untuk terang) mencakup `--bg-main`, `--card-bg`, `--card-border`, `--text-primary`, `--text-secondary`, `--primary`, dan `--glass-blur`.
- **Tailwind Mapping:** Variabel CSS dipetakan ke utilitas Tailwind (`text-main`, `text-secondary`, `bg-main`, `bg-glass`, `border-glass`, `glass-card`).
- **ThemeContext (React):** Context provider dengan `localStorage` persistence, menyediakan toggle `toggleTheme()` yang dapat diakses seluruh komponen.

#### 3.7.2. Mode Terang (*Light Mode*)
- Latar belakang: `#f2f2f7` (abu-abu terang ala iOS).
- Kartu: `rgba(255,255,255,0.7)` dengan `backdrop-blur(25px)` — efek kaca (*Glassmorphism*).
- Border halus: `rgba(0,0,0,0.05)`.

#### 3.7.3. Mode Gelap (*Dark Mode*)
- Latar belakang: `#000000` (hitam murni).
- Kartu: `#1c1c1e` solid (tanpa blur) — gaya iOS Dark Mode.
- Border halus: `rgba(255,255,255,0.08)`.

#### 3.7.4. Bahasa Desain
- **Tipografi:** `font-black uppercase tracking-widest` untuk judul dan label, memberikan kesan premium dan konsisten.
- **Warna Aksen**: `#00d6ab` (hijau *teal*) sebagai warna utama di kedua mode.
- **Soft Contrast Visualization**: Dashboard trading dan chart analytics menggunakan sistem transparansi dan warna muted (opacity 20-30%) untuk kenyamanan mata dan kesan premium.
- **Elemen Interaktif**: Tombol aktif menggunakan `bg-primary text-black shadow-primary/20`, dengan efek `hover:brightness-110` and `active:scale-[0.98]`.
- **Sudut:** `rounded-2xl` hingga `rounded-3xl` pada kartu dan tombol.
- **Segmented Control:** Tab navigasi bergaya iOS menggunakan latar `bg-black/5 dark:bg-white/5` dengan pill aktif `bg-primary`.

#### 3.7.5. Cakupan Halaman
| Halaman | Komponen yang Di-tema |
|---------|----------------------|
| Header | Navbar glassmorphism, toggle tema (Sun/Moon) |
| Feed | Panel, tabs, search, tabel data |
| Dashboard | MetricCards, PerformanceAnalytics, EngagementBars, BotStatusMatrix |
| Trading | 21 komponen + 4 modal (Optimization, Backtest, Logs) |
| Profile | ProfileHeader, RecentActivityList, AccountSettingsList, DangerZone |

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
