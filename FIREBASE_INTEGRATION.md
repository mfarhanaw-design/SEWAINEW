# Firebase Integration - SewaPro Rental Marketplace

## 📦 What's Been Done

Aplikasi SewaPro telah diintegrasikan dengan Firebase Firestore sebagai database. Berikut file-file yang telah dibuat/dimodifikasi:

### File Baru:
1. **`src/firebaseConfig.js`** - Konfigurasi Firebase dan inisialisasi Firestore
2. **`.env.local`** - Environment variables untuk Firebase credentials
3. **`FIREBASE_SETUP.md`** - Panduan lengkap setup Firebase

### File Termodifikasi:
1. **`src/App.jsx`** - Ditambahkan Firebase operations:
   - `useEffect` hooks untuk load data dari Firestore
   - Update `handleBooking` untuk save ke Firestore
   - Update `cancelBooking` untuk update status di Firestore
   - Update `rescheduleBooking` untuk reschedule di Firestore
   - Update `updateProduct` untuk update produk di Firestore
   - Loading state saat data diambil dari Firebase

## 🔧 Features

### Data Persistence
- ✅ Produk tersimpan di collection `products`
- ✅ Booking tersimpan di collection `bookings`
- ✅ Auto-load data dari Firebase saat app dibuka
- ✅ Real-time sync dengan Firestore

### Operations yang Terintegrasi
- ✅ Create Booking → Simpan ke `bookings` collection
- ✅ Cancel Booking → Update status di Firestore
- ✅ Reschedule Booking → Update tanggal di Firestore
- ✅ Update Product → Simpan perubahan ke Firestore
- ✅ Load Products → Ambil dari `products` collection

## 🚀 Cara Memulai

### Step 1: Setup Firebase
Ikuti panduan di `FIREBASE_SETUP.md` untuk:
1. Buat Firebase project
2. Enable Firestore Database
3. Dapatkan credentials
4. Isi di `.env.local`

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: Test Data Sync
- Buka aplikasi
- Buat booking baru
- Cek di Firebase Console → Firestore → `bookings` collection
- Data seharusnya sudah ada

## 📁 Environment Variables

File `.env.local` berisi:
```
VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx
```

**PENTING**: `.env.local` tidak di-commit ke Git (sudah di `.gitignore`)

## 🗄️ Firestore Collections

### Products Collection
```
products/
  - product_1
    - id: 1
    - name: "Sony Alpha a7 III Kit"
    - category: "Kamera"
    - price: 350000
    - image: "url"
    - minDp: 30
    - desc: "Deskripsi produk"
```

### Bookings Collection
```
bookings/
  - doc_id_auto_generated
    - productId: 1
    - productName: "Sony Alpha a7 III Kit"
    - date: "2026-02-20"
    - status: "Booked"
    - total: 350000
    - createdAt: timestamp
```

## 🔐 Security Notes

Aplikasi saat ini menggunakan **test mode** Firestore:
- ✅ Cocok untuk development
- ❌ Tidak aman untuk production

Untuk production, Anda perlu mengatur security rules di Firebase Console.

## 📝 Error Handling

Semua Firebase operations sudah include error handling:
- Try-catch untuk setiap operation
- User notification untuk error cases
- Console logging untuk debugging

## 🐛 Troubleshooting

Lihat `FIREBASE_SETUP.md` untuk troubleshooting details.

## 📚 Dependencies

- `firebase` (v9+) - Firebase SDK
- Semua library lain tetap sama

## ❓ FAQ

**Q: Bagaimana jika saya belum punya Firebase?**
A: Ikuti langkah di `FIREBASE_SETUP.md` untuk membuat project baru (gratis)

**Q: Apakah data lama akan hilang?**
A: Tidak, initial data akan auto-upload ke Firestore saat pertama kali app dijalankan

**Q: Bagaimana offline support?**
A: Bisa ditambahkan nanti dengan Firestore offline persistence

**Q: Bisa pakai database lain?**
A: Ya, cukup ubah `firebaseConfig.js` dan implements beda di `App.jsx`
