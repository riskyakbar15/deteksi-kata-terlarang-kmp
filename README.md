# Deteksi Kata Terlarang pada Chat

Aplikasi untuk mendeteksi kata-kata terlarang pada chat menggunakan **Algoritma Knuth-Morris-Pratt (KMP)**.

## 🚀 Fitur

- ✅ **Deteksi Kata Terlarang** - Menggunakan algoritma KMP dengan kompleksitas O(n+m)
- ✅ **Penyensoran Otomatis** - Otomatis menyensor kata terlarang dengan asterisk
- ✅ **Admin Panel** - Dashboard untuk mengelola kata terlarang
- ✅ **Statistik Pelanggaran** - Visualisasi data pelanggaran dengan chart
- ✅ **Autentikasi JWT** - Keamanan admin panel dengan token JWT
- ✅ **55+ Kata Terlarang** - Data seed untuk 4 kategori

## 📋 Teknologi

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy (SQLite)
- Pydantic
- python-jose (JWT)
- passlib (Password Hashing)

### Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Recharts (Charts)
- Axios

## 🛠️ Instalasi

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm atau yarn

### Backend Setup

```bash
# Masuk ke direktori backend
cd backend

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Jalankan seeding database
python -m app.seeds.seed

# Jalankan server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

## 🔑 Login Admin

Setelah seeding database:

- **Username:** `admin`
- **Password:** `admin123`

⚠️ Anda akan diminta mengganti password saat login pertama kali.

## 📖 API Documentation

Setelah backend berjalan, akses dokumentasi API di:

- [Swagger UI](http://localhost:8000/docs)
- [ReDoc](http://localhost:8000/redoc)

## 📊 Algoritma KMP

Knuth-Morris-Pratt (KMP) adalah algoritma pencarian string yang efisien:

### Kompleksitas

- **Waktu:** O(n + m) dimana n = panjang teks, m = panjang pola
- **Ruang:** O(m) untuk array LPS

### Cara Kerja

1. **Preprocessing:** Membangun array LPS (Longest Proper Prefix Suffix)
2. **Matching:** Menggunakan LPS untuk menghindari pencocokan ulang

```python
# Contoh penggunaan
from app.services.kmp_algorithm import KMPMatcher

matcher = KMPMatcher()
matches = matcher.search("ini adalah teks contoh", "contoh")
# Output: [(17, 23)]  # posisi ditemukan
```

## 📂 Struktur Proyek

```struktur-proyek
deteksi-kata-terlarang/
├── backend/
│   ├── app/
│   │   ├── main.py              # Entry point FastAPI
│   │   ├── config.py            # Konfigurasi
│   │   ├── database.py          # Database setup
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # API routes
│   │   ├── services/            # Business logic (KMP)
│   │   ├── utils/               # Utilities
│   │   └── seeds/               # Database seeding
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── lib/                 # API client
│   │   ├── store/               # Zustand store
│   │   └── types/               # TypeScript types
│   └── package.json
└── README.md
```

## 🔒 Kategori Kata Terlarang

| Kategori        | Deskripsi            | Severity |
| --------------- | -------------------- | -------- |
| `profanity`     | Kata kasar/umpatan   | 3-5      |
| `hate_speech`   | Ujaran kebencian     | 4-5      |
| `spam`          | Kata-kata spam/promo | 1-2      |
| `inappropriate` | Konten tidak pantas  | 3-5      |

## 📝 API Endpoints

### Authentication

- `POST /api/auth/login` - Login admin
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Chat

- `POST /api/chat/validate` - Validasi teks
- `POST /api/chat/send` - Kirim dan simpan pesan
- `GET /api/chat/messages` - Get message history

### Forbidden Words (Admin)

- `GET /api/admin/words` - List kata terlarang
- `POST /api/admin/words` - Tambah kata baru
- `PUT /api/admin/words/{id}` - Update kata
- `DELETE /api/admin/words/{id}` - Hapus kata

### Statistics (Admin)

- `GET /api/statistics/overview` - Statistik overview
- `GET /api/statistics/top-words` - Top kata terdeteksi
- `GET /api/statistics/timeline` - Timeline pelanggaran

## 📜 Lisensi

MIT License - Silakan gunakan untuk keperluan akademik dan pembelajaran.
