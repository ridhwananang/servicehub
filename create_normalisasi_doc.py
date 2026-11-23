import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def generate_perfect_normalisasi_doc(output_path):
    doc = docx.Document()
    
    # Margin Standar Skripsi/KP A4: Left 4cm, Top 3cm, Right 3cm, Bottom 3cm
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.left_margin = Inches(1.57)  # 4.0 cm
        section.right_margin = Inches(1.18) # 3.0 cm
        section.top_margin = Inches(1.18)   # 3.0 cm
        section.bottom_margin = Inches(1.18)# 3.0 cm

    # Base Font
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = RGBColor(30, 41, 59)
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(6)

    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(15)
        run.font.color.rgb = RGBColor(15, 23, 42)
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(16)
        run = p.add_run(text)
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(71, 85, 105)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(30, 58, 138) # Navy Blue
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(15, 23, 42)
        return p

    def add_p(text, bold_prefix=None, italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.bold = True
            run_b.font.color.rgb = RGBColor(15, 23, 42)
        run = p.add_run(text)
        run.italic = italic
        return p

    def add_callout(text, prefix="Analisis Ketergantungan: "):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.left_indent = Inches(0.2)
        p.paragraph_format.right_indent = Inches(0.2)
        
        run_p = p.add_run(prefix)
        run_p.bold = True
        run_p.font.color.rgb = RGBColor(180, 83, 9) # Amber
        
        run_t = p.add_run(text)
        run_t.italic = True
        run_t.font.color.rgb = RGBColor(71, 85, 105)
        return p

    # --- TITLE ---
    add_title("PERANCANGAN BASIS DATA:\nTAHAPAN NORMALISASI SISTEM SERVICEHUB")
    add_subtitle("Implementasi Pelaporan Teknisi Lapangan Berbasis Web App dengan Metode Vision-Language Model\nStudi Kasus: PT. Sharp Electronics Indonesia")

    # Divider
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_after = Pt(12)
    p_div_border = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="1" w:color="1E3A8A"/></w:pBdr>')
    p_div._p.get_or_add_pPr().append(p_div_border)

    # --- 1. PENDAHULUAN ---
    add_h1("1. Pendahuluan Normalisasi Basis Data")
    add_p(
        "Normalisasi basis data merupakan proses analisis ketergantungan atribut (functional dependency) untuk "
        "mengorganisasikan relasi basis data sedemikian rupa sehingga terhindar dari anomali modifikasi (insert, update, "
        "dan delete anomaly) serta meminimalkan redundansi data. Normalisasi sistem ServiceHub dirancang berdasarkan data masukan "
        "nyata pada lembar fisik Surat Perintah Kerja (SPK) PT. Sharp Electronics Indonesia."
    )
    add_p(
        "Lembar kerja formulir fisik SPK Sharp memuat 5 kelompok data operasional utama:",
        bold_prefix="Dekomposisi Data Dokumen Sumber (SPK Sharp):\n"
    )
    items = [
        ("Header SPK: ", "Nomor Notifikasi SPK (No Notif), Cabang Service Center (Pulogadung / MOI / Lain-lain)."),
        ("Data Pelanggan: ", "Nama Pelanggan, Nomor Telepon/WhatsApp, dan Alamat Lengkap Konsumen."),
        ("Spesifikasi Unit Sharp: ", "Model/Tipe Unit (AC Inverter 1.5 PK, Smart TV 55 Inch OLED, Kulkas) dan Nomor Seri Fisik (Serial Number)."),
        ("Detail Pengerjaan Servis: ", "Tanggal Servis, Batas Waktu (Deadline), Status Pembayaran (Berbayar / Tidak Berbayar), Keterangan Status Bebas Biaya (Garansi / Free Service), Status Pengerjaan (Belum Selesai / Selesai), Jenis Pekerjaan (Service Minor, Service Mayor, Install Bracket), Jam Mulai/Selesai, dan Catatan Diagnosis."),
        ("Dokumentasi & Petugas: ", "Foto Fisik Unit Saat Kedatangan (Visit), Foto Fisik Unit Setelah Selesai (Completion), ID Petugas, Nama Petugas, Email, dan Peran Akun.")
    ]
    for h, desc in items:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(3)
        r = bp.add_run(h)
        r.bold = True
        bp.add_run(desc)

    # --- 2. BENTUK TIDAK NORMAL (UNF) ---
    add_h1("2. Bentuk Tidak Normal (Unnormalized Form / UNF)")
    add_p(
        "Bentuk Tidak Normal (UNF) memuat seluruh atribut mentah yang tercatat pada formulir fisik SPK Sharp tanpa aturan relasional. "
        "Pada kondisi ini, data memuat kelompok berulang (repeating groups) pada daftar tindakan pekerjaan dan foto dokumentasi, "
        "serta data profil petugas yang bercampur dalam satu rekaman tiket servis. "
        "Perlu ditegaskan bahwa atribut ID_Petugas pada formulir fisik merepresentasikan identitas petugas yang mencatat dan membuat tiket servis ke dalam sistem, "
        "yang pada tahap perancangan fisik nantinya dipetakan secara fungsional ke kolom created_by."
    )
    add_p(
        "SPK_UNF = (No_Notif, Cabang, Nama_Pelanggan, Telp_Pelanggan, Alamat_Pelanggan, Model_Unit, Serial_Number, "
        "Tgl_Servis, Deadline, Status_Biaya, Ket_Status, Status_Kerja, {Jenis_Pekerjaan}, Jam_Mulai, Jam_Selesai, "
        "{Foto_Servis}, Catatan, ID_Petugas, Nama_Petugas, Email_Petugas, Peran)",
        bold_prefix="Notasi Relasional UNF:\n"
    )

    add_p("Tabel 2.1 Sampel Data Bentuk Tidak Normal (UNF)", italic=True)
    t_unf = doc.add_table(rows=3, cols=8)
    t_unf.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_unf)
    h_unf = ["No_Notif", "Nama Pelanggan", "Model Unit", "Status Biaya", "Ket Status", "{Jenis Pekerjaan} (Repeating)", "{Foto Bukti} (Repeating)", "Nama Petugas"]
    for i, h in enumerate(h_unf):
        c = t_unf.cell(0, i)
        c.text = h
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 70, 70, 90, 90)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(9.5)

    r_unf = [
        ("NTF-2026-0901", "Budi Santoso", "AC Inverter 1.5 PK", "tidak_berbayar", "Garansi", "1. Service Mayor\n2. Penjelasan", "1. visit_01.jpg\n2. comp_01.jpg", "Ahmad Fauzi (Teknisi)"),
        ("NTF-2026-0902", "Siti Aminah", "Smart TV 55 Inch", "berbayar", "-", "1. Service Minor\n2. Install Bracket", "1. visit_02.jpg\n2. comp_02.jpg", "Ahmad Fauzi (Teknisi)")
    ]
    for r_idx, r_data in enumerate(r_unf, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_unf.cell(r_idx, c_idx)
            c.text = val
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 70, 70)
            p = c.paragraphs[0]
            if c_idx in [0, 3, 4]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.size = Pt(9)

    add_callout(
        "Kelemahan Bentuk UNF: (1) Nilai atribut Jenis Pekerjaan dan Foto Bukti berupa repeating group yang bernilai banyak (non-atomic). "
        "(2) Redundansi data tinggi karena identitas petugas dicatat berulang kali pada setiap tiket. "
        "(3) Terjadi Update Anomaly bila profil petugas diperbarui karena harus memperbarui banyak baris secara simultan, "
        "serta Delete Anomaly bila suatu rekaman tiket dihapus, maka salinan informasi data petugas yang tercantum pada rekaman tiket tersebut ikut terhapus dari basis data.",
        prefix="Anomali dan Permasalahan UNF: "
    )

    # --- 3. BENTUK NORMAL PERTAMA (1NF) ---
    add_h1("3. Bentuk Normal Pertama (1NF - First Normal Form)")
    add_p(
        "Sebuah relasi memenuhi kriteria Bentuk Normal Pertama (1NF) jika dan hanya jika seluruh atribut bernilai skalar tunggal dan "
        "atomik (atomic value), serta tidak terdapat atribut bernilai jamak (multivalued) maupun kelompok berulang (repeating groups)."
    )

    # REVISI 1: Penjelasan perbedaan konseptual vs fisik JSONB
    add_p(
        "Dalam kajian teori perancangan basis data, penting untuk membedakan antara Normalisasi Tingkat Konseptual "
        "dengan Implementasi Tingkat Fisik Basis Data Modern:\n\n"
        "• Tingkat Konseptual (Teori Relasional Klasik E.F. Codd):\n"
        "Pada fase normalisasi konseptual, setiap atribut wajib bernilai atomik murni (skalar tunggal). Atribut daftar pekerjaan "
        "tidak boleh direpresentasikan sebagai struktur array maupun koleksi, melainkan distandarisasi menjadi atribut teks skalar tunggal "
        "(jenis_pekerjaan) yang mendeskripsikan tindakan servis utama.\n\n"
        "• Tingkat Implementasi Fisik (Modern RDBMS - PostgreSQL):\n"
        "Pada arsitektur fisik sistem ServiceHub, kebutuhan operasional teknisi di lapangan yang sering kali mencakup multi-tindakan perbaikan "
        "sekaligus (checklist pekerjaan) diakomodasi melalui fitur hybrid relational-document PostgreSQL menggunakan tipe data native JSONB (work_types). "
        "Pendekatan fisik ini dipilih untuk mengakomodasi kebutuhan multi-select pekerjaan tanpa menambahkan tabel detail atau tabel perantara pada implementasi aplikasi, "
        "dengan potensi optimasi performa kueri yang dapat didukung dengan pengindeksan GIN (Generalized Inverted Index). Namun demikian, pada tahap normalisasi konseptual 1NF ini, data diformalkan secara atomik terlebih dahulu.",
        bold_prefix="Perbedaan Normalisasi Konseptual dengan Implementasi Fisik (JSONB):\n"
    )

    # REVISI 2: Penjelasan Natural Identifier vs Surrogate PK
    add_p(
        "Pada tahap perancangan konseptual ini, atribut notif_number (Nomor SPK unik Sharp) ditetapkan sebagai "
        "Natural Identifier (Primary Key Alami) karena secara inheren menjadi tanda pengenal tunggal dan unik dari lembar kerja "
        "fisik SPK di dunia operasional nyata. Pada implementasi fisik basis data nantinya, sistem mengadopsi Surrogate Primary Key (id) "
        "demi efisiensi indexing B-Tree dan konvensi ORM, dengan tetap mempertahankan notif_number sebagai UNIQUE KEY.",
        bold_prefix="Penetapan Natural Identifier (Primary Key Konseptual):\n"
    )

    add_p(
        "Transformasi dari UNF ke 1NF dilakukan dengan:\n"
        "1. Menghilangkan repeating group foto dengan memecahnya menjadi atribut atomik tunggal: visit_photo (foto kondisi awal unit) "
        "dan completion_photo (foto hasil pengetesan setelah selesai diperbaiki).\n"
        "2. Menghilangkan repeating group pekerjaan dengan menetapkan atribut skalar atomik tunggal: jenis_pekerjaan. "
        "Pada formulir SPK fisik Sharp, teknisi mencatat tindakan servis utama yang dilakukan pada unit. "
        "Di tingkat konseptual 1NF, setiap rekaman hanya memuat satu tindakan skalar atomik murni (misalnya: 'Service Mayor'), "
        "tanpa menggabungkan beberapa pekerjaan menggunakan kata sambung atau tanda baca.\n"
        "3. Menetapkan atribut tunggal notif_number sebagai Natural Identifier (Primary Key).",
        bold_prefix="Langkah Transformasi Menuju 1NF:\n"
    )

    add_p(
        "TIKET_SERVIS_1NF = (notif_number [PK], mainwork_center, customer_name, customer_phone, customer_address, "
        "unit_model, serial_number, service_date, deadline, status, status_note, work_status, jenis_pekerjaan, "
        "start_time, finish_time, visit_photo, completion_photo, notes, user_id, user_name, user_email, user_role)",
        bold_prefix="Notasi Relasional 1NF:\n"
    )

    add_p("Tabel 3.1 Sampel Data Bentuk Normal Pertama (1NF) - Seluruh Atribut Bernilai Atomik", italic=True)
    t_1nf = doc.add_table(rows=3, cols=8)
    t_1nf.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_1nf)
    h_1nf = ["notif_number (PK)", "customer_name", "unit_model", "status", "status_note", "jenis_pekerjaan", "work_status", "user_name"]
    for i, h in enumerate(h_1nf):
        c = t_1nf.cell(0, i)
        c.text = h
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 70, 70, 90, 90)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(9.5)

    r_1nf = [
        ("NTF-2026-0901", "Budi Santoso", "AC Inverter 1.5 PK", "tidak_berbayar", "Garansi", "Service Mayor", "selesai", "Ahmad Fauzi"),
        ("NTF-2026-0902", "Siti Aminah", "Smart TV 55 Inch", "berbayar", "-", "Service Minor", "belum_selesai", "Ahmad Fauzi")
    ]
    for r_idx, r_data in enumerate(r_1nf, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_1nf.cell(r_idx, c_idx)
            c.text = val
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 70, 70)
            p = c.paragraphs[0]
            if c_idx in [0, 3, 4, 6]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.size = Pt(9)

    add_callout(
        "Kondisi 1NF: Seluruh sel tabel kini berisi nilai atomik skalar tunggal. Atribut Primary Key yang ditetapkan "
        "adalah atribut tunggal (single attribute PK): notif_number.",
        prefix="Status Evaluasi 1NF: "
    )

    # --- 4. BENTUK NORMAL KEDUA (2NF) ---
    add_h1("4. Bentuk Normal Kedua (2NF - Second Normal Form)")
    add_p(
        "Sebuah relasi dikatakan memenuhi Bentuk Normal Kedua (2NF) apabila:\n"
        "1. Relasi telah berada dalam Bentuk Normal Pertama (1NF).\n"
        "2. Tidak terdapat ketergantungan fungsional sebagian (Partial Functional Dependency), yaitu seluruh atribut bukan kunci "
        "harus bergantung secara fungsional penuh (Full Functional Dependency) terhadap Primary Key."
    )

    add_p(
        "Berdasarkan kaidah teori relasional (E.F. Codd, Connolly & Begg, Fathansyah):\n"
        "Ketergantungan parsial hanya mungkin terjadi apabila Primary Key relasi berupa Kunci Gabungan (Composite Key / memiliki lebih dari satu atribut). "
        "Pada relasi TIKET_SERVIS_1NF di atas, Primary Key yang ditetapkan adalah atribut tunggal (Single Attribute PK), yaitu notif_number.\n\n"
        "Karena Primary Key bersifat tunggal dan tidak memiliki komponen pecahan kunci, maka secara matematis TIDAK MUNGKIN terdapat atribut "
        "non-kunci yang bergantung hanya pada sebagian kunci. Seluruh atribut non-kunci secara otomatis memiliki ketergantungan fungsional penuh "
        "(Full Functional Dependency) terhadap notif_number:\n"
        "notif_number -> mainwork_center, customer_name, customer_phone, customer_address, unit_model, serial_number, service_date, "
        "deadline, status, status_note, work_status, jenis_pekerjaan, start_time, finish_time, visit_photo, completion_photo, notes, "
        "user_id, user_name, user_email, user_role.",
        bold_prefix="Analisis Ketergantungan Parsial pada 2NF:\n"
    )

    add_callout(
        "Karena Primary Key berupa single attribute (notif_number), relasi tidak memiliki partial functional dependency. "
        "Oleh karena itu, struktur tabel pada tahap ini TIDAK PERLU DIPECAH dan SECARA OTOMATIS TELAH MEMENUHI BENTUK NORMAL KEDUA (2NF). "
        "Relasi tetap utuh satu tabel (TIKET_SERVIS_2NF) sama persis dengan tabel 1NF.",
        prefix="Kesimpulan Tahap 2NF: "
    )

    # --- 5. BENTUK NORMAL KETIGA (3NF) ---
    add_h1("5. Bentuk Normal Ketiga (3NF - Third Normal Form)")
    add_p(
        "Sebuah relasi memenuhi Bentuk Normal Ketiga (3NF) jika:\n"
        "1. Relasi telah memenuhi syarat 2NF.\n"
        "2. Tidak terdapat ketergantungan transitif (Transitive Functional Dependency), di mana atribut bukan kunci tidak boleh "
        "bergantung pada atribut bukan kunci lainnya (A -> B dan B -> C, sehingga A -> C secara tidak langsung)."
    )

    add_p(
        "Pada relasi TIKET_SERVIS_2NF, dilakukan evaluasi ketergantungan antar atribut non-kunci dan ditemukan Ketergantungan Transitif "
        "pada kelompok data pengguna/petugas:\n\n"
        "1. notif_number -> user_id (Nomor SPK menentukan akun pengguna yang mencatat/membuat tiket servis)\n"
        "2. user_id -> user_name, user_email, user_role (ID pengguna menentukan nama, email, dan peran pengguna)\n\n"
        "Akibatnya: notif_number -> user_name, user_email, user_role terjadi secara transitif melalui user_id!\n"
        "Atribut user_name, user_email, dan user_role bukan merupakan fakta langsung mengenai tiket servis, melainkan merupakan "
        "fakta mengenai entitas pengguna (user_id).",
        bold_prefix="Identifikasi Ketergantungan Transitif:\n"
    )

    add_p(
        "Untuk menghilangkan ketergantungan transitif tersebut, relasi TIKET_SERVIS didekomposisi menjadi dua tabel mandiri pada tahap 3NF:\n"
        "1. Tabel USERS: Menyimpan data akun pengguna (Admin Service Center dan Teknisi) dengan Primary Key id.\n"
        "2. Tabel SERVICE_TICKETS: Menyimpan data transaksi tiket servis dengan Primary Key notif_number dan mereferensikan "
        "created_by (user_id) sebagai Foreign Key (FK) yang merujuk ke USERS(id).",
        bold_prefix="Langkah Dekomposisi pada Tahap 3NF:\n"
    )

    add_p(
        "1. USERS = (id [PK], name, email, role, password, avatar, created_at, updated_at)\n"
        "   Ketergantungan Langsung: id -> name, email, role, password, avatar\n\n"
        "2. SERVICE_TICKETS = (notif_number [PK], created_by [FK], customer_name, customer_phone, customer_address, "
        "unit_model, serial_number, service_date, deadline, status, status_note, work_status, jenis_pekerjaan, "
        "mainwork_center, start_time, finish_time, visit_photo, completion_photo, notes, created_at, updated_at)\n"
        "   Ketergantungan Langsung: notif_number -> created_by, customer_name, ..., completion_photo",
        bold_prefix="Skema Relasional Konseptual Hasil Dekomposisi 3NF:\n"
    )

    add_p(
        "Pada tahap dekomposisi, atribut user_id (yang merepresentasikan ID_Petugas pencatat tiket pada relasi awal) "
        "direpresentasikan secara fungsional sebagai created_by pada tabel SERVICE_TICKETS untuk menunjukkan akun pengguna "
        "yang mencatat dan membuat tiket servis tersebut."
    )

    # Tabel Users 3NF
    add_p("Tabel 5.1 Entitas USERS Hasil Dekomposisi 3NF", italic=True)
    t_u3 = doc.add_table(rows=3, cols=5)
    t_u3.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_u3)
    h_u3 = ["id (PK)", "name", "email", "role", "avatar"]
    for i, h in enumerate(h_u3):
        c = t_u3.cell(0, i)
        c.text = h
        set_cell_background(c, "0284C7")
        set_cell_margins(c, 60, 60, 80, 80)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(9.5)

    r_u3 = [
        ("1", "Ridhwan Anang (Admin)", "admin@sharp-servicehub.com", "admin", "avatar_admin.jpg"),
        ("2", "Ahmad Fauzi (Teknisi)", "fauzi@sharp-servicehub.com", "teknisi", "avatar_fauzi.jpg")
    ]
    for r_idx, r_data in enumerate(r_u3, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_u3.cell(r_idx, c_idx)
            c.text = val
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 70, 70)
            p = c.paragraphs[0]
            if c_idx in [0, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.size = Pt(9)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Tabel Tickets 3NF
    add_p("Tabel 5.2 Entitas SERVICE_TICKETS Hasil Dekomposisi 3NF", italic=True)
    t_t3 = doc.add_table(rows=3, cols=7)
    t_t3.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_t3)
    h_t3 = ["notif_number (PK)", "created_by (FK)", "customer_name", "unit_model", "status", "jenis_pekerjaan", "work_status"]
    for i, h in enumerate(h_t3):
        c = t_t3.cell(0, i)
        c.text = h
        set_cell_background(c, "0284C7")
        set_cell_margins(c, 60, 60, 80, 80)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(9.5)

    r_t3 = [
        ("NTF-2026-0901", "2 (merujuk Users.id)", "Budi Santoso", "AC Inverter 1.5 PK", "tidak_berbayar", "Service Mayor", "selesai"),
        ("NTF-2026-0902", "2 (merujuk Users.id)", "Siti Aminah", "Smart TV 55 Inch", "berbayar", "Service Minor", "belum_selesai")
    ]
    for r_idx, r_data in enumerate(r_t3, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_t3.cell(r_idx, c_idx)
            c.text = val
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 70, 70)
            p = c.paragraphs[0]
            if c_idx in [0, 1, 4, 6]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.size = Pt(9)

    add_callout(
        "Setelah pemisahan pada 3NF: Seluruh atribut non-kunci pada kedua tabel hanya bergantung secara langsung dan penuh "
        "pada Primary Key masing-masing tabel. Ketergantungan transitif pada atribut pengguna telah dieliminasi melalui dekomposisi "
        "menjadi tabel USERS dan SERVICE_TICKETS, sehingga skema hasil dekomposisi memenuhi bentuk normal ketiga (3NF).",
        prefix="Status Kelulusan 3NF: "
    )

    # --- 6. IMPLEMENTASI SISTEM (CATATAN DARI TEORI KE POSTGRESQL) ---
    add_h1("6. Implementasi Skema Fisik pada Basis Data PostgreSQL ServiceHub")
    add_p(
        "Pada tingkat implementasi fisik arsitektur web modern menggunakan framework Laravel 11 dan basis data PostgreSQL, "
        "skema hasil normalisasi 3NF ini diimplementasikan dengan penyesuaian teknis, pemetaan tipe data, dan optimasi performa sebagai berikut:\n\n"
        "1. Penerapan Surrogate Primary Key (id):\n"
        "Pada level fisik tabel service_tickets, sistem menambahkan kolom id bertipe BIGINT (PostgreSQL Identity) sebagai Surrogate Primary Key. "
        "Sementara itu, notif_number yang merupakan Natural Identifier pada tahap konseptual ditetapkan dengan batasan UNIQUE KEY (UK) dan NOT NULL. "
        "Penggunaan integer 64-bit sebagai Primary Key fisik mendukung efisiensi pengindeksan B-Tree serta efisiensi relasi Foreign Key, "
        "sekaligus memberikan identifier teknis yang stabil apabila terjadi perubahan format penomoran dokumen di masa mendatang.\n\n"
        "2. Pemetaan jenis_pekerjaan Konseptual ke Tipe Data Native JSONB (work_types) & Atribut other_work_text:\n"
        "Atribut jenis_pekerjaan yang dimodelkan secara skalar atomik pada tahap normalisasi konseptual dipetakan ke kolom work_types "
        "bertipe native JSONB pada implementasi fisik PostgreSQL. Penyesuaian ini dilakukan untuk mengakomodasi fleksibilitas operasional "
        "teknisi lapangan di mana satu kali servis dapat mencakup beberapa tindakan checklist sekaligus (multi-select), "
        "tanpa memerlukan penambahan tabel detail atau tabel perantara. Pada sistem ServiceHub, daftar tindakan yang tersimpan di dalam array JSON "
        "mengikuti master kategori servis resmi Sharp ('Install Standart', 'Install Bracket', 'Penjelasan', 'Service Minor', 'Service Mayor', 'Penambahan', 'Lain-lain'). "
        "Tipe data ini dapat didukung dengan pengindeksan GIN (Generalized Inverted Index) untuk performa pencarian tinggi. "
        "Selain itu, atribut other_work_text ditambahkan pada implementasi fisik sebagai atribut pelengkap untuk menampung deskripsi teks bebas "
        "apabila teknisi memilih opsi checklist 'Lain-lain' pada antarmuka aplikasi.\n\n"
        "3. Integritas Referensial & Mitigasi Cascade Delete (ON DELETE SET NULL):\n"
        "Kolom created_by pada tabel service_tickets ditetapkan sebagai Foreign Key bertipe BIGINT yang merujuk ke users(id) "
        "dengan batasan NULLABLE dan aturan referensial ON DELETE SET NULL. Kebijakan ini diterapkan secara spesifik untuk mencegah terjadinya Cascade Delete "
        "(penghapusan berantai) yang berbahaya. Apabila suatu akun petugas/teknisi dihapus secara permanen dari basis data (physical delete), "
        "seluruh rekaman transaksi tiket servis yang pernah dicatat oleh petugas tersebut TIDAK IKUT TERHAPUS, melainkan nilai created_by "
        "secara aman diset menjadi NULL. Hal ini menjaga agar rekaman riwayat transaksi servis, catatan diagnosis, status pembayaran, "
        "serta bukti foto dokumentasi tetap tersimpan di basis data sebagai arsip audit operasional perusahaan, meskipun nilai atribut referensi created_by diubah menjadi NULL.\n\n"
        "4. Penambahan Atribut Sistem Aplikasi & Penjelasan Modul Autentikasi Laravel:\n"
        "Atribut password (hash Bcrypt), avatar (path foto profil), serta created_at dan updated_at merupakan atribut tingkat sistem "
        "yang ditambahkan pada tahap implementasi fisik untuk mendukung keamanan autentikasi, personalisasi antarmuka, dan jejak audit (audit trail). "
        "Perlu dicatat pula bahwa basis data PostgreSQL fisik tabel users memuat kolom bawaan framework Laravel seperti email_verified_at, "
        "remember_token, serta kolom Two-Factor Authentication (two_factor_secret, two_factor_recovery_codes, two_factor_confirmed_at dari Laravel Fortify). "
        "Sesuai kaidah pemodelan basis data akademik, atribut internal modul autentikasi framework tersebut diabstraksi dari perancangan "
        "relasional agar fokus analisis tetap tertuju pada entitas domain proses bisnis SPK Sharp.\n\n"
        "5. Standarisasi Nilai Status Pembayaran (status & status_note) serta Cabang (mainwork_center):\n"
        "Untuk mencegah ambiguitas semantik antara data konseptual dan implementasi riil basis data:\n"
        "• Kolom status pada basis data PostgreSQL secara tegas menyimpan status pembayaran servis dalam dua nilai valid: 'berbayar' dan 'tidak_berbayar'.\n"
        "• Kolom status_note menyimpan keterangan rincian jaminan bebas biaya ('Garansi' atau 'Free Service') khusus apabila status bernilai 'tidak_berbayar', "
        "dan bernilai NULL apabila status bernilai 'berbayar'.\n"
        "• Kolom mainwork_center menampung kode cabang service center penanggung jawab tiket, dengan pilihan nilai riil sistem: 'Pulogadung', 'MOI' (Mall of Indonesia), atau 'Lain-lain'.\n\n"
        "6. Penyelarasan Alokasi Fisik VARCHAR(255) dengan Batasan Validasi Form:\n"
        "Pada tingkat fisik DDL PostgreSQL, kolom teks seperti notif_number dan customer_phone dialokasikan dengan tipe VARCHAR(255) "
        "mengikuti konvensi default framework Laravel Blueprint ($table->string()). Sementara itu, integritas panjang data diatur "
        "dan dibatasi secara presisi pada layer logika aplikasi melalui Form Request Validation (maksimal 50 karakter), "
        "sehingga tercipta keselarasan antara fleksibilitas skema penyimpanan fisik dengan kepatuhan format data operasional.",
        bold_prefix="Penyesuaian dari Skema Konseptual ke Skema Fisik (PostgreSQL):\n"
    )

    # Kamus Users
    add_p("Tabel 6.1 Kamus Kolom Fisik Tabel USERS (PostgreSQL)", bold_prefix="")
    t_uspec = doc.add_table(rows=8, cols=5)
    t_uspec.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_uspec)
    h_spec = ["No", "Nama Kolom", "Tipe Data", "Constraint", "Keterangan"]
    for i, h in enumerate(h_spec):
        c = t_uspec.cell(0, i)
        c.text = h
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 80, 80)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(9.5)

    u_rows = [
        ("1", "id", "BIGINT", "PRIMARY KEY (PostgreSQL Identity)", "Identitas unik akun pengguna (Surrogate PK)"),
        ("2", "name", "VARCHAR(255)", "NOT NULL", "Nama lengkap petugas/teknisi"),
        ("3", "email", "VARCHAR(255)", "UNIQUE, NOT NULL", "Alamat email login ke sistem"),
        ("4", "role", "VARCHAR(255)", "NOT NULL, DEFAULT 'teknisi', INDEX", "Peran otorisasi pengguna ('admin' / 'teknisi') yang terindeks"),
        ("5", "password", "VARCHAR(255)", "NOT NULL", "Kata sandi hash terenkripsi Bcrypt"),
        ("6", "avatar", "VARCHAR(255)", "NULLABLE", "Jalur penyimpanan berkas foto profil"),
        ("7", "created_at / updated_at", "TIMESTAMP", "NULLABLE", "Jejak waktu sistem (audit trail)")
    ]
    for r_idx, r_data in enumerate(u_rows, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_uspec.cell(r_idx, c_idx)
            c.text = val
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 70, 70)
            p = c.paragraphs[0]
            if c_idx in [0, 2, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.size = Pt(9)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Kamus Tickets
    add_p("Tabel 6.2 Kamus Kolom Fisik Tabel SERVICE_TICKETS (PostgreSQL)", bold_prefix="")
    t_tspec = doc.add_table(rows=23, cols=5)
    t_tspec.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_tspec)
    for i, h in enumerate(h_spec):
        c = t_tspec.cell(0, i)
        c.text = h
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 80, 80)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(9.5)

    t_rows = [
        ("1", "id", "BIGINT", "PRIMARY KEY (PostgreSQL Identity)", "Identitas unik transaksi tiket servis (Surrogate PK)"),
        ("2", "created_by", "BIGINT", "FOREIGN KEY -> users(id), NULLABLE", "Relasi ke akun pengguna pembuat tiket (ON DELETE SET NULL)"),
        ("3", "notif_number", "VARCHAR(255)", "UNIQUE, NOT NULL", "Nomor notifikasi SPK Sharp sebagai Unique Key (alokasi fisik VARCHAR(255), validasi aplikasi maks. 50 karakter)"),
        ("4", "mainwork_center", "VARCHAR(255)", "NOT NULL", "Pusat servis cabang penanggung jawab ('Pulogadung' / 'MOI' / 'Lain-lain')"),
        ("5", "customer_name", "VARCHAR(255)", "NOT NULL", "Nama lengkap pelanggan konsumen"),
        ("6", "customer_phone", "VARCHAR(255)", "NOT NULL", "Nomor kontak telepon/WhatsApp pelanggan (alokasi fisik VARCHAR(255), validasi aplikasi maks. 50 karakter)"),
        ("7", "customer_address", "TEXT", "NULLABLE", "Alamat lengkap lokasi domisili pelaksanaan perbaikan"),
        ("8", "unit_model", "VARCHAR(255)", "NOT NULL", "Model dan tipe produk perangkat Sharp (AC, TV, Kulkas, dll.)"),
        ("9", "serial_number", "VARCHAR(255)", "NOT NULL", "Nomor seri fisik unit perangkat elektronik Sharp"),
        ("10", "service_date", "DATE", "NULLABLE", "Tanggal aktual pelaksanaan perbaikan unit"),
        ("11", "deadline", "DATE", "NULLABLE", "Batas waktu target penyelesaian tiket servis"),
        ("12", "status", "VARCHAR(255)", "NOT NULL", "Status pembayaran servis ('berbayar' / 'tidak_berbayar')"),
        ("13", "status_note", "VARCHAR(255)", "NULLABLE", "Keterangan jaminan bebas biaya ('Garansi' / 'Free Service'), NULL bila berbayar"),
        ("14", "work_status", "VARCHAR(255)", "NOT NULL, DEFAULT 'belum_selesai'", "Status pengerjaan tiket servis ('belum_selesai' / 'selesai')"),
        ("15", "work_types", "JSONB", "NOT NULL", "Array JSON tindakan servis Sharp (Standart, Minor, Mayor, Bracket, dll.)"),
        ("16", "other_work_text", "VARCHAR(255)", "NULLABLE", "Deskripsi tindakan servis jika memilih opsi checklist 'Lain-lain'"),
        ("17", "start_time", "VARCHAR(255)", "NULLABLE", "Waktu mulai penanganan servis di lokasi konsumen (format hh:mm)"),
        ("18", "finish_time", "VARCHAR(255)", "NULLABLE", "Waktu selesai penanganan servis di lokasi konsumen (hh:mm)"),
        ("19", "visit_photo", "VARCHAR(255)", "NULLABLE", "Tautan URL foto kondisi unit saat kedatangan teknisi di storage"),
        ("20", "completion_photo", "VARCHAR(255)", "NULLABLE", "Tautan URL foto kondisi unit setelah perbaikan selesai di storage"),
        ("21", "notes", "TEXT", "NULLABLE", "Catatan diagnosis kerusakan teknis dan suku cadang sparepart"),
        ("22", "created_at / updated_at", "TIMESTAMP", "NULLABLE", "Jejak audit waktu pencatatan dan pembaruan data sistem")
    ]
    for r_idx, r_data in enumerate(t_rows, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_tspec.cell(r_idx, c_idx)
            c.text = val
            set_cell_background(c, bg)
            set_cell_margins(c, 40, 40, 60, 60)
            p = c.paragraphs[0]
            if c_idx in [0, 2, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.size = Pt(8.5)

    # --- BAB 7: KEUNTUNGAN NORMALISASI ---
    add_h1("7. Manfaat Penerapan Normalisasi 3NF pada ServiceHub")
    benefits = [
        ("Efisiensi Media Penyimpanan: ", "Mengurangi redundansi data pengguna dengan memusatkan penyimpanan atribut profil pada tabel master USERS, sehingga data identitas pengguna tidak diduplikasi pada setiap rekaman transaksi tiket servis."),
        ("Pencegahan Anomali Modifikasi: ", "Perubahan profil pengguna (nama/email) cukup dieksekusi satu kali pada tabel master USERS tanpa memengaruhi integritas relasional rekaman riwayat tiket servis terkait."),
        ("Integritas Referensial & Perlindungan Arsip Audit: ", "Penerapan Foreign Key (created_by) dengan batasan referensial ON DELETE SET NULL melindungi rekaman tiket servis dari penghapusan berantai (cascade delete), sehingga data riwayat pengerjaan Sharp tetap tersimpan sebagai arsip audit operasional perusahaan ketika akun pengguna dihapus."),
        ("Kombinasi Kunci yang Optimal: ", "Pemisahan peran notif_number sebagai Natural Identifier bisnis (UNIQUE) dan id sebagai Surrogate Primary Key fisik mendukung efisiensi kueri B-Tree PostgreSQL sekaligus memberikan identifier teknis yang stabil bagi relasi basis data.")
    ]
    for b_title, b_desc in benefits:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r1 = bp.add_run(b_title)
        r1.bold = True
        bp.add_run(b_desc)

    doc.save(output_path)
    print(f"Document successfully regenerated at: {output_path}")

if __name__ == "__main__":
    out_file = r"c:\Users\An\Herd\servicehub\Normalisasi_Basis_Data_ServiceHub.docx"
    generate_perfect_normalisasi_doc(out_file)
