# Firebase Setup Guide untuk SewaPro

## Langkah 1: Buat Firebase Project

1. Kunjungi [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Create a new project"** atau **"Add project"**
3. Masukkan nama project: `SewaPro` (atau nama lain)
4. Pilih lokasi dan konfirmasi

## Langkah 2: Enable Firestore Database

1. Di console Firebase, pilih project Anda
2. Klik **Build** → **Firestore Database**
3. Klik **Create database**
4. Pilih **Start in test mode** (untuk development)
5. Pilih lokasi: **asia-southeast1** (recommended untuk Indonesia)
6. Klik **Create**

## Langkah 3: Dapatkan Konfigurasi Firebase

1. Di console Firebase, klik ikon **Gear** (Settings) → **Project Settings**
2. Scroll ke bawah hingga bagian **Your apps**
3. Klik **Web** icon untuk mendaftarkan web app
4. Masukkan nama app: `SewaPro Web`
5. Klik **Register app**
6. Copy konfigurasi yang ditampilkan (akan ada kode dengan apiKey, projectId, dll)

## Langkah 4: Isi Konfigurasi di .env.local

Buka file `.env.local` di folder root project dan isi dengan credentials dari Step 3:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Contoh:**
```
VITE_FIREBASE_API_KEY=AIzaSyDxX2VZ9r4pKmQ0wY1zA2bC3dE4fG5hI6j
VITE_FIREBASE_AUTH_DOMAIN=sewapro-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sewapro-12345
VITE_FIREBASE_STORAGE_BUCKET=sewapro-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Langkah 5: Restart Dev Server

1. Matikan dev server (Ctrl+C di terminal)
2. Jalankan lagi: `npm run dev`
3. Buka browser dan akses aplikasi

## Firestore Collections Structure

Aplikasi Anda akan menggunakan 2 collections:

### Collection: `products`
```
{
  id: number,
  name: string,
  category: string,
  price: number,
  image: string (URL),
  minDp: number (0-100),
  desc: string
}
```

### Collection: `bookings`
```
{
  productId: number,
  productName: string,
  date: string (YYYY-MM-DD),
  status: string ('Booked', 'Selesai', 'Dibatalkan'),
  total: number,
  createdAt: timestamp
}
```

## Testing Firestore Rules (Development Only)

Sekarang app menggunakan "test mode" yang memungkinkan semua read/write tanpa authentication. Untuk production, Anda perlu set security rules yang lebih ketat.

Untuk saat ini, Anda bisa langsung mulai menambah data melalui aplikasi, dan data akan otomatis tersimpan di Firebase.

## Troubleshooting

### "Credentials are invalid" error
- Pastikan credentials di `.env.local` sudah benar
- Pastikan tidak ada spasi tambahan atau typo

### Data tidak muncul
- Buka Firestore Console → Data
- Lihat apakah collections sudah dibuat
- Refresh halaman atau restart dev server

### CORS Error
- Ini normal di development, biar tetap berjalan
- Firebase SDK sudah handle CORS untuk browser

## Tips

- Data yang Anda input di aplikasi akan langsung tersimpan di Firestore
- Anda bisa lihat/edit data real-time di Firebase Console
- Untuk menghapus semua data, gunakan Firebase Console → Delete database (tapi akan recreate)
