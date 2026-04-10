# Risk Register: Daftar & Mitigasi Risiko

Setiap sistem *high-speed trading* memiliki risiko teknikal dan finansial yang mutlak. Daftar ini mencatat semua temuan, kemungkinan terburuknya, serta jaring pengaman (mitigasi) yang telah atau akan diaplikasikan di dalam *codebase* Twin Capital.

## Daftar Matriks Risiko

| ID | Kategori | Deskripsi Risiko | Probabilitas | Dampak | Rencana Mitigasi (Fallback) | Status |
| :-- | :-- | :--- | :---: | :---: | :--- | :---: |
| **RSK-01** | *AI / Logika* | **AI Hallucination / Revenge Trading**. AI mengambil kesimpulan teknikal yang salah secara berturut-turut setelah mengenai *Stop Loss*, membakar dana secara membabi buta. | Tinggi | Krusial | 1. Implementasi **Adaptive Cooldown** (bot dikarantina sementara usai kalah).<br>2. **AI Memory Injection**: AI diberi prompt riwayat 6 trade terakhir. | Tertangani |
| **RSK-02** | *System Data* | **Log Duplication & Ghost Logs**. *Risk Engine loop* (setiap 10s) menarik data lampau / mendaftarkan data puluhan kali akibat *race conditions*. | Tinggi | Tinggi | 1. Implementasi **Mutex Lock (riskLocks)**.<br>2. Deduplikasi berbasis `orderId`.<br>3. Pemblokiran asimilasi data menggunakan `pnlTime < createdAt`. | Tertangani |
| **RSK-03** | *Finansial* | **Market Crash / Flash Crash**. Likuidasi terjadi lebih cepat daripada respons mesin Signal (yang hanya mengecek tiap 15-30 menit). | Sedang | Krusial | Mesin pelindung harian (**Risk Engine**) disetel berjalan setiap 10 detik murni secara hardcoded *Trailing Stop* dan *Max Daily Drawdown Kill-Switch*. | Tertangani |
| **RSK-04** | *Infrastruktur* | **Ban API Exchange (Rate Limit)**. Bybit memblokir lalu lintas IP aplikasi akibat dibrondong cek saldo tiap 10 detik dan gagal *auth*. | Sedang | Tinggi | Sistem meredam kegagalan menggunakan *Try-Catch* dan menampilkan alert *API Error Validation Failed* di antarmuka alih-alih me-retri paksa. | Dipantau |
| **RSK-05** | *Keamanan* | **Pencurian API Keys**. Kebocoran akses melalui penyerang yang berhasil masuk ke *database* atau repo klien. | Rendah | Fatal | 1. Seluruh Kunci API Bybit/OpenAI disimpan menggunakan enkripsi `AES-256-GCM` pada level *Backend*.<br>2. Akun dilindungi `2FA`. | Tertangani |

---
**Aturan Koordinasi Bencana:** 
Jika **RSK-05** terjadi, tombol *Emergency Stop* dan Rotasi *Encryption Key* di dalam `apps/api/src/lib/encryption.js` harus langsung dijalankan.
