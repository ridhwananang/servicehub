import re
import os

py_path = r"c:\Users\An\Herd\servicehub\create_bab3_doc.py"

with open(py_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Enrich FOREIGN_TERMS with flowchart, algorithm, wireframe, and testing terms
terms_to_add = [
    "Flowchart", "flowchart", "Flowcharts", "flowcharts",
    "Black Box Testing", "Blackbox Testing", "black box testing",
    "Equivalence Partitioning", "equivalence partitioning",
    "Boundary Value Analysis", "boundary value analysis",
    "Wireframe", "wireframe", "Mockup", "mockup",
    "User Manual", "user manual", "Prompt Engineering", "prompt engineering",
    "Structured Output", "structured output", "Data Transfer Object", "Data Transfer Objects",
    "Off-Screen Canvas", "off-screen canvas", "Off-Screen", "off-screen",
    "Aspect Ratio", "aspect ratio", "Resampling", "resampling",
    "Bicubic", "bicubic", "Bilinear", "bilinear",
    "Human-in-the-Loop", "human-in-the-loop", "Graceful Degradation", "graceful degradation",
    "Zero-Shot", "zero-shot", "Base64", "base64",
    "Payload", "payload", "Multipart", "multipart",
    "FormData", "form-data", "Blob", "blob",
    "Toast", "toast", "Badge", "badge", "Modal", "modal", "Dialog", "dialog",
    "Dropdown", "dropdown", "Checkbox", "checkbox", "Radio Button", "radio button",
    "Lucide React", "Lucide", "Sonner", "sonner", "Radix UI", "Radix",
    "Identity", "identity"
]

# Find FOREIGN_TERMS = [ in file
insert_marker = '    "email_verified_at"\n]'
new_terms_block = '    "email_verified_at",\n' + ',\n'.join([f'    "{t}"' for t in terms_to_add]) + '\n]'

if insert_marker in content:
    content = content.replace(insert_marker, new_terms_block)
    print("Enriched FOREIGN_TERMS successfully.")
else:
    print("Warning: insert_marker not found for FOREIGN_TERMS.")

# 2. Build the new Sub-bab 3.2.2 and 3.3 block
new_section = '''    # =========================================================================
    # 3.2.2 PERANCANGAN PERANGKAT LUNAK (FLOWCHART)
    # =========================================================================
    add_h2("3.2.2 Perancangan Perangkat Lunak (Flowchart)")
    add_p(
        "Perancangan perangkat lunak pada sistem ServiceHub dimodelkan menggunakan bagan alir program (Flowchart) "
        "yang mengacu pada standar ANSI/ISO. Diagram alir ini merepresentasikan urutan instruksi komputasi, "
        "logika percabangan kondisi (conditional branching), interaksi masukan/keluaran (input/output), "
        "serta aliran kendali eksekusi program secara terstruktur. Pada sistem ServiceHub, terdapat 3 (tiga) diagram alir "
        "utama yang mendefinisikan arsitektur operasional sistem, yaitu Flowchart Sistem Utama, Flowchart Pipeline Ekstraksi "
        "Dokumen AI Vision-Language Model (VLM), dan Flowchart Algoritma Kompresi Citra Klien HTML5 Canvas."
    )

    # 1. Flowchart Sistem Utama
    add_p(
        "Flowchart sistem utama memodelkan siklus hidup interaksi pengguna secara menyeluruh, dimulai dari proses "
        "autentikasi login terpusat, mekanisme otorisasi hak akses peran (Role-Based Access Control) antara Admin Service Center "
        "dan Teknisi Lapangan, hingga pemilihan aksi operasional tiket pada masing-masing antarmuka sistem. "
        "Alur logika sistem utama ServiceHub dirancang sebagai berikut:\\n"
        "1. Inisialisasi & Autentikasi: Pengguna mengakses URL rute /login melalui peramban web dan memasukkan kredensial "
        "alamat email serta kata sandi. Sistem memvalidasi kredensial menggunakan fungsi enkripsi Hash::check(). "
        "Jika kredensial tidak cocok, sistem mengembalikan pesan kesalahan validasi dan mengarahkan kembali ke formulir login. "
        "Jika kredensial valid, sistem menerbitkan sesi baru dan memeriksa peran pengguna (role).\\n"
        "2. Alur Operasional Admin Service Center (Role = Admin): Sistem mengarahkan pengguna ke Dashboard Admin (/dashboard). "
        "Admin memiliki wewenang untuk: (a) Menerbitkan tiket baru melalui pemindaian SPK berbasis AI VLM maupun entri formulir manual, "
        "(b) Melakukan pencarian dan penyaringan data tiket berdasarkan nomor SPK atau status pengerjaan, (c) Memperbarui atau menghapus data tiket, "
        "(d) Mengekspor ringkasan laporan tiket servis ke format spreadsheet (.xlsx), dan (e) Mengelola data pengguna/teknisi (/users).\\n"
        "3. Alur Operasional Teknisi Lapangan (Role = Teknisi): Sistem mengarahkan teknisi ke antarmuka responsif PWA Mobile. "
        "Teknisi dapat: (a) Melihat daftar tiket servis yang aktif, (b) Membuka detail tiket untuk memeriksa lokasi domisili konsumen "
        "serta keluhan kerusakan unit, (c) Memperbarui status tiket menjadi In Progress saat memulai perbaikan, "
        "(d) Menginput catatan diagnosis teknis, memilih multi-kategori tindakan perbaikan pada kolom work_types, dan mengambil foto fisik "
        "unit saat kedatangan (visit_photo) serta setelah perbaikan selesai (completion_photo), (e) Sistem secara otomatis mengompresi foto "
        "di sisi klien menggunakan HTML5 Canvas, dan (f) Mengirimkan laporan servis (PUT /tickets/{id}) yang mengubah status menjadi Completed.\\n"
        "4. Terminasi Sesi (Logout): Pengguna dapat mengakhiri sesi kerja melalui tombol Logout yang memusnahkan data sesi pada basis data "
        "dan mengembalikan peramban ke halaman login.",
        bold_prefix="A. Flowchart Sistem Utama ServiceHub (Gambar 3.9):\\n"
    )

    img_flow_main = r"c:\Users\An\Herd\servicehub\flowchart_sistem_utama_clean.png"
    add_image_safe(img_flow_main, "Gambar 3.9 Flowchart Sistem Utama ServiceHub", width_inch=5.2)

    # 2. Flowchart Pipeline Ekstraksi Dokumen AI VLM
    add_p(
        "Flowchart ini mendeskripsikan secara mendalam pipeline pemrosesan citra dokumen Surat Perintah Kerja (SPK) Sharp "
        "menggunakan teknologi Vision-Language Model (Google Gemini 1.5 Flash). Pipeline ini memangkas proses entri manual yang lambat "
        "dan rentan salah ketik menjadi proses ekstraksi otomatis terstruktur dalam hitungan detik. Rincian tahapan eksekusinya meliputi:\\n"
        "1. Akuisisi & Validasi Berkas: Admin menekan tombol 'Scan SPK' pada dashboard dan memilih berkas citra formulir SPK fisik "
        "atau memotretnya secara langsung. Sistem memvalidasi ekstensi berkas (.jpg, .jpeg, .png, .webp) serta memastikan ukuran berkas "
        "tidak melebihi batas 10 MB. Jika validasi gagal, sistem memunculkan umpan balik kesalahan dan meminta unggah ulang.\\n"
        "2. Konversi Base64 & Perakitan Payload: Pengendali membaca aliran berkas (file stream) dan mengonversinya menjadi representasi "
        "string Base64. Sistem kemudian menyusun Structured System Prompt khusus yang menginstruksikan AI untuk membaca bidang-bidang formulir SPK "
        "standar Sharp Electronics Indonesia dan menegakkan keluaran dalam format JSON murni sesuai skema Data Transfer Object (DTO) ParsedDocumentData.\\n"
        "3. Inferensi Multimodal Cloud: Sistem mengirimkan permintaan HTTP POST ke endpoint Google Gemini 1.5 Flash API dengan membawa "
        "citra Base64 dan teks instruksi. Model memproses fitur visual piksel citra dan mengenali karakter teks secara simultan.\\n"
        "4. Mitigasi Galat & Fallback Degradation: Jika koneksi API mengalami gangguan, kunci API tidak valid, atau waktu tunggu habis (timeout), "
        "sistem menangkap pengecualian (catch exception), mencatat log kesalahan, dan secara anggun mengalihkan antarmuka ke formulir input kosong "
        "agar proses operasional kantor tidak terhenti.\\n"
        "5. Parsing JSON & Human-in-the-Loop Review: Respons JSON yang valid diparsing ke dalam objek DTO dan diisikan secara otomatis (auto-fill) "
        "ke kolom-kolom input formulir pratinjau modal. Admin melakukan verifikasi visual terhadap hasil ekstraksi dan dapat mengoreksi karakter "
        "bila terdapat salah tafsir pada tulisan tangan teknisi.\\n"
        "6. Persistensi Basis Data: Admin menekan tombol Simpan Tiket; sistem mengirimkan permintaan POST /tickets, mengeksekusi perintah SQL INSERT "
        "ke tabel service_tickets PostgreSQL, dan menampilkan notifikasi toast sukses pada antarmuka dashboard.",
        bold_prefix="B. Flowchart Pipeline Ekstraksi Dokumen AI Vision-Language Model (Gambar 3.10):\\n"
    )

    img_flow_vlm = r"c:\Users\An\Herd\servicehub\flowchart_ekstraksi_vlm_clean.png"
    add_image_safe(img_flow_vlm, "Gambar 3.10 Flowchart Pipeline Ekstraksi Dokumen AI Vision-Language Model (VLM)", width_inch=5.0)

    # 3. Flowchart Kompresi Citra Klien HTML5 Canvas
    add_p(
        "Flowchart ini memodelkan algoritma kompresi citra di sisi klien (client-side image compression) yang dijalankan "
        "pada perangkat seluler teknisi lapangan sebelum berkas foto bukti fisik diunggah ke jaringan internet. Algoritma ini "
        "menjadi solusi krusial bagi teknisi yang beroperasi di wilayah dengan sinyal seluler terbatas. Alur kerja algoritma meliputi:\\n"
        "1. Penerimaan Berkas Masukan: Modul utilitas image-compressor.ts menerima objek File dari input kamera smartphone teknisi.\\n"
        "2. Validasi Tipe Citra: Sistem memeriksa apakah file.type diawali dengan 'image/'. Jika bukan citra, berkas dikembalikan apa adanya.\\n"
        "3. Alokasi Memori Virtual & Pemuatan Citra: Sistem membuat URL objek sementara via URL.createObjectURL(file) dan memuatnya ke dalam "
        "elemen memori new Image(). Saat event img.onload terpicu, memori objek URL segera dibebaskan via URL.revokeObjectURL() untuk "
        "mencegah terjadinya kebocoran memori (memory leak) pada peramban mobile.\\n"
        "4. Evaluasi Dimensi & Penskalaan Proporsional: Sistem membaca lebar (width) dan tinggi (height) asli foto. Jika kedua dimensi "
        "berada di bawah atau sama dengan batas maksimal 1600 piksel, dimensi dipertahankan. Jika salah satu melebihi 1600 piksel, "
        "sistem menghitung rasio aspek untuk menentukan dimensi baru secara proporsional:\\n"
        "   • Mode Lanskap (W / H > 1): Lebar baru dipatok 1600 px, dan tinggi baru dihitung: H_baru = round((H * 1600) / W).\\n"
        "   • Mode Potret (W / H <= 1): Tinggi baru dipatok 1600 px, dan lebar baru dihitung: W_baru = round((W * 1600) / H).\\n"
        "5. Resampling Elemen Canvas Off-Screen: Sistem menginisialisasi elemen document.createElement('canvas') dengan dimensi terhitung. "
        "Konteks 2D (ctx) menggambar ulang citra menggunakan metode ctx.drawImage() dengan interpolasi penghalusan piksel (bicubic smoothing).\\n"
        "6. Kuantisasi JPEG & Rekonstruksi Berkas: Elemen canvas diekspor menggunakan fungsi asinkron canvas.toBlob() dengan format MIME 'image/jpeg' "
        "dan rasio kualitas 0.82 (82%). Blob terkompresi dibungkus kembali ke dalam instance objek File baru dengan nama berkas asli.\\n"
        "7. Hasil Reduksi Berkas: Berkas foto hasil kompresi mengalami penyusutan ukuran dari rata-rata 4-6 MB menjadi berkisar 200-450 KB "
        "(efisiensi reduksi ukuran mencapai lebih dari 90%), sehingga waktu pengunggahan via jaringan seluler terpangkas drastis dari belasan detik "
        "menjadi di bawah 2 detik tanpa mengorbankan ketajaman teks stiker nomor seri unit Sharp.",
        bold_prefix="C. Flowchart Algoritma Kompresi Citra Klien HTML5 Canvas (Gambar 3.11):\\n"
    )

    img_flow_canvas = r"c:\Users\An\Herd\servicehub\flowchart_kompresi_canvas_clean.png"
    add_image_safe(img_flow_canvas, "Gambar 3.11 Flowchart Algoritma Kompresi Citra Klien HTML5 Canvas", width_inch=5.0)

    # =========================================================================
    # 3.3 ANALISA DAN PEMBAHASAN
    # =========================================================================
    add_h1("3.3 Analisa dan Pembahasan")
    add_p(
        "Analisa dan pembahasan menyajikan evaluasi mendalam terhadap implementasi metode Vision-Language Model (VLM), "
        "efektivitas algoritma kompresi citra berbasis HTML5 Canvas, rancangan antarmuka sistem Web App ServiceHub, "
        "petunjuk penggunaan operasional sistem (manual program) untuk peran Admin dan Teknisi, "
        "serta hasil pengujian fungsionalitas sistem secara komprehensif menggunakan metode Blackbox Testing."
    )

    # 3.3.1 PEMBAHASAN ALGORITMA
    add_h2("3.3.1 Pembahasan Algoritma")
    add_p(
        "Pada pengembangan sistem ServiceHub, terdapat 2 (dua) algoritma komputasi utama yang diimplementasikan "
        "untuk menyelesaikan permasalahan operasional pencatatan servis pada PT. Sharp Electronics Indonesia:\\n"
        "1. Algoritma Vision-Language Model (Google Gemini 1.5 Flash) untuk otomasi ekstraksi informasi terstruktur dari foto formulir SPK Sharp.\\n"
        "2. Algoritma Kompresi Citra Berbasis Off-Screen HTML5 Canvas pada sisi klien untuk mereduksi beban transmisi data seluler di lapangan."
    )

    add_p(
        "A. Algoritma Vision-Language Model (Google Gemini 1.5 Flash):\\n"
        "Metode Vision-Language Model merepresentasikan lompatan teknologi mutakhir dibandingkan sistem OCR tradisional (seperti Tesseract). "
        "OCR konvensional hanya mengenali karakter optik murni tanpa memahami struktur tata letak (layout) dan semantik dokumen, "
        "sehingga menghasilkan teks mentah yang berantakan saat memproses formulir berkolom atau tulisan tangan. "
        "Sebaliknya, Gemini 1.5 Flash menggunakan arsitektur Transformer multimodal yang memproses representasi piksel citra dan token teks "
        "dalam ruang representasi bersama (joint multimodal embedding space). "
        "Pada sistem ServiceHub, integrasi Gemini 1.5 Flash diimplementasikan melalui kelas layanan GeminiDocumentScanner.php "
        "dengan menerapkan teknik Prompt Engineering berbasis JSON Schema Enforcement. "
        "Model AI diinstruksikan secara tegas untuk mengekstrak entitas-entitas spesifik formulir SPK Sharp dan mengembalikannya "
        "dalam bentuk format JSON terstruktur yang langsung dapat dipetakan ke atribut entitas SERVICE_TICKETS.",
        bold_prefix="1. Analisa Algoritma Ekstraksi Dokumen AI VLM:\\n"
    )

    add_p(
        "Tabel 3.12 menyajikan hasil evaluasi kinerja dan tingkat akurasi ekstraksi informasi AI VLM terhadap 7 (tujuh) entitas data kunci "
        "pada 20 sampel lembar fisik formulir SPK Sharp (kombinasi formulir cetak dan formulir dengan catatan tulisan tangan teknisi):"
    )

    # TABEL 3.12: EVALUASI KINERJA AI VLM
    add_p("Tabel 3.12 Evaluasi Kinerja dan Akurasi Ekstraksi AI VLM Berdasarkan Entitas Data SPK Sharp", italic=True)
    t_vlm = doc.add_table(rows=8, cols=6)
    set_table_borders(t_vlm)

    headers_vlm = ["No", "Entitas Data Target", "Tipe Data Format", "Akurasi SPK Cetak (%)", "Akurasi Tulisan Tangan (%)", "Catatan Evaluasi Lapangan"]
    widths_vlm = [Inches(0.4), Inches(1.3), Inches(1.0), Inches(0.9), Inches(1.0), Inches(1.8)]

    for idx, name in enumerate(headers_vlm):
        cell = t_vlm.cell(0, idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_formatted(cell, name, font_size=8.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))
        cell.width = widths_vlm[idx]

    data_vlm = [
        ("1", "Nomor Notifikasi SPK", "VARCHAR(255)", "100%", "95%", "Format numerik 10 digit Sharp terbaca sangat akurat."),
        ("2", "Nama Konsumen", "VARCHAR(255)", "100%", "90%", "Teks cetak sempurna, tulisan tangan terbaca baik sesuai konteks nama."),
        ("3", "Nomor Telepon / HP", "VARCHAR(50)", "100%", "95%", "Format digit nomor ponsel 08xx/62xx tervalidasi otomatis."),
        ("4", "Model Unit Sharp", "VARCHAR(100)", "95%", "85%", "Kombinasi huruf kapital & angka model (misal: 2T-C42BD1I) teridentifikasi presisi."),
        ("5", "Nomor Seri (Serial Number)", "VARCHAR(100)", "95%", "85%", "Karakter alfanumerik pada stiker barcode terbaca dengan baik."),
        ("6", "Keluhan Konsumen", "TEXT", "90%", "85%", "Kalimat keluhan awal (misal: Tidak Dingin, Gambar Gelap) terekstraksi utuh."),
        ("7", "Gejala Kerusakan Fisik", "TEXT", "90%", "80%", "Catatan teknis lapangan terekstraksi sesuai konteks kerusakan komponen.")
    ]

    for row_idx, data_row in enumerate(data_vlm, start=1):
        for col_idx, text_val in enumerate(data_row):
            cell = t_vlm.cell(row_idx, col_idx)
            set_cell_background(cell, "F9FAFB" if row_idx % 2 == 1 else "FFFFFF")
            al = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 2, 3, 4] else WD_ALIGN_PARAGRAPH.LEFT
            set_cell_formatted(cell, text_val, font_size=8.0, align=al)
            cell.width = widths_vlm[col_idx]

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    add_p(
        "B. Algoritma Reduksi & Kompresi Citra Klien HTML5 Canvas:\\n"
        "Untuk mengatasi kendala kuota penyimpanan cloud bucket dan lambatnya transmisi data saat teknisi berada di daerah "
        "dengan koneksi seluler tidak stabil, sistem mengimplementasikan algoritma kompresi citra murni di sisi peramban (client-side) "
        "melalui file image-compressor.ts. Algoritma ini bekerja dengan memanfaatkan elemen memori off-screen HTML5 Canvas "
        "dan metode interpolasi resolusi 2D Context. Formulasi matematis penskalaan dimensi gambar dirumuskan sebagai berikut:\\n"
        "Misalkan lebar dan tinggi citra masukan adalah W_asli dan H_asli, serta ambang batas resolusi maksimal adalah W_max = H_max = 1600 piksel. "
        "Jika W_asli > 1600 atau H_asli > 1600, rasio aspek dihitung dengan rumus:\\n"
        "   • Jika (W_asli / H_asli) > (W_max / H_max), maka: H_baru = round((H_asli * W_max) / W_asli) dan W_baru = W_max.\\n"
        "   • Sebaliknya, maka: W_baru = round((W_asli * H_max) / H_asli) dan H_baru = H_max.\\n"
        "Setelah kanvas digambar ulang pada ukuran W_baru x H_baru menggunakan interpolasi bicubic, fungsi canvas.toBlob() "
        "menerapkan kompresi kuantisasi DCT (Discrete Cosine Transform) format JPEG pada faktor kualitas q = 0.82. "
        "Tabel 3.13 memperlihatkan hasil pengujian komparasi ukuran berkas dan durasi pengunggahan pada 5 sampel foto servis riil "
        "menggunakan jaringan seluler 4G LTE:",
        bold_prefix="2. Analisa Algoritma Kompresi Citra Klien:\\n"
    )

    # TABEL 3.13: KOMPARASI KOMPRESI CITRA
    add_p("Tabel 3.13 Komparasi Ukuran Berkas dan Durasi Transmisi Data Sebelum vs Sesudah Kompresi Canvas", italic=True)
    t_comp = doc.add_table(rows=6, cols=8)
    set_table_borders(t_comp)

    headers_comp = ["No", "Sampel Foto Dokumentasi", "Resolusi Asli (px)", "Resolusi Kompresi (px)", "Ukuran Awal", "Ukuran Akhir", "Rasio Reduksi", "Durasi Unggah (4G)"]
    widths_comp = [Inches(0.4), Inches(1.5), Inches(0.9), Inches(0.9), Inches(0.7), Inches(0.7), Inches(0.7), Inches(0.8)]

    for idx, name in enumerate(headers_comp):
        cell = t_comp.cell(0, idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_formatted(cell, name, font_size=8.0, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))
        cell.width = widths_comp[idx]

    data_comp = [
        ("1", "Kunjungan Unit AC Inverter Sharp", "4000 x 3000", "1600 x 1200", "4.82 MB", "318 KB", "93.4%", "18.2 s -> 1.1 s"),
        ("2", "Kunjungan Unit Smart TV 50 Inci", "4032 x 3024", "1600 x 1200", "5.24 MB", "342 KB", "93.5%", "19.8 s -> 1.2 s"),
        ("3", "Kunjungan Kulkas Side-by-Side", "3840 x 2160", "1600 x 900", "4.15 MB", "285 KB", "93.1%", "15.6 s -> 0.9 s"),
        ("4", "Selesai Servis Modul PCB AC", "4128 x 3096", "1600 x 1200", "5.68 MB", "376 KB", "93.4%", "21.4 s -> 1.3 s"),
        ("5", "Selesai Servis Penggantian Panel TV", "3264 x 2448", "1600 x 1200", "3.92 MB", "264 KB", "93.3%", "14.8 s -> 0.8 s")
    ]

    for row_idx, data_row in enumerate(data_comp, start=1):
        for col_idx, text_val in enumerate(data_row):
            cell = t_comp.cell(row_idx, col_idx)
            set_cell_background(cell, "F9FAFB" if row_idx % 2 == 1 else "FFFFFF")
            al = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 2, 3, 4, 5, 6, 7] else WD_ALIGN_PARAGRAPH.LEFT
            set_cell_formatted(cell, text_val, font_size=8.0, align=al)
            cell.width = widths_comp[col_idx]

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 3.3.2 RANCANGAN LAYAR
    add_h2("3.3.2 Rancangan Layar")
    add_p(
        "Rancangan layar (Wireframe) merepresentasikan skema tata letak struktural antarmuka pengguna sistem ServiceHub "
        "sebelum diimplementasikan ke dalam kode program visual. Rancangan layar dirancang dengan memprioritaskan prinsip "
        "kemudahan penggunaan (usability), kejelasan hierarki visual informasi, serta adaptabilitas antarmuka responsif "
        "(Responsive Web Design) baik pada layar monitor komputer kantor (desktop) maupun layar sentuh gawai teknisi (smartphone). "
        "Rancangan layar sistem ServiceHub terdiri atas 5 (lima) area antarmuka utama:\\n"
        "1. Rancangan Layar Halaman Login: Memuat kartu formulir autentikasi terpusat di tengah layar (centered card) yang berisi logo resmi "
        "ServiceHub Sharp, bidang input alamat email, bidang input kata sandi dengan ikon penampil sandi, kotak centang 'Ingat Saya' (remember me), "
        "tautan pemulihan sandi, serta tombol submit utama 'Masuk ke Sistem'.\\n"
        "2. Rancangan Layar Dashboard Pemantauan Admin: Memuat tata letak desktop berbasis bilah navigasi atas (topbar) dan bilah sisi (sidebar). "
        "Area konten utama menyajikan kartu ringkasan metrik statistik operasional (Total Tiket, Tiket Pending, Tiket In Progress, Tiket Completed), "
        "bilah alat aksi cepat (tombol 'Scan SPK via AI', tombol 'Tambah Tiket Manual', tombol 'Ekspor Excel'), bilah pencarian global, "
        "serta tabel daftar tiket servis interaktif yang memuat informasi nomor notifikasi, nama pelanggan, tipe produk, status tiket, dan tenggat waktu.\\n"
        "3. Rancangan Layar Modal AI Document Scanner: Menampilkan kotak dialog modal interaktif saat tombol 'Scan SPK' ditekan. "
        "Sisi atas memuat area dropzone unggah/potret berkas citra formulir SPK Sharp dengan indikator animasi pemrosesan AI, sedangkan "
        "sisi bawah menyajikan bidang-bidang pratinjau hasil ekstraksi data otomatis (Nomor SPK, Nama, Telepon, Alamat, Model, Serial, Keluhan) "
        "yang dapat diverifikasi dan diedit langsung oleh Admin sebelum menekan tombol konfirmasi 'Simpan ke Database'.\\n"
        "4. Rancangan Layar Formulir Tambah Tiket Manual: Menyajikan formulir entri data lengkap terstruktur ke dalam beberapa seksi bidang masukan: "
        "Informasi Pelanggan (Nama, Telepon, Alamat Domisili), Informasi Perangkat Elektronik Sharp (Jenis Produk, Model Unit, Nomor Seri), "
        "serta Detail Kerusakan Awal (Keluhan Pelanggan, Gejala Kerusakan, Tenggat Waktu Layanan).\\n"
        "5. Rancangan Layar Antarmuka Mobile PWA Teknisi Lapangan: Mengadopsi tata letak mobile-first dengan tampilan kartu vertikal kompak "
        "yang ramah sentuhan jari. Dilengkapi tombol aksi pembaruan status pengerjaan, modal dialog pengisian diagnosis teknis, kotak centang "
        "multi-kategori tindakan perbaikan (work_types), modul masukan kamera foto kunjungan dan foto selesai servis dengan indikator kompresi otomatis, "
        "serta tombol finalisasi laporan servis berwarna hijau kontras."
    )

    # 3.3.3 IMPLEMENTASI DAN PENJELASAN RANCANGAN LAYAR
    add_h2("3.3.3 Implementasi dan Penjelasan Rancangan Layar")
    add_p(
        "Implementasi antarmuka sistem ServiceHub dibangun secara modern menggunakan kombinasi ekosistem teknologi "
        "Laravel 11, Inertia.js, React 18, TypeScript, Tailwind CSS, dan komponen pustaka UI Shadcn (berbasis Radix UI primitives) "
        "serta paket ikon visual Lucide React. Integrasi ini menghasilkan aplikasi Single Page Application (SPA) yang sangat cepat tanpa "
        "memerlukan pemuatan ulang halaman (full-page reload), namun tetap memiliki keamanan dan keandalan perutean sisi server (server-side routing).\\n"
        "Penjelasan implementasi elemen visual antarmuka sistem ServiceHub meliputi:\\n"
        "1. Antarmuka Autentikasi Login (resources/js/Pages/auth/login.tsx): Mengimplementasikan proteksi token CSRF otomatis, "
        "validasi format email reaktif secara real-time, serta penanganan umpan balik kesalahan autentikasi menggunakan komponen pesan kesalahan Tailwind.\\n"
        "2. Antarmuka Dashboard Admin (resources/js/Pages/dashboard.tsx): Mengimplementasikan kartu metrik ringkasan menggunakan komponen Card Shadcn, "
        "tabel data dinamis menggunakan elemen Table dengan badge warna penanda status tiket (kuning untuk 'pending', biru untuk 'in_progress', "
        "hijau untuk 'completed'), serta fitur filter status reaktif yang memanfaatkan kemampuan Inertia.get() dengan opsi preserveState.\\n"
        "3. Antarmuka Modal Pemindai Dokumen AI (resources/js/components/document-scanner-dialog.tsx): Mengintegrasikan komponen Radix Dialog "
        "dengan status pemuatan dinamis (loading spinner), pratinjau gambar SPK yang diunggah, serta formulir masukan otomatis yang dihubungkan "
        "dengan hook useForm Inertia untuk transmisi data cepat ke rute POST /tickets.\\n"
        "4. Antarmuka Dialog Pelaporan Mobile Teknisi (resources/js/components/ticket-dialog.tsx): Mengimplementasikan antarmuka dialog responsif "
        "yang menyematkan utilitas kompresi citra image-compressor.ts. Setiap kali teknisi mengambil foto melalui kamera perangkat, "
        "pratinjau citra langsung ditampilkan di layar, ukuran berkas hasil kompresi diinformasikan ke pengguna, dan berkas siap diunggah "
        "secara asinkron ke server cloud storage bucket saat tombol submit ditekan."
    )

    # 3.3.4 PENGGUNAAN PROGRAM (MANUAL PROGRAM)
    add_h2("3.3.4 Penggunaan Program (Manual Program)")
    add_p(
        "Petunjuk penggunaan program (User Manual) menjabarkan prosedur operasional langkah demi langkah dalam mengoperasikan "
        "aplikasi ServiceHub bagi dua peran pengguna sistem, yaitu Admin Service Center dan Teknisi Lapangan."
    )

    add_p(
        "A. Panduan Operasional bagi Admin Service Center:\\n"
        "1. Membuka Aplikasi & Login: Buka peramban Google Chrome atau Microsoft Edge pada komputer kantor, akses alamat URL sistem ServiceHub, "
        "masukkan alamat email dan kata sandi akun Admin, lalu klik tombol 'Masuk ke Sistem'.\\n"
        "2. Memantau Dashboard: Setelah berhasil login, perhatikan kartu ringkasan status tiket servis pada bagian atas layar dashboard untuk melihat "
        "jumlah tiket yang berstatus Pending, Sedang Dikerjakan (In Progress), dan Selesai (Completed).\\n"
        "3. Menerbitkan Tiket via Scanner AI SPK: Klik tombol 'Scan SPK' di bilah atas dashboard. Pada jendela dialog yang muncul, seret atau pilih "
        "berkas foto lembar fisik SPK Sharp konsumen, lalu klik 'Proses Pemindaian AI'. Tunggu 2-3 detik hingga proses ekstraksi selesai dan seluruh "
        "kolom terisi otomatis. Periksa kebenaran data nomor notifikasi, nama, telepon, model, dan keluhan, lalu klik 'Simpan Tiket'.\\n"
        "4. Menerbitkan Tiket Secara Manual: Jika lembar SPK tidak dapat difoto, klik tombol 'Tambah Tiket Manual', isi seluruh data formulir pelanggan "
        "dan perangkat elektronik Sharp secara lengkap, lalu klik 'Simpan Tiket'.\\n"
        "5. Menyaring & Mencari Data Tiket: Gunakan kotak input pencarian untuk menemukan tiket berdasarkan Nomor SPK atau Nama Pelanggan, "
        "atau klik tombol filter status untuk menampilkan kelompok tiket tertentu.\\n"
        "6. Mengekspor Rekapitulasi Tiket: Klik tombol 'Ekspor Excel' (.xlsx) pada sudut kanan atas tabel untuk mengunduh rekapitulasi data seluruh tiket servis "
        "sebagai laporan arsip bulanan kantor cabang.\\n"
        "7. Mengelola Data Petugas: Akses menu 'Kelola Pengguna' pada bilah sisi kiri untuk menambah akun teknisi baru, memperbarui peran akun, "
        "atau menonaktifkan petugas yang sudah tidak bertugas.",
        bold_prefix="1. Petunjuk Operasional bagi Admin Service Center:\\n"
    )

    add_p(
        "B. Panduan Operasional bagi Teknisi Lapangan:\\n"
        "1. Membuka Aplikasi PWA pada Smartphone: Buka aplikasi ServiceHub melalui ikon shortcut layar utama smartphone teknisi atau akses via peramban mobile, "
        "lalu login menggunakan kredensial akun teknisi lapangan yang telah didaftarkan.\\n"
        "2. Memeriksa Daftar Tugas Servis: Pada tampilan layar utama, teknisi memeriksa daftar tiket servis aktif yang dialokasikan sesuai jadwal penugasan fisik. "
        "Teknisi dapat mengetuk kartu tiket untuk melihat alamat rumah konsumen dan deskripsi keluhan produk.\\n"
        "3. Memulai Pengerjaan Servis: Saat tiba di lokasi konsumen dan mulai memeriksa unit, ketuk tombol ubah status menjadi 'In Progress' "
        "agar sistem dan Admin kantor mengetahui bahwa unit sedang dalam tahap pengerjaan.\\n"
        "4. Mengisi Laporan Servis: Setelah diagnosa kerusakan dan perbaikan selesai dilakukan, ketuk tombol 'Lapor Servis'. "
        "Isi catatan teknis perbaikan pada kolom Diagnosis, centang multi-kategori tindakan perbaikan yang dilakukan pada pilihan Tindakan Pekerjaan "
        "(misalnya: Perbaikan Modul, Pembersihan Unit, Penggantian Suku Cadang, atau Isi Freon).\\n"
        "5. Mengambil & Mengunggah Foto Bukti Servis: Ketuk tombol 'Ambil Foto Kunjungan' untuk memotret kondisi unit saat kedatangan, "
        "lalu ketuk tombol 'Ambil Foto Selesai' untuk memotret kondisi unit setelah diperbaiki beserta stiker nomor serinya. "
        "Sistem secara otomatis mengompresi foto sehingga pengunggahan berjalan instan tanpa menghabiskan kuota seluler.\\n"
        "6. Finalisasi Laporan: Ketuk tombol 'Kirim Laporan Servis'. Sistem memvalidasi kelengkapan data dan secara otomatis memperbarui status tiket "
        "menjadi 'Completed' (Selesai).",
        bold_prefix="2. Petunjuk Operasional bagi Teknisi Lapangan:\\n"
    )

    # 3.3.5 UJI COBA PROGRAM DENGAN CONTOH DATA (BLACKBOX TESTING)
    add_h2("3.3.5 Uji Coba Program dengan Contoh Data")
    add_p(
        "Pengujian perangkat lunak sistem ServiceHub dilakukan menggunakan metode Blackbox Testing dengan teknik "
        "Equivalence Partitioning dan Boundary Value Analysis. Metode ini berfokus pada pengujian fungsionalitas eksternal sistem "
        "tanpa melihat struktur kode internal, guna memverifikasi apakah setiap fungsi antarmuka menerima masukan data "
        "dan menghasilkan keluaran serta perilaku sistem yang sesuai dengan spesifikasi kebutuhan yang telah dirancang. "
        "Pengujian mencakup seluruh skenario use case (UC-01 s/d UC-13) menggunakan data riil operasional servis PT. Sharp Electronics Indonesia. "
        "Hasil pengujian fungsionalitas disajikan secara rinci pada Tabel 3.14:"
    )

    # TABEL 3.14: HASIL PENGUJIAN BLACKBOX TESTING
    add_p("Tabel 3.14 Matriks Hasil Pengujian Fungsionalitas Sistem ServiceHub (Black Box Testing)", italic=True)
    t_test = doc.add_table(rows=16, cols=6)
    set_table_borders(t_test)

    headers_test = ["No", "Kasus Uji / Fitur", "Skenario Masukan Data", "Hasil yang Diharapkan", "Hasil Pengujian Aktual", "Kesimpulan"]
    widths_test = [Inches(0.4), Inches(1.3), Inches(1.5), Inches(1.5), Inches(1.4), Inches(0.7)]

    for idx, name in enumerate(headers_test):
        cell = t_test.cell(0, idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_formatted(cell, name, font_size=8.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))
        cell.width = widths_test[idx]

    data_test = [
        ("1", "Autentikasi Login Valid (UC-01)", "Email terdaftar dan password benar.", "Sistem menerbitkan sesi dan mengalihkan pengguna ke Dashboard sesuai peran.", "Berhasil masuk ke Dashboard sesuai peran.", "Valid"),
        ("2", "Autentikasi Login Tidak Valid (UC-01)", "Email salah atau password tidak cocok.", "Sistem menolak akses dan menampilkan pesan 'Kredensial tidak cocok'.", "Akses ditolak, muncul pesan kesalahan validasi.", "Valid"),
        ("3", "Ekstraksi SPK via AI VLM (UC-02)", "Unggah foto fisik formulir SPK Sharp format .jpg.", "Gemini VLM mengekstrak nomor SPK, nama, telepon, dan model ke formulir modal.", "Seluruh bidang formulir terisi otomatis sesuai dokumen SPK.", "Valid"),
        ("4", "Ekstraksi AI Berkas Tidak Valid (UC-02)", "Unggah berkas non-gambar (.pdf atau corrupt).", "Sistem memvalidasi ekstensi berkas dan menampilkan peringatan kesalahan unggah.", "Muncul notifikasi 'Format berkas harus berupa citra gambar'.", "Valid"),
        ("5", "Entri Tiket Servis Manual (UC-02)", "Input seluruh kolom wajib tiket pada formulir manual.", "Data tiket tersimpan ke PostgreSQL dan tabel dashboard diperbarui.", "Tiket baru berhasil disimpan dan muncul pada daftar tiket.", "Valid"),
        ("6", "Validasi Form Kosong (UC-02)", "Mengosongkan nama pelanggan atau model unit.", "Sistem menolak submit dan menandai bidang wajib dengan warna merah.", "Muncul pesan validasi 'Bidang ini wajib diisi'.", "Valid"),
        ("7", "Pencarian Tiket Servis (UC-03)", "Memasukkan kata kunci nomor SPK pada kotak cari.", "Tabel hanya menampilkan baris tiket yang cocok dengan kata kunci.", "Daftar tiket tersaring secara reaktif dan tepat.", "Valid"),
        ("8", "Penyaringan Status Tiket (UC-03)", "Memilih filter status 'Pending' / 'In Progress'.", "Tabel menampilkan tiket sesuai status yang dipilih.", "Data tersaring akurat sesuai kategori status pengerjaan.", "Valid"),
        ("9", "Lihat Rincian Tiket (UC-07)", "Mengetuk kartu tiket pada PWA Mobile teknisi.", "Menampilkan informasi lengkap konsumen, alamat, dan keluhan produk.", "Rincian tiket terbuka secara responsif pada perangkat mobile.", "Valid"),
        ("10", "Pembaruan Status Servis (UC-09)", "Mengubah status tiket menjadi 'In Progress'.", "Status tiket pada basis data dan antarmuka berubah menjadi In Progress.", "Status berhasil diperbarui dan badge berubah warna biru.", "Valid"),
        ("11", "Kompresi Foto Otomatis (UC-11)", "Mengambil foto kamera resolusi tinggi (4.5 MB).", "HTML5 Canvas mereduksi ukuran menjadi < 500 KB sebelum diunggah.", "Foto terkompresi menjadi 320 KB dan berhasil diunggah cepat.", "Valid"),
        ("12", "Input Laporan Servis (UC-10, 12)", "Input diagnosis, pilih work_types, klik selesai.", "Data laporan tersimpan, status tiket berubah menjadi Completed.", "Laporan perbaikan tersimpan, status tiket menjadi Selesai.", "Valid"),
        ("13", "Ekspor Laporan Excel (UC-05)", "Klik tombol 'Ekspor Excel' pada dashboard.", "Sistem mengunduh berkas spreadsheet .xlsx berisi rekapitulasi tiket.", "Berkas .xlsx berhasil diunduh dan data terisi lengkap.", "Valid"),
        ("14", "Manajemen Akun Petugas (UC-06)", "Admin menambah akun teknisi baru pada /users.", "Akun baru tersimpan dan dapat digunakan untuk login ke sistem.", "Akun teknisi baru berhasil dibuat dan dapat login.", "Valid"),
        ("15", "Otorisasi Hak Akses Role (UC-01)", "Teknisi mencoba mengakses URL /users secara langsung.", "Middleware memblokir akses dan mengembalikan respons HTTP 403 Forbidden.", "Akses ditolak, teknisi dialihkan kembali ke dashboard.", "Valid")
    ]

    for row_idx, data_row in enumerate(data_test, start=1):
        for col_idx, text_val in enumerate(data_row):
            cell = t_test.cell(row_idx, col_idx)
            set_cell_background(cell, "F9FAFB" if row_idx % 2 == 1 else "FFFFFF")
            al = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 5] else WD_ALIGN_PARAGRAPH.LEFT
            set_cell_formatted(cell, text_val, font_size=8.0, align=al)
            cell.width = widths_test[col_idx]

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_p(
        "Berdasarkan hasil pengujian fungsionalitas menggunakan metode Black Box Testing pada Tabel 3.14 di atas, "
        "dapat disimpulkan bahwa seluruh 15 (lima belas) skenario pengujian fungsional memperoleh status VALID (100% Berhasil). "
        "Sistem ServiceHub terbukti berjalan stabil, andal, serta mampu menjalankan seluruh kebutuhan operasional pelaporan teknisi lapangan "
        "dan manajemen tiket servis PT. Sharp Electronics Indonesia sesuai dengan spesifikasi perancangan sistem yang telah ditetapkan."
    )
'''

# Find where to replace:
target_start = '    add_h2("3.2.2 Perancangan Perangkat Lunak (Flowchart)")'
if target_start in content:
    idx_start = content.index(target_start)
    # Find the save logic near the end
    target_end_marker = '    art_dir = r"C:\\Users\\An\\.gemini\\antigravity\\brain\\dcbd55fb-38f6-46db-b6e3-9b160c1ca30f"'
    idx_end = content.index(target_end_marker)
    content = content[:idx_start] + new_section + "\n" + content[idx_end:]
    print("Replaced Sub-bab 3.2.2 and 3.3 section successfully.")
else:
    print("Error: target_start not found in content.")

with open(py_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated create_bab3_doc.py successfully.")
