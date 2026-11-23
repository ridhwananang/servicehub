import os

sub332_code = r'''
    # =========================================================================
    # 3.3.2 RANCANGAN LAYAR (INTERFACE DESIGN & WIREFRAME)
    # =========================================================================
    add_h2("3.3.2 Rancangan Layar")
    add_p(
        "Rancangan layar (user interface design) merupakan tahapan perancangan visual dalam rekayasa perangkat lunak "
        "yang bertujuan untuk menerjemahkan seluruh spesifikasi kebutuhan fungsional (UC-01 sampai dengan UC-12) "
        "dan alur komputasi perangkat lunak (Bab 3.2) ke dalam bentuk cetak biru (blueprint) tata letak antarmuka. "
        "Perancangan antarmuka pada sistem ServiceHub PT. Sharp Electronics Indonesia menerapkan metodologi "
        "Two-Tier Iterative Interface Prototyping yang terbagi ke dalam 2 (dua) tingkatan perancangan terpadu:\n"
        "1. Rancangan Kerangka Tata Letak Antarmuka (Low-Fidelity Wireframe): Sketsa struktural komponen, zonasi fungsional, "
        "hierarki tombol aksi, dan tata letak formulir berbasis Draw.io dengan skema visual kontras tinggi (dark-mode blueprint).\n"
        "2. Rancangan Prototipe Interaktif Antarmuka (High-Fidelity Rapid Prototyping): Pemodelan antarmuka interaktif "
        "menggunakan Google AI Studio App untuk memvalidasi alur operasional, keterbacaan 4 metrik KPI tiket, serta responsivitas "
        "kontrol filter pencarian sebelum sistem diimplementasikan secara penuh ke dalam kode program."
    )

    # -------------------------------------------------------------------------
    # A. LOW-FIDELITY WIREFRAME (DRAW.IO)
    # -------------------------------------------------------------------------
    add_h3("A. Rancangan Kerangka Tata Letak Antarmuka (Low-Fidelity Wireframe)")
    add_p(
        "Rancangan kerangka tata letak antarmuka (low-fidelity wireframe) memodelkan arsitektur tata letak dari 8 (delapan) antarmuka "
        "layar utama yang mencakup seluruh siklus operasional sistem, mulai dari halaman publik beranda, autentikasi masuk, "
        "monitoring dashboard tiket, pemindaian dokumen cerdas VLM, formulir pencatatan servis, manajemen akun pengguna, "
        "hingga konfigurasi profil dan keamanan akun."
    )

    # 1. LANDING PAGE
    add_p(
        "1. Rancangan Layar Beranda (Landing Page):\n"
        "Rancangan layar beranda berfungsi sebagai pintu gerbang informasi publik sistem ServiceHub Aquos Platinum Sharp "
        "sebelum pengguna melakukan autentikasi login. Antarmuka ini dirancang dengan struktur terbagi (split layout):\n"
        "• Bilah Navigasi Atas (Header): Memuat logo resmi Aquos Platinum Sharp dan tombol akses masuk ('Masuk') "
        "yang mengarahkan pengguna langsung ke antarmuka login sistem.\n"
        "• Kolom Kiri (Value Proposition & Fitur Unggulan): Memuat tajuk utama 'Platform Manajemen Pengerjaan Servis Modern: "
        "Work Order & Notifikasi Service Jadi Cepat, Rapi dan Akurat', ringkasan kapabilitas integrasi sistem (pencatatan Notif Unique, "
        "kompresi foto teknisi, manajemen cabang Pulogadung & MOI, serta ekspor XLSX), serta tombol seleksi fitur unggulan interaktif.\n"
        "• Kolom Kanan (Graphic Hero Section): Area penempatan ilustrasi grafis visual dan kartu fitur representatif yang memperkuat "
        "identitas layanan purnajual resmi Sharp Electronics Indonesia.\n"
        "• Kaki Halaman (Footer): Memuat informasi legalitas, hak cipta, dan identitas perusahaan.",
        bold_prefix="1. Rancangan Layar Beranda (Landing Page):\n"
    )
    img_landing = os.path.join(r"c:\Users\An\Herd\servicehub", "wireframe_drawio_landing.jpg")
    add_image_safe(img_landing, "Gambar 3.12 Rancangan Layar Beranda (Landing Page) Sistem ServiceHub", width_inch=5.4)

    # 2. LOGIN PAGE
    add_p(
        "2. Rancangan Layar Masuk Sistem (Halaman Login):\n"
        "Rancangan layar masuk sistem (login page) memodelkan antarmuka autentikasi tunggal (single login entry) "
        "yang digunakan oleh peran Administrator maupun Teknisi Lapangan. Karakteristik perancangan antarmuka ini meliputi:\n"
        "• Header Sederhana: Menampilkan logo Aquos Platinum dan tombol navigasi 'Kembali' menuju halaman beranda publik.\n"
        "• Kartu Masuk Terpusat (Centered Login Card): Kotak formulir terfokus yang memuat judul 'Masuk ke Platform Aquos Platinum: "
        "Akses Sistem Work Order & Notifikasi Pelaporan Teknisi'.\n"
        "• Kolom Masukan Kredensial: Kolom input 'Alamat Email' (dengan penampung email@aquosplatinum.com), kolom input 'Kata Sandi' "
        "dengan masking karakter, kotak centang persistensi sesi 'Ingat saya di perangkat ini', serta tombol aksi 'Login' yang "
        "mengirimkan permintaan autentikasi POST ke sistem backend.",
        bold_prefix="2. Rancangan Layar Masuk Sistem (Halaman Login):\n"
    )
    img_login = os.path.join(r"c:\Users\An\Herd\servicehub", "wireframe_drawio_login.jpg")
    add_image_safe(img_login, "Gambar 3.13 Rancangan Layar Masuk Sistem (Halaman Login)", width_inch=5.4)

    # 3. DASHBOARD PAGE
    add_p(
        "3. Rancangan Layar Dashboard Operasional Tiket Servis & Pengerjaan:\n"
        "Rancangan layar dashboard operasional merupakan pusat komando kerja harian (daily operational center) bagi Admin Service Center "
        "untuk memantau pergerakan servis di Mainwork Pulogadung dan Mall of Indonesia (MOI). Komponen antarmuka meliputi:\n"
        "• Baris Status Atas: Menampilkan identitas logo, penunjuk waktu real-time dalam format WIB ('Jumat, 17 Oktober 2026 | 20.00.00 WIB'), "
        "tombol navigasi cepat 'Kelola User', serta dropdown profil Admin aktif ('Ridwan Admin').\n"
        "• 4 Kartu Ringkasan KPI Operasional: Disusun sejajar pada grid atas guna menyajikan metrik kuantitatif secara instan:\n"
        "  a. Kartu Total Notif: Menampilkan total volume tiket unik (misal: 13 tiket) dan status kelengkapan foto dokumentasi.\n"
        "  b. Kartu Berbayar: Menampilkan jumlah tiket servis reguler berbayar (misal: 11 tiket, 85% dari total pengerjaan).\n"
        "  c. Kartu Tidak Berbayar: Menampilkan jumlah unit dalam masa garansi resmi Sharp (misal: 2 tiket, garansi 15%).\n"
        "  d. Kartu Center: Menampilkan rincian distribusi tiket per cabang servis (Pulogadung: 7, MOI: 4, Lain-lain: 2).\n"
        "• Bilah Kontrol dan Filter Multikriteria: Menyediakan alat bantu operasional terpadu yang memuat bilah pencarian (Search), "
        "filter dropdown Bulan, Status pembayaran, Center, status Pengerjaan, sakelar mode tampilan (Tabel | Kartu), "
        "tombol ekspor data 'Download', serta tombol '+ Tambah' untuk memicu pembuatan tiket baru.\n"
        "• Tabel Data Servis Komprehensif (12 Kolom): Menyajikan katalog tiket secara tabular dengan atribut: Notifikasi, Nama, No Hp, "
        "Alamat, Model Unit, No Seri, Status, Jenis Pengerjaan, Center, Deadline, Dokumentasi, dan Aksi.\n"
        "• Kontrol Paginasi Bernomor: Tombol navigasi Back, tombol halaman aktif (indikator lingkaran merah), nomor halaman berikutnya, dan Next.",
        bold_prefix="3. Rancangan Layar Dashboard Operasional Tiket Servis & Pengerjaan:\n"
    )
    img_dash = os.path.join(r"c:\Users\An\Herd\servicehub", "wireframe_drawio_dashboard.jpg")
    add_image_safe(img_dash, "Gambar 3.14 Rancangan Layar Dashboard Operasional Tiket Servis & Pengerjaan", width_inch=5.4)

    # 4. MODAL SCANNER VLM
    add_p(
        "4. Rancangan Layar Modal Pemindaian Dokumen SPK Berbasis AI Vision:\n"
        "Rancangan layar modal pemindaian dokumen merupakan dialog pop-up interaktif yang mengimplementasikan otomatisasi "
        "ekstraksi data berbasis Vision-Language Model. Elemen antarmuka dirancang untuk memandu Admin:\n"
        "• Judul Dialog: 'Scan Dokumen: Foto lembar dokumen pengerjaan fisik atau unggah gambar untuk mengisi data formulir secara otomatis'.\n"
        "• Panel Konfigurasi Mesin AI Vision: Menjelaskan kemampuan ekstraksi multimodal 'Ekstraksi AI cerdas super cepat via Groq "
        "(otomatis cadangkan ke Tesseract jika offline)' dengan tombol sakelar mode pemroses ('AI Scanner' dan 'OCR').\n"
        "• Tombol Aksi Akuisisi Citra: Dua kartu interaksi utama berukuran besar:\n"
        "  a. 'Ambil Foto dengan Kamera': Memicu pengaktifan sensor kamera perangkat untuk menangkap lembar fisik secara langsung.\n"
        "  b. 'Pilih dari Galeri': Membuka penjelajah berkas lokal untuk mengunggah berkas citra berformat JPEG atau PNG.\n"
        "• Kartu Panduan Kualitas Citra: Memberikan instruksi visual 'Tips Hasil Scan Maksimal' agar Admin memastikan pencahayaan memadai, "
        "teks tidak buram, dan seluruh nomor notifikasi, nama konsumen, model unit, serta nomor seri terbaca utuh di dalam bingkai.",
        bold_prefix="4. Rancangan Layar Modal Pemindaian Dokumen SPK Berbasis AI Vision:\n"
    )
    img_scan = os.path.join(r"c:\Users\An\Herd\servicehub", "wireframe_drawio_modal_scan.jpg")
    add_image_safe(img_scan, "Gambar 3.15 Rancangan Layar Modal Pemindaian Dokumen SPK Berbasis AI Vision", width_inch=5.2)

    # 5. MODAL INPUT TIKET
    add_p(
        "5. Rancangan Layar Modal Formulir Entri Tiket Servis:\n"
        "Rancangan layar modal input tiket memodelkan struktur formulir penulisan data tiket servis secara menyeluruh. "
        "Formulir ini dapat terisi otomatis oleh hasil ekstraksi AI VLM atau diisi manual oleh staf Admin, yang terbagi ke dalam 7 bagian terstruktur:\n"
        "• Banner Akselerasi Pindai: Bilah 'Scan / Foto Dokumen' dengan tombol 'Scan' di bagian atas untuk memicu modal kamera AI sewaktu-waktu.\n"
        "• Seksi 1 (Data Tiket & Jadwal Pengerjaan): Kolom Nomor Notif, penyeleksi dropdown Mainwork Center (Pulogadung/MOI), "
        "Deadline Tanggal, serta jam operasional teknisi (Jam Mulai dan Jam Selesai).\n"
        "• Seksi 2 (Data Pelanggan & Lokasi): Bidang input Nama Pelanggan, Nomor Telepon, dan area teks Alamat lengkap domisili servis.\n"
        "• Seksi 3 (Unit / Perangkat): Kolom Model Unit Sharp (misal: AH-XP10UHY) dan Nomor Seri mesin (Serial Number).\n"
        "• Seksi 4 (Status Pengerjaan & Biaya): Tombol radio pilihan status pengerjaan ('Belum Selesai' / 'Selesai') "
        "serta status biaya/garansi ('Berbayar' / 'Tidak Berbayar').\n"
        "• Seksi 5 (Jenis Pengerjaan): Kotak dropdown penyeleksi tindakan teknis (multi-selection) seperti Reparasi Modul, Penggantian Kompresor, "
        "Perbaikan Panel, atau Pengisian Refrigeran.\n"
        "• Seksi 6 (Dokumentasi Foto): Dua kontainer pratinjau foto untuk 'Kunjungan Awal' dan 'Kunjungan Akhir', masing-masing dilengkapi tombol "
        "'Ambil Foto' dan 'Pilih Galeri' yang langsung terhubung ke modul kompresi citra klien.\n"
        "• Seksi 7 (Catatan Kerusakan & Perbaikan): Area teks luas untuk deskripsi gejala kerusakan dan rincian tindakan reparasi teknisi.\n"
        "• Tombol Aksi Akhir: Tombol 'Cancel' untuk membatalkan dan tombol 'Tambah' untuk menyimpan tiket ke basis data PostgreSQL.",
        bold_prefix="5. Rancangan Layar Modal Formulir Entri Tiket Servis:\n"
    )
    img_tiket = os.path.join(r"c:\Users\An\Herd\servicehub", "wireframe_drawio_modal_input_tiket.jpg")
    add_image_safe(img_tiket, "Gambar 3.16 Rancangan Layar Modal Formulir Entri Tiket Servis", width_inch=3.8)

    # 6. USER MANAGEMENT
    add_p(
        "6. Rancangan Layar Manajemen Pengguna (User Management):\n"
        "Rancangan layar manajemen pengguna memodelkan antarmuka pengelolaan hak akses administratif bagi seluruh personel "
        "yang beroperasi di ServiceHub. Komponen antarmuka terdiri atas:\n"
        "• Tajuk Halaman: 'User Management: Kelola akun teknisi lapangan dan administrator sistem Aquos Platinum'.\n"
        "• 3 Kartu Ringkasan Akun: Menyajikan statistik akun terdaftar: Total Pengguna (3), Teknisi (2), dan Admin (1).\n"
        "• Bilah Kontrol dan Pencarian: Kolom pencarian teks instan 'Pencarian', filter status 'Semua (3)', serta tombol aksi 'Tambah User'.\n"
        "• Tabel Katalog Akun: Menampilkan daftar personel dalam 5 kolom data terstruktur: Pengguna (Nama Lengkap), Alamat Email, "
        "Peran sistem (Admin / Teknisi), Tanggal Terdaftar, serta kolom Aksi yang memuat tombol manipulasi 'Edit' dan 'Delete'.",
        bold_prefix="6. Rancangan Layar Manajemen Pengguna (User Management):\n"
    )
    img_user = os.path.join(r"c:\Users\An\Herd\servicehub", "wireframe_drawio_user_management.jpg")
    add_image_safe(img_user, "Gambar 3.17 Rancangan Layar Manajemen Pengguna (User Management)", width_inch=5.4)

    # 7. MODAL TAMBAH USER
    add_p(
        "7. Rancangan Layar Modal Tambah Pengguna Baru:\n"
        "Rancangan layar modal tambah pengguna memodelkan kotak dialog formulir pendaftaran akun teknisi atau admin baru:\n"
        "• Header Dialog: 'Tambah Pengguna Baru: Tambahkan akun teknisi atau admin baru untuk mengakses sistem' disertai tombol tutup (X).\n"
        "• Area Foto Profil: Wadah lingkaran unggah avatar profil ('Format JPG, PNG, atau WEBP - Maksimal 2MB') dengan tombol 'Pilih Foto'.\n"
        "• Kolom Biodata Akun: Kolom input 'Nama Lengkap' dan 'Alamat Email' resmi pengguna.\n"
        "• Penyeleksi Peran (Role Selector): Dua tombol seleksi eksklusif berukuran besar yang membedakan hak akses: 'TEKNISI' atau 'ADMIN'.\n"
        "• Kolom Kredensial Keamanan: Kolom masukan 'Kata Sandi' dan 'Konfirmasi Kata Sandi' untuk verifikasi integritas otentikasi.\n"
        "• Tombol Aksi: Tombol 'Batal' untuk menutup dialog dan tombol 'Simpan' untuk mengeksekusi pendaftaran pengguna ke tabel users basis data.",
        bold_prefix="7. Rancangan Layar Modal Tambah Pengguna Baru:\n"
    )
    img_add_user = os.path.join(r"c:\Users\An\Herd\servicehub", "wireframe_drawio_modal_tambah_user.jpg")
    add_image_safe(img_add_user, "Gambar 3.18 Rancangan Layar Modal Tambah Pengguna Baru", width_inch=4.0)

    # 8. PROFILE PAGE
    add_p(
        "8. Rancangan Layar Pengaturan Profil dan Keamanan Akun (Profile Page):\n"
        "Rancangan layar profil pengguna memodelkan antarmuka personalisasi dan manajemen keamanan akun pengguna yang sedang login:\n"
        "• Seksi Avatar Profil: Lingkaran foto profil pengguna dengan 3 kontrol manipulasi citra: 'Ganti Foto', 'Lihat', dan 'Hapus'.\n"
        "• Seksi Informasi Akun & Kontak: Kolom penyesuaian Nama Lengkap dan Alamat Email yang divalidasi dengan tombol aksi 'SIMPAN'.\n"
        "• Penegasan Hak Akses: Banner deklarasi hak otoritas sistem 'Hak Akses Sistem: Administrator - Anda memiliki hak akses penuh administrator "
        "untuk mengelola seluruh tiket servis, jadwal teknisi, data pelanggan, serta manajemen akun staf'.\n"
        "• Seksi Keamanan & Kata Sandi: Panel pengaturan pembaruan kata sandi akun dan opsi aktivasi otentikasi dua faktor (Two-Factor Authentication / 2FA) "
        "berbasis protokol TOTP (Time-based One-Time Password) untuk proteksi akun tingkat tinggi.\n"
        "• Seksi Pembatalan Akun (Account Deletion): Area pengamanan kritis bertanda peringatan 'Delete your account and all of its resources: "
        "Warning Please proceed with caution, this cannot be undone' disertai tombol aksi khusus 'Delete Account'.",
        bold_prefix="8. Rancangan Layar Pengaturan Profil dan Keamanan Akun (Profile Page):\n"
    )
    img_prof = os.path.join(r"c:\Users\An\Herd\servicehub", "wireframe_drawio_profile.jpg")
    add_image_safe(img_prof, "Gambar 3.19 Rancangan Layar Pengaturan Profil dan Keamanan Akun", width_inch=4.2)

    # -------------------------------------------------------------------------
    # B. HIGH-FIDELITY RAPID PROTOTYPING (GOOGLE AI STUDIO)
    # -------------------------------------------------------------------------
    add_h3("B. Rancangan Prototipe Interaktif Antarmuka (High-Fidelity Rapid Prototyping)")
    add_p(
        "Sebagai bagian dari penerapan metodologi rekayasa perangkat lunak modern, perancangan antarmuka sistem ServiceHub "
        "tidak berhenti pada sketsa struktural hitam-putih semata. Sebelum melangkah ke tahap pengkodean penuh (coding phase) "
        "menggunakan tumpukan teknologi Laravel, React, TypeScript, dan Tailwind CSS, tim pengembang membangun dan mengevaluasi "
        "sebuah prototipe antarmuka interaktif tingkat tinggi (High-Fidelity Interactive Prototype) menggunakan platform Google AI Studio App. "
        "Pendekatan Rapid Prototyping ini memberikan sejumlah manfaat desain dan teknis yang sangat fundamental:\n"
        "1. Validasi Kepadatan dan Hierarki Informasi (Information Density Validation): Meninjau kesesuaian proporsi visual tata letak "
        "antara 4 kartu KPI operasional di bagian atas dengan tabel transaksi tiket di bagian bawah, memastikan tidak terjadi penumpukan visual "
        "yang dapat membingungkan staf Admin saat melayani konsumen.\n"
        "2. Simulasi Alur Kerja Operasional Pengguna (User Workflow Simulation): Memvalidasi kemudahan interaksi Admin (Siti Rahmawati) "
        "dalam melakukan pencarian instan pada bilah query (Query Notifikasi Unique, Nama, No Seri, Telepon), penyaringan status multi-kriteria "
        "(Status Pembayaran, Mainwork Center, dan Pengerjaan), hingga akses cepat ekspor rekapitulasi data Excel via tombol 'Download (XLSX)'.\n"
        "3. Standar Acuan Desain Kode Frontend (Design Ground Truth): Prototipe interaktif ini berfungsi sebagai cetak biru visual hidup "
        "yang dijadikan acuan langsung oleh pengembang dalam menyusun komponen modular React 19, skema warna Sharp (merah aksen, biru status, dan netral slate), "
        "serta integrasi antarmuka dengan basis data PostgreSQL pada tahap implementasi perangkat lunak.",
        bold_prefix="1. Konsep dan Rasionalitas Pemodelan Prototipe Interaktif:\n"
    )
    img_proto = os.path.join(r"c:\Users\An\Herd\servicehub", "prototype_aistudio_dashboard.png")
    add_image_safe(img_proto, "Gambar 3.20 Prototipe Interaktif Dashboard Tiket Servis dan Notifikasi (Google AI Studio App)", width_inch=5.5)

    add_p(
        "Hasil pengujian dan evaluasi kegunaan (usability evaluation) terhadap prototipe interaktif pada Gambar 3.20 membuktikan "
        "bahwa pemodelan tata letak telah memenuhi standar ergonomi perangkat lunak perkantoran: informasi kunci tiket dapat diakses "
        "dalam waktu kurang dari 3 kali klik (three-click rule), metrik rasio performa servis terbaca jelas, dan seluruh elemen formulir "
        "siap dihubungkan dengan modul komputasi backend ServiceHub.",
        bold_prefix="2. Hasil Evaluasi Prototipe Interaktif:\n"
    )
'''

with open("create_bab3_doc.py", "r", encoding="utf-8") as f:
    text = f.read()

marker = '        bold_prefix="5. Analisis Dampak Efisiensi Kompresi Citra Lapangan:\\n"\n    )\n'

if marker in text:
    new_text = text.replace(marker, marker + sub332_code)
    with open("create_bab3_doc.py", "w", encoding="utf-8") as f:
        f.write(new_text)
    print("Inserted Sub-bab 3.3.2 Rancangan Layar successfully into create_bab3_doc.py!")
else:
    print("Error: Marker not found!")
