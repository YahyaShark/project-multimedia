# NovaBank Digital

NovaBank Digital adalah aplikasi web banking sederhana berbasis Next.js. Project ini dibuat sebagai prototype UI modern minimalis untuk alur login, pembuatan akun, lupa sandi, dashboard rekening, cek saldo, transfer, dan aktivitas transaksi.

Saat ini project masih berupa frontend/demo UI. Data transaksi masih menggunakan sample data lokal dan belum terhubung ke database atau sistem autentikasi asli.

## Fitur

- Login dengan username dan password
- Sign in untuk membuat akun baru
- Lupa sandi dengan form ganti sandi berdasarkan username
- Dashboard rekening dengan informasi kartu dan ringkasan transaksi
- Cek saldo dan detail rekening
- Form transfer dana
- Daftar aktivitas transaksi
- Dark mode dengan toggle tema
- Tampilan modern minimalis dan responsif untuk desktop maupun HP

## Teknologi

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint

## Struktur Folder

```text
banking/
+-- app/
|   +-- activity.tsx
|   +-- balance.tsx
|   +-- dashboard.tsx
|   +-- forgot-password.tsx
|   +-- index.tsx
|   +-- login.tsx
|   +-- sign-in.tsx
|   +-- transfer.tsx
+-- components/
|   +-- account-card.tsx
|   +-- banking-layout.tsx
|   +-- page-header.tsx
|   +-- stat-card.tsx
|   +-- theme-toggle.tsx
+-- lib/
|   +-- sample-data.ts
|   +-- use-theme.ts
+-- pages/
|   +-- _app.tsx
|   +-- activity.tsx
|   +-- balance.tsx
|   +-- dashboard.tsx
|   +-- forgot-password.tsx
|   +-- index.tsx
|   +-- login.tsx
|   +-- sign-in.tsx
|   +-- transfer.tsx
+-- public/
+-- styles/
|   +-- globals.css
+-- env.example
+-- eslint.config.mjs
+-- next.config.ts
+-- package.json
+-- package-lock.json
+-- tsconfig.json
```

## Penjelasan Folder

`app/` berisi file halaman utama secara datar, seperti `login.tsx`, `dashboard.tsx`, dan `forgot-password.tsx`.

`pages/` berisi route Next.js. File di folder ini hanya meneruskan export dari file halaman di folder `app/`.

`components/` berisi komponen UI yang dipakai berulang, seperti layout dashboard, kartu rekening, header halaman, kartu statistik, dan tombol theme toggle.

`lib/` berisi data/helper lokal. Untuk saat ini file `sample-data.ts` menyimpan data transaksi demo dan `use-theme.ts` menyimpan fitur dark mode.

`styles/` berisi styling global aplikasi, termasuk layout responsif, desain login, sidebar, kartu, form, dan dashboard.

`public/` berisi asset statis bawaan Next.js.

`env.example` adalah contoh konfigurasi environment. Rename file ini menjadi `.env` saat konfigurasi asli ingin digunakan.

## Persiapan Environment

Salin atau rename file contoh environment:

```bash
env.example -> .env
```

Isi default yang tersedia:

```env
NEXT_PUBLIC_APP_NAME=NovaBank Digital
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api
AUTH_SECRET=change-this-secret
AUTH_SESSION_MAX_AGE=86400
DATABASE_URL=postgresql://username:password@localhost:5432/novabank
```

Catatan:

- Jangan commit file `.env` yang berisi secret asli.
- Untuk demo UI saat ini, project tetap bisa berjalan tanpa database.
- Jika nanti memakai Supabase atau Neon, nilai `DATABASE_URL` dan konfigurasi auth bisa disesuaikan.

## Cara Menjalankan Project

Pastikan Node.js dan npm sudah terinstall.

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka aplikasi di browser:

```text
http://localhost:3000
```

Route utama:

```text
/login
/sign-in
/forgot-password
/dashboard
/balance
/transfer
/activity
```

## Script yang Tersedia

```bash
npm run dev
```

Menjalankan project dalam mode development.

```bash
npm run build
```

Membuat production build dan menjalankan type-check.

```bash
npm run start
```

Menjalankan hasil production build.

```bash
npm run lint
```

Menjalankan ESLint.

Jika `npm run lint` bermasalah di PowerShell karena execution policy, gunakan:

```bash
npm.cmd run lint
```

## Alur Penggunaan

1. Buka `/login`.
2. Masukkan username dan password demo.
3. Klik `Masuk` untuk menuju dashboard.
4. Gunakan link `Sign in` untuk membuka form pembuatan akun.
5. Gunakan link `Lupa sandi?` untuk membuka form ganti sandi.
6. Setelah masuk dashboard, informasi kartu rekening tampil di halaman dashboard.

## Rencana Pengembangan

- Integrasi database Supabase atau Neon
- Autentikasi asli untuk login, register, dan lupa sandi
- API route untuk user, rekening, transaksi, dan transfer
- Validasi form
- Role user dan admin jika dibutuhkan
- Penyimpanan transaksi secara dinamis

## Status Project

Project ini siap dijalankan sebagai frontend demo. Untuk kebutuhan production, perlu ditambahkan backend, database, autentikasi, validasi, dan handling keamanan.
