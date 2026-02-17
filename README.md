# PARAS Frontend

Frontend web untuk sistem PARAS (Platform Peminjaman Ruangan dan Sarana). Aplikasi ini dibangun dengan React, TypeScript, dan Vite, serta terintegrasi dengan backend PARAS berbasis JWT authentication dan role-based authorization.

## Ringkasan

PARAS Frontend menyediakan antarmuka untuk:

- login menggunakan NRP dan password
- manajemen sesi berbasis token JWT
- pembatasan akses halaman berdasarkan role (`Admin` dan `User`)
- pengelolaan data ruangan, peminjaman, persetujuan, dan riwayat status

Integrasi utama diarahkan ke backend lokal pada `http://localhost:5238`.

## Fitur Utama

- Halaman login modern dengan validasi form
- Route guard untuk halaman privat
- Guard tambahan untuk halaman admin (`/admin`)
- Dashboard ringkasan ruangan dan peminjaman
- Daftar ruangan dan manajemen ruangan (aksi admin)
- Pencarian ketersediaan ruangan berdasarkan rentang waktu
- Pengajuan peminjaman dari hasil ketersediaan
- Daftar peminjaman, detail peminjaman, dan riwayat status
- Alur approve/reject untuk admin

## Teknologi

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form + Zod
- Tailwind CSS + Radix UI

## Prasyarat

- Node.js 18 atau lebih baru (disarankan Node.js 20 LTS)
- npm 9 atau lebih baru
- Backend PARAS aktif dan dapat diakses

## Konfigurasi Environment

Salin file contoh environment:

```powershell
Copy-Item .env.example .env
```

Atur nilai berikut di `.env`:

```env
VITE_API_BASE_URL=http://localhost:5238
```

## Instalasi dan Menjalankan Aplikasi

Install dependency:

```bash
npm install
```

Jalankan mode development:

```bash
npm run dev
```

Secara default frontend akan berjalan di:

- `http://localhost:5173`

## Script yang Tersedia

- `npm run dev` menjalankan development server
- `npm run build` menjalankan type-check lalu build produksi
- `npm run lint` menjalankan pemeriksaan ESLint
- `npm run preview` menjalankan preview hasil build

## Mekanisme Autentikasi

Frontend menggunakan endpoint backend:

- `POST /auth/login` untuk proses login
- `GET /auth/me` untuk validasi profil sesi (saat dibutuhkan)

Data sesi disimpan di local storage:

- `paras_token`
- `paras_user`

Saat logout, kedua key tersebut dihapus.

## Otorisasi dan Akses Role

Aturan akses halaman:

- pengguna yang belum login diarahkan ke `/login`
- halaman `/admin` hanya bisa diakses role `Admin`
- jika role tidak sesuai, pengguna diarahkan ke `/forbidden`

## Struktur Halaman

- `/login` halaman login
- `/` dashboard utama
- `/rooms` daftar dan manajemen ruangan
- `/availability` pencarian ketersediaan dan pengajuan peminjaman
- `/loans` daftar peminjaman
- `/loans/:id` detail peminjaman
- `/admin` panel persetujuan admin
- `/forbidden` halaman akses ditolak

## Struktur Folder Inti

```text
src/
  api/          client HTTP, tipe DTO, hooks query/mutation
  auth/         auth context dan sesi pengguna
  components/   komponen UI reusable dan guard auth
  layout/       shell dan navigasi aplikasi
  lib/          utilitas format/status/helper
  pages/        halaman fitur utama
```

## Catatan Integrasi Backend

- CORS backend harus mengizinkan origin frontend (`http://localhost:5173`).
- Pastikan konfigurasi JWT backend valid (`Issuer`, `Audience`, `Key`).
- Data akun login mengikuti data user yang ada di database backend.
- Untuk role admin/user, pengaturan role dilakukan di backend.

## Troubleshooting

Jika login gagal:

- pastikan backend aktif di URL yang sama dengan `VITE_API_BASE_URL`
- pastikan NRP dan password benar-benar ada di database backend
- cek response API `POST /auth/login` di tab Network browser

Jika request dari frontend gagal karena CORS:

- pastikan origin frontend cocok dengan policy CORS backend

Jika build gagal:

- jalankan `npm install` ulang
- jalankan `npx tsc -b` untuk melihat error TypeScript secara spesifik

## Status Pengembangan

Frontend ini aktif dikembangkan untuk sinkron dengan PARAS Backend versi terbaru, termasuk autentikasi dan otorisasi berbasis role.
