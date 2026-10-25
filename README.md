# 🌟 Media Pembelajaran Interaktif Siswa SD
### Petualangan Sains Ceria: Perubahan Wujud Benda & Keajaiban Siklus Air
Aplikasi web media pembelajaran interaktif untuk siswa Sekolah Dasar (SD) dengan pengalaman belajar ala **Articulate Storyline modern**, laboratorium virtual, 3 mini games edukatif, evaluasi otomatis, serta sistem akun siswa & operator terpisah.

---

## 🌐 Akses Media Pembelajaran

### 1. Halaman Siswa (Media Belajar Interaktif):
* **Lokal:** [http://localhost:8000](http://localhost:8000)
* **GitHub Pages:** `https://<username>.github.io/<repo>/`

### 2. Halaman Operator (Panel Guru & Administrator):
* **Lokal:** [http://localhost:8000/operator.html](http://localhost:8000/operator.html)
* **GitHub Pages:** `https://<username>.github.io/<repo>/operator.html`

---

## 🚀 Cara Menjalankan Secara Lokal

### Cara 1: Menggunakan File Batch (Windows)
Cukup klik ganda (double-click) file:
```
run.bat
```

### Cara 2: Menjalankan Server Python FastAPI
```bash
python app.py
```

---

## 🔒 Keamanan & Akun Pengguna

### 1. Akun Operator (Guru):
* Kelola kurikulum, bank soal, dan akun siswa melalui portal operator.
* Kata sandi operator dikonfigurasi melalui variabel lingkungan (`OPERATOR_PASSWORD`) atau melalui form login awal administrator.
* Demi alasan keamanan, kredensial administrator tidak dicantumkan dalam dokumentasi publik.

### 2. Akun Siswa (Demo / Terdaftar):
Siswa dapat masuk menggunakan NIM, Nama, dan PIN yang didaftarkan oleh operator, atau mencoba fitur pembelajaran melalui tombol **"Mode Demo"** pada halaman utama.

---

## 🗺️ 8 Menu Pembelajaran Utama

1. **💡 Petunjuk:** Panduan visual interaktif langkah belajar dari materi hingga evaluasi.
2. **🎯 Pengujian (Pre-test):** Soal evaluasi diagnostik awal sebelum materi dipelajari.
3. **👦 Profil Siswa:** Biodata, 8 avatar kartun pilihan, rapor nilai, dan lemari lencana prestasi.
4. **📖 Materi (Storyline Slide):** Slide interaktif dengan navigasi bab, teks ramah anak, diagram warna-warni, narasi suara berbahasa Indonesia, aktivitas hotspot sentuh benda, drag-and-drop, dan checkpoint quiz.
5. **🔬 Eksperimen Virtual:** Laboratorium sains simulasi pemanasan zat cair (es batu, pemanas Bunsen, termometer digital, dan kondensasi tutup kaca pendingin) lengkap dengan jurnal catatan pengamatan siswa.
6. **🧩 Kesimpulan:** Peta konsep segitiga perubahan wujud benda dan rangkuman visual.
7. **📝 Soal (Post-test Evaluasi Akhir):** Evaluasi akhir dengan perhitungan nilai otomatis, perbandingan nilai kenaikan pre-test vs post-test, serta pembahasan jawaban lengkap.
8. **🎮 Permainan Edukasi (3 Mini Game):**
   - *Game 1:* Tebak Cepat Wujud Benda (Refleks 60 detik)
   - *Game 2:* Susun Rantai Siklus Air (Teka-teki urutan tahapan)
   - *Game 3:* Tangkap Benda Sains (Arcade seru dengan tombol layar / keyboard)

---

## 🛠️ Panel Pengelolaan Operator
- **Manajemen Akun Siswa:** Tambah siswa, edit kelas, reset PIN, buat akun massal, impor & ekspor CSV.
- **Manajemen Materi & Slide:** Susun slide Storyline, ubah tipe slide, tambahkan checkpoint quiz.
- **Bank Soal Evaluasi:** Kelola soal pilihan ganda, kunci jawaban, dan pembahasan.
- **Laporan & Analitik:** Pantau nilai Pre-test, Post-test, perolehan gain skor, progres materi, skor game, dan unduh ke format CSV.
- **Pengaturan Media:** Ganti judul media pembelajaran, nama sekolah, dan tema tampilan.
