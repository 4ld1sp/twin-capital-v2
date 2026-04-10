# Stakeholder Register & RACI Matrix

Dokumen ini mendata seluruh lapisan tim dan unit yang berdampak di dalam proyek pengembangan Twin Capital untuk menjamin arus komunikasi yang presisi tanpa ada pihak yang tertinggal.

## 1. Daftar Pemangku Kepentingan
| Nama/Peran | Departemen | Pengaruh / Kekuatan | Ketertarikan | Ekspektasi Utama |
| :--- | :--- | :---: | :---: | :--- |
| **Aldis / CEO** | *Executive* | Tinggi | Tinggi | Pertumbuhan portofolio tanpa defisit teknikal, efisiensi operasional. |
| **Lead Developer** | *Engineering* | Tinggi | Tinggi | Basis kode yang kokoh (No Duplicate logs, 100% uptime, zero memory leaks). |
| **Quant / Risk Analyst** | *Research* | Sedang | Tinggi | Konfigurasi logika AI Memory anti-revenge, batasan SL yang bisa disesuaikan dengan pengungkit (*Leverage*). |
| **OpenClaw Agent** | *External (Autonomous)* | Rendah | Rendah | Mengandalkan koneksi 7x24 jam via tunnel. Menginginkan endpoint API `/operator` selalu menyala. |

## 2. RACI Matrix (Roles & Responsibilities)
> **R** = Responsible (Mengerjakan Tugas)  
> **A** = Accountable (Pemberi Persetujuan / Penanggung Jawab Akhir)  
> **C** = Consulted (Memberi Saran / Dimintai Pendapat)  
> **I** = Informed (Cukup Diinformasikan Saja Setelah Selesai)  

| Komponen Tugas / Aktivitas | Executive | Lead Engineer | Quant Analyst | External Agent |
| :--- | :---: | :---: | :---: | :---: |
| Arsitektur *Backend* & UI Server | **A** | **R** | **C** | **I** |
| Konfigurasi AI Prompts & SL/TP | **A** | **C** | **R** | **I** |
| Deployment & Bug Fixing (seperti Ghost Logs) | **I** | **R** | **C** | **I** |
| Injeksi Dana Likuiditas / Pemilihan Bursa | **A** | **I** | **R** | **I** |

## 3. Rencana Komunikasi
- **Harian (*Daily Sync*):** Sinkronisasi singkat via chat / terminal report terkait anomali *Risk Engine* harian (Misalnya ada bot yang tertabrak SL max harian).
- **Insidental (*Hotfix / Outage*):** Laporan pembaruan langsung (contoh: Perbaikan duplikasi Mutex Lock di DB).
- **Pembaruan Fitur (*Feature Rollout*):** Peninjauan menyeluruh kode melalui penyelarasan Walkthrough Artefak dan persetujuan Pull Request.
