# Twin Capital - Engineering & Technical Documentation

Selamat datang di repositori dokumentasi teknis **Twin Capital Command Center**. 
Dokumen ini disusun khusus bagi *Engineers, Quants*, dan *Developers* untuk memahami, memelihara, dan mengembangkan infrastruktur platform eksekusi algoritma *crypto-trading* canggih milik Twin Capital.

---

## 1. Arsitektur Sistem (Global Overview)

Twin Capital Command Center dirancang dengan konsep *Asymmetric Executive Application* berlapis ganda.
Sistem berfokus pada eksekusi strategi murni berbasis data (AI) dan keamanan kapital yang sangat ketat (Risk Management).

- **Frontend (Tampilan & Kontrol)**: React 18, Vite, Tailwind CSS (Custom Premium Glassmorphism UI).
- **Backend (Otak & Eksekusi)**: Node.js, Express.js.
- **Database (Memori Permanen)**: PostgreSQL dikelola dengan spesifikasi Drizzle ORM.
- **Autentikasi & Keamanan**: Better Auth (2FA enabled), Enkripsi tingkat militer `AES-256-GCM` untuk mengamankan Secret Keys (API Keys) di dalam *database*.
- **Tunneling & Akses Remote**: Cloudflare Tunnels digunakan untuk memberikan antarmuka aman bagi *autonomous agent* eksternal seperti OpenClaw (`/api/operator`).

---

## 2. Jantung Sistem: The Hybrid Auto-Trading Engine

Keunikan dan keunggulan utama Twin Capital terletak pada arsitektur **Dual-Loop Engine** di dalam *backend* (`apps/api/src/services/botEngine.js`).
Kedua mesin ini berjalan pada lapisan *loop* asinkron yang benar-benar independen dan saling mengontrol:

### A. The Signal Engine (Otak Eksekusi)
- **Fungsi**: Mesin analisis prediktif yang berjalan dalam ritme lambat dan periodik (misal: setiap 5, 15, atau 30 menit).
- **Alur Kerja**:
  1. Menarik data *candlestick*, indikator *real-time*, dan orderbook dari **Bybit API**.
  2. Menganalisis kondisi (*Prompt Injection*) menggunakan model **AI (Minimax / OpenAI)**. AI prompt diberikan konteks tajam mengenai kondisi global.
  3. **AI Memory Injection**: Menyuntikkan 6 riwayat *trading log* terakhir agar AI mengenali *trend* kemenangan/kekalahannya, mencegah *overtrading* dan menjaga kesinambungan.
  4. Menerima output `BUY`, `SELL`, atau `HOLD` dari AI, lalu mengeksekusi order *Market* (Taker).
  5. Menyetel (setup) parameter perlindungan dasar (`Stop Loss` & `Take Profit`).

### B. The Risk Engine (Sistem Saraf & Penjaga Keamanan)
- **Fungsi**: Mesin *hardcoded* murni yang sangat agresif. Berjalan terus menerus setiap **10 detik**.
- **Peran**: AI tidak dipercaya 100% untuk mengamankan uang. *Risk Engine* mengambil alih posisi yang sedang terbuka.
- **Fitur Utama**:
  1. **Mutex Lock (`riskLocks`)**: Mencegah tabrakan pemrosesan (*race conditions*) sehingga tidak akan pernah ada penarikan data ganda.
  2. **Dynamic Trailing Stop**: Jika harga bergerak searah profit, *Risk Engine* diam-diam memindahkan garis perlindungan *Stop Loss* ke zona profit, mengamankan keuntungan tak terduga.
  3. **Daily Max Drawdown**: Mesin menghitung akumulasi (*realized loss*) harian. Jika kerugian melewati *Max Drawdown* ($), mesin akan **SECARA PAKSA MENYUNTIK MATI (Kill-Switch)** seluruh operasional bot dan memaksa jual saldo aktif.
  4. **Ghost Log Deduplication**: Validasi cerdas (berbasis Timestamp `createdAt` bot) untuk mencegah sistem tertipu oleh data PnL global dari bursa, menghindari "halusinasi *sync*".
  
---

## 3. Fitur Perlindungan Superior (System Guards)

Dalam iterasi pembaruan terbaru, *engine* ini dilindungi oleh mekanisme anti-bunuh diri:

- **Adaptive Bot Cooldown (Anti-Whipsaw Guard)**:
  Jika AI menderita kekalahan (hit Stop Loss) pada koin tertentu, mesin *Signal* akan memberikan "penalti istirahat" adaptif sebesar `Interval Bot X 1` (contoh: interval 30 menit = *cooldown* 30 menit) kepada koin tersebut. API dilarang keras membuka koin yang baru saja hancur untuk mencegah fenomena "Revenge Trading".

- **Leverage-Aware Dynamic Strict SL**:
  Sistem perlindungan telah diprogram untuk memahami pengungkit (*leverage*). Persentase *Stop-Loss* tidak di-hardcode ke arah koin, melainkan menargetkan hancurnya **margin rasio**. Batas Take Profit dibuka lebar ke 10% agar algoritma *Trailing Stop* memiliki tempat bermain merekam *bull-run* yang masif.

---

## 4. Struktur Database Inti (Drizzle Schema Overview)

Seluruh logika diklaim dan diikat ke *database* via `/apps/api/src/db/schema.js`. Tabel paling vital:

1. `deployed_bots`: Menyimpan "jiwa" sang bot. Konfigurasi ID koin (`symbol`), arah *prompt* AI (`strategyScript`), batas interval loop, maksimal *drawdown*, batas leverage, serta *real-time status* (`running`, `paused`, `error`, `replaced`, `killed`).
2. `trade_logs`: *Ledger* yang *immutable* (tidak bisa dihapus oleh klien). Berfungsi sebagai rekam jejak setiap pernapasan bursa. Status aksinya meliputi `BUY`, `SELL`, `HOLD`, `CLOSE`, `BOT_START`, dan `ERROR`. Dilengkapi penjelasan keputusan AI (`aiReasoning`) dan ID unik posisi asal Bybit (`orderId`).
3. `api_keys`: Tempat bertenggernya autentikasi bursa dan AI eksternal, dikunci kokoh oleh Enkripsi simetris backend. Terisolasi total dari pembacaan *Frontend*.
4. `operator_keys`: Sistem unik *Bearer Token* manajemen *Remote Control*.

---

## 5. Development Setup & Deployment

### Pra-Syarat:
- Node.js versi 22+ (LTS)
- Docker Desktop (untuk lokal PostgreSQL)
- API Keys dari Bybit Account (Unified Margin dihidupkan)
- `npm` versi terbaru

### Instalasi Cepat:
1. Kloning repositori Twin Capital ke mesin lokal.
2. Navigasi ke direktori instalasi, jalankan proses *hook* dependensi:
   ```bash
   cd apps/api && npm install
   cd apps/dashboard && npm install
   ```
3. Bangkitkan Container Database PostgreSQL:
   ```bash
   cd apps/api
   docker-compose up -d
   ```
4. Push pemetaan skema Drizzle ke *database* baru:
   ```bash
   npm run db:push
   ```
5. Siapkan `apps/api/.env` dan salin format dari `.env.example`. Masukkan kunci Database dan *ENCRYPTION_KEY* minimal 32 karakter rahasia.

### Menghidupkan Server:
Buka dua terminal terpisah:
- **Terminal 1 (Backend/Otak)**:
  ```bash
  cd apps/api
  npm run dev
  ```
  API *Engine* menyala di port `3001`!
  
- **Terminal 2 (Frontend/Kokpit)**:
  ```bash
  cd apps/dashboard
  npm run dev
  ```
  Vite menyajikan Dashboard di `localhost:5173`. Masuk dengan *Better Auth*.

---

## 6. Prosedur Trouble-Shooting Sederhana

- **Masalah Tampilan Log Hantu (The Ghost Logs)**:
  *Symptom*: Anda men-deploy strategi baru, tapi log dibanjiri masa lalu, atau UI gagal berpindah ke strategi terbaru.
  *Solusi*: UI sudah diperbaiki lewat logika Auto-Sync dan ID tracking instan di `useBotEngine.js`. Pastikan Backend Anda memiliki tambalan perbaikan `pnlTime < new Date(bot.createdAt) continue;` agar mesing terisolir sejarahnya dari akun global.

- **Masalah Database Race Conditions**:
  Jika log memunculkan entri yang sama berulang setiap 10 detik, pastikan *Mutex Lock* di Set Memory Global (`riskLocks`) dan *Index fallback deduplication* (pengecekan `orderId` bursa) di dalam `runRiskCycle()` tetap terpasang dengan kuat sebelum eksekusi `db.insert()`.

- **Masalah Komunikasi OpenClaw / Agent Asing**:
  Jika agen tidak mampu membaca *endpoint*, pastikan `cloudflare tunnel` (`npm run tunnel`) berjalan. Tunnels tersebut mengarahkan *request inbound* langsung ke `.env` lokal Anda tanpa mem-blokirnya. *Operator Keys* (dibuat di UI dashboard) menaungi otorisasi masuk.

---
**Dokumen ini diarsip dan dilacak secara internal.** 
*Terakhir Diperbarui: Twin Capital Dev Engine (2026).*
