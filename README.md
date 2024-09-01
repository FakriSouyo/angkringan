# Angkringan Mas Pithik

Angkringan Mas Pithik adalah aplikasi web untuk manajemen dan pemesanan makanan online dari warung angkringan. Aplikasi ini dibangun menggunakan React dan Vite, dengan backend yang didukung oleh Supabase.

## Fitur Utama

- Antarmuka pengguna yang responsif untuk desktop dan mobile
- Sistem autentikasi pengguna (login/signup)
- Manajemen menu makanan
- Keranjang belanja
- Sistem pemesanan
- Dashboard admin untuk manajemen pesanan dan menu
- Riwayat transaksi pengguna

## Teknologi yang Digunakan

- React
- Vite
- Tailwind CSS
- Framer Motion
- Supabase
- React Router
- React Icons

## Instalasi dan Pengaturan

Untuk menjalankan proyek ini di mesin lokal Anda, ikuti langkah-langkah berikut:

1. Clone repositori ini:
   ```
   git clone https://github.com/FakriSouyo/angkringan.git
   ```

2. Masuk ke direktori proyek:
   ```
   cd angkringan
   ```

3. Instal dependensi:
   ```
   npm install
   ```

4. Salin file `.env.example` menjadi `.env` dan isi dengan kredensial Supabase Anda:
   ```
   cp .env.example .env
   ```
   Kemudian edit file `.env` dan tambahkan URL dan kunci anonim Supabase Anda:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Jalankan aplikasi dalam mode pengembangan:
   ```
   npm run dev
   ```

Aplikasi sekarang akan berjalan di `http://localhost:5173`.

## Struktur Proyek

- `src/components`: Berisi semua komponen React
- `src/services`: Berisi konfigurasi Supabase
- `src/assets`: Berisi aset statis seperti gambar
- `src/App.jsx`: Komponen utama aplikasi
- `src/main.jsx`: Titik masuk aplikasi

## Kontribusi

Kontribusi untuk proyek ini sangat diterima. Jika Anda ingin berkontribusi, silakan buat pull request atau buka issue untuk diskusi fitur baru atau perbaikan bug.


## Kontak

Jika Anda memiliki pertanyaan atau masukan, jangan ragu untuk menghubungi kami melalui issues di repositori GitHub ini.
