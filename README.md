# SI-OBE (Sistem Informasi Outcome-Based Education)

Sistem Informasi untuk manajemen kurikulum berbasis *Outcome-Based Education* (OBE) dengan siklus PDCA (Plan-Do-Check-Act).

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | MySQL 8+ |

## Prasyarat

Pastikan sudah terinstall:
- **Node.js** v18+ → [Download](https://nodejs.org/)
- **MySQL** v8+ → Bisa pakai [Laragon](https://laragon.org/) (Windows), XAMPP, atau install manual
- **Git** → [Download](https://git-scm.com/)

## Cara Install & Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/Fanico-oke/SI-OBE.git
cd SI-OBE
```

### 2. Setup Database

Buka MySQL dan buat database baru:

```sql
CREATE DATABASE siobe_db;
```

### 3. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/`:

```env
DATABASE_URL="mysql://root:@localhost:3306/siobe_db"
PORT=5000
JWT_SECRET="ganti_dengan_string_acak_yang_panjang"
NODE_ENV=development
```

> **Catatan:** Sesuaikan `DATABASE_URL` dengan username/password MySQL kamu.
> - Laragon default: `mysql://root:@localhost:3306/siobe_db`
> - XAMPP default: `mysql://root:@localhost:3306/siobe_db`
> - Jika pakai password: `mysql://root:PASSWORD_KAMU@localhost:3306/siobe_db`

Generate Prisma Client & migrasi database:

```bash
npx prisma generate
npx prisma db push
```

Seed data awal (akun default):

```bash
npx ts-node prisma/seed.ts
```

Jalankan backend:

```bash
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 4. Setup Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 5. Buka Aplikasi

Buka browser → `http://localhost:5173`

## Akun Default

Setelah seed, akun yang tersedia:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Kaprodi | kaprodi | kaprodi123 |
| Dosen | dosen | dosen123 |

> Password bisa berbeda tergantung seed file. Cek `backend/prisma/seed.ts` untuk detailnya.

## Struktur Folder

```
SI-OBE/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/     # Halaman-halaman utama
│   │   ├── components/# Komponen UI
│   │   └── store/     # State management (Zustand)
│   └── package.json
├── backend/           # Express + Prisma + TypeScript
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── lib/       # Prisma client, helpers
│   │   └── index.ts   # Entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Data seeder
│   └── package.json
└── README.md
```

## Troubleshooting

**Error: Can't reach database server**
→ Pastikan MySQL sudah berjalan. Jika pakai Laragon, klik "Start All".

**Error: Port 5000 already in use**
→ Ubah `PORT` di file `.env` ke port lain (misal 5001).

**Error: EPERM atau permission denied**
→ Jalankan terminal sebagai Administrator.

**Prisma error setelah pull terbaru**
→ Jalankan ulang:
```bash
cd backend
npx prisma generate
npx prisma db push
```
