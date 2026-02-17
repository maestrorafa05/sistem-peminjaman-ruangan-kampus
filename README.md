# PARAS Frontend (React + TypeScript)

UI untuk backend PARAS.

## Prasyarat

- Node.js 18+ (disarankan 20 LTS)
- Backend berjalan di `http://localhost:5238` (sesuai request kamu)

## Setup

1) Copy env

```bash
cp .env.example .env
```

2) Install dependencies

```bash
npm install
```

> Kalau repo kamu punya `package-lock.json` lama, aman pakai `npm install` (bukan `npm ci`) supaya lockfile ikut ter-update.

3) Run dev server

```bash
npm run dev
```

Frontend default Vite akan jalan di `http://localhost:5173`.

## Catatan penting

- Backend kamu mengizinkan CORS origin: `http://localhost:5173`. Kalau kamu ganti port Vite, update CORS di backend.
- Kalau dari browser muncul error seperti **failed to fetch**:
  - Cek apakah backend meng-redirect ke **https** (karena `UseHttpsRedirection()`), dan dev certificate belum trusted.
  - Solusi cepat: matikan `UseHttpsRedirection()` untuk dev, atau jalankan backend pada https dan set `VITE_API_BASE_URL` ke https.

## Fitur UI

- Dashboard: status API + db ping + ringkasan counts.
- Rooms: list + add/edit + delete (soft-delete via `DELETE /rooms/{id}`).
- Availability: cari room available + langsung booking.
- Loans: list + filter + detail + cancel.
- Admin: approve / reject loan pending.

