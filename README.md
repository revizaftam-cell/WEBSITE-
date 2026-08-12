# REVIZA Static Website

File di root ini adalah versi murni HTML5, CSS3, dan JavaScript ES6 dari website REVIZA.

## Struktur

```text
/
├── index.html
├── produk.html
├── pay.html
├── admin.html
├── css/styles.css
├── js/config.js
├── js/firebase.js
├── js/app.js
├── js/products.js
└── assets/favicon.svg
```

## Konfigurasi layanan

1. Buka `js/config.js`.
2. Isi Firebase Web App Config dari Firebase Console.
3. Aktifkan Google provider di Firebase Authentication.
4. Buat Firestore Database dan collection `users`.
5. Isi EmailJS Public Key, Service ID, Welcome Template ID, dan Broadcast Template ID.
6. Ganti email pada `adminEmails` dengan email developer yang diizinkan membuka `admin.html`.
7. Atur Firestore Security Rules agar hanya user login yang dapat menulis profilnya sendiri dan hanya admin yang dapat membaca daftar user.

Template EmailJS yang disarankan menerima parameter:

```text
to_email
to_name
subject
message
```

Website statis tidak dapat menyembunyikan Firebase Web Config atau EmailJS Public Key. Keamanan sebenarnya tetap harus ditegakkan melalui Firebase Security Rules dan daftar admin yang benar.

## Upload ke GitHub Pages

1. Buat repository GitHub baru.
2. Upload file dan folder statis dari root ini. Pastikan `index.html` berada langsung di root repository.
3. Buka `Settings -> Pages`, pilih `Deploy from a branch`, branch `main`, folder `/ (root)`, lalu simpan.
4. Tambahkan domain GitHub Pages Anda ke Firebase Console -> Authentication -> Settings -> Authorized domains.
5. Isi `js/config.js` sebelum commit agar login Google, Firestore, dan EmailJS aktif.

Folder pengembangan Replit seperti `artifacts/`, `lib/`, dan `scripts/` tidak perlu di-upload. Untuk GitHub Pages, gunakan `index.html`, `produk.html`, `pay.html`, `admin.html`, `css/`, `js/`, `assets/`, dan `.nojekyll`.
