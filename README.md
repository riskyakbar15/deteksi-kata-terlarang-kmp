# Deteksi Kata Terlarang

Aplikasi web untuk mendeteksi kata terlarang pada pesan chat menggunakan **algoritma Knuth-Morris-Pratt (KMP)**. Proyek ini terdiri dari backend FastAPI dan frontend Next.js App Router untuk validasi pesan, penyimpanan chat, manajemen daftar kata terlarang, serta dashboard statistik.

## GitHub

- Repository: [riskyakbar15/Deteksi-Kata-Terlarang](https://github.com/riskyakbar15/Deteksi-Kata-Terlarang)

## Gambaran Umum

Sistem ini dirancang untuk membantu moderasi percakapan secara cepat dan terstruktur. Pengguna dapat memvalidasi pesan sebelum dikirim, sementara admin dapat mengelola kata terlarang, melihat riwayat pelanggaran, dan memantau statistik penggunaan.

## Fitur Utama

- Deteksi kata terlarang menggunakan algoritma KMP dengan kompleksitas waktu $O(n+m)$.
- Penyensoran otomatis kata yang terdeteksi.
- Validasi pesan sebelum dikirim.
- Penyimpanan pesan chat beserta log pelanggaran.
- Panel admin untuk mengelola kata terlarang.
- Statistik pelanggaran dan visualisasi data.
- Autentikasi JWT untuk akses admin.
- Data seed bawaan berisi 55 kata terlarang dalam 4 kategori.

## Teknologi

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy
- Pydantic dan Pydantic Settings
- SQLite (default)
- python-jose untuk JWT
- passlib untuk hashing password

### Frontend

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Zustand
- Recharts
- Axios

## Struktur Proyek

```text
deteksi-kata-terlarang/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── seeds/
│   │   └── utils/
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── change-password/
│   │   └── admin/
│   ├── lib/
│   ├── store/
│   ├── types/
│   ├── globals.css
│   └── package.json
└── README.md
```

Catatan: frontend menggunakan struktur root App Router, jadi folder `src/` tidak digunakan lagi.

## Persyaratan

- Python 3.11 atau lebih baru
- Node.js 18 atau lebih baru
- npm

## Konfigurasi Environment

Backend membaca konfigurasi dari file `.env` di folder `backend/`.

Contoh variabel yang digunakan:

- `DATABASE_URL` - koneksi database, default: `sqlite:///./forbidden_words.db`
- `SECRET_KEY` - kunci JWT
- `ALGORITHM` - algoritma JWT, default: `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` - masa berlaku token
- `CORS_ORIGINS` - daftar origin frontend yang diizinkan

## Instalasi dan Menjalankan Aplikasi

### 1. Backend

```bash
cd backend
python -m venv venv
```

Aktifkan virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Install dependensi dan jalankan seed database:

```bash
pip install -r requirements.txt
python -m app.seeds.seed
```

Jalankan server backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Akses Aplikasi

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Login Admin Default

Setelah seed dijalankan, gunakan akun berikut:

- Username: `admin`
- Password: `admin123`

Saat login pertama kali, sistem akan meminta penggantian password.

## Fitur Backend

### Autentikasi

- `POST /api/auth/login` - login admin
- `GET /api/auth/me` - informasi pengguna aktif
- `PUT /api/auth/change-password` - ubah password

### Chat

- `POST /api/chat/validate` - validasi pesan tanpa menyimpan
- `POST /api/chat/send` - kirim dan simpan pesan
- `GET /api/chat/messages` - riwayat pesan chat

### Admin Kata Terlarang

- `GET /api/admin/words` - daftar kata terlarang
- `GET /api/admin/words/all` - daftar aktif untuk deteksi
- `POST /api/admin/words` - tambah kata baru
- `PUT /api/admin/words/{id}` - ubah kata
- `DELETE /api/admin/words/{id}` - hapus kata

### Statistik

- `GET /api/statistics/overview` - ringkasan statistik
- `GET /api/statistics/top-words` - kata yang paling sering terdeteksi
- `GET /api/statistics/timeline` - timeline pelanggaran

## Kategori Kata Terlarang

| Kategori        | Deskripsi               | Severity umum |
| --------------- | ----------------------- | ------------- |
| `profanity`     | Kata kasar atau umpatan | 3-5           |
| `hate_speech`   | Ujaran kebencian        | 4-5           |
| `spam`          | Kata promosi atau spam  | 1-2           |
| `inappropriate` | Konten tidak pantas     | 3-5           |

## Algoritma KMP

KMP adalah algoritma pencarian string yang efisien untuk mendeteksi pola di dalam teks tanpa melakukan pencocokan ulang yang tidak perlu.

### Karakteristik

- Kompleksitas waktu: $O(n+m)$
- Kompleksitas ruang: $O(m)$ untuk array LPS

### Alur Kerja

1. Preprocessing pola untuk membangun array LPS.
2. Pencocokan teks menggunakan informasi dari LPS.
3. Deteksi semua kemunculan pola secara efisien.

## Catatan Pengembangan

- Backend menggunakan SQLite secara default agar mudah dijalankan secara lokal.
- Frontend menggunakan App Router dan menyimpan code bersama di root `frontend/app`, `frontend/lib`, `frontend/store`, dan `frontend/types`.
- Jika Anda mengubah konfigurasi backend, pastikan `CORS_ORIGINS` sesuai dengan URL frontend yang digunakan.

## Lisensi

MIT License. Proyek ini dapat digunakan untuk pembelajaran, demonstrasi, dan pengembangan internal.
