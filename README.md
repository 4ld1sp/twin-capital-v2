# Twin Capital Command Center 🌐

![Twin Capital Dashboard](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge) ![Node](https://img.shields.io/badge/Node.js-22%2B-blue?style=for-the-badge) ![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-336791?style=for-the-badge)

Twin Capital Command Center adalah sebuah eksekutif *dashboard* tersentralisasi untuk memonitor portofolio investasi (*crypto* & saham) dan mengelola pengoperasian Algoritma Trading AI Otonom di bursa Bybit.

Aplikasi ini menonjolkan UI bergaya *Premium Glassmorphism* dan dibangun dengan arsitektur **Hybrid Auto-Trading Engine** yang sangat mutakhir, memisahkan logika prediksi AI (lambat) dengan perlindungan *Risk Engine* level *server* (super cepat).

---

## ✨ Fitur Utama

- **Live Market Feed**: Streaming data *real-time* langsung dari Bybit WebSockets dengan indikator kedip visual murni dalam satuan milidetik.
- **Dual-Loop Auto-Trading Engine**: Bot eksekusi yang digerakkan oleh AI (Minimax / OpenAI) namun dinaungi oleh perlindungan *Risk Engine* tanpa henti setiap 10 detik.
- **Robust Security**: API Key bursa Anda dienkripsi ke *database* menggunakan `AES-256-GCM`. Dilengkapi Autentikasi 2FA via *Better Auth*.
- **Smart Memory AI**: Mencegah *revenge trading* melalui memori otomatis (AI mengingat 6 rugi/laba terakhir) dan proteksi *Cooldown Adaptive*.
- **Kanban Media Pipeline**: Studio manajemen pembuatan gambar/teks untuk kebutuhan sosial media terintegrasi di dalam terminal.

---

## 🚀 Quick Start / Instalasi Lokal

Sistem kita menggunakan arsitektur Node.js *monorepo* (Backend di `/apps/api`, Frontend di `/apps/dashboard`).

### 1. Prasyarat Sistem
Cek file `requirements.txt` untuk info detailnya, minimal Anda membutuhkan **Node.js v22**, **npm v10**, dan **Docker Desktop** (untuk database lokal).

### 2. Kloning & Instalasi
Instal semua dependensi paket *workspace*:
```bash
# Integrasi Root
npm install

# Instalasi di setiap layer
cd apps/api && npm install
cd ../dashboard && npm install
```

### 3. Persiapan Database
Nyalakan *container* PostgreSQL via Docker, lalu paksa struktur skema Drizzle ke dalam sistem:
```bash
cd apps/api
docker-compose up -d
npm run db:push
```

### 4. Menyalakan Server (Development)
Buka dua terminal konsol terpisah di sistem Anda:

**Terminal 1 (Menyalakan Otak Server / API):**
```bash
cd apps/api
npm run dev
```

**Terminal 2 (Menyalakan UI Terminal Kokpit):**
```bash
cd apps/dashboard
npm run dev
```
Buka browser dan masuk ke `http://localhost:5173`.

---

## 📚 Dokumentasi Lebih Lanjut

Apakah Anda seorang teknisi (*Engineer/Quant*) yang ingin berkontribusi mengubah kerangka AI Logika atau skema Basis Data kami? 
Silakan membaca **[Twin Capital Engineering Document (ENGINEERING.md)](./ENGINEERING.md)** yang berada di folder *root* ini untuk pedoman *backend* yang menyeluruh.

---
**Dirancang secara internal oleh Twin Capital (2026).**
