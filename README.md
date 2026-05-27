# Project Multimedia

Repository ini berisi project aplikasi web banking sederhana bernama NovaBank Digital. Aplikasi ini dibuat sebagai prototype UI modern minimalis untuk kebutuhan project multimedia, dengan fokus pada tampilan antarmuka, navigasi, dan simulasi fitur dasar perbankan digital.

NovaBank Digital menyediakan halaman login, pembuatan akun, lupa sandi, dashboard rekening, cek saldo, transfer, dan aktivitas transaksi. Untuk saat ini aplikasi masih berjalan sebagai frontend/demo UI, sehingga data transaksi masih berasal dari sample data lokal dan belum terhubung ke database atau autentikasi asli.

Project utama berada di folder:

```text
banking/
```

Dokumentasi lengkap, cara menjalankan project, struktur folder, dan konfigurasi environment ada di:

```text
banking/README.md
```

## Ringkasan Fitur

- Login pengguna
- Sign in untuk membuat akun
- Form lupa sandi
- Dashboard rekening
- Informasi kartu dan saldo
- Form transfer
- Riwayat aktivitas transaksi
- Tampilan responsif untuk desktop dan HP

## Teknologi Utama

- Next.js
- React
- TypeScript
- Tailwind CSS

## Menjalankan Project

Masuk ke folder aplikasi:

```bash
cd banking
```

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka di browser:

```text
http://localhost:3000
```

Untuk dokumentasi yang lebih lengkap, lihat file `banking/README.md`.
