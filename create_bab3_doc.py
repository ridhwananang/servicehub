import os
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag.endswith('shd'):
            tcPr.remove(child)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
    tcPr = cell._tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag.endswith('tcMar'):
            tcPr.remove(child)
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4"):
    tblPr = table._tbl.tblPr
    for child in list(tblPr):
        if child.tag.endswith('tblBorders'):
            tblPr.remove(child)
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)


# =============================================================================
# DAFTAR ISTILAH ASING (ITALIC SESUAI PANDUAN PENULISAN LAPORAN UNPAM HLMN 4 POIN N)
# =============================================================================
FOREIGN_TERMS = [
    # Multi-word technical phrases (diurutkan dari terpanjang ke terpendek)
    "Unified Modeling Language",
    "Progressive Web App",
    "Vision-Language Model",
    "Optical Character Recognition",
    "Entity-Relationship Diagram",
    "Role-Based Access Control",
    "Two-Factor Authentication",
    "Relational Database Management System",
    "Third Normal Form",
    "Second Normal Form",
    "First Normal Form",
    "Unnormalized Form",
    "Transitive Functional Dependency",
    "transitive functional dependency",
    "Partial Functional Dependency",
    "partial functional dependency",
    "Full Functional Dependency",
    "full functional dependency",
    "Functional Dependency",
    "functional dependency",
    "Transitive Dependency",
    "transitive dependency",
    "Composite B-Tree Index",
    "Single-Column B-Tree Index",
    "Composite B-Tree",
    "Composite Index",
    "Surrogate Primary Key",
    "Surrogate Key",
    "Natural Identifier",
    "Candidate Key",
    "Alternate Key",
    "Primary Key Index",
    "Single-Column Index",
    "Primary Key",
    "Foreign Key",
    "Unique Key",
    "Unique Constraint Index",
    "Activity Diagram",
    "Use Case Diagram",
    "Sequence Diagram",
    "Crow's Foot",
    "Blackbox Testing",
    "blackbox testing",
    "double data entry",
    "human error",
    "file-sort",
    "File-Sort",
    "audit trail",
    "Audit Trail",
    "real-time",
    "multi-select",
    "repeating groups",
    "atomic value",
    "insert anomaly",
    "update anomaly",
    "delete anomaly",
    "cascade delete",
    "cascading delete",
    "referential action",
    "Referential Action",
    "query processing",
    "cloud storage",
    "cloud server",
    "Service Center",
    "service center",
    "Web App",
    "web app",
    "mobile native",
    "mobile responsive",
    "user manual",
    "User Manual",
    "manual program",
    "System Design",
    "system design",
    "One-to-Many",
    "Many-to-One",
    
    # Specific tech names & single words
    "Flowchart",
    "flowchart",
    "database",
    "Database",
    "query",
    "queries",
    "framework",
    "Framework",
    "smartphone",
    "smartphones",
    "browser",
    "dashboard",
    "Dashboard",
    "spreadsheet",
    "wireframe",
    "mockup",
    "login",
    "Login",
    "logout",
    "Logout",
    "session",
    "token",
    "tokens",
    "storage",
    "Storage",
    "server",
    "Server",
    "servers",
    "multivalued",
    "atomic",
    "Atomic",
    "constraint",
    "constraints",
    "Constraint",
    "checklist",
    "dropdown",
    "submit",
    "Submit",
    "scanner",
    "scanning",
    "caching",
    "installable",
    "responsive",
    "client-side",
    "server-side",
    "front-end",
    "back-end",
    "full-stack",
    "native",
    "B-Tree",
    "B-tree",
    "Bcrypt",
    "bcrypt",
    "hash",
    "As-Is",
    "as-is",
    "To-Be",
    "to-be",
    "delayed",
    "testing",
    "Testing",
    "nullable",
    "Nullable",
    "filtering",
    "Identity",
    "timestamps",
    "Inertia.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Shadcn",
    "Laravel Fortify",
    
    # Code & Schema attributes (PostgreSQL)
    "service_tickets",
    "users",
    "created_by",
    "work_types",
    "other_work_text",
    "customer_name",
    "customer_phone",
    "customer_address",
    "unit_model",
    "serial_number",
    "service_date",
    "deadline",
    "work_status",
    "status_note",
    "mainwork_center",
    "start_time",
    "finish_time",
    "visit_photo",
    "completion_photo",
    "two_factor_secret",
    "two_factor_recovery_codes",
    "two_factor_confirmed_at",
    "remember_token",
    "email_verified_at",
    "Flowchart",
    "flowchart",
    "Flowcharts",
    "flowcharts",
    "Black Box Testing",
    "Blackbox Testing",
    "black box testing",
    "Equivalence Partitioning",
    "equivalence partitioning",
    "Boundary Value Analysis",
    "boundary value analysis",
    "Wireframe",
    "wireframe",
    "Mockup",
    "mockup",
    "User Manual",
    "user manual",
    "Prompt Engineering",
    "prompt engineering",
    "Structured Output",
    "structured output",
    "Data Transfer Object",
    "Data Transfer Objects",
    "Off-Screen Canvas",
    "off-screen canvas",
    "Off-Screen",
    "off-screen",
    "Aspect Ratio",
    "aspect ratio",
    "Resampling",
    "resampling",
    "Bicubic",
    "bicubic",
    "Bilinear",
    "bilinear",
    "Human-in-the-Loop",
    "human-in-the-loop",
    "Graceful Degradation",
    "graceful degradation",
    "Zero-Shot",
    "zero-shot",
    "Base64",
    "base64",
    "Payload",
    "payload",
    "Multipart",
    "multipart",
    "FormData",
    "form-data",
    "Blob",
    "blob",
    "Toast",
    "toast",
    "Badge",
    "badge",
    "Modal",
    "modal",
    "Dialog",
    "dialog",
    "Dropdown",
    "dropdown",
    "Checkbox",
    "checkbox",
    "Radio Button",
    "radio button",
    "Lucide React",
    "Lucide",
    "Sonner",
    "sonner",
    "Radix UI",
    "Radix",
    "Identity",
    "identity"
]

FOREIGN_TERMS = sorted(list(set(FOREIGN_TERMS)), key=len, reverse=True)
pattern_str = r'\b(' + '|'.join(re.escape(t) for t in FOREIGN_TERMS) + r')\b'
REGEX_FOREIGN = re.compile(pattern_str)

def tokenize_text(text):
    tokens = []
    last_idx = 0
    for match in REGEX_FOREIGN.finditer(text):
        start, end = match.span()
        if start > last_idx:
            tokens.append((text[last_idx:start], False))
        tokens.append((match.group(0), True))
        last_idx = end
    if last_idx < len(text):
        tokens.append((text[last_idx:], False))
    return tokens

def add_formatted_runs(paragraph, text, font_size=12, bold=False, italic=False, color=RGBColor(0, 0, 0)):
    if not text:
        return
    if italic:
        r = paragraph.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(font_size)
        r.font.bold = bold
        r.font.italic = True
        r.font.color.rgb = color
        return
    tokens = tokenize_text(text)
    for chunk, is_foreign in tokens:
        if not chunk:
            continue
        r = paragraph.add_run(chunk)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(font_size)
        r.font.bold = bold
        r.font.italic = is_foreign
        r.font.color.rgb = color

def set_cell_formatted(cell, text, font_size=8.5, bold=False, align=None, color=RGBColor(0, 0, 0)):
    p = cell.paragraphs[0]
    p.text = ""
    for r in list(p.runs):
        p._p.remove(r._r)
    if align is not None:
        p.alignment = align
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    add_formatted_runs(p, text, font_size=font_size, bold=bold, italic=False, color=color)

def build_bab3_document(output_path):
    doc = docx.Document()

    # --- 1. SETUP PAGE MARGINS & PAPER (A4, Top 4cm, Left 4cm, Right 3cm, Bottom 3cm - UNPAM Standard) ---
    section = doc.sections[0]
    section.page_width = Inches(8.27)     # 21.0 cm (A4)
    section.page_height = Inches(11.69)    # 29.7 cm (A4)
    section.top_margin = Inches(1.575)     # 4 cm (Panduan UNPAM Halaman 4)
    section.bottom_margin = Inches(1.181)  # 3 cm
    section.left_margin = Inches(1.575)    # 4 cm
    section.right_margin = Inches(1.181)   # 3 cm

    # --- 2. SETUP PAGE NUMBERING (Panduan UNPAM Halaman 4 Poin n) ---
    # Aturan UNPAM:
    # 1) Halaman judul bab: nomor halaman diletakkan di tengah bawah
    # 2) Halaman lainnya: nomor halaman diletakkan di kanan atas
    section.different_first_page_header_footer = True

    # First page footer (Center bottom)
    p_ff = section.first_page_footer.paragraphs[0]
    p_ff.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ff_r = p_ff.add_run()
    p_ff_r.font.name = 'Times New Roman'
    p_ff_r.font.size = Pt(12)
    xml_fld1 = f'<w:fldSimple {nsdecls("w")} w:instr="PAGE"/>'
    p_ff._p.append(parse_xml(xml_fld1))

    # Subsequent pages header (Right top)
    p_h = section.header.paragraphs[0]
    p_h.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_h_r = p_h.add_run()
    p_h_r.font.name = 'Times New Roman'
    p_h_r.font.size = Pt(12)
    xml_fld2 = f'<w:fldSimple {nsdecls("w")} w:instr="PAGE"/>'
    p_h._p.append(parse_xml(xml_fld2))

    # --- 3. TYPOGRAPHY & STYLES (Times New Roman 12, Spasi 1.5 - UNPAM Standard) ---
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.line_spacing = 1.5  # Wajib 1,5 UNPAM

    def add_p(text, bold_prefix="", italic=False, space_after=6, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.line_spacing = 1.5  # Spasi 1,5 wajib UNPAM
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        if bold_prefix:
            add_formatted_runs(p, bold_prefix, font_size=12, bold=True, italic=italic)
        add_formatted_runs(p, text, font_size=12, bold=False, italic=italic)
        return p

    def add_caption(text, is_table=False):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER  # Diletakkan di tengah-tengah
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.italic = True
        r.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        add_formatted_runs(p, text, font_size=12, bold=True)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        add_formatted_runs(p, text, font_size=12, bold=True)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        add_formatted_runs(p, text, font_size=12, bold=True)
        return p

    def add_code_listing(code_text, caption=""):
        """
        Membungkus pseudocode ke dalam container card profesional (Panduan UNPAM: Consolas, spasi 1.0):
        - Baris 0 (Header): Background biru Sharp (#1E3A8A) dengan judul/caption listing
        - Baris 1 (Body): Background abu-abu terang (#F8FAFC) dengan border (#CBD5E1)
        - Font Consolas 9.0 pt, spasi 1.0, dengan syntax highlighting
        """
        table = doc.add_table(rows=2, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="single" w:sz="8" w:space="0" w:color="1E3A8A"/>'
            f'<w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
            f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
            f'<w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
            f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            f'<w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)

        # 1. Header Row
        cell_hdr = table.cell(0, 0)
        cell_hdr.width = Inches(5.51)
        set_cell_background(cell_hdr, "1E3A8A")
        set_cell_margins(cell_hdr, top=70, bottom=70, left=140, right=140)

        p_hdr = cell_hdr.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_hdr.paragraph_format.line_spacing = 1.0
        p_hdr.paragraph_format.space_before = Pt(2)
        p_hdr.paragraph_format.space_after = Pt(2)
        header_title = caption if caption else "Listing Program / Notasi Algoritma Formal"
        r_hdr = p_hdr.add_run(header_title)
        r_hdr.font.name = 'Consolas'
        r_hdr.font.size = Pt(9.5)
        r_hdr.font.bold = True
        r_hdr.font.color.rgb = RGBColor(255, 255, 255)

        # 2. Body Row
        cell_body = table.cell(1, 0)
        cell_body.width = Inches(5.51)
        set_cell_background(cell_body, "F8FAFC")
        set_cell_margins(cell_body, top=100, bottom=100, left=140, right=140)

        lines = code_text.strip().split("\n")
        p_body = cell_body.paragraphs[0]
        p_body.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_body.paragraph_format.line_spacing = 1.0
        p_body.paragraph_format.space_before = Pt(0)
        p_body.paragraph_format.space_after = Pt(1.5)

        keywords_major = ["ALGORITMA", "MASUKAN", "KELUARAN", "DEKLARASI", "LANGKAH-LANGKAH", "SELESAI ALGORITMA"]
        control_flow = ["JIKA", "MAKA", "AKHIR JIKA", "SEBALIKNYA", "COBA", "TANGKAP", "AKHIR COBA", "LEMPAR", "KEMBALIKAN", "TUNGGU", "BULATKAN"]
        compound_kws = ["LANGKAH-LANGKAH", "SELESAI ALGORITMA", "AKHIR JIKA", "AKHIR COBA"]

        for i, line in enumerate(lines):
            if i > 0:
                p_line = cell_body.add_paragraph()
                p_line.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p_line.paragraph_format.line_spacing = 1.0
                p_line.paragraph_format.space_before = Pt(0)
                p_line.paragraph_format.space_after = Pt(1.5)
            else:
                p_line = p_body

            if "//" in line:
                code_part, comment_part = line.split("//", 1)
                comment_text = "//" + comment_part
            else:
                code_part = line
                comment_text = ""

            trimmed = code_part.strip()
            is_major = any(trimmed.startswith(k) for k in keywords_major)

            pattern = r"(\b(?:LANGKAH-LANGKAH|SELESAI ALGORITMA|AKHIR JIKA|AKHIR COBA)\b|\b[A-Z_]{2,}\b|<-|'[^']*'|\b\d+\b)"
            tokens = re.split(pattern, code_part)
            for tok in tokens:
                if not tok:
                    continue
                r = p_line.add_run(tok)
                r.font.name = 'Consolas'
                r.font.size = Pt(9.0)
                if tok in keywords_major or (is_major and any(k in tok for k in keywords_major)):
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(30, 58, 138)  # #1E3A8A Navy
                elif tok in control_flow or tok in ["ATAU", "DAN", "BUKAN"]:
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(15, 23, 42)   # Dark Slate
                elif tok == "<-":
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(37, 99, 235)  # #2563EB Blue
                elif tok.startswith("'") and tok.endswith("'"):
                    r.font.color.rgb = RGBColor(13, 148, 136) # #0D9488 Teal
                else:
                    r.font.color.rgb = RGBColor(30, 41, 59)   # Default code text

            if comment_text:
                r_c = p_line.add_run(comment_text)
                r_c.font.name = 'Consolas'
                r_c.font.size = Pt(8.5)
                r_c.font.italic = True
                r_c.font.color.rgb = RGBColor(100, 116, 139) # #64748B Slate gray

        doc.add_paragraph().paragraph_format.space_after = Pt(4)
        return table

    def add_callout(text, prefix="Catatan Analisis: "):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, 80, 80, 140, 120)

        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="1E3A8A"/>'
            f'<w:top w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'<w:bottom w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)

        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(0)
        add_formatted_runs(p, prefix, font_size=10.5, bold=True, color=RGBColor(30, 58, 138))
        add_formatted_runs(p, text, font_size=10.5, italic=True, color=RGBColor(51, 65, 85))
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    def add_image_safe(img_path, caption_text, width_inch=5.4):
        if os.path.exists(img_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run()
            run.add_picture(img_path, width=Inches(width_inch))
            add_caption(caption_text)
        else:
            add_callout(f"File gambar tidak ditemukan pada jalur: {img_path}", prefix="Perhatian: ")

    # =========================================================================
    # JUDUL BAB III (Panduan UNPAM: BAB dan JUDUL BAB dicetak HURUF KAPITAL)
    # =========================================================================
    p_bab = doc.add_paragraph()
    p_bab.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_bab.paragraph_format.line_spacing = 1.5
    p_bab.paragraph_format.space_before = Pt(0)
    p_bab.paragraph_format.space_after = Pt(0)
    r_b = p_bab.add_run("BAB III")
    r_b.font.name = 'Times New Roman'
    r_b.font.size = Pt(14)
    r_b.font.bold = True
    r_b.font.color.rgb = RGBColor(0, 0, 0)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.line_spacing = 1.5
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(18)
    r_sub = p_title.add_run("PEMBAHASAN")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(14)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0, 0, 0)

    # =========================================================================
    # 3.1 TINJAUAN PUSTAKA
    # =========================================================================
    add_h1("3.1 Tinjauan Pustaka")
    add_p(
        "Tinjauan pustaka memuat landasan teoretis yang digunakan sebagai acuan ilmiah dalam pelaksanaan kerja praktek "
        "dan perancangan perangkat lunak ServiceHub (Aquos Platinum) di PT. Sharp Electronics Indonesia. Teori-teori utama "
        "mencakup pemodelan sistem berorientasi objek dengan Unified Modeling Language (UML), prinsip normalisasi basis data relasional, "
        "arsitektur Progressive Web App (PWA), serta integrasi Vision-Language Model (VLM) untuk otomatisasi data operasional."
    )

    add_h2("3.1.1 Unified Modeling Language (UML)")
    add_p(
        "Unified Modeling Language (UML) merupakan bahasa standar industri untuk memvisualisasikan, menspesifikasikan, "
        "membangun, dan mendokumentasikan artefak dari sistem perangkat lunak berorientasi objek. Berdasarkan standar UML 2.5, "
        "diagram yang digunakan dalam perancangan sistem ServiceHub meliputi:\n\n"
        "1. Activity Diagram: Memodelkan aliran kerja (workflow) proses bisnis dari satu aktivitas ke aktivitas lainnya, "
        "baik pada sistem manual yang sedang berjalan (As-Is) maupun sistem usulan berbasis digital (To-Be).\n"
        "2. Use Case Diagram: Menggambarkan fungsionalitas sistem dari sudut pandang pengguna eksternal (aktor), "
        "menjelaskan batasan sistem, serta interaksi antara Admin Service Center dan Teknisi Lapangan dengan modul aplikasi.\n"
        "3. Sequence Diagram: Menggambarkan interaksi dinamis antar-objek atau komponen sistem yang disusun dalam urutan waktu tertentu."
    )

    add_h2("3.1.2 Basis Data Relasional dan Normalisasi")
    add_p(
        "Basis data relasional mengorganisasikan data ke dalam tabel-tabel dua dimensi yang terdiri atas baris (rekaman) "
        "dan kolom (atribut). Teori normalisasi basis data yang digagas oleh E.F. Codd dan dikembangkan oleh Connolly & Begg serta Fathansyah "
        "merupakan teknik terstruktur untuk menganalisis ketergantungan atribut fungsional (functional dependency). "
        "Tujuan utama normalisasi adalah meminimalkan redundansi data dan mencegah terjadinya anomali modifikasi (insert anomaly, "
        "update anomaly, dan delete anomaly) dengan memecah relasi hingga memenuhi kriteria Bentuk Normal Ketiga (3NF)."
    )

    add_h2("3.1.3 Progressive Web App (PWA) dan Vision-Language Model (VLM)")
    add_p(
        "Sistem ServiceHub dirancang menggunakan arsitektur Progressive Web App (PWA) berbasis Laravel 11, Inertia.js, dan React TypeScript. "
        "PWA memungkinkan aplikasi web diakses melalui perangkat mobile dengan karakteristik antarmuka responsif dan dapat diinstal pada perangkat yang mendukung "
        "tanpa kendala distribusi toko aplikasi. Selain itu, sistem mengintegrasikan Vision-Language Model (VLM) mutakhir untuk mengekstraksi "
        "data teks tulisan tangan dan cetak pada formulir fisik Surat Perintah Kerja (SPK) Sharp menjadi data terstruktur JSON secara otomatis, "
        "sehingga memangkas waktu entri data secara signifikan."
    )

    # =========================================================================
    # 3.2 PROSEDUR KERJA PRAKTEK
    # =========================================================================
    add_h1("3.2 Prosedur Kerja Praktek")
    add_p(
        "Prosedur kerja praktek merupakan tahapan sistematis yang dilaksanakan selama kegiatan kerja praktek di PT. Sharp Electronics Indonesia. "
        "Tahapan ini mencakup investigasi alur operasional pencatatan servis manual, perancangan sistem perangkat lunak (System Design), "
        "serta perancangan arsitektur logika dan basis data aplikasi ServiceHub."
    )

    add_h2("3.2.1 Perancangan Sistem (System Design)")
    add_p(
        "Perancangan sistem menjabarkan transformasi proses bisnis dan pemodelan teknis aplikasi ServiceHub yang mencakup "
        "Activity Diagram sistem berjalan, Activity Diagram sistem usulan, Use Case Diagram beserta spesifikasi use case, "
        "dan Normalisasi Basis Data secara komprehensif."
    )

    # -------------------------------------------------------------------------
    # A. ACTIVITY DIAGRAM SISTEM BERJALAN (AS-IS)
    # -------------------------------------------------------------------------
    add_h3("A. Activity Diagram Sistem Berjalan (As-Is)")
    add_p(
        "Sistem penanganan Surat Perintah Kerja (SPK) yang berjalan saat ini di PT. Sharp Electronics Indonesia masih "
        "mengandalkan formulir kertas fisik konvensional rangkap tiga. Alur operasional sistem berjalan melibatkan tiga entitas "
        "atau swimlane utama, yaitu Pelanggan (Customer), Admin Service Center, dan Teknisi Lapangan sebagaimana dipetakan pada Gambar 3.1."
    )

    add_p(
        "1. Pelanggan (Customer) menyampaikan keluhan dan rincian kerusakan unit perangkat TV Sharp Aquos kepada pihak service center, baik melalui sambungan telepon maupun datang langsung ke kantor cabang.\n"
        "2. Admin Service Center menerima keluhan tersebut dan mencatat seluruh rincian keluhan ke dalam lembar formulir fisik SPK kertas rangkap tiga.\n"
        "3. Admin meletakkan lembaran SPK fisik ke dalam buku tugas atau keranjang penugasan harian teknisi sesuai jadwal kerja operasional.\n"
        "4. Teknisi Lapangan mengambil berkas SPK fisik dari buku tugas dan menyusun rute perjalanan kunjungan servis mandiri sesuai sebaran lokasi domisili pelanggan.\n"
        "5. Teknisi mendatangi lokasi pelanggan, memeriksa kondisi fisik unit TV Sharp, dan mendiagnosis kerusakan perangkat sesuai prosedur.\n"
        "6. Teknisi melakukan perbaikan unit, mencatat perincian hasil pengerjaan (termasuk pergantian suku cadang jika ada) pada lembar kertas SPK, dan meminta tanda tangan fisik pelanggan sebagai bukti serah terima pekerjaan selesai.\n"
        "7. Teknisi membawa kembali lembaran SPK fisik ke kantor service center setelah seluruh rangkaian kunjungan kerja lapangan selesai.\n"
        "8. Admin menerima berkas SPK fisik yang telah ditandatangani, lalu mengetik ulang seluruh data pengerjaan servis ke program spreadsheet (Microsoft Excel) atau buku rekapitulasi untuk keperluan dokumentasi dan pelaporan manajemen.",
        bold_prefix="Uraian Aktivitas Alur Berjalan:\n"
    )

    # Embed Image Activity Diagram As-Is
    img_as_is = os.path.join(r"c:\Users\An\Herd\servicehub", "activity_diagram_sistem_berjalan_clean.png")
    add_image_safe(img_as_is, "Gambar 3.1 Activity Diagram Sistem Berjalan (As-Is Manual SPK)")

    add_p("Tabel 3.1 Analisis Kelemahan pada Sistem Berjalan (As-Is)", italic=True)
    t_kelemahan = doc.add_table(rows=5, cols=4)
    t_kelemahan.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_kelemahan)
    h_kel = ["No", "Aspek Operasional", "Permasalahan Sistem Berjalan (As-Is)", "Dampak terhadap Perusahaan"]
    for i, h in enumerate(h_kel):
        c = t_kelemahan.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 80, 80)
        set_cell_formatted(c, h, font_size=9.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    r_kel = [
        ("1", "Media Dokumentasi", "Menggunakan kertas fisik rangkap tiga yang rentan sobek, basah, atau hilang selama perjalanan teknisi.", "Risiko hilangnya arsip bukti penanganan servis konsumen."),
        ("2", "Proses Entri Data", "Terjadi penginputan ganda (double data entry), teknisi menulis manual lalu admin mengetik ulang ke spreadsheet.", "Pemborosan waktu kerja dan potensi human error saat input ulang."),
        ("3", "Visibilitas & Tracking", "Admin tidak dapat memantau status pengerjaan unit secara real-time saat teknisi berada di lapangan.", "Komunikasi status ke konsumen terhambat dan lambat."),
        ("4", "Klaim Garansi & Audit", "Verifikasi status garansi produk memerlukan pencarian manual dokumen arsip fisik lama.", "Proses rekonsiliasi biaya garansi internal menjadi lambat.")
    ]
    for r_idx, r_data in enumerate(r_kel, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_kelemahan.cell(r_idx, c_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 70, 70)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx == 0 else WD_ALIGN_PARAGRAPH.JUSTIFY
            set_cell_formatted(c, val, font_size=9.0, bold=False, align=align, color=RGBColor(0, 0, 0))

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------------------
    # B. ACTIVITY DIAGRAM SISTEM USULAN (TO-BE)
    # -------------------------------------------------------------------------
    add_h3("B. Activity Diagram Sistem Usulan (To-Be)")
    add_p(
        "Sistem usulan ServiceHub mentransformasi seluruh alur kerja manual menjadi sistem digital terintegrasi berbasis "
        "web app dengan dukungan kecerdasan buatan Vision-Language Model (VLM). Alur kerja sistem usulan melibatkan tiga "
        "swimlane terintegrasi, yaitu Admin Service Center, Sistem Pelaporan Teknisi (Web App, VLM, PostgreSQL, dan Cloud Storage S3), "
        "serta Teknisi Lapangan sebagaimana divisualisasikan pada Gambar 3.2."
    )

    add_p(
        "1. Admin Service Center menerima order servis baru dan mengunggah foto lembar SPK fisik ke dalam sistem melalui web app ServiceHub.\n"
        "2. Sistem Pelaporan Teknisi mengekstrak data teks dan informasi dokumen SPK secara otomatis menggunakan modul Vision-Language Model (VLM) / OCR, lalu mengisikan hasil ekstraksi ke formulir tiket digital.\n"
        "3. Sistem mengevaluasi kelengkapan data. Apabila hasil ekstraksi belum lengkap atau memerlukan penyesuaian, Admin melakukan validasi dan koreksi data secara langsung melalui antarmuka web.\n"
        "4. Sistem Pelaporan Teknisi menyimpan data tiket servis ke basis data PostgreSQL dengan status awal tiket 'Open' (secara fisik bernilai belum_selesai) serta mencatat akun pengguna pembuat tiket pada kolom created_by.\n"
        "5. Koordinator operasional cabang melakukan koordinasi penugasan tiket secara operasional kepada teknisi lapangan sesuai wilayah pusat kerja (mainwork_center: Pulogadung atau Mall of Indonesia). Pada sistem ServiceHub, tiket terdata sebagai ruang kerja bersama (shared workspace) yang dapat diakses oleh teknisi terkait berdasarkan penugasan operasional tersebut.\n"
        "6. Teknisi Lapangan menerima penugasan servis melalui aplikasi web app (Progressive Web App / PWA), melihat detail tiket servis, rute perjalanan menuju alamat pelanggan, dan informasi unit.\n"
        "7. Teknisi mendatangi lokasi pelanggan, memeriksa kondisi perangkat TV Sharp, dan mendiagnosis kerusakan sesuai standar operasional prosedur perusahaan.\n"
        "8. Teknisi melaksanakan tindakan perbaikan unit di lokasi, mencatat rincian pengerjaan teknis, dan meminta konfirmasi pelanggan (konfirmasi penyelesaian perbaikan pada web app).\n"
        "9. Teknisi mengunggah foto dokumentasi hasil servis (foto kedatangan/visit dan foto penyelesaian/completion) serta melengkapi form laporan hasil servis melalui web app.\n"
        "10. Sistem Pelaporan Teknisi mengirimkan berkas foto ke Cloud Storage (S3), memperbarui data laporan ke basis data PostgreSQL, dan secara otomatis mengubah status tiket menjadi 'Selesai' (work_status = selesai).\n"
        "11. Admin Service Center memantau status perkembangan seluruh tiket secara real-time melalui dashboard analitik dan dapat mengunduh rekapitulasi laporan servis dalam format CSV / Excel kapan pun dibutuhkan.",
        bold_prefix="Uraian Aktivitas Alur Usulan:\n"
    )

    # Embed Image Activity Diagram To-Be
    img_to_be = os.path.join(r"c:\Users\An\Herd\servicehub", "activity_diagram_sistem_usulan_clean.png")
    add_image_safe(img_to_be, "Gambar 3.2 Activity Diagram Sistem Usulan (To-Be ServiceHub PWA)")

    # Komparasi As-Is vs To-Be
    add_p("Tabel 3.2 Matriks Perbandingan Sistem Berjalan (As-Is) vs Sistem Usulan (To-Be)", italic=True)
    t_komparasi = doc.add_table(rows=6, cols=4)
    t_komparasi.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_komparasi)
    h_komp = ["No", "Parameter Evaluasi", "Sistem Berjalan (Manual SPK)", "Sistem Usulan (ServiceHub)"]
    for i, h in enumerate(h_komp):
        c = t_komparasi.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 80, 80)
        set_cell_formatted(c, h, font_size=9.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    r_komp = [
        ("1", "Media Pencatatan", "Kertas formulir fisik manual rangkap tiga.", "Digital Progressive Web App (PWA) tersentralisasi di PostgreSQL."),
        ("2", "Metode Entri Data", "Penulisan manual dengan pena dan input ulang di Excel.", "Formulir digital responsif dan auto-ekstraksi foto SPK dengan AI VLM."),
        ("3", "Pemantauan Status", "Menunggu teknisi kembali membawa lembar SPK (delayed).", "Pelacakan status pengerjaan tiket secara real-time di dashboard web."),
        ("4", "Dokumentasi Bukti Servis", "Tanda tangan basah di kertas, tidak ada arsip foto visual.", "Foto visual sebelum (visit) & sesudah servis (completion) di cloud storage."),
        ("5", "Penyusunan Rekapitulasi", "Merekap manual satu per satu dari tumpukan kertas.", "Ekspor instan rekapitulasi tiket ke format CSV dan Microsoft Excel.")
    ]
    for r_idx, r_data in enumerate(r_komp, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_komparasi.cell(r_idx, c_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 70, 70)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx == 0 else WD_ALIGN_PARAGRAPH.JUSTIFY
            set_cell_formatted(c, val, font_size=9.0, bold=False, align=align, color=RGBColor(0, 0, 0))

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------------------
    # C. USE CASE DIAGRAM & SPESIFIKASI USE CASE
    # -------------------------------------------------------------------------
    add_h3("C. Use Case Diagram dan Spesifikasi Use Case")
    add_p(
        "Use Case Diagram menggambarkan batasan fungsional sistem ServiceHub dan interaksi antara aktor pengguna dengan sistem. "
        "Sistem ServiceHub memiliki dua aktor utama dengan hak akses berbasis peran (Role-Based Access Control / RBAC):\n\n"
        "1. Admin Service Center: Bertanggung jawab atas autentikasi (Login/Logout), pengelolaan tiket servis dengan integrasi Vision-Language Model (VLM), "
        "penugasan teknisi, pemantauan status pengerjaan tiket di dashboard, peninjauan laporan hasil servis, serta pengunduhan rekapitulasi data (CSV/Excel).\n"
        "2. Teknisi Lapangan: Bertanggung jawab atas autentikasi (Login/Logout), melihat daftar tugas servis, memeriksa detail tiket dan informasi pelanggan, "
        "mengakses peta lokasi dan rute navigasi, mencatat diagnosis kerusakan dan hasil perbaikan, mengunggah dokumentasi foto servis (sebelum dan sesudah), "
        "serta mengirimkan laporan penyelesaian servis."
    )

    # Embed Use Case Diagram Image
    img_use_case = os.path.join(r"c:\Users\An\Herd\servicehub", "use_case_diagram_servicehub_clean.png")
    add_image_safe(img_use_case, "Gambar 3.3 Use Case Diagram Sistem Pelaporan Teknisi ServiceHub PT. Sharp Electronics Indonesia")

    add_p("Tabel 3.3 Daftar dan Spesifikasi Kebutuhan Fungsional Use Case (UC-01 s/d UC-14)", italic=True)
    t_uc = doc.add_table(rows=15, cols=4)
    t_uc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_uc)
    h_uc = ["Kode", "Nama Use Case", "Aktor Utama", "Deskripsi Fungsionalitas"]
    for i, h in enumerate(h_uc):
        c = t_uc.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 80, 80)
        set_cell_formatted(c, h, font_size=9.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    r_uc = [
        ("UC-01", "Login", "Admin, Teknisi", "Melakukan autentikasi akun pengguna menggunakan alamat email dan kata sandi untuk mengakses sistem ServiceHub sesuai peran masing-masing."),
        ("UC-02", "Mengelola Tiket Servis via AI Scanner", "Admin", "Mengelola data tiket servis melalui alur pemindaian cerdas berbasis Vision-Language Model: Mengunggah Foto SPK (<<include>>), Ekstraksi Data SPK dengan VLM (<<include>>), Validasi & Koreksi Data (<<include>>), serta Menyimpan Tiket (<<include>>) ke basis data."),
        ("UC-03", "Perekaman Tiket Manual & Koordinasi Penugasan", "Admin", "Mencatat transaksi tiket servis secara manual serta mengkoordinasikan penugasan tiket servis secara operasional kepada teknisi lapangan berdasarkan wilayah pusat kerja (mainwork_center) dan jadwal operasional cabang."),
        ("UC-04", "Memantau Status Tiket", "Admin", "Melihat dan memantau perkembangan status penanganan seluruh tiket servis secara real-time pada antarmuka dashboard operasional."),
        ("UC-05", "Melihat Laporan & Detail Servis", "Admin", "Meninjau laporan hasil servis yang dikirimkan oleh teknisi lapangan secara terperinci (<<include>> Melihat Detail Laporan)."),
        ("UC-06", "Mengunduh Rekapitulasi (CSV / Excel)", "Admin", "Mengekspor data rekapitulasi penanganan tiket servis ke dalam berkas laporan berformat Microsoft Excel (.xlsx) atau CSV."),
        ("UC-07", "Melihat Tugas Servis", "Teknisi", "Membuka dan melihat daftar tugas tiket servis yang teralokasi pada wilayah kerjanya melalui aplikasi mobile Progressive Web App (PWA)."),
        ("UC-08", "Melihat Detail Tiket", "Teknisi", "Memeriksa rincian data pelanggan, kontak telepon, spesifikasi model unit elektronik Sharp, serta keluhan kerusakan unit."),
        ("UC-09", "Melihat Lokasi Pelanggan & Rute", "Teknisi", "Mengakses peta navigasi digital menuju lokasi alamat pelanggan untuk memandu perjalanan pelaksanaan servis."),
        ("UC-10", "Mencatat Diagnosis & Hasil Perbaikan", "Teknisi", "Menginput catatan teknis hasil diagnosis perbaikan dan memilih opsi checklist multi-kategori tindakan perbaikan (work_types)."),
        ("UC-11", "Mengunggah & Mengompresi Foto Servis", "Teknisi", "Mengunggah dokumentasi visual foto unit yang mencakup Foto Kedatangan / Visit (<<include>>) dan Foto Selesai / Completion (<<include>>) dengan kompresi otomatis sisi klien."),
        ("UC-12", "Mengirim Laporan Servis", "Teknisi", "Mengirim finalisasi laporan hasil penanganan perbaikan dan memperbarui status pengerjaan tiket servis menjadi selesai (work_status = selesai)."),
        ("UC-13", "Logout", "Admin, Teknisi", "Mengakhiri sesi autentikasi pengguna dan keluar dari sistem web app ServiceHub."),
        ("UC-14", "Mengelola Akun Pengguna", "Admin", "Mengelola data akun pengguna sistem (Admin dan Teknisi) yang mencakup pembuatan akun baru, pembaruan data pengguna, pengaturan hak akses, dan penonaktifan akun via modul /users.")
    ]
    for r_idx, r_data in enumerate(r_uc, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_uc.cell(r_idx, c_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 70, 70)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 2] else (WD_ALIGN_PARAGRAPH.LEFT if c_idx == 1 else WD_ALIGN_PARAGRAPH.JUSTIFY)
            set_cell_formatted(c, val, font_size=8.5, bold=False, align=align, color=RGBColor(0, 0, 0))

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------------------
    # D. NORMALISASI BASIS DATA LENGKAP
    # -------------------------------------------------------------------------
    add_h3("D. Normalisasi Basis Data Sistem ServiceHub")
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
    items_spk = [
        ("Header SPK: ", "Nomor Notifikasi SPK (No Notif), Cabang Service Center (Pulogadung / MOI / Lain-lain)."),
        ("Data Pelanggan: ", "Nama Pelanggan, Nomor Telepon/WhatsApp, dan Alamat Lengkap Konsumen."),
        ("Spesifikasi Unit Sharp: ", "Model/Tipe Unit (AC Inverter 1.5 PK, Smart TV 55 Inch OLED, Kulkas) dan Nomor Seri Fisik (Serial Number)."),
        ("Detail Pengerjaan Servis: ", "Tanggal Servis, Batas Waktu (Deadline), Status Pembayaran (Berbayar / Tidak Berbayar), Keterangan Status Bebas Biaya (Garansi / Free Service), Status Pengerjaan (Belum Selesai / Selesai), Jenis Pekerjaan (Service Minor, Service Mayor, Install Bracket), Jam Mulai/Selesai, dan Catatan Diagnosis."),
        ("Dokumentasi & Petugas: ", "Foto Fisik Unit Saat Kedatangan (Visit), Foto Fisik Unit Setelah Selesai (Completion), ID Petugas, Nama Petugas, Email, dan Peran Akun.")
    ]
    for h, desc in items_spk:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.line_spacing = 1.5
        bp.paragraph_format.space_after = Pt(3)
        r = bp.add_run(h)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        r.font.color.rgb = RGBColor(0, 0, 0)
        r.bold = True
        r2 = bp.add_run(desc)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(12)
        r2.font.color.rgb = RGBColor(0, 0, 0)

    # UNF
    add_p(
        "Bentuk Tidak Normal (UNF) memuat seluruh atribut mentah yang tercatat pada formulir fisik SPK Sharp tanpa aturan relasional. "
        "Pada kondisi ini, data memuat kelompok berulang (repeating groups) pada daftar tindakan pekerjaan dan foto dokumentasi, "
        "serta data profil pengguna yang bercampur dalam satu rekaman tiket servis. "
        "Perlu ditegaskan bahwa atribut ID_Petugas pada formulir fisik merepresentasikan identitas akun pengguna yang mencatat atau membuat tiket servis ke dalam sistem, "
        "yang pada tahap perancangan fisik nantinya dipetakan secara fungsional ke kolom created_by.",
        bold_prefix="1. Bentuk Tidak Normal (Unnormalized Form / UNF):\n"
    )
    add_p(
        "SPK_UNF = (No_Notif, Cabang, Nama_Pelanggan, Telp_Pelanggan, Alamat_Pelanggan, Model_Unit, Serial_Number, "
        "Tgl_Servis, Deadline, Status_Biaya, Ket_Status, Status_Kerja, {Jenis_Pekerjaan}, Jam_Mulai, Jam_Selesai, "
        "{Foto_Servis}, Catatan, ID_Petugas, Nama_Petugas, Email_Petugas, Peran)",
        bold_prefix="Notasi Relasional UNF:\n"
    )

    add_p("Tabel 3.4 Sampel Data Bentuk Tidak Normal (UNF)", italic=True)
    t_unf = doc.add_table(rows=3, cols=8)
    t_unf.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_unf)
    h_unf = ["No_Notif", "Nama Pelanggan", "Model Unit", "Status Biaya", "Ket Status", "{Jenis Pekerjaan} (Repeating)", "{Foto Bukti} (Repeating)", "Nama Petugas"]
    for i, h in enumerate(h_unf):
        c = t_unf.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 70, 70)
        set_cell_formatted(c, h, font_size=8.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    r_unf = [
        ("NTF-2026-0901", "Budi Santoso", "AC Inverter 1.5 PK", "tidak_berbayar", "Garansi", "1. Service Mayor\n2. Penjelasan", "1. visit_01.jpg\n2. comp_01.jpg", "Ahmad Fauzi (Teknisi)"),
        ("NTF-2026-0902", "Siti Aminah", "Smart TV 55 Inch", "berbayar", "-", "1. Service Minor\n2. Install Bracket", "1. visit_02.jpg\n2. comp_02.jpg", "Ahmad Fauzi (Teknisi)")
    ]
    for r_idx, r_data in enumerate(r_unf, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_unf.cell(r_idx, c_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 60, 60)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 3, 4] else (WD_ALIGN_PARAGRAPH.JUSTIFY if c_idx in [1, 5, 6] else WD_ALIGN_PARAGRAPH.LEFT)
            set_cell_formatted(c, val, font_size=8.5, bold=False, align=align, color=RGBColor(0, 0, 0))

    add_callout(
        "Kelemahan Bentuk UNF: (1) Nilai atribut Jenis Pekerjaan dan Foto Bukti berupa repeating group yang bernilai banyak (non-atomic). "
        "(2) Redundansi data tinggi karena identitas petugas dicatat berulang kali pada setiap tiket. "
        "(3) Terjadi Update Anomaly bila profil petugas diperbarui karena harus memperbarui banyak baris secara simultan, "
        "serta Delete Anomaly bila suatu rekaman tiket dihapus, maka salinan informasi data petugas yang tercantum pada rekaman tiket tersebut ikut terhapus dari basis data.",
        prefix="Anomali dan Permasalahan UNF: "
    )

    # 1NF
    add_p(
        "Sebuah relasi memenuhi kriteria Bentuk Normal Pertama (1NF) jika dan hanya jika seluruh atribut bernilai skalar tunggal dan "
        "atomik (atomic value), serta tidak terdapat atribut bernilai jamak (multivalued) maupun kelompok berulang (repeating groups).\n\n"
        "• Tingkat Konseptual (Teori Relasional Klasik E.F. Codd):\n"
        "Pada fase normalisasi konseptual, setiap atribut wajib bernilai atomik murni (skalar tunggal). Atribut daftar pekerjaan "
        "tidak boleh direpresentasikan sebagai struktur array maupun koleksi, melainkan distandarisasi menjadi atribut teks skalar tunggal "
        "(jenis_pekerjaan) yang mendeskripsikan tindakan servis utama.\n\n"
        "• Tingkat Implementasi Fisik (Modern RDBMS - PostgreSQL):\n"
        "Pada arsitektur fisik sistem ServiceHub, kebutuhan operasional teknisi di lapangan yang sering kali mencakup multi-tindakan perbaikan "
        "sekaligus (checklist pekerjaan) diakomodasi melalui fitur hybrid relational-document PostgreSQL menggunakan tipe data native JSON (work_types). "
        "Pendekatan fisik ini dipilih untuk mengakomodasi kebutuhan multi-select pekerjaan tanpa menambahkan tabel detail atau tabel perantara pada implementasi aplikasi. "
        "Namun demikian, pada tahap normalisasi konseptual 1NF ini, data diformalkan secara atomik terlebih dahulu.",
        bold_prefix="2. Bentuk Normal Pertama (1NF - First Normal Form):\n"
    )

    add_p(
        "TIKET_SERVIS_1NF = (notif_number [PK], mainwork_center, customer_name, customer_phone, customer_address, "
        "unit_model, serial_number, service_date, deadline, status, status_note, work_status, jenis_pekerjaan, "
        "start_time, finish_time, visit_photo, completion_photo, notes, user_id, user_name, user_email, user_role)",
        bold_prefix="Notasi Relasional 1NF:\n"
    )

    add_p("Tabel 3.5 Sampel Data Bentuk Normal Pertama (1NF) - Seluruh Atribut Bernilai Atomik", italic=True)
    t_1nf = doc.add_table(rows=3, cols=8)
    t_1nf.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_1nf)
    h_1nf = ["notif_number (PK)", "customer_name", "unit_model", "status", "status_note", "jenis_pekerjaan", "work_status", "user_name"]
    for i, h in enumerate(h_1nf):
        c = t_1nf.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 70, 70)
        set_cell_formatted(c, h, font_size=8.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    r_1nf = [
        ("NTF-2026-0901", "Budi Santoso", "AC Inverter 1.5 PK", "tidak_berbayar", "Garansi", "Service Mayor", "selesai", "Ahmad Fauzi"),
        ("NTF-2026-0902", "Siti Aminah", "Smart TV 55 Inch", "berbayar", "-", "Service Minor", "belum_selesai", "Ahmad Fauzi")
    ]
    for r_idx, r_data in enumerate(r_1nf, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_1nf.cell(r_idx, c_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 60, 60)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 3, 4, 6] else (WD_ALIGN_PARAGRAPH.JUSTIFY if c_idx in [1, 5] else WD_ALIGN_PARAGRAPH.LEFT)
            set_cell_formatted(c, val, font_size=8.5, bold=False, align=align, color=RGBColor(0, 0, 0))

    add_callout(
        "Kondisi 1NF: Seluruh sel tabel kini berisi nilai atomik skalar tunggal. Atribut Primary Key konseptual yang ditetapkan "
        "adalah atribut tunggal (single attribute PK): notif_number.",
        prefix="Status Evaluasi 1NF: "
    )

    # 2NF
    add_p(
        "Sebuah relasi dikatakan memenuhi Bentuk Normal Kedua (2NF) apabila:\n"
        "1. Relasi telah berada dalam Bentuk Normal Pertama (1NF).\n"
        "2. Tidak terdapat ketergantungan fungsional sebagian (Partial Functional Dependency), yaitu seluruh atribut bukan kunci "
        "harus bergantung secara fungsional penuh (Full Functional Dependency) terhadap Primary Key.\n\n"
        "Berdasarkan kaidah teori relasional (E.F. Codd, Connolly & Begg, Fathansyah):\n"
        "Ketergantungan parsial hanya mungkin terjadi apabila Primary Key relasi berupa Kunci Gabungan (Composite Key). "
        "Pada relasi TIKET_SERVIS_1NF di atas, Primary Key yang ditetapkan adalah atribut tunggal (Single Attribute PK), yaitu notif_number.\n\n"
        "Karena Primary Key bersifat tunggal dan tidak memiliki komponen pecahan kunci, maka secara matematis TIDAK MUNGKIN terdapat atribut "
        "non-kunci yang bergantung hanya pada sebagian kunci. Seluruh atribut non-kunci secara otomatis memiliki ketergantungan fungsional penuh "
        "(Full Functional Dependency) terhadap notif_number:\n"
        "notif_number -> mainwork_center, customer_name, customer_phone, customer_address, unit_model, serial_number, service_date, "
        "deadline, status, status_note, work_status, jenis_pekerjaan, start_time, finish_time, visit_photo, completion_photo, notes, "
        "user_id, user_name, user_email, user_role.",
        bold_prefix="3. Bentuk Normal Kedua (2NF - Second Normal Form):\n"
    )

    add_callout(
        "Karena Primary Key berupa single attribute (notif_number), relasi tidak memiliki partial functional dependency. "
        "Oleh karena itu, struktur tabel pada tahap ini TIDAK PERLU DIPECAH dan SECARA OTOMATIS TELAH MEMENUHI BENTUK NORMAL KEDUA (2NF). "
        "Relasi tetap utuh satu tabel (TIKET_SERVIS_2NF) sama persis dengan tabel 1NF.",
        prefix="Kesimpulan Tahap 2NF: "
    )

    # 3NF
    add_p(
        "Sebuah relasi memenuhi Bentuk Normal Ketiga (3NF) jika:\n"
        "1. Relasi telah memenuhi syarat 2NF.\n"
        "2. Tidak terdapat ketergantungan transitif (Transitive Functional Dependency), di mana atribut bukan kunci tidak boleh "
        "bergantung pada atribut bukan kunci lainnya (A -> B dan B -> C, sehingga A -> C secara tidak langsung).\n\n"
        "Pada relasi TIKET_SERVIS_2NF, dilakukan evaluasi ketergantungan antar atribut non-kunci dan ditemukan Ketergantungan Transitif "
        "pada kelompok data akun pengguna pencatat tiket:\n"
        "1. notif_number -> user_id (Nomor SPK menentukan akun pengguna yang mencatat/membuat tiket servis)\n"
        "2. user_id -> user_name, user_email, user_role (ID pengguna menentukan nama, email, dan peran pengguna)\n\n"
        "Akibatnya: notif_number -> user_name, user_email, user_role terjadi secara transitif melalui user_id!\n"
        "Atribut user_name, user_email, dan user_role bukan merupakan fakta langsung mengenai tiket servis, melainkan merupakan "
        "fakta mengenai entitas pengguna (user_id).",
        bold_prefix="4. Bentuk Normal Ketiga (3NF - Third Normal Form):\n"
    )

    add_p(
        "Untuk menghilangkan ketergantungan transitif tersebut, relasi TIKET_SERVIS didekomposisi menjadi dua tabel mandiri pada tahap 3NF:\n"
        "1. USERS = (id [PK], name, email, role, password, avatar, created_at, updated_at)\n"
        "   Ketergantungan Langsung: id -> name, email, role, password, avatar\n\n"
        "2. SERVICE_TICKETS = (notif_number [PK], created_by [FK], customer_name, customer_phone, customer_address, "
        "unit_model, serial_number, service_date, deadline, status, status_note, work_status, jenis_pekerjaan, "
        "mainwork_center, start_time, finish_time, visit_photo, completion_photo, notes, created_at, updated_at)\n"
        "   Ketergantungan Langsung: notif_number -> created_by, customer_name, ..., completion_photo\n\n"
        "Pada tahap dekomposisi, atribut user_id (yang merepresentasikan ID_Petugas pencatat tiket pada relasi awal) "
        "direpresentasikan secara fungsional sebagai created_by pada tabel SERVICE_TICKETS untuk menunjukkan akun pengguna "
        "yang mencatat dan membuat tiket servis tersebut.",
        bold_prefix="Skema Relasional Konseptual Hasil Dekomposisi 3NF:\n"
    )

    # Tabel Users 3NF
    add_p("Tabel 3.6 Entitas USERS Hasil Dekomposisi 3NF", italic=True)
    t_u3 = doc.add_table(rows=3, cols=5)
    t_u3.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_u3)
    h_u3 = ["id (PK)", "name", "email", "role", "avatar"]
    for i, h in enumerate(h_u3):
        c = t_u3.cell(0, i)
        set_cell_background(c, "0284C7")
        set_cell_margins(c, 60, 60, 70, 70)
        set_cell_formatted(c, h, font_size=8.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    r_u3 = [
        ("1", "Ridhwan Anang (Admin)", "admin@sharp-servicehub.com", "admin", "avatar_admin.jpg"),
        ("2", "Ahmad Fauzi (Teknisi)", "fauzi@sharp-servicehub.com", "teknisi", "avatar_fauzi.jpg")
    ]
    for r_idx, r_data in enumerate(r_u3, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_u3.cell(r_idx, c_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 60, 60)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 3] else (WD_ALIGN_PARAGRAPH.JUSTIFY if c_idx == 1 else WD_ALIGN_PARAGRAPH.LEFT)
            set_cell_formatted(c, val, font_size=8.5, bold=False, align=align, color=RGBColor(0, 0, 0))

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Tabel Tickets 3NF
    add_p("Tabel 3.7 Entitas SERVICE_TICKETS Hasil Dekomposisi 3NF", italic=True)
    t_t3 = doc.add_table(rows=3, cols=7)
    t_t3.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_t3)
    h_t3 = ["notif_number (PK)", "created_by (FK)", "customer_name", "unit_model", "status", "jenis_pekerjaan", "work_status"]
    for i, h in enumerate(h_t3):
        c = t_t3.cell(0, i)
        set_cell_background(c, "0284C7")
        set_cell_margins(c, 60, 60, 70, 70)
        set_cell_formatted(c, h, font_size=8.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    r_t3 = [
        ("NTF-2026-0901", "2 (merujuk Users.id)", "Budi Santoso", "AC Inverter 1.5 PK", "tidak_berbayar", "Service Mayor", "selesai"),
        ("NTF-2026-0902", "2 (merujuk Users.id)", "Siti Aminah", "Smart TV 55 Inch", "berbayar", "Service Minor", "belum_selesai")
    ]
    for r_idx, r_data in enumerate(r_t3, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_t3.cell(r_idx, c_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 60, 60)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 1, 4, 6] else (WD_ALIGN_PARAGRAPH.JUSTIFY if c_idx in [2, 5] else WD_ALIGN_PARAGRAPH.LEFT)
            set_cell_formatted(c, val, font_size=8.5, bold=False, align=align, color=RGBColor(0, 0, 0))

    add_callout(
        "Setelah pemisahan pada 3NF: Seluruh atribut non-kunci pada kedua tabel hanya bergantung secara langsung dan penuh "
        "pada Primary Key masing-masing tabel. Ketergantungan transitif pada atribut pengguna telah dieliminasi melalui dekomposisi "
        "menjadi tabel USERS dan SERVICE_TICKETS, sehingga skema hasil dekomposisi memenuhi bentuk normal ketiga (3NF).",
        prefix="Status Kelulusan 3NF: "
    )

    # Implementasi Fisik PostgreSQL
    add_p(
        "Pada tingkat implementasi fisik arsitektur web modern menggunakan framework Laravel 11 dan basis data PostgreSQL, "
        "skema hasil normalisasi 3NF ini diimplementasikan dengan penyesuaian teknis, pemetaan tipe data, dan optimasi performa sebagai berikut:\n\n"
        "1. Penerapan Surrogate Primary Key (id):\n"
        "Pada level fisik tabel service_tickets, sistem menambahkan kolom id bertipe BIGINT (PostgreSQL Identity) sebagai Surrogate Primary Key. "
        "Sementara itu, notif_number yang merupakan Natural Identifier pada tahap konseptual ditetapkan dengan batasan UNIQUE KEY (UK) dan NOT NULL. "
        "Penggunaan integer 64-bit sebagai Primary Key fisik mendukung efisiensi pengindeksan B-Tree serta efisiensi relasi Foreign Key, "
        "sekaligus memberikan identifier teknis yang stabil apabila terjadi perubahan format penomoran dokumen di masa mendatang.\n\n"
        "2. Pemetaan jenis_pekerjaan Konseptual ke Tipe Data Native JSON (work_types) dan Atribut other_work_text:\n"
        "Atribut jenis_pekerjaan yang dimodelkan secara skalar atomik pada tahap normalisasi konseptual dipetakan ke kolom work_types "
        "bertipe JSON pada implementasi fisik PostgreSQL. Penyesuaian ini dilakukan untuk mengakomodasi fleksibilitas operasional "
        "teknisi lapangan di mana satu kali servis dapat mencakup beberapa tindakan checklist sekaligus (multi-select), "
        "tanpa memerlukan penambahan tabel detail atau tabel perantara. Pada sistem ServiceHub, daftar tindakan yang tersimpan di dalam array JSON "
        "mengikuti master kategori servis resmi Sharp ('Install Standart', 'Install Bracket', 'Penjelasan', 'Service Minor', 'Service Mayor', 'Penambahan', 'Lain-lain'). "
        "Selain itu, atribut other_work_text ditambahkan pada implementasi fisik sebagai atribut pelengkap untuk menampung deskripsi teks bebas "
        "apabila teknisi memilih opsi checklist 'Lain-lain' pada antarmuka aplikasi.\n\n"
        "3. Integritas Referensial & Mitigasi Cascade Delete (ON DELETE SET NULL):\n"
        "Kolom created_by pada tabel service_tickets ditetapkan sebagai Foreign Key bertipe BIGINT yang merujuk ke users(id) "
        "dengan batasan NULLABLE dan aturan referensial ON DELETE SET NULL. Kebijakan ini diterapkan secara spesifik untuk mencegah terjadinya Cascade Delete "
        "(penghapusan berantai) yang berbahaya. Apabila suatu akun pengguna pencatat tiket dihapus secara permanen dari basis data (physical delete), "
        "seluruh rekaman transaksi tiket servis yang pernah dicatat oleh pengguna tersebut TIDAK IKUT TERHAPUS, melainkan nilai created_by "
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
        "6. Pemetaan Hasil Ekstraksi AI VLM ke Kolom Fisik (notes):\n"
        "Pada formulir lembar fisik SPK Sharp, terdapat dua informasi teknis terpisah yaitu keluhan awal dari konsumen dan gejala kerusakan fisik hasil observasi awal. "
        "Pada perancangan fisik basis data service_tickets, kedua entitas data tersebut dipetakan dan digabungkan secara terstruktur ke dalam satu kolom fisik notes bertipe TEXT "
        "dengan format: 'Keterangan: [Keluhan Konsumen] | Kerusakan: [Gejala Kerusakan Fisik]'. Hal ini menjaga kesederhanaan skema fisik tanpa menghilangkan kelengkapan data operasional.\n\n"
        "7. Penyelarasan Alokasi Fisik VARCHAR(255) dengan Batasan Validasi Form:\n"
        "Pada tingkat fisik DDL PostgreSQL, kolom teks seperti notif_number dan customer_phone dialokasikan dengan tipe VARCHAR(255) "
        "mengikuti konvensi default framework Laravel Blueprint ($table->string()). Sementara itu, integritas panjang data diatur "
        "dan dibatasi secara presisi pada layer logika aplikasi melalui Form Request Validation (maksimal 50 karakter), "
        "sehingga tercipta keselarasan antara fleksibilitas skema penyimpanan fisik dengan kepatuhan format data operasional.",
        bold_prefix="5. Implementasi Skema Fisik pada Basis Data PostgreSQL ServiceHub:\n"
    )

    # Kamus Users
    add_p("Tabel 3.8 Kamus Kolom Fisik Tabel USERS (PostgreSQL)", italic=True)
    t_uspec = doc.add_table(rows=8, cols=5)
    t_uspec.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_uspec)
    h_spec = ["No", "Nama Kolom", "Tipe Data", "Constraint", "Keterangan"]
    for i, h in enumerate(h_spec):
        c = t_uspec.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 70, 70)
        set_cell_formatted(c, h, font_size=9.0, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    u_rows = [
        ("1", "id", "BIGINT", "PRIMARY KEY (PostgreSQL Identity)", "Identitas unik akun pengguna (Surrogate PK)"),
        ("2", "name", "VARCHAR(255)", "NOT NULL", "Nama lengkap pengguna (Admin atau Teknisi)"),
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
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 60, 60)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 2, 3] else (WD_ALIGN_PARAGRAPH.JUSTIFY if c_idx == 4 else WD_ALIGN_PARAGRAPH.LEFT)
            set_cell_formatted(c, val, font_size=8.5, bold=False, align=align, color=RGBColor(0, 0, 0))

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Kamus Tickets
    add_p("Tabel 3.9 Kamus Kolom Fisik Tabel SERVICE_TICKETS (PostgreSQL)", italic=True)
    t_tspec = doc.add_table(rows=23, cols=5)
    t_tspec.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_tspec)
    for i, h in enumerate(h_spec):
        c = t_tspec.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 80, 80)
        set_cell_formatted(c, h, font_size=9.0, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

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
        ("15", "work_types", "JSON", "NOT NULL", "Array JSON tindakan servis Sharp (Standart, Minor, Mayor, Bracket, dll.)"),
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
            set_cell_background(c, bg)
            set_cell_margins(c, 40, 40, 60, 60)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 2, 3] else (WD_ALIGN_PARAGRAPH.LEFT if c_idx == 1 else WD_ALIGN_PARAGRAPH.JUSTIFY)
            set_cell_formatted(c, val, font_size=8.0, bold=False, align=align, color=RGBColor(0, 0, 0))

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Manfaat Normalisasi
    add_p(
        "Penerapan normalisasi hingga 3NF pada basis data ServiceHub memberikan empat manfaat utama bagi keandalan sistem:",
        bold_prefix="6. Manfaat Penerapan Normalisasi 3NF pada ServiceHub:\n"
    )
    benefits = [
        ("Efisiensi Media Penyimpanan: ", "Mengurangi redundansi data pengguna dengan memusatkan penyimpanan atribut profil pada tabel master USERS, sehingga data identitas pengguna tidak diduplikasi pada setiap rekaman transaksi tiket servis."),
        ("Pencegahan Anomali Modifikasi: ", "Perubahan profil pengguna (nama/email) cukup dieksekusi satu kali pada tabel master USERS tanpa memengaruhi integritas relasional rekaman riwayat tiket servis terkait."),
        ("Integritas Referensial & Perlindungan Arsip Audit: ", "Penerapan Foreign Key (created_by) dengan batasan referensial ON DELETE SET NULL melindungi rekaman tiket servis dari penghapusan berantai (cascade delete), sehingga data riwayat pengerjaan Sharp tetap tersimpan sebagai arsip audit operasional perusahaan ketika akun pengguna dihapus."),
        ("Kombinasi Kunci yang Optimal: ", "Pemisahan peran notif_number sebagai Natural Identifier bisnis (UNIQUE) dan id sebagai Surrogate Primary Key fisik mendukung efisiensi kueri B-Tree PostgreSQL sekaligus memberikan identifier teknis yang stabil bagi relasi basis data.")
    ]
    for b_title, b_desc in benefits:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.line_spacing = 1.5
        bp.paragraph_format.space_after = Pt(3)
        add_formatted_runs(bp, b_title, font_size=12, bold=True)
        add_formatted_runs(bp, b_desc, font_size=12, bold=False)

    # -------------------------------------------------------------------------
    # PLACEHOLDER TAHAP SELANJUTNYA (SESUAI PANDUAN KP)
    # -------------------------------------------------------------------------
    add_h3("E. Entity-Relationship Diagram (ERD)")
    add_p(
        "Entity-Relationship Diagram (ERD) merupakan diagram pemodelan konseptual yang mengilustrasikan struktur logikal basis data "
        "sistem, mendefinisikan entitas data yang terlibat dalam proses bisnis, atribut pembentuk entitas, serta relasi dan derajat "
        "kardinalitas yang mengikat antar-entitas tersebut (Connolly & Begg, 2015). Pada perancangan sistem pelaporan teknisi ServiceHub "
        "di PT. Sharp Electronics Indonesia, struktur ERD diturunkan secara langsung dan konsisten dari hasil normalisasi bentuk ketiga "
        "(Third Normal Form / 3NF) serta skema fisik basis data PostgreSQL yang diterapkan pada aplikasi."
    )
    add_p(
        "Berdasarkan analisis alur proses bisnis pengerjaan servis dan hasil dekomposisi ketergantungan transitif pada tahap 3NF, "
        "domain sistem ServiceHub memodelkan 2 (dua) entitas data domain utama, yaitu entitas USERS (menyimpan kredensial dan profil akun pengguna) "
        "serta entitas SERVICE_TICKETS (menyimpan rekaman operasional Surat Perintah Kerja). Hubungan logikal antar-entitas beserta struktur atribut, "
        "kunci utama (Primary Key), kunci tamu (Foreign Key), dan kardinalitasnya dimodelkan menggunakan notasi Crow's Foot sebagaimana disajikan pada Gambar 3.4 berikut."
    )

    img_erd = r"c:\Users\An\Herd\servicehub\erd_servicehub_clean.png"
    add_image_safe(img_erd, "Gambar 3.4 Entity-Relationship Diagram (ERD) Sistem ServiceHub PT. Sharp Electronics Indonesia")

    add_p(
        "Berdasarkan visualisasi pemodelan data pada Gambar 3.4 di atas, struktur entitas, atribut, dan relasi logikal pada sistem "
        "pelaporan teknisi ServiceHub dapat dijelaskan secara komprehensif sebagai berikut:"
    )

    erd_points = [
        (
            "1. Entitas USERS (Master Entity / Akun Pengguna):\n",
            "Entitas USERS merepresentasikan seluruh akun pengguna terautentikasi yang memiliki hak akses ke dalam sistem, mencakup staf administrasi "
            "(Admin Service Center) di kantor cabang Pulogadung dan MOI Kelapa Gading, serta Teknisi Lapangan yang beroperasi menangani perbaikan unit. "
            "Kunci utama (Primary Key) entitas ini adalah atribut id bertipe BIGINT dengan penomoran sekuensial otomatis (PostgreSQL Identity). "
            "Atribut penting lainnya meliputi email bertipe VARCHAR(255) yang bersifat unik (Unique Key) sebagai pengenal login, name (nama lengkap), "
            "role (peran otorisasi dengan nilai 'admin' atau 'teknisi'), password (hash kata sandi), serta avatar (foto profil pengguna). "
            "Entitas ini juga dilengkapi atribut audit sistem framework seperti remember_token, timestamps (created_at, updated_at), dan parameter Two-Factor Authentication (2FA)."
        ),
        (
            "2. Entitas SERVICE_TICKETS (Transaction Entity / Nota SPK Servis):\n",
            "Entitas SERVICE_TICKETS merepresentasikan transaksi Surat Perintah Kerja (SPK) perbaikan perangkat elektronik Sharp. Kunci utama teknis (Surrogate Primary Key) "
            "entitas ini adalah id (BIGINT Identity), dengan notif_number bertipe VARCHAR(255) sebagai kunci alternatif/alami unik (Alternate/Candidate Key) yang berasal dari nomor fisik nota lembar kerja. "
            "Entitas ini menampung 23 atribut operasional riil yang mencakup:\n"
            "• Identitas Pelanggan: customer_name, customer_phone, customer_address.\n"
            "• Spesifikasi Perangkat: unit_model, serial_number.\n"
            "• Parameter Layanan & Biaya: service_date, deadline, status ('berbayar' atau 'tidak_berbayar'), status_note ('Garansi' atau 'Free Service'), mainwork_center ('Pulogadung', 'MOI', atau 'Lain-lain').\n"
            "• Status & Teknis Pengerjaan: work_status ('belum_selesai' atau 'selesai'), work_types (bertipe JSON yang menampung pilihan multi-kategori pekerjaan perbaikan), other_work_text, start_time, finish_time, serta notes (catatan kerusakan dan tindakan perbaikan).\n"
            "• Bukti Dokumentasi Fisik: visit_photo (dokumentasi awal unit saat kunjungan) dan completion_photo (dokumentasi akhir setelah unit selesai diperbaiki)."
        ),
        (
            "3. Relasi 'Mencatat / Membuat' dan Kardinalitas (USERS 1 : N SERVICE_TICKETS):\n",
            "Hubungan antara entitas USERS dan SERVICE_TICKETS dihubungkan melalui relasi dengan predikat 'Mencatat / Membuat' (creates / records). "
            "Secara struktural hubungan ini bertipe One-to-Many (USERS 1 : N SERVICE_TICKETS), dengan spesifikasi modalitas dan optionality relasional USERS 0..1 : 0..N SERVICE_TICKETS:\n"
            "• Sisi USERS (0..N): Satu akun pengguna dapat mencatat nol atau banyak (0..N) tiket servis. Nilai nol (0) merepresentasikan akun pengguna yang baru terdaftar dan belum pernah mencatat tiket servis di sistem.\n"
            "• Sisi SERVICE_TICKETS (0..1): Setiap tiket servis terhubung ke 0 atau 1 akun pengguna pembuat karena atribut foreign key created_by bersifat nullable.\n"
            "• Penjelasan Nullable: Partisipasi opsional (0..1) pada sisi tiket ini merupakan konsekuensi langsung dari penerapan aturan integritas referensial ON DELETE SET NULL pada kolom created_by."
        ),
        (
            "4. Integritas Referensial dan Aturan Penghapusan Data (ON DELETE SET NULL):\n",
            "Kunci tamu created_by pada entitas SERVICE_TICKETS bersifat opsional (Nullable). Sistem menerapkan batasan integritas referensial ON DELETE SET NULL. "
            "Aturan ini memastikan bahwa data tiket tetap dipertahankan ketika akun pencatat dihapus, sedangkan nilai created_by menjadi NULL. "
            "Mekanisme ini mencegah hilangnya data riwayat perbaikan servis konsumen, menjamin keabsahan pelaporan garansi, serta menghindari anomali penghapusan berantai (cascading delete) pada basis data PT. Sharp Electronics Indonesia."
        ),
        (
            "5. Independensi Penugasan Operasional Teknisi:\n",
            "Sesuai dengan proses bisnis aktual pada Service Center Aquos Platinum dan hasil audit database, kolom created_by murni berfungsi sebagai pencatat histori administratif "
            "(audit trail pembuat tiket), bukan sebagai penugasan teknisi individu. Penugasan teknisi lapangan dilakukan secara operasional langsung melalui pembagian fisik SPK di kantor cabang "
            "atau koordinasi harian supervisor servis, sementara teknisi yang bersangkutan mengakses tiket pada web app untuk memperbarui status pengerjaan (work_status), "
            "mengisi jam kerja, dan mengunggah foto dokumentasi hasil perbaikan."
        ),
    ]

    for p_title, p_desc in erd_points:
        p_pt = doc.add_paragraph()
        p_pt.paragraph_format.left_indent = Inches(0.2)
        p_pt.paragraph_format.line_spacing = 1.5
        p_pt.paragraph_format.space_after = Pt(4)
        add_formatted_runs(p_pt, p_title, font_size=12, bold=True)
        add_formatted_runs(p_pt, p_desc, font_size=12, bold=False)

    # -------------------------------------------------------------------------
    # F. RELASI TABEL
    # -------------------------------------------------------------------------
    add_h3("F. Relasi Tabel")
    add_p(
        "Relasi Tabel merupakan representasi skema fisik basis data (Physical Data Model / skema relasional terimplementasi) "
        "yang menjabarkan secara teknis bagaimana entitas-entitas logikal dari hasil dekomposisi normalisasi (3NF) dan pemodelan ERD "
        "direalisasikan ke dalam struktur tabel fisik pada Relational Database Management System (RDBMS) PostgreSQL. "
        "Relasi tabel mendefinisikan secara eksplisit nama tabel fisik, seluruh atribut/kolom penyusun, alokasi tipe data fisik, "
        "penanganan nilai kosong (Nullability), batasan integritas kunci (Primary Key, Foreign Key, Unique Key), aturan aksi referensial "
        "(Referential Action), serta konfigurasi pengindeksan fisik (Index) guna mengoptimalkan kinerja query processing pada sistem "
        "operasional ServiceHub di PT. Sharp Electronics Indonesia."
    )
    add_p(
        "Berdasarkan hasil migrasi basis data framework Laravel 11 dan skema aktual PostgreSQL pada sistem ServiceHub, basis data "
        "terdiri dari 2 (dua) tabel domain utama, yaitu tabel users (13 kolom fisik) dan tabel service_tickets (23 kolom fisik). "
        "Struktur fisik kedua tabel, relasi foreign key penghubung, aturan referensial, dan arsitektur pengindeksan B-tree "
        "disajikan secara komprehensif pada Gambar 3.5 berikut."
    )

    img_relasi = r"c:\Users\An\Herd\servicehub\relasi_tabel_servicehub_clean.png"
    add_image_safe(img_relasi, "Gambar 3.5 Relasi Tabel Sistem ServiceHub PT. Sharp Electronics Indonesia")

    add_p(
        "Berdasarkan visualisasi skema fisik basis data pada Gambar 3.5 di atas, rincian teknis mengenai struktur tabel, integritas relasi, "
        "dan strategi pengindeksan sistem ServiceHub dapat dijelaskan secara mendalam sebagai berikut:"
    )

    relasi_points = [
        (
            "1. Struktur Skema Fisik Tabel users (Master Akun Pengguna):\n",
            "Tabel users berfungsi sebagai tabel master untuk menyimpan data kredensial dan profil pengguna terautentikasi (Administrator dan Teknisi). "
            "Tabel ini memiliki 13 kolom fisik yang didefinisikan secara presisi pada PostgreSQL:\n"
            "• id (BIGINT IDENTITY): Berperan sebagai Primary Key fisik dengan penomoran sekuensial otomatis (Surrogate PK). Pemilihan tipe integer 64-bit menjamin performa pencarian B-Tree dengan kompleksitas O(log n) serta mengoptimalkan efisiensi penyimpanan memori saat dijadikan referensi foreign key.\n"
            "• name (VARCHAR(255), NOT NULL): Menyimpan nama lengkap personel admin atau teknisi lapangan.\n"
            "• email (VARCHAR(255), UNIQUE, NOT NULL): Berfungsi sebagai pengenal unik autentikasi akun pada saat login sistem. Kolom ini terikat dengan batasan indeks keunikan (users_email_unique).\n"
            "• role (VARCHAR(255), NOT NULL, DEFAULT 'teknisi'): Menentukan tingkat hak akses otorisasi dalam sistem ('admin' atau 'teknisi'). Kolom ini dilengkapi indeks B-tree tunggal (users_role_index) guna mempercepat proses kueri penyaringan daftar akun berdasarkan peran operasional.\n"
            "• avatar (VARCHAR(255), NULLABLE): Menyimpan jalur lokasi (path/URL) berkas foto profil pengguna pada direktori storage aplikasi.\n"
            "• password (VARCHAR(255), NOT NULL): Menyimpan string hash kata sandi terenkripsi menggunakan algoritma Bcrypt (60 karakter) demi memenuhi standar keamanan kredensial.\n"
            "• Atribut Internal Framework Laravel: email_verified_at (TIMESTAMP, NULLABLE), remember_token (VARCHAR(100), NULLABLE), serta atribut pendukung autentikasi dua faktor (Two-Factor Authentication / 2FA) meliputi two_factor_secret (TEXT, NULLABLE), two_factor_recovery_codes (TEXT, NULLABLE), dan two_factor_confirmed_at (TIMESTAMP, NULLABLE).\n"
            "• Timestamps (created_at dan updated_at, TIMESTAMP, NULLABLE): Mencatat waktu presisi pembuatan baris dan pembaruan profil pengguna sebagai jejak audit sistem."
        ),
        (
            "2. Struktur Skema Fisik Tabel service_tickets (Transaksi Surat Perintah Kerja):\n",
            "Tabel service_tickets merupakan tabel transaksi utama yang menampung seluruh siklus hidup pengerjaan tiket servis perangkat Sharp dari tahap penerbitan SPK hingga pelaporan final teknisi. Tabel ini memuat 23 kolom fisik dengan rincian arsitektur sebagai berikut:\n"
            "• id (BIGINT IDENTITY): Berperan sebagai Surrogate Primary Key teknis untuk memfasilitasi pengindeksan internal dan pemeliharaan relasi data.\n"
            "• notif_number (VARCHAR(255), UNIQUE, NOT NULL): Berperan sebagai Candidate/Alternate Key yang berasal dari nomor fisik formulir SPK Sharp. Diberi batasan unik (service_tickets_notif_number_unique) untuk menjamin tidak ada duplikasi nomor notifikasi tiket pada sistem.\n"
            "• created_by (BIGINT, NULLABLE): Kolom Foreign Key yang menghubungkan rekaman tiket dengan akun pengguna yang mencatat atau membuat tiket pada tabel users(id).\n"
            "• Data Konsumen & Perangkat: customer_name (VARCHAR(255), NOT NULL), customer_phone (VARCHAR(255), NOT NULL, terindeks idx_service_tickets_customer_phone untuk pencarian cepat riwayat servis berbasis nomor telepon), customer_address (TEXT, NULLABLE untuk alamat domisili lengkap konsumen), unit_model (VARCHAR(255), NOT NULL), dan serial_number (VARCHAR(255), NOT NULL).\n"
            "• Parameter Layanan & Cabang: service_date (DATE, NULLABLE, terindeks), deadline (DATE, NULLABLE, terindeks komposit), status (VARCHAR(255), NOT NULL, terindeks dengan nilai 'berbayar' atau 'tidak_berbayar'), status_note (VARCHAR(255), NULLABLE untuk keterangan 'Garansi' atau 'Free Service'), dan mainwork_center (VARCHAR(255), NOT NULL, terindeks untuk pemfilteran kantor cabang penanggung jawab 'Pulogadung', 'MOI', atau 'Lain-lain').\n"
            "• Status & Teknis Pengerjaan: work_status (VARCHAR(255), NOT NULL, DEFAULT 'belum_selesai'), work_types (JSON, NOT NULL untuk menampung array string daftar tindakan servis perbaikan Sharp), other_work_text (VARCHAR(255), NULLABLE untuk rincian pekerjaan kustom bila teknisi memilih kategori 'Lain-lain'), start_time dan finish_time (VARCHAR(255), NULLABLE untuk durasi pengerjaan dengan format 'hh:mm'), serta notes (TEXT, NULLABLE untuk deskripsi diagnosis kerusakan teknis dan kebutuhan suku cadang sparepart).\n"
            "• Bukti Dokumentasi Fisik: visit_photo (VARCHAR(255), NULLABLE) dan completion_photo (VARCHAR(255), NULLABLE) yang menyimpan URL berkas foto kondisi unit saat kedatangan teknisi dan setelah perbaikan selesai yang telah dikompresi di sisi klien.\n"
            "• Timestamps: created_at dan updated_at (TIMESTAMP, NULLABLE) untuk jejak audit operasional tiket."
        ),
        (
            "3. Integritas Referensial dan Aturan Relasi Fisik (created_by -> users.id):\n",
            "Relasi fisik antara tabel users dan service_tickets dibangun melalui batasan Foreign Key pada kolom created_by yang merujuk secara langsung ke kolom id pada tabel users (service_tickets.created_by -> users.id). Karakteristik integritas relasi fisik ini diatur dengan ketentuan sebagai berikut:\n"
            "• Aksi Referensial ON DELETE SET NULL: Sistem menetapkan aturan integritas referensial ON DELETE SET NULL pada kolom created_by. Apabila suatu data akun pengguna pada tabel users dihapus secara fisik dari basis data, mesin basis data PostgreSQL secara otomatis mengubah nilai kolom created_by pada tabel service_tickets yang bersangkutan menjadi NULL tanpa menghapus rekaman tiket servis tersebut.\n"
            "• Mitigasi Bahaya Cascade Delete: Kebijakan ini diterapkan secara ketat karena tiket servis merupakan dokumen legal transaksi operasional, catatan klaim garansi, dan histori pendapatan servis PT. Sharp Electronics Indonesia yang memiliki nilai audit jangka panjang. Penghapusan akun pengguna tidak boleh mengakibatkan hilangnya (terhapus berantai) data transaksi tiket servis konsumen.\n"
            "• Kardinalitas Fisik 0..1 (Nullable FK): Karena kolom created_by bersifat NULLABLE, maka kardinalitas relasi pada ujung child table secara fisik bernilai 0..1 (setiap tiket servis dapat terhubung ke tepat satu akun pembuat atau bernilai NULL jika akun pembuat telah dihapus), sementara pada ujung parent table bernilai 0..N (satu akun pengguna dapat mencatat banyak tiket servis atau belum mencatat tiket sama sekali).\n"
            "• Independensi Penugasan Operasional: Kolom created_by murni berfungsi sebagai pencatat histori administratif pengguna yang membuat/mencatat tiket ke dalam sistem web app, bukan sebagai penguncian penugasan teknisi individu. Penugasan teknisi dilakukan secara operasional langsung melalui pembagian fisik lembar SPK oleh supervisor cabang servis."
        ),
        (
            "4. Struktur dan Strategi Pengindeksan Fisik Basis Data (Database Indexing):\n",
            "Untuk menjamin skalabilitas dan performa kueri yang responsif pada saat volume transaksi tiket servis meningkat, skema fisik basis data PostgreSQL ServiceHub dilengkapi dengan 4 (empat) kategori pengindeksan B-Tree fisik yang terkonfigurasi secara aktif:\n"
            "• Primary Key Index (B-Tree): Indeks users_pkey pada kolom users(id) dan service_tickets_pkey pada kolom service_tickets(id). Indeks ini dibangun secara otomatis oleh RDBMS untuk memfasilitasi pencarian baris data spesifik dengan kompleksitas O(log n).\n"
            "• Unique Constraint Index: Indeks users_email_unique pada kolom users(email) dan service_tickets_notif_number_unique pada kolom service_tickets(notif_number). Mengamankan integritas data dari potensi anomali duplikasi pada level penyimpanan fisik.\n"
            "• Single-Column B-Tree Index: Diterapkan pada kolom-kolom yang menjadi predikat penyaringan (filtering) utama pada kueri operasional harian, meliputi users_role_index pada users(role), idx_service_tickets_service_date pada service_tickets(service_date) untuk rekapitulasi tanggal servis, idx_service_tickets_status pada service_tickets(status) untuk klasifikasi tiket garansi vs berbayar, idx_service_tickets_mainwork_center pada service_tickets(mainwork_center) untuk pemisahan data per kantor cabang servis, serta idx_service_tickets_customer_phone pada service_tickets(customer_phone) untuk kemudahan penelusuran histori komplain pelanggan.\n"
            "• Composite B-Tree Index (Pengindeksan Komposit Multi-Kolom): Indeks service_tickets_work_status_deadline_index yang dibentuk pada kombinasi kolom (work_status, deadline). Indeks komposit tersebut dirancang untuk membantu proses penyaringan berdasarkan work_status dan pengurutan berdasarkan deadline pada kueri pemuatan antrean tiket aktif di dashboard utama (WHERE work_status = 'belum_selesai' ORDER BY deadline ASC)."
        ),
    ]

    for p_title, p_desc in relasi_points:
        p_pt = doc.add_paragraph()
        p_pt.paragraph_format.left_indent = Inches(0.2)
        p_pt.paragraph_format.line_spacing = 1.5
        p_pt.paragraph_format.space_after = Pt(4)
        add_formatted_runs(p_pt, p_title, font_size=12, bold=True)
        add_formatted_runs(p_pt, p_desc, font_size=12, bold=False)

    # -------------------------------------------------------------------------
    # TABEL 3.10: MATRIKS RELASI ANTAR-TABEL DAN INTEGRITAS REFERENSIAL
    # -------------------------------------------------------------------------
    add_p(
        "Untuk mempertegas spesifikasi teknis dan aturan integritas yang mengikat hubungan fisik antar-tabel pada sistem ServiceHub, "
        "matriks relasi foreign key, kardinalitas, dan aksi referensial dirangkum pada Tabel 3.10 berikut.",
        space_after=4
    )
    add_p("Tabel 3.10 Matriks Relasi Antar-Tabel dan Integritas Referensial Sistem ServiceHub", italic=True)
    t_rel = doc.add_table(rows=2, cols=8)
    t_rel.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_rel)
    h_rel = ["No", "Tabel Asal (Child)", "Kolom FK", "Tabel Rujukan (Parent)", "Kolom PK", "Kardinalitas", "Aksi Referensial", "Logika & Kebijakan Bisnis"]
    for i, h in enumerate(h_rel):
        c = t_rel.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 70, 70)
        set_cell_formatted(c, h, font_size=8.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    r_rel_data = [
        ("1", "service_tickets", "created_by", "users", "id", "Many-to-One (N : 1)\n• service_tickets → users: 0..1 : 1\n• users → service_tickets: 0..N", "ON DELETE SET NULL", "Menghubungkan tiket servis dengan akun pengguna yang mencatat atau membuat tiket. Nilai foreign key created_by bersifat NULLABLE. Aturan referensial ON DELETE SET NULL menjamin seluruh rekaman transaksi tiket, riwayat pembayaran, foto bukti, dan diagnosis perbaikan tetap tersimpan di basis data saat akun pengguna pencatat dihapus, sedangkan nilai kolom created_by diset menjadi NULL (mencegah anomali cascade delete).")
    ]
    for r_idx, r_data in enumerate(r_rel_data, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_rel.cell(r_idx, c_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, 50, 50, 60, 60)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 4, 5, 6] else (WD_ALIGN_PARAGRAPH.LEFT if c_idx in [1, 2, 3] else WD_ALIGN_PARAGRAPH.JUSTIFY)
            set_cell_formatted(c, val, font_size=8.0, bold=False, align=align, color=RGBColor(0, 0, 0))

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------------------
    # TABEL 3.11: KATALOG PENGINDEKSAN FISIK BASIS DATA POSTGRESQL
    # -------------------------------------------------------------------------
    add_p(
        "Konfigurasi dan spesifikasi lengkap dari 10 (sepuluh) struktur pengindeksan B-tree pada basis data PostgreSQL sistem ServiceHub "
        "disajikan secara terstruktur pada Tabel 3.11 berikut.",
        space_after=4
    )
    add_p("Tabel 3.11 Katalog Pengindeksan Fisik Basis Data PostgreSQL ServiceHub", italic=True)
    t_idx = doc.add_table(rows=11, cols=6)
    t_idx.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_idx)
    h_idx = ["No", "Nama Indeks Fisik", "Tabel", "Kolom Terindeks", "Kategori Indeks", "Tujuan Optimasi Kueri Operasional"]
    for i, h in enumerate(h_idx):
        c = t_idx.cell(0, i)
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, 60, 60, 70, 70)
        set_cell_formatted(c, h, font_size=8.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))

    r_idx_data = [
        ("1", "users_pkey", "users", "id", "Primary Key (B-Tree)", "Pencarian identitas unik akun instan O(log n) serta penjaminan integritas target referensi foreign key."),
        ("2", "service_tickets_pkey", "service_tickets", "id", "Primary Key (B-Tree)", "Akses baris fisik transaksi tiket servis instan O(log n) pada internal database."),
        ("3", "users_email_unique", "users", "email", "Unique Key (B-Tree)", "Validasi keunikan kredensial login serta pencegahan anomali duplikasi alamat email akun."),
        ("4", "service_tickets_notif_number_unique", "service_tickets", "notif_number", "Unique Key (B-Tree)", "Menjamin keunikan nomor fisik SPK Sharp di seluruh sistem dan mempercepat pencarian tiket berbasis nomor notifikasi."),
        ("5", "users_role_index", "users", "role", "Single-Column (B-Tree)", "Mempercepat kueri penyaringan pembagian peran pengguna (daftar akun 'admin' vs 'teknisi')."),
        ("6", "idx_service_tickets_service_date", "service_tickets", "service_date", "Single-Column (B-Tree)", "Mengoptimalkan kueri pemilahan rekapitulasi pelaporan pengerjaan servis harian dan bulanan."),
        ("7", "idx_service_tickets_status", "service_tickets", "status", "Single-Column (B-Tree)", "Penyaringan cepat klasifikasi biaya servis ('berbayar' vs 'tidak_berbayar')."),
        ("8", "idx_service_tickets_mainwork_center", "service_tickets", "mainwork_center", "Single-Column (B-Tree)", "Pemisahan kueri beban kerja tiket per cabang service center ('Pulogadung' vs 'MOI')."),
        ("9", "idx_service_tickets_customer_phone", "service_tickets", "customer_phone", "Single-Column (B-Tree)", "Memfasilitasi pencarian cepat riwayat servis berulang pelanggan berdasarkan nomor telepon konsumen."),
        ("10", "service_tickets_work_status_deadline_index", "service_tickets", "work_status, deadline", "Composite (B-Tree)", "Membantu proses penyaringan tiket berdasarkan work_status dan pengurutan berdasarkan deadline pada kueri dashboard: WHERE work_status = 'belum_selesai' ORDER BY deadline ASC.")
    ]
    for r_idx, r_data in enumerate(r_idx_data, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = t_idx.cell(r_idx, c_idx)
            set_cell_background(c, bg)
            set_cell_margins(c, 45, 45, 60, 60)
            align = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 4] else (WD_ALIGN_PARAGRAPH.LEFT if c_idx in [1, 2, 3] else WD_ALIGN_PARAGRAPH.JUSTIFY)
            set_cell_formatted(c, val, font_size=8.0, bold=False, align=align, color=RGBColor(0, 0, 0))

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------------------
    # G. SEQUENCE DIAGRAM
    # -------------------------------------------------------------------------
    add_h3("G. Sequence Diagram")
    add_p(
        "Sequence Diagram merupakan diagram pemodelan interaksi dinamis dalam Unified Modeling Language (UML) "
        "yang menggambarkan kolaborasi antar-objek dan komponen perangkat lunak berdasarkan kronologi urutan waktu "
        "(time sequence). Diagram ini secara visual memetakan pengiriman pesan (messages) antar-elemen arsitektur sistem, "
        "mulai dari aktor pengguna, komponen antarmuka pengguna (<<boundary>>), pengendali logika aplikasi (<<controller>>), "
        "layanan pemrosesan (<<service>>), antarmuka pemrograman aplikasi eksternal (<<external API>>), entitas model (<<entity>>), "
        "hingga media penyimpanan basis data relasional (<<database>>) dan penyimpanan berkas awan (<<storage>>)."
    )
    add_p(
        "Pada perancangan perangkat lunak ServiceHub (PT. Sharp Electronics Indonesia), Sequence Diagram dimodelkan untuk "
        "3 (tiga) skenario proses bisnis inti yang paling krusial, yaitu:\n"
        "1. Proses Autentikasi Pengguna (Login - UC-01).\n"
        "2. Pembuatan Tiket Servis dan Ekstraksi Dokumen Berbasis AI Vision-Language Model (UC-02).\n"
        "3. Pelaporan dan Penyelesaian Servis Lapangan oleh Teknisi (UC-10, UC-11, dan UC-12)."
    )

    # 1. Sequence Diagram Login
    add_p(
        "Skenario ini memodelkan interaksi saat Admin Service Center atau Teknisi Lapangan melakukan autentikasi "
        "ke dalam sistem ServiceHub menggunakan kredensial alamat email dan kata sandi. Komponen arsitektur yang berkolaborasi meliputi:\n"
        "• Aktor Pengguna: Personel Admin atau Teknisi yang mengakses antarmuka sistem.\n"
        "• <<boundary>> :LoginPage: Komponen antarmuka formulir login berbasis React TypeScript dan Inertia.js (auth/login.tsx).\n"
        "• <<controller>> :AuthenticatedSessionController: Pengendali autentikasi Laravel Fortify (AuthenticatedSessionController).\n"
        "• <<entity>> :User: Model Eloquent yang merepresentasikan entitas akun pengguna terdaftar.\n"
        "• <<database>> :PostgreSQL: Basis data relasional penyimpanan tabel master users dan tabel sessions.\n\n"
        "Rincian Urutan Aliran Pesan:\n"
        "1. Pengguna membuka peramban web dan mengakses URL rute /login.\n"
        "2. Komponen :LoginPage merender antarmuka formulir login dengan proteksi token CSRF.\n"
        "3. Pengguna mengisi alamat email serta kata sandi, lalu menekan tombol Login.\n"
        "4. Komponen :LoginPage mengirimkan permintaan POST /login membawa parameter kredensial ke :AuthenticatedSessionController.\n"
        "5. :AuthenticatedSessionController mengeksekusi kueri pencarian akun pengguna via :User::where('email', $email)->first().\n"
        "6. :User meneruskan perintah kueri SQL SELECT * FROM users WHERE email = ? ke basis data :PostgreSQL.\n"
        "7. :PostgreSQL mengembalikan data baris akun pengguna beserta string hash kata sandi ke :User.\n"
        "8. :User mengembalikan instance objek model User ke :AuthenticatedSessionController.\n"
        "9. :AuthenticatedSessionController memverifikasi kecocokan kata sandi menggunakan fungsi enkripsi Hash::check().\n"
        "Alur percabangan fragment alt menangani dua kondisi hasil validasi:\n"
        "• Kondisi [Kredensial Valid & Cocok]:\n"
        "  10. :AuthenticatedSessionController menerbitkan sesi login baru (regenerateSession) dan mencatat jejak waktu aktif ke :PostgreSQL.\n"
        "  11. :PostgreSQL mengonfirmasi penyimpanan sesi aktif berhasil.\n"
        "  12. :AuthenticatedSessionController mengirimkan respons pengalihan (redirect) menuju rute /dashboard ke :LoginPage.\n"
        "  13. :LoginPage mengalihkan pengguna ke Dashboard operasional sesuai hak akses peran (Admin atau Teknisi).\n"
        "• Kondisi [Kredensial Tidak Valid]:\n"
        "  14. :AuthenticatedSessionController melempar ValidationException (kode HTTP 422 Unprocessable Entity) ke :LoginPage.\n"
        "  15. :LoginPage menampilkan pesan umpan balik kesalahan 'Kredensial yang diberikan tidak cocok' kepada Pengguna.",
        bold_prefix="1. Sequence Diagram Proses Autentikasi Pengguna (Login - UC-01):\n"
    )

    img_seq_login = os.path.join(r"c:\Users\An\Herd\servicehub", "sequence_diagram_login_clean.png")
    add_image_safe(img_seq_login, "Gambar 3.6 Sequence Diagram Proses Autentikasi Pengguna (Login - UC-01)")

    # 2. Sequence Diagram Pembuatan Tiket & Ekstraksi AI VLM
    add_p(
        "Skenario ini memodelkan inovasi utama sistem ServiceHub dalam mengotomatisasi entri data Surat Perintah Kerja (SPK) Sharp "
        "menggunakan teknologi kecerdasan buatan Vision-Language Model (VLM). Komponen arsitektur yang berkolaborasi meliputi:\n"
        "• Aktor Admin Service Center: Staf administrasi kantor cabang penerima lembar fisik SPK Sharp.\n"
        "• <<boundary>> :ScannerModal: Dialog antarmuka pemindaian dokumen dan formulir input tiket digital (ticket-dialog.tsx / document-scanner-dialog.tsx).\n"
        "• <<controller>> :ScanDocController: Pengendali rute POST /tickets/scan-document (ScanDocumentController.php).\n"
        "• <<service>> :DocScannerService: Layanan abstraksi pemindai dokumen (DocumentScannerInterface) yang secara dinamis mengikat GroqDocumentScanner (default) dan GeminiDocumentScanner (cadangan).\n"
        "• <<external API>> :Groq / Gemini API: Layanan REST API Vision-Language Model cloud (Groq Vision API model Qwen 3.8 / Google Gemini Vision API).\n"
        "• <<controller>> :ServiceTicketController: Pengendali transaksi tiket servis (ServiceTicketController.php).\n"
        "• <<database>> :PostgreSQL: Tabel basis data fisik service_tickets penyimpanan nota transaksi.\n\n"
        "Rincian Urutan Aliran Pesan:\n"
        "1. Admin mengunggah berkas foto lembar formulir fisik SPK Sharp pada dialog antarmuka :ScannerModal.\n"
        "2. :ScannerModal mengirimkan permintaan multipart POST /tickets/scan-document berisi berkas citra ke :ScanDocController.\n"
        "3. :ScanDocController memvalidasi format citra (JPEG/PNG maks. 10 MB) lalu memanggil metode scan() pada layanan :DocScannerService.\n"
        "4. :DocScannerService mengonversi citra ke representasi base64 dan mengirimkan permintaan POST beserta instruksi prompt JSON terstruktur ke :Groq / Gemini API.\n"
        "5. :Groq / Gemini API mengeksekusi inferensi multimodal OCR dan mengembalikan respons teks berformat JSON terstruktur ke :DocScannerService.\n"
        "6. :DocScannerService mem-parsing string JSON hasil ekstraksi dan memetakannya ke objek Data Transfer Object (ParsedDocumentData DTO).\n"
        "7. :DocScannerService mengembalikan DTO data dokumen ke :ScanDocController.\n"
        "8. :ScanDocController mengembalikan respons JsonResponse berisi data ekstraksi formulir SPK ke :ScannerModal.\n"
        "9. :ScannerModal mengisi otomatis (auto-populate) seluruh bidang isian formulir tiket digital.\n"
        "10. Admin memeriksa kebenaran data melalui antarmuka pratinjau (Human-in-the-Loop review), mengoreksi bila terdapat ketidaksesuaian, lalu menekan tombol Simpan Tiket.\n"
        "11. :ScannerModal mengirimkan permintaan POST /tickets membawa data formulir terverifikasi ke :ServiceTicketController.\n"
        "12. :ServiceTicketController mengikat ID admin pencatat (created_by), menetapkan work_status = 'belum_selesai', dan memanggil ServiceTicket::create().\n"
        "13. Model ServiceTicket mengeksekusi perintah SQL INSERT INTO service_tickets ... ke basis data :PostgreSQL.\n"
        "14. :PostgreSQL mengonfirmasi rekaman transaksi baru berhasil disimpan dan mengembalikan instance data tiket ke :ServiceTicketController.\n"
        "15. :ServiceTicketController mengirimkan respons redirect back disertai flash message sukses ke :ScannerModal.\n"
        "16. :ScannerModal menutup modal dan menampilkan notifikasi toast 'Tiket Servis Berhasil Ditambahkan' kepada Admin.",
        bold_prefix="2. Sequence Diagram Pembuatan Tiket dan Ekstraksi AI VLM (UC-02):\n"
    )

    img_seq_vlm = os.path.join(r"c:\Users\An\Herd\servicehub", "sequence_diagram_ticket_vlm_clean.png")
    add_image_safe(img_seq_vlm, "Gambar 3.7 Sequence Diagram Pembuatan Tiket dan Ekstraksi AI VLM (UC-02)")

    # 3. Sequence Diagram Pelaporan & Penyelesaian Servis oleh Teknisi
    add_p(
        "Skenario ini memodelkan alur kerja teknisi di lokasi domisili pelanggan dalam mencatat diagnosis kerusakan, "
        "memilih tindakan perbaikan, mengompresi dan mengunggah foto bukti visual, serta memfinalisasi status penyelesaian tiket. "
        "Komponen arsitektur yang berkolaborasi meliputi:\n"
        "• Aktor Teknisi Lapangan: Personel teknisi servis Sharp yang beroperasi di lapangan via smartphone.\n"
        "• <<boundary>> :TicketDialogPWA: Antarmuka pelaporan tiket berbasis Progressive Web App (ticket-dialog.tsx).\n"
        "• <<utility>> :ImageCompressor: Utilitas pengompresi citra sisi klien berbasis HTML5 Canvas (image-compressor.ts).\n"
        "• <<controller>> :ServiceTicketController: Pengendali transaksi tiket servis (ServiceTicketController.php).\n"
        "• <<storage>> :StorageDisk(S3): Media penyimpanan berkas foto publik / Cloud Storage Bucket (storage tickets/visit & completion).\n"
        "• <<database>> :PostgreSQL: Tabel basis data fisik service_tickets.\n\n"
        "Rincian Urutan Aliran Pesan:\n"
        "1. Teknisi membuka tiket servis yang relevan melalui aplikasi PWA pada smartphone dan mengakses formulir pelaporan servis.\n"
        "2. :TicketDialogPWA merender formulir pelaporan yang memuat catatan diagnosis dan tombol pengunggahan foto.\n"
        "3. Teknisi menginput catatan teknis kerusakan unit dan memilih multi-kategori tindakan perbaikan pada selector work_types.\n"
        "4. Teknisi mengambil foto fisik kondisi unit saat kedatangan (visit_photo) dan setelah selesai perbaikan (completion_photo).\n"
        "5. :TicketDialogPWA meneruskan berkas citra mentah resolusi tinggi kamera ke modul utilitas :ImageCompressor.\n"
        "6. :ImageCompressor mereduksi dimensi gambar (maks. 1600x1600 piksel) dan mengompresi kualitas JPEG menjadi 0.82 menggunakan elemen off-screen HTML5 Canvas, sehingga ukuran berkas menyusut dari 4-6 MB menjadi di bawah 500 KB.\n"
        "7. :ImageCompressor mengembalikan berkas citra terkompresi yang siap diunggah ke :TicketDialogPWA.\n"
        "8. Teknisi menekan tombol Kirim Laporan Servis; :TicketDialogPWA mengirimkan permintaan multipart PUT /tickets/{id} dengan parameter work_status = 'selesai' ke :ServiceTicketController.\n"
        "9. :ServiceTicketController memanggil Storage::disk()->storePublicly() untuk menyimpan berkas foto ke direktori :StorageDisk(S3).\n"
        "10. :StorageDisk(S3) menyimpan fisik berkas citra dan mengembalikan URL publik penyimpanan ke :ServiceTicketController.\n"
        "11. :ServiceTicketController memanggil metode update() pada model ServiceTicket untuk memperbarui data rekaman tiket servis.\n"
        "12. Model mengeksekusi perintah SQL UPDATE service_tickets SET work_status = 'selesai', visit_photo = ?, completion_photo = ? WHERE id = ? ke :PostgreSQL.\n"
        "13. :PostgreSQL mengembalikan konfirmasi pembaruan baris data transaksi berhasil ke model.\n"
        "14. Model mengembalikan instance tiket terbarui ke :ServiceTicketController.\n"
        "15. :ServiceTicketController mengirimkan respons redirect back disertai pesan kilat sukses ke :TicketDialogPWA.\n"
        "16. :TicketDialogPWA menampilkan notifikasi toast 'Laporan Servis Berhasil Dikirim' dan memperbarui status tiket menjadi Selesai.",
        bold_prefix="3. Sequence Diagram Pelaporan dan Penyelesaian Servis oleh Teknisi (UC-10, UC-11, UC-12):\n"
    )

    img_seq_tech = os.path.join(r"c:\Users\An\Herd\servicehub", "sequence_diagram_technician_report_clean.png")
    add_image_safe(img_seq_tech, "Gambar 3.8 Sequence Diagram Pelaporan dan Penyelesaian Servis oleh Teknisi (UC-10, UC-11, UC-12)")

    # =========================================================================
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
        "Alur logika sistem utama ServiceHub dirancang sebagai berikut:\n"
        "1. Inisialisasi & Autentikasi: Pengguna mengakses URL rute /login melalui peramban web dan memasukkan kredensial "
        "alamat email serta kata sandi. Sistem memvalidasi kredensial menggunakan fungsi enkripsi Hash::check(). "
        "Jika kredensial tidak cocok, sistem mengembalikan pesan kesalahan validasi dan mengarahkan kembali ke formulir login. "
        "Jika kredensial valid, sistem menerbitkan sesi baru dan memeriksa peran pengguna (role).\n"
        "2. Alur Operasional Admin Service Center (Role = Admin): Sistem mengarahkan pengguna ke Dashboard Admin (/dashboard). "
        "Admin memiliki wewenang untuk: (a) Menerbitkan tiket baru melalui pemindaian SPK berbasis AI VLM maupun entri formulir manual, "
        "(b) Melakukan pencarian dan penyaringan data tiket berdasarkan nomor SPK atau status pengerjaan, (c) Memperbarui atau menghapus data tiket, "
        "(d) Mengekspor ringkasan laporan tiket servis ke format spreadsheet (.xlsx), dan (e) Mengelola data pengguna/teknisi (/users).\n"
        "3. Alur Operasional Teknisi Lapangan (Role = Teknisi): Sistem mengarahkan teknisi ke antarmuka responsif PWA Mobile. "
        "Teknisi dapat: (a) Melihat daftar tiket servis yang aktif, (b) Membuka detail tiket untuk memeriksa lokasi domisili konsumen "
        "serta keluhan kerusakan unit, (c) Memperbarui status tiket menjadi In Progress saat memulai perbaikan, "
        "(d) Menginput catatan diagnosis teknis, memilih multi-kategori tindakan perbaikan pada kolom work_types, dan mengambil foto fisik "
        "unit saat kedatangan (visit_photo) serta setelah perbaikan selesai (completion_photo), (e) Sistem secara otomatis mengompresi foto "
        "di sisi klien menggunakan HTML5 Canvas, dan (f) Mengirimkan laporan servis (PUT /tickets/{id}) yang mengubah status menjadi Completed.\n"
        "4. Terminasi Sesi (Logout): Pengguna dapat mengakhiri sesi kerja melalui tombol Logout yang memusnahkan data sesi pada basis data "
        "dan mengembalikan peramban ke halaman login.",
        bold_prefix="A. Flowchart Sistem Utama ServiceHub (Gambar 3.9):\n"
    )

    img_flow_main = r"c:\Users\An\Herd\servicehub\flowchart_sistem_utama_clean.png"
    add_image_safe(img_flow_main, "Gambar 3.9 Flowchart Sistem Utama ServiceHub", width_inch=5.2)

    # 2. Flowchart Pipeline Ekstraksi Dokumen AI VLM
    add_p(
        "Flowchart ini mendeskripsikan secara mendalam pipeline pemrosesan citra dokumen Surat Perintah Kerja (SPK) Sharp "
        "menggunakan arsitektur Vision-Language Model multi-engine (Groq Cloud Qwen 3.8 / Google Gemini Vision). Pipeline ini memangkas proses entri manual yang lambat "
        "dan rentan salah ketik menjadi proses ekstraksi otomatis terstruktur dalam hitungan detik. Rincian tahapan eksekusinya meliputi:\n"
        "1. Akuisisi & Validasi Berkas: Admin menekan tombol 'Scan SPK' pada dashboard dan memilih berkas citra formulir SPK fisik "
        "atau memotretnya secara langsung. Sistem memvalidasi ekstensi berkas (.jpg, .jpeg, .png, .webp) serta memastikan ukuran berkas "
        "tidak melebihi batas 10 MB. Jika validasi gagal, sistem memunculkan umpan balik kesalahan dan meminta unggah ulang.\n"
        "2. Konversi Base64 & Perakitan Payload: Pengendali membaca aliran berkas (file stream) dan mengonversinya menjadi representasi "
        "string Base64. Sistem kemudian menyusun Structured System Prompt khusus yang menginstruksikan AI untuk membaca bidang-bidang formulir SPK "
        "standar Sharp Electronics Indonesia dan menegakkan keluaran dalam format JSON murni sesuai skema Data Transfer Object (DTO) ParsedDocumentData.\n"
        "3. Inferensi Multimodal Cloud: Sistem mengirimkan permintaan HTTP POST ke endpoint API VLM aktif (default: Groq Vision API dengan model Qwen 27B Vision / qwen/qwen3.8-27b; alternatif cadangan: Google Gemini API) dengan membawa "
        "citra Base64 dan teks instruksi prompt JSON. Model memproses fitur visual piksel citra dan mengenali karakter teks secara simultan.\n"
        "4. Mitigasi Galat & Fallback Degradation: Jika koneksi API mengalami gangguan, kunci API tidak valid, atau waktu tunggu habis (timeout), "
        "sistem menangkap pengecualian (catch exception), mencatat log kesalahan, dan secara anggun mengalihkan antarmuka ke formulir input kosong "
        "agar proses operasional kantor tidak terhenti.\n"
        "5. Parsing JSON & Human-in-the-Loop Review: Respons JSON yang valid diparsing ke dalam objek DTO dan diisikan secara otomatis (auto-fill) "
        "ke kolom-kolom input formulir pratinjau modal. Admin melakukan verifikasi visual terhadap hasil ekstraksi dan dapat mengoreksi karakter "
        "bila terdapat salah tafsir pada tulisan tangan teknisi.\n"
        "6. Persistensi Basis Data: Admin menekan tombol Simpan Tiket; sistem mengirimkan permintaan POST /tickets, mengeksekusi perintah SQL INSERT "
        "ke tabel service_tickets PostgreSQL, dan menampilkan notifikasi toast sukses pada antarmuka dashboard.",
        bold_prefix="B. Flowchart Pipeline Ekstraksi Dokumen AI Vision-Language Model (Gambar 3.10):\n"
    )

    img_flow_vlm = r"c:\Users\An\Herd\servicehub\flowchart_ekstraksi_vlm_clean.png"
    add_image_safe(img_flow_vlm, "Gambar 3.10 Flowchart Pipeline Ekstraksi Dokumen AI Vision-Language Model (VLM)", width_inch=5.0)

    # 3. Flowchart Kompresi Citra Klien HTML5 Canvas
    add_p(
        "Flowchart ini memodelkan algoritma kompresi citra di sisi klien (client-side image compression) yang dijalankan "
        "pada perangkat seluler teknisi lapangan sebelum berkas foto bukti fisik diunggah ke jaringan internet. Algoritma ini "
        "menjadi solusi krusial bagi teknisi yang beroperasi di wilayah dengan sinyal seluler terbatas. Alur kerja algoritma meliputi:\n"
        "1. Penerimaan Berkas Masukan: Modul utilitas image-compressor.ts menerima objek File dari input kamera smartphone teknisi.\n"
        "2. Validasi Tipe Citra: Sistem memeriksa apakah file.type diawali dengan 'image/'. Jika bukan citra, berkas dikembalikan apa adanya.\n"
        "3. Alokasi Memori Virtual & Pemuatan Citra: Sistem membuat URL objek sementara via URL.createObjectURL(file) dan memuatnya ke dalam "
        "elemen memori new Image(). Saat event img.onload terpicu, memori objek URL segera dibebaskan via URL.revokeObjectURL() untuk "
        "mencegah terjadinya kebocoran memori (memory leak) pada peramban mobile.\n"
        "4. Evaluasi Dimensi & Penskalaan Proporsional: Sistem membaca lebar (width) dan tinggi (height) asli foto. Jika kedua dimensi "
        "berada di bawah atau sama dengan batas maksimal 1600 piksel, dimensi dipertahankan. Jika salah satu melebihi 1600 piksel, "
        "sistem menghitung rasio aspek untuk menentukan dimensi baru secara proporsional:\n"
        "   • Mode Lanskap (W / H > 1): Lebar baru dipatok 1600 px, dan tinggi baru dihitung: H_baru = round((H * 1600) / W).\n"
        "   • Mode Potret (W / H <= 1): Tinggi baru dipatok 1600 px, dan lebar baru dihitung: W_baru = round((W * 1600) / H).\n"
        "5. Resampling Elemen Canvas Off-Screen: Sistem menginisialisasi elemen document.createElement('canvas') dengan dimensi terhitung. "
        "Konteks 2D (ctx) menggambar ulang citra menggunakan metode ctx.drawImage() dengan akselerasi peramban native (hardware-accelerated 2D resampling) untuk menjaga ketajaman visual.\n"
        "6. Kuantisasi JPEG & Rekonstruksi Berkas: Elemen canvas diekspor menggunakan fungsi asinkron canvas.toBlob() dengan format MIME 'image/jpeg' "
        "dan rasio kualitas 0.82 (82%). Blob terkompresi dibungkus kembali ke dalam instance objek File baru dengan nama berkas asli.\n"
        "7. Hasil Reduksi Berkas: Berkas foto hasil kompresi mengalami penyusutan ukuran dari rata-rata 4-6 MB menjadi berkisar 200-450 KB "
        "(efisiensi reduksi ukuran mencapai lebih dari 90%), sehingga waktu pengunggahan via jaringan seluler terpangkas drastis dari belasan detik "
        "menjadi di bawah 2 detik tanpa mengorbankan ketajaman teks stiker nomor seri unit Sharp.",
        bold_prefix="C. Flowchart Algoritma Kompresi Citra Klien HTML5 Canvas (Gambar 3.11):\n"
    )

    img_flow_canvas = r"c:\Users\An\Herd\servicehub\flowchart_kompresi_canvas_clean.png"
    add_image_safe(img_flow_canvas, "Gambar 3.11 Flowchart Algoritma Kompresi Citra Klien HTML5 Canvas", width_inch=5.0)

    # =========================================================================
    # =========================================================================
    # 3.3 ANALISA DAN PEMBAHASAN
    # =========================================================================
    add_h1("3.3 Analisa dan Pembahasan")
    add_p(
        "Analisa dan pembahasan menyajikan evaluasi mendalam terhadap implementasi metode Vision-Language Model (VLM), "
        "efektivitas algoritma kompresi citra berbasis HTML5 Canvas, rancangan antarmuka pengguna sistem Web App ServiceHub, "
        "petunjuk operasional penggunaan program (manual program) untuk peran Admin dan Teknisi Lapangan, "
        "serta hasil pengujian fungsionalitas sistem secara komprehensif menggunakan metode Blackbox Testing."
    )

    # =========================================================================
    # 3.3.1 PEMBAHASAN ALGORITMA
    # =========================================================================
    add_h2("3.3.1 Pembahasan Algoritma")
    add_p(
        "Sub-bab pembahasan algoritma menyajikan analisis komputasional dan matematis yang mendalam terhadap logika kerja dari "
        "metode kecerdasan buatan dan teknik optimasi transmisi data yang diintegrasikan ke dalam arsitektur sistem ServiceHub "
        "PT. Sharp Electronics Indonesia. Pembahasan ini berfokus pada 2 (dua) pilar algoritma komputasi utama yang dirancang "
        "untuk memecahkan kendala operasional lapangan secara langsung:\n"
        "1. Algoritma Ekstraksi Dokumen Vision-Language Model (VLM) untuk otomatisasi pencatatan formulir Surat Perintah Kerja (SPK) Sharp.\n"
        "2. Algoritma Reduksi dan Kompresi Citra Berbasis Off-Screen HTML5 Canvas untuk efisiensi pengunggahan foto dokumentasi servis oleh teknisi lapangan."
    )

    # -------------------------------------------------------------------------
    # A. ALGORITMA EKSTRAKSI DOKUMEN VISION-LANGUAGE MODEL (VLM)
    # -------------------------------------------------------------------------
    add_h3("A. Algoritma Ekstraksi Dokumen Vision-Language Model (VLM)")
    add_p(
        "Vision-Language Model (VLM) merupakan paradigma kecerdasan buatan mutakhir berbasis arsitektur Transformer multimodal "
        "yang memiliki kapabilitas komputasi untuk memproses, mengaitkan, dan menginterpretasikan informasi visual (matriks piksel citra) "
        "serta teks alami (Natural Language Processing/NLP) secara simultan dalam sebuah ruang representasi bersama (joint embedding space). "
        "Penerapan metode VLM pada sistem ServiceHub merupakan inovasi yang dirancang untuk mengatasi kelemahan mendasar dari "
        "teknologi Optical Character Recognition (OCR) konvensional (seperti Tesseract OCR):\n"
        "• Keterbatasan OCR Konvensional: OCR konvensional bekerja secara sekuensial mengekstraksi karakter baris demi baris tanpa "
        "memiliki pemahaman terhadap tata letak spasial (layout awareness) maupun konteks semantik dokumen. Pada formulir fisik SPK Sharp "
        "yang memiliki format multi-kolom, stempel resmi kantor, garis pembatas tabel, serta catatan tulisan tangan teknisi, OCR konvensional "
        "menghasilkan deretan teks mentah yang teracak dan saling tumpang tindih. Proses rekonstruksi data memerlukan aturan ekspresi reguler "
        "(regex parsing) yang sangat rumit serta rentan menghasilkan galat sintaksis.\n"
        "• Keunggulan Metode VLM: Metode VLM memiliki kesadaran spasial-semantik (spatial-semantic awareness) tingkat tinggi. Model tidak sekadar "
        "mengenali karakter, melainkan memahami hubungan fungsional antar-blok dokumen: teks di sebelah kanan label 'Nama Konsumen' diidentifikasi "
        "sebagai entitas nama pelanggan, dan karakter alfanumerik pada kotak 'Model Unit' dipahami sebagai kode model perangkat elektronik Sharp "
        "(seperti AH-XP10UHY). Selain itu, arsitektur VLM mampu melakukan penalaran kontekstual terhadap variasi pencahayaan, kemiringan kertas (skewness), "
        "serta distorsi tulisan tangan teknisi.\n"
        "• Arsitektur Multi-Provider pada ServiceHub: Pada tingkat implementasi perangkat lunak di ServiceHub, algoritma ekstraksi VLM "
        "dibangun menggunakan pola desain Strategy Pattern melalui kontrak antarmuka DocumentScannerInterface. Pola ini mendukung integrasi multi-provider "
        "secara modular antara Groq Cloud Vision API (menggunakan model open-weights Qwen 27B Vision / qwen/qwen3.8-27b) sebagai mesin inferensi "
        "utama berkecepatan tinggi, dan Google Gemini Vision API (gemini-2.5-flash / gemini-3.6-flash) sebagai mesin inferensi alternatif yang dapat dipilih melalui konfigurasi lingkungan (DOCUMENT_SCANNER_PROVIDER). "
        "Arsitektur ini memberikan modularitas tinggi, mengurangi ketergantungan mutlak pada penyedia tunggal (vendor lock-in), serta mempermudah pergantian backend AI tanpa memerlukan modifikasi pada lapisan kontrol aplikasi.",
        bold_prefix="1. Konsep Dasar dan Rasionalitas Pemilihan Metode VLM:\n"
    )

    add_p(
        "Proses komputasi ekstraksi data formulir SPK Sharp menggunakan metode Vision-Language Model dieksekusi melalui 5 (lima) tahapan "
        "komputasi yang terstruktur dan deterministik:\n"
        "• Tahap 1 (Validasi Citra & Pengkodean Base64): Berkas citra SPK yang diunggah divalidasi oleh ScanDocumentController untuk memastikan tipe MIME "
        "(jpeg, jpg, png, webp) dan batasan ukuran berkas maksimal 10 MB (10.240 KB). Aliran biner berkas dikonversi ke format string Base64 "
        "menggunakan base64_encode($file->get()) guna ditransmisikan secara langsung dalam payload JSON HTTP tanpa memerlukan penyimpanan berkas sementara pada server.\n"
        "• Tahap 2 (Rekayasa Instruksi & Penegakan Skema JSON): Sistem menyusun instruksi sistem (system prompt) terstruktur berbahasa Indonesia yang mendefinisikan "
        "peran model sebagai asisten administrasi pusat servis resmi PT. Sharp Electronics Indonesia. Instruksi menginstruksikan model mengekstraksi "
        "15 entitas data operasional: notif_number, customer_name, customer_phone, customer_address, unit_model, serial_number, service_date, "
        "deadline, status, status_note, work_status, work_types, start_time, finish_time, dan notes. Parameter response_format ditetapkan ke "
        "json_object untuk menjamin keluaran berupa JSON murni tanpa elemen markdown.\n"
        "• Tahap 3 (Inferensi Multimodal Berparameter Deterministik): Permintaan HTTP POST dikirimkan ke endpoint API inferensi dengan batas waktu "
        "(timeout) 30 detik serta mekanisme percobaan ulang (retry) otomatis sebanyak 2 kali (Http::timeout(30)->retry(2, 500)). Parameter temperatur "
        "disetel pada nilai deterministik T = 0.1 guna meminimalkan entropi probabilitas token keluaran, meniadakan halusinasi AI, dan memastikan "
        "akurasi pembacaan data dokumen fisik.\n"
        "• Tahap 4 (Deserialisasi DTO & Mitigasi Kesalahan Fallback): Data keluaran JSON diuraikan dan dipetakan ke dalam Data Transfer Object (DTO) "
        "ParsedDocumentData. Sistem menjalankan normalisasi data otomatis (pembersihan gelar nama pelanggan, standardisasi nomor telepon, dan validasi "
        "tanggal ISO YYYY-MM-DD). Apabila terjadi kegagalan jaringan atau pembatasan kuota (HTTP 429), sistem menangkap DocumentScannerException "
        "dan mengembalikan bendera fallback_available = true, yang memicu pembukaan formulir manual kosong di antarmuka peramban.\n"
        "• Tahap 5 (Validasi Human-in-the-Loop): Nilai data hasil ekstraksi diisikan secara otomatis (auto-fill) ke dalam formulir pratinjau modal dialog. "
        "Admin Service Center bertindak sebagai verifikator akhir (Human-in-the-Loop) yang meninjau kesesuaian data dengan lembar fisik sebelum data disimpan "
        "secara permanen ke basis data PostgreSQL melalui perintah SQL INSERT.",
        bold_prefix="2. Alur Eksekusi Komputasi Algoritma VLM:\n"
    )

    add_p(
        "Logika komputasi fungsi pemindaian dokumen pada layanan DocumentScanner disajikan dalam notasi pseudocode formal berikut:",
        bold_prefix="3. Notasi Algoritma Formal (Pseudocode Ekstraksi Dokumen VLM):\n",
        space_after=4
    )

    pseudocode_vlm = (
        "ALGORITMA EkstraksiDokumenSPK_VLM\n"
        "MASUKAN : BerkasGambar (File formulir fisik SPK Sharp dalam format JPEG/PNG/WEBP)\n"
        "KELUARAN: ObjekDTO_ParsedData (Data terstruktur 15 entitas dokumen SPK)\n"
        "DEKLARASI:\n"
        "    base64Data, mimeType, promptTeks, skemaJSON : String\n"
        "    payloadHTTP, responseAPI, dataArray : Objek / Array\n"
        "LANGKAH-LANGKAH:\n"
        "    1. JIKA UkuranBerkas(BerkasGambar) > 10 MB ATAU FormatTidakValid(BerkasGambar) MAKA\n"
        "           LEMPAR PengecualianValidasi('Format atau ukuran berkas tidak memenuhi syarat')\n"
        "       AKHIR JIKA\n"
        "    2. base64Data <- EncodeBase64(BacaBiner(BerkasGambar))\n"
        "    3. mimeType   <- DapatkanMimeType(BerkasGambar)\n"
        "    4. promptTeks <- BangunSystemPromptSpkSharp()\n"
        "    5. skemaJSON  <- BangunSkemaResponJson()\n"
        "    6. payloadHTTP <- SusunPayload({\n"
        "           model: 'qwen/qwen3.8-27b',\n"
        "           messages: [{\n"
        "               role: 'user',\n"
        "               content: [\n"
        "                   {type: 'text', text: promptTeks},\n"
        "                   {type: 'image_url', url: 'data:' + mimeType + ';base64,' + base64Data}\n"
        "               ]\n"
        "           }],\n"
        "           temperature: 0.1,\n"
        "           response_format: {type: 'json_object'}\n"
        "       })\n"
        "    7. COBA\n"
        "           responseAPI <- KirimHttpPost(EndpointAPI, payloadHTTP, Timeout=30s, Retry=2)\n"
        "           JIKA responseAPI.Status == 429 MAKA\n"
        "               LEMPAR PengecualianKuota('Batas kuota API terlampaui')\n"
        "           AKHIR JIKA\n"
        "           JIKA responseAPI.Gagal MAKA\n"
        "               LEMPAR PengecualianAPI('Gangguan layanan VLM')\n"
        "           AKHIR JIKA\n"
        "           dataArray <- ParseJson(responseAPI.Body.Choices[0].Message.Content)\n"
        "           NormalisasiDataEntitas(dataArray)\n"
        "           KEMBALIKAN ParsedDocumentData::fromArray(dataArray)\n"
        "       TANGKAP Pengecualian e MAKA\n"
        "           CatatLogKesalahan(e.Pesan)\n"
        "           AktifkanFallbackFormManual()\n"
        "           LEMPAR e\n"
        "       AKHIR COBA\n"
        "SELESAI ALGORITMA"
    )
    add_code_listing(pseudocode_vlm, caption="Listing 3.1 Pseudocode Ekstraksi Dokumen SPK Berbasis VLM")

    add_p(
        "Evaluasi empiris terhadap akurasi ekstraksi metode VLM diuji menggunakan 20 (dua puluh) sampel fisik lembar formulir SPK Sharp "
        "yang diperoleh selama pelaksanaan Kerja Praktik di Mainwork Service Center Aquos Platinum Pulogadung. Sampel pengujian mencakup "
        "lembar SPK dengan cetakan mesin (printer dot-matrix/inkjet) serta lembar SPK dengan catatan tulisan tangan teknisi lapangan. "
        "Hasil pengujian akurasi ekstraksi per entitas data dirangkum secara mendalam pada Tabel 3.12 berikut:",
        bold_prefix="4. Evaluasi Kinerja dan Hasil Pengujian Akurasi Algoritma VLM:\n",
        space_after=4
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
        ("1", "Nomor Notifikasi SPK", "VARCHAR(255)", "100%", "95%", "Format numerik 10 digit Sharp terbaca sangat presisi tanpa distorsi."),
        ("2", "Nama Konsumen", "VARCHAR(255)", "100%", "90%", "Teks cetak terbaca sempurna; gelar 'BP/IBU' berhasil dibersihkan otomatis."),
        ("3", "Nomor Telepon / HP", "VARCHAR(50)", "100%", "95%", "Format numerik nomor ponsel 08xx/62xx tervalidasi dan dinormalisasi."),
        ("4", "Model Unit Sharp", "VARCHAR(100)", "95%", "85%", "Kombinasi huruf kapital & angka model (misal: AH-XP10UHY) teridentifikasi tepat."),
        ("5", "Nomor Seri (Serial Number)", "VARCHAR(100)", "95%", "85%", "Karakter alfanumerik pada stiker barcode terbaca dengan baik."),
        ("6", "Keluhan Konsumen", "TEXT", "90%", "85%", "Deskripsi keluhan awal (misal: Unit Tidak Dingin, Timer Kedip) terekstraksi utuh."),
        ("7", "Gejala Kerusakan Fisik", "TEXT", "90%", "80%", "Catatan teknis lapangan terekstraksi sesuai konteks komponen yang rusak.")
    ]

    for row_idx, data_row in enumerate(data_vlm, start=1):
        for col_idx, text_val in enumerate(data_row):
            cell = t_vlm.cell(row_idx, col_idx)
            set_cell_background(cell, "F9FAFB" if row_idx % 2 == 1 else "FFFFFF")
            al = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 2, 3, 4] else WD_ALIGN_PARAGRAPH.LEFT
            set_cell_formatted(cell, text_val, font_size=8.0, align=al)
            cell.width = widths_vlm[col_idx]

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    add_callout(
        "Catatan Pemetaan Entitas Hasil Ekstraksi ke Basis Data: Pada formulir fisik SPK Sharp, entitas 'Keluhan Konsumen' "
        "dan 'Gejala Kerusakan Fisik' berada pada bagian form yang terpisah. Pada implementasi skema fisik tabel service_tickets, "
        "kedua data tersebut digabungkan ke dalam satu kolom fisik notes (TEXT) dengan format terstruktur: "
        "'Keterangan: [Keluhan Konsumen] | Kerusakan: [Gejala Kerusakan Fisik]'. Hal ini menjaga kesederhanaan skema tanpa "
        "mengorbankan kelengkapan informasi historis servis.",
        prefix="Pemetaan Kolom Catatan Fisik: "
    )

    add_p(
        "Berdasarkan hasil evaluasi empiris pada Tabel 3.12, implementasi metode Vision-Language Model memberikan dampak efisiensi "
        "yang sangat signifikan terhadap operasional administrasi PT. Sharp Electronics Indonesia:\n"
        "• Efisiensi Durasi Entri Data: Durasi rata-rata yang dibutuhkan staf Admin untuk mencatat 1 berkas SPK ke sistem terpangkas "
        "secara dramatis dari 5–8 menit (saat dilakukan pengetikan manual satu per satu) menjadi hanya 1.8 – 2.5 detik per lembar menggunakan ekstraksi AI VLM.\n"
        "• Reduksi Kesalahan Tipografi (Human Error): Kesalahan salah ketik (typo) pada entitas krusial seperti nomor seri mesin dan nomor ponsel konsumen "
        "yang sering terjadi pada proses entri manual berhasil ditekan hingga di bawah 5%, menjamin akurasi basis data riwayat servis unit Sharp.",
        bold_prefix="5. Analisis Dampak Efisiensi Ekstraksi AI VLM:\n"
    )

    # -------------------------------------------------------------------------
    # B. ALGORITMA KOMPRESI CITRA BERBASIS HTML5 CANVAS
    # -------------------------------------------------------------------------
    add_h3("B. Algoritma Kompresi Citra Berbasis HTML5 Canvas")
    add_p(
        "Selain efisiensi pencatatan SPK di kantor cabang, efisiensi operasional di sisi teknisi lapangan sangat dipengaruhi oleh kelancaran "
        "pengunggahan foto bukti servis unit elektronik di lokasi pelanggan. Kamera smartphone modern menghasilkan foto beresolusi tinggi "
        "(12 MP hingga 48 MP) dengan ukuran berkas berkisar 4 MB hingga 6 MB per foto. Kondisi ini menimbulkan dua permasalahan utama:\n"
        "1. Kegagalan Pengunggahan Akibat Fluktuasi Sinyal 4G: Teknisi yang bertugas di daerah perumahan padat atau daerah dengan sinyal seluler lemah "
        "sering mengalami kegagalan unggah (HTTP timeout), yang memaksa teknisi mengulang proses pelaporan berkali-kali.\n"
        "2. Pembengkakan Kuota Penyimpanan Cloud: Pengunggahan puluhan tiket per hari dengan foto mentah berukuran besar menyebabkan kapasitas ruang "
        "penyimpanan cloud bucket server terbebani secara berlebihan dalam jangka panjang.\n\n"
        "Untuk menuntaskan kendala tersebut, sistem ServiceHub menerapkan algoritma kompresi citra langsung di sisi peramban seluler (client-side) "
        "menggunakan elemen memori virtual off-screen HTML5 Canvas (image-compressor.ts) sebelum berkas dikirimkan melalui jaringan internet.",
        bold_prefix="1. Landasan Masalah dan Rasionalitas Kompresi Sisi Klien:\n"
    )

    add_p(
        "Algoritma kompresi citra pada modul image-compressor.ts mengeksekusi tiga tahapan matematis dan rekayasa memori peramban:\n"
        "1. Formulasi Matematis Preservasi Rasio Aspek (Aspect Ratio Scaling):\n"
        "   Sistem menetapkan batas dimensi maksimal W_maks = H_maks = 1600 piksel. Nilai ini dipilih karena terbukti menghasilkan detail visual yang sangat tajam "
        "   untuk membaca label barcode dan pelat model Sharp, namun memiliki jumlah piksel yang jauh lebih ringkas. "
        "   Apabila lebar asli (W_asli) atau tinggi asli (H_asli) melebihi 1600 piksel, dimensi baru dihitung secara proporsional:\n"
        "   • Mode Lanskap ((W_asli / H_asli) > 1): H_baru = round((H_asli * 1600) / W_asli) dan W_baru = 1600.\n"
        "   • Mode Potret ((W_asli / H_asli) <= 1): W_baru = round((W_asli * 1600) / H_asli) dan H_baru = 1600.\n"
        "2. Manajemen Memori Virtual & Pelepasan Referensi (Memory Leak Prevention):\n"
        "   Citra dimuat ke objek memori virtual new Image() melalui URL objek lokal URL.createObjectURL(file). Sesaat setelah event "
        "   img.onload terpicu dan dimensi berhasil dibaca, referensi memori lokal segera dibebaskan menggunakan URL.revokeObjectURL(objectUrl). "
        "   Langkah ini sangat penting untuk mencegah kebocoran memori RAM (memory leak) pada peramban smartphone teknisi yang memiliki spesifikasi terbatas.\n"
        "3. Kuantisasi Kompresi DCT JPEG & Rekonstruksi Objek File:\n"
        "   Kanvas off-screen dirender pada dimensi baru menggunakan ctx.drawImage() dengan interpolasi penghalusan bicubic smoothing. "
        "   Matriks kanvas selanjutnya dikompresi ke dalam format JPEG melalui metode asinkron canvas.toBlob() dengan koefisien kualitas q = 0.82 (82%). "
        "   Algoritma kuantisasi Discrete Cosine Transform (DCT) pada format JPEG membuang frekuensi tinggi visual yang tidak terdeteksi oleh mata manusia "
        "   (perceptual lossy compression), lalu membungkus Blob terkompresi ke dalam objek File baru dengan nama berkas asli.",
        bold_prefix="2. Formulasi Matematis Preservasi Rasio Aspek dan Kompresi DCT:\n"
    )

    add_p(
        "Alur komputasi reduksi citra pada modul utilitas image-compressor.ts dimodelkan dalam pseudocode formal berikut:",
        bold_prefix="3. Notasi Algoritma Formal (Pseudocode Kompresi Citra Canvas):\n",
        space_after=4
    )

    pseudocode_comp = (
        "ALGORITMA KompresiCitraKlien_HTML5Canvas\n"
        "MASUKAN : BerkasFoto (Objek File kamera mentah dari input ponsel teknisi),\n"
        "           LebarMaks = 1600, TinggiMaks = 1600, Kualitas = 0.82\n"
        "KELUARAN: BerkasTerkompresi (Objek File JPEG teroptimasi ukuran ringkas)\n"
        "DEKLARASI:\n"
        "    objekURL : String;  img : HTMLImageElement\n"
        "    w, h, w_baru, h_baru : Integer;  canvas : HTMLCanvasElement;  ctx : CanvasRenderingContext2D\n"
        "LANGKAH-LANGKAH:\n"
        "    1. JIKA TipeBerkas(BerkasFoto) BUKAN DIAWALI DENGAN 'image/' MAKA\n"
        "           KEMBALIKAN BerkasFoto  // Kembalikan berkas asli tanpa proses\n"
        "       AKHIR JIKA\n"
        "    2. objekURL <- URL.createObjectURL(BerkasFoto)\n"
        "    3. img <- BuatElemenGambar(objekURL)\n"
        "    4. TUNGGU img.onload SELESAI:\n"
        "           URL.revokeObjectURL(objekURL)  // Bebaskan alokasi memori virtual\n"
        "           w <- img.width;  h <- img.height\n"
        "           JIKA (w > LebarMaks) ATAU (h > TinggiMaks) MAKA\n"
        "               JIKA (w / h) > (LebarMaks / TinggiMaks) MAKA\n"
        "                   h_baru <- Bulatkan((h * LebarMaks) / w)\n"
        "                   w_baru <- LebarMaks\n"
        "               SEBALIKNYA\n"
        "                   w_baru <- Bulatkan((w * TinggiMaks) / h)\n"
        "                   h_baru <- TinggiMaks\n"
        "               AKHIR JIKA\n"
        "           SEBALIKNYA\n"
        "               w_baru <- w;  h_baru <- h\n"
        "           AKHIR JIKA\n"
        "           canvas <- InisialisasiCanvas(w_baru, h_baru)\n"
        "           ctx <- canvas.getContext('2d')\n"
        "           ctx.drawImage(img, 0, 0, w_baru, h_baru)  // Hardware-accelerated 2D canvas resampling\n"
        "           canvas.toBlob(FungsiCallback(blobCitra) {\n"
        "               BerkasTerkompresi <- BuatFileBaru(blobCitra, GantiEkstensi(BerkasFoto.Name, '.jpg'), 'image/jpeg')\n"
        "               KEMBALIKAN BerkasTerkompresi\n"
        "           }, 'image/jpeg', Kualitas)\n"
        "SELESAI ALGORITMA"
    )
    add_code_listing(pseudocode_comp, caption="Listing 3.2 Pseudocode Kompresi Citra Klien Berbasis HTML5 Canvas")

    add_p(
        "Pengujian efektivitas algoritma kompresi citra dilakukan secara langsung menggunakan smartphone operasional teknisi "
        "terhadap 5 (lima) sampel foto kondisi unit servis riil di lokasi pelanggan PT. Sharp Electronics Indonesia (Unit AC Inverter, "
        "Smart TV 50 Inci, Kulkas Side-by-Side, Modul PCB, dan Penggantian Panel Layar) melalui jaringan seluler 4G LTE komersial. "
        "Hasil pengujian komparasi disajikan pada Tabel 3.13:",
        bold_prefix="4. Evaluasi Kinerja Reduksi Ukuran dan Durasi Transmisi Data:\n",
        space_after=4
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

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_p(
        "Data empiris pada Tabel 3.13 membuktikan bahwa algoritma kompresi citra klien berbasis HTML5 Canvas secara konsisten "
        "mencapai efisiensi reduksi ukuran berkas sebesar 93.1% hingga 93.5%. Ukuran foto mentah kamera smartphone yang semula mencapai "
        "4 MB hingga 5.6 MB berhasil disusutkan menjadi di bawah 380 KB per foto tanpa mengorbankan keterbacaan visual label nomor seri unit. "
        "Sebagai dampaknya, durasi pengunggahan berkas melalui jaringan seluler 4G LTE terpangkas dari rata-rata 18.2 detik "
        "menjadi hanya 1.1 detik per foto (sekitar 16 kali lebih cepat pada sampel yang diuji). Efisiensi ini secara signifikan meminimalkan risiko kegagalan transmisi data (HTTP request timeout) di lapangan "
        "serta menghemat beban alokasi ruang penyimpanan cloud server secara berkelanjutan. Rasio reduksi dihitung menggunakan formula: "
        "Rasio Reduksi = ((Ukuran Awal - Ukuran Akhir) / Ukuran Awal) x 100%. Hasil pengukuran ini merupakan hasil pengamatan empiris pada 5 sampel pengujian di bawah kondisi jaringan seluler 4G LTE operasional.",
        bold_prefix="5. Analisis Dampak Efisiensi Kompresi Citra Lapangan:\n"
    )

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

    # =========================================================================
    # 3.3.3 IMPLEMENTASI ANTARMUKA (USER INTERFACE IMPLEMENTATION)
    # =========================================================================
    add_h2("3.3.3 Implementasi Antarmuka")
    add_p(
        "Tahap implementasi antarmuka merealisasikan seluruh rancangan cetak biru (wireframe) dan prototipe interaktif ke dalam bentuk "
        "antarmuka pengguna grafis (Graphical User Interface / GUI) nyata yang beroperasi secara penuh pada peramban web modern. "
        "Sistem ServiceHub dibangun menggunakan tumpukan teknologi modern (modern web stack) yang memadukan framework Laravel 11 "
        "pada sisi backend dengan pustaka antarmuka React 19, TypeScript, dan kerangka utilitas penataan gaya Tailwind CSS pada sisi klien. "
        "Integrasi antara backend Laravel dan antarmuka React dihubungkan melalui adaptor monolitik modern Inertia.js v3. "
        "Pilihan arsitektur ini memungkinkan antarmuka ServiceHub beroperasi dengan responsivitas Single-Page Application (SPA) "
        "yang sangat mulus tanpa memerlukan penulisan API REST terpisah, sekaligus mempertahankan keunggulan pengelolaan routing, "
        "autentikasi sesi, dan validasi data terpusat di sisi server.\n\n"
        "Implementasi antarmuka sistem ServiceHub di PT. Sharp Electronics Indonesia disajikan secara komprehensif melalui "
        "5 (lima) visualisasi layar operasional utama berikut:"
    )

    # 1. IMPLEMENTASI HALAMAN LOGIN
    add_p(
        "Implementasi antarmuka halaman login memodelkan pintu gerbang autentikasi tunggal (Single Sign-On entry) bagi seluruh pengguna sistem. "
        "Antarmuka ini menampilkan kartu autentikasi terpusat berlatar belakang bersih dengan identitas visual Sharp Aquos Platinum. "
        "Fitur utama pada antarmuka ini mencakup kolom input email terintegrasi dengan validasi tipe RFC, kolom kata sandi dengan fitur "
        "masking karakter serta tombol pengalih visibilitas teks, kotak centang 'Ingat saya' untuk persistensi token sesi peramban, "
        "serta tombol aksi 'Masuk' yang mengirimkan permintaan POST /login ke controller autentikasi Laravel Fortify. "
        "Formulir login dilengkapi penanganan kesalahan reaktif yang menampilkan pesan umpan balik visual apabila kredensial tidak sesuai.",
        bold_prefix="1. Implementasi Antarmuka Halaman Masuk Sistem (Gambar 3.21):\n"
    )
    img_ui_login = os.path.join(r"c:\Users\An\Herd\servicehub", "ui_login.png")
    add_image_safe(img_ui_login, "Gambar 3.21 Implementasi Antarmuka Halaman Masuk Sistem (Login)", width_inch=5.4)

    # 2. IMPLEMENTASI DASHBOARD OPERASIONAL
    add_p(
        "Implementasi dashboard operasional merupakan pusat komando monitoring dan pengawasan transaksi tiket servis secara real-time "
        "bagi Admin Service Center di kantor cabang Pulogadung maupun Mall of Indonesia (MOI). Antarmuka dashboard terdiri atas empat zona komponen:\n"
        "• Zona Header: Menampilkan logo sistem, penunjuk waktu operasional dinamis, navigasi menu cepat 'Kelola User', dan menu profil Admin.\n"
        "• Zona 4 Kartu KPI Metrik Operasional: Menyajikan ringkasan kuantitatif status tiket yang meliputi Total Notifikasi, volume tiket Berbayar, "
        "volume tiket Bebas Biaya (Garansi / Free Service), serta distribusi sebaran tiket per pusat kerja cabang (Pulogadung, MOI, Lain-lain).\n"
        "• Zona Kontrol & Filter Multi-Kriteria: Menyediakan bilah pencarian teks instan (query nomor notifikasi, nama, no HP, model unit), "
        "filter dropdown Bulan, Status Pembayaran, Mainwork Center, Status Pengerjaan, tombol aksi 'Download (XLSX)' untuk ekspor rekapitulasi Excel, "
        "serta tombol '+ Tambah' untuk memicu pembuatan tiket baru.\n"
        "• Zona Tabel Data Tabular (12 Kolom): Menyajikan katalog tiket servis secara terstruktur dengan fitur penyorotan status warna "
        "(badge hijau untuk tiket selesai dan oranye untuk belum selesai), akses tombol aksi rincian tiket, dan kontrol paginasi halaman.",
        bold_prefix="2. Implementasi Antarmuka Dashboard Operasional Tiket Servis (Gambar 3.22):\n"
    )
    img_ui_dash = os.path.join(r"c:\Users\An\Herd\servicehub", "ui_dashboard.png")
    add_image_safe(img_ui_dash, "Gambar 3.22 Implementasi Antarmuka Dashboard Operasional Tiket Servis", width_inch=5.4)

    # 3. IMPLEMENTASI MODAL PEMINDAIAN SPK (AI VLM)
    add_p(
        "Implementasi antarmuka modal scanner dokumen merupakan implementasi nyata inovasi ekstraksi dokumen otomatis berbasis AI Vision-Language Model. "
        "Dialog pop-up interaktif ini memandu Admin dalam mengunggah atau memotret berkas lembar fisik Surat Perintah Kerja (SPK) Sharp. "
        "Antarmuka dilengkapi dengan kartu petunjuk 'Tips Hasil Scan Maksimal' untuk memastikan ketajaman foto, dua tombol pemicu akuisisi citra "
        "('Ambil Foto dengan Kamera' dan 'Pilih dari Galeri'), indikator status inferensi AI aktif (Groq Vision Qwen 3.8 / Gemini dengan fallback Tesseract), "
        "serta area pratinjau hasil ekstraksi. Pendekatan Human-in-the-Loop diwujudkan pada antarmuka ini, di mana staf Admin dapat meninjau "
        "dan memverifikasi kebenaran 15 entitas data yang diekstrak sebelum disalin ke formulir tiket utama.",
        bold_prefix="3. Implementasi Antarmuka Modal Pemindaian SPK Berbasis AI VLM (Gambar 3.23):\n"
    )
    img_ui_scan = os.path.join(r"c:\Users\An\Herd\servicehub", "ui_modal_scanner.png")
    add_image_safe(img_ui_scan, "Gambar 3.23 Implementasi Antarmuka Modal Pemindaian Dokumen SPK Berbasis AI Vision", width_inch=5.4)

    # 4. IMPLEMENTASI MODAL FORMULIR TIKET MANUAL
    add_p(
        "Implementasi formulir modal tiket servis menangani proses pencatatan data secara manual maupun penyesuaian data dari hasil pemindaian AI. "
        "Formulir ini dirancang mengikuti standar ergonomi pengisian data dengan pengelompokan bidang masukan yang logis:\n"
        "• Bagian Identitas SPK: Nomor Notifikasi (validasi keunikan sistem) dan batas waktu pengerjaan (Deadline).\n"
        "• Bagian Pelanggan: Nama lengkap pelanggan, nomor kontak telepon/WhatsApp, dan alamat domisili pengerjaan servis.\n"
        "• Bagian Perangkat Sharp: Model unit elektronik (AC, TV, Mesin Cuci, dll.) dan nomor seri mesin (Serial Number).\n"
        "• Bagian Finansial & Administrasi: Status pembayaran (radio button Berbayar / Tidak Berbayar), keterangan jaminan bebas biaya "
        "(dropdown Garansi / Free Service jika tidak berbayar), serta cabang penanggung jawab (Pulogadung, MOI, Lain-lain).\n"
        "• Bagian Teknis: Multi-checkbox pilihan kategori tindakan servis resmi Sharp (work_types) dan area teks catatan keluhan/diagnosis teknis (notes). "
        "Formulir divalidasi secara real-time sebelum dikirimkan ke server melalui helper formulir Inertia.js (useForm).",
        bold_prefix="4. Implementasi Antarmuka Modal Formulir Entri Tiket Servis Manual (Gambar 3.24):\n"
    )
    img_ui_form = os.path.join(r"c:\Users\An\Herd\servicehub", "ui_form_manual.png")
    add_image_safe(img_ui_form, "Gambar 3.24 Implementasi Antarmuka Modal Formulir Entri Tiket Servis Manual", width_inch=4.2)

    # 5. IMPLEMENTASI MOBILE PWA TEKNISI
    add_p(
        "Implementasi antarmuka mobile responsif dirancang menggunakan pendekatan Mobile-First Progressive Web App (PWA) guna memfasilitasi "
        "teknisi lapangan dalam mengakses sistem langsung dari smartphone saat berada di lokasi perumahan pelanggan. "
        "Karakteristik utama antarmuka mobile teknisi meliputi:\n"
        "• Tata Letak Vertikal Kompak: Elemen visual dioptimalkan untuk pengoperasian satu tangan dengan area sentuh tombol yang ergonomis.\n"
        "• Kartu Ringkasan Tugas Lapangan: Menyajikan daftar tiket yang ditugaskan kepada teknisi sesuai filter cabang operasional.\n"
        "• Akses Cepat Navigasi Lokasi: Tombol pintas navigasi yang langsung membuka aplikasi Google Maps menuju titik alamat domisili konsumen.\n"
        "• Formulir Pelaporan Lapangan: Memuat pengisian diagnosis perbaikan di lokasi, pemilihan tindakan servis nyata, serta pencatatan waktu pengerjaan.\n"
        "• Integrasi Kamera & Kompresi Otomatis Klien: Komponen input foto langsung mengaktifkan kamera ponsel untuk mengambil foto kondisi unit saat "
        "kedatangan (visit) dan foto penyelesaian (completion). Citra yang ditangkap secara otomatis dikompresi di sisi klien via HTML5 Canvas "
        "sehingga berkas 5 MB menyusut menjadi < 400 KB dalam waktu 1 detik sebelum dikirimkan ke backend.",
        bold_prefix="5. Implementasi Antarmuka Responsif Mobile PWA Teknisi Lapangan (Gambar 3.25):\n"
    )
    img_ui_pwa = os.path.join(r"c:\Users\An\Herd\servicehub", "ui_mobile_pwa.png")
    add_image_safe(img_ui_pwa, "Gambar 3.25 Implementasi Antarmuka Responsif Mobile PWA Teknisi Lapangan", width_inch=3.6)

    # =========================================================================
    # 3.3.4 MANUAL PROGRAM (PANDUAN PENGGUNAAN SISTEM)
    # =========================================================================
    add_h2("3.3.4 Manual Program (Panduan Penggunaan Sistem)")
    add_p(
        "Manual program merupakan dokumentasi instruksi operasional terstruktur yang disusun untuk memandu pengguna akhir (end-users) "
        "dalam mengoperasikan aplikasi ServiceHub sesuai dengan prosedur standar operasional (SOP) PT. Sharp Electronics Indonesia. "
        "Panduan operasional ini dibagi menjadi dua bagian terpisah berdasarkan peran dan wewenang pengguna:"
    )

    # A. PANDUAN PENGGUNAAN ADMIN
    add_h3("A. Panduan Penggunaan untuk Admin Service Center")
    add_p(
        "Staf Administrator Service Center bertanggung jawab atas seluruh siklus pencatatan tiket servis masuk, pengawasan pengerjaan teknisi, "
        "verifikasi status pembayaran, ekspor rekapitulasi data, serta pemeliharaan data akun pengguna. Berikut tahapan operasionalnya:\n\n"
        "1. Langkah 1: Akses Sistem dan Login Akun Admin\n"
        "   a. Buka aplikasi peramban web (Google Chrome / Mozilla Firefox / Microsoft Edge) pada komputer kerja kantor.\n"
        "   b. Akses tautan URL aplikasi ServiceHub (contoh: https://servicehub.sharp.co.id/login).\n"
        "   c. Masukkan alamat email resmi Admin (misal: admin@sharp-servicehub.com) dan kata sandi terdaftar pada bidang isian yang tersedia.\n"
        "   d. Centang opsi 'Ingat saya di perangkat ini' untuk mempertahankan sesi kerja peramban, lalu klik tombol 'Login'.\n"
        "   e. Sistem memverifikasi kredensial dan secara otomatis mengarahkan peramban ke antarmuka Dashboard Operasional.\n\n"
        "2. Langkah 2: Pemantauan Dashboard dan Filter Tiket Operasional\n"
        "   a. Pada Dashboard utama, perhatikan 4 kartu ringkasan KPI untuk membaca performa harian (Total Tiket, Berbayar, Garansi, Sebaran Cabang).\n"
        "   b. Gunakan kontrol filter dropdown untuk memfilter tiket berdasarkan Bulan pengerjaan, Status Pembayaran ('berbayar' / 'tidak_berbayar'), "
        "Pusat Servis Cabang ('Pulogadung' / 'MOI' / 'Lain-lain'), atau Status Pengerjaan ('belum_selesai' / 'selesai').\n"
        "   c. Gunakan bilah pencarian (Search bar) untuk mencari tiket tertentu secara cepat berdasarkan nomor notifikasi SPK, nama konsumen, atau model unit.\n\n"
        "3. Langkah 3: Pencatatan Tiket Otomatis via AI SPK Scanner\n"
        "   a. Klik tombol '+ Tambah' pada bilah kontrol dashboard, lalu pilih opsi dialog 'Scan SPK'.\n"
        "   b. Klik tombol 'Ambil Foto dengan Kamera' untuk memotret lembaran fisik SPK Sharp atau 'Pilih dari Galeri' untuk memilih berkas citra.\n"
        "   c. Tunggu sistem memproses ekstraksi multimodal AI Vision (durasi pemrosesan rata-rata 1.8 - 2.5 detik).\n"
        "   d. Periksa seluruh entitas data yang tampil pada pratinjau hasil ekstraksi (nomor notifikasi, nama pelanggan, kontak, model unit, nomor seri, keluhan).\n"
        "   e. Koreksi karakter tulisan tangan bila diperlukan, lalu klik tombol 'Terapkan Data ke Formulir'.\n"
        "   f. Formulir tiket terisi otomatis; periksa kelengkapan data lalu klik tombol 'Simpan Tiket'. Sistem menampilkan notifikasi sukses.\n\n"
        "4. Langkah 4: Pencatatan dan Pengeditan Tiket Servis Manual\n"
        "   a. Apabila lembaran fisik SPK tidak dapat dipindai kamera, klik tombol '+ Tambah' lalu langsung isi formulir modal entri secara manual.\n"
        "   b. Masukkan nomor notifikasi unik SPK, tanggal deadline, nama pelanggan, kontak telepon, alamat lengkap domisili, dan model unit Sharp.\n"
        "   c. Tentukan status pembayaran servis (pilih 'Berbayar' atau 'Tidak Berbayar' dengan pilihan alasan 'Garansi' / 'Free Service').\n"
        "   d. Pilih pusat kerja penanggung jawab ('Pulogadung' atau 'MOI'), pilih checklist tindakan servis yang direncanakan, lalu klik 'Simpan Tiket'.\n"
        "   e. Untuk mengedit tiket yang sudah ada, klik ikon tombol 'Edit' pada baris tabel tiket, perbarui data, lalu klik 'Perbarui'.\n\n"
        "5. Langkah 5: Pembaruan Status Pembayaran dan Verifikasi Tiket\n"
        "   a. Admin dapat memperbarui status pembayaran tiket pelanggan dari 'tidak_berbayar' menjadi 'berbayar' apabila hasil pemeriksaan membuktikan garansi telah kedaluwarsa.\n"
        "   b. Klik menu dropdown status pada baris tiket atau buka modal edit tiket untuk memperbarui status dan catatan status secara aman.\n\n"
        "6. Langkah 6: Ekspor dan Rekapitulasi Laporan ke Excel (.xlsx)\n"
        "   a. Terapkan filter periode bulan, status pembayaran, atau cabang yang ingin diekspor pada antarmuka dashboard.\n"
        "   b. Klik tombol 'Download (XLSX)' pada bilah kontrol.\n"
        "   c. Server backend mengompilasi seluruh rekaman data tiket aktif ke dalam format spreadsheet terstandarisasi Microsoft Excel (.xlsx).\n"
        "   d. Berkas Excel otomatis terunduh ke komputer Admin dan siap digunakan untuk laporan manajemen purnajual Sharp.\n\n"
        "7. Langkah 7: Manajemen Akun Pengguna Sistem (/users)\n"
        "   a. Klik tautan navigasi 'Kelola User' pada bilah atas dashboard.\n"
        "   b. Sistem menampilkan katalog akun pengguna aktif (Admin dan Teknisi Lapangan).\n"
        "   c. Klik tombol '+ Tambah Pengguna' untuk mendaftarkan akun teknisi baru (masukkan nama lengkap, alamat email resmi, kata sandi, dan peran 'Teknisi').\n"
        "   d. Admin dapat memperbarui data pengguna atau menghapus akun teknisi yang sudah tidak aktif tanpa khawatir merusak rekaman riwayat tiket "
        "(karena relasi created_by dilindungi batasan ON DELETE SET NULL)."
    )

    # B. PANDUAN PENGGUNAAN TEKNISI
    add_h3("B. Panduan Penggunaan untuk Teknisi Lapangan")
    add_p(
        "Teknisi Lapangan bertugas melaksanakan pengerjaan servis unit elektronik di lokasi domisili konsumen serta mendokumentasikan "
        "hasil pengerjaan secara mobile melalui aplikasi Progressive Web App (PWA). Berikut panduan operasional teknisi:\n\n"
        "1. Langkah 1: Akses Sistem Lapangan Berbasis Mobile PWA\n"
        "   a. Buka peramban seluler (Google Chrome pada Android atau Safari pada iOS) pada smartphone kerja.\n"
        "   b. Akses URL ServiceHub dan pilih opsi 'Tambahkan ke Layar Utama' (Add to Home Screen) untuk memasang ikon aplikasi PWA.\n"
        "   c. Buka aplikasi ServiceHub dari layar ponsel, masukkan email dan kata sandi teknisi, lalu klik 'Masuk'.\n\n"
        "2. Langkah 2: Membuka Daftar Tugas dan Detail Tiket Pelanggan\n"
        "   a. Pada antarmuka mobile dashboard, teknisi melihat daftar kartu tugas tiket servis yang teralokasi pada wilayah kerjanya.\n"
        "   b. Ketuk kartu tiket untuk membuka lembar rincian tiket perbaikan.\n"
        "   c. Periksa nama pelanggan, keluhan awal perangkat, model unit Sharp, dan batas waktu target pengerjaan (deadline).\n\n"
        "3. Langkah 3: Mengakses Navigasi Rute Perjalanan ke Lokasi Pelanggan\n"
        "   a. Pada tampilan detail tiket, ketuk ikon peta atau alamat pelanggan.\n"
        "   b. Sistem secara otomatis membuka aplikasi peta navigasi (Google Maps) yang memandu rute perjalanan teknisi menuju rumah pelanggan.\n"
        "   c. Teknisi dapat langsung menghubungi nomor WhatsApp/telepon pelanggan melalui tombol pintas kontak yang disediakan.\n\n"
        "4. Langkah 4: Mengisi Diagnosis dan Memilih Checklist Tindakan Perbaikan\n"
        "   a. Setibanya di lokasi pelanggan, teknisi melakukan pemeriksaan unit dan membuka modal formulir pelaporan servis pada aplikasi PWA.\n"
        "   b. Catat temuan kerusakan teknis dan komponen yang diganti pada bidang teks 'Catatan Diagnosis / Kerusakan'.\n"
        "   c. Pilih satu atau beberapa kategori checklist tindakan perbaikan resmi Sharp pada pemilih work_types (misal: 'Service Mayor', 'Install Bracket'). "
        "Bila memilih opsi 'Lain-lain', ketikkan rincian tindakan pada kolom isian teks pelengkap.\n\n"
        "5. Langkah 5: Dokumentasi Foto Lapangan dengan Kompresi Otomatis Canvas\n"
        "   a. Ketuk tombol 'Ambil Foto Kedatangan' (visit_photo); sistem mengaktifkan sensor kamera smartphone secara langsung.\n"
        "   b. Ambil foto kondisi fisik unit sebelum dibongkar. Modul utilitas peramban secara otomatis mengompresi foto berukuran 5 MB menjadi < 400 KB "
        "menggunakan elemen HTML5 Canvas tanpa menghambat kinerja smartphone.\n"
        "   c. Setelah perbaikan unit tuntas, ketuk tombol 'Ambil Foto Selesai' (completion_photo) untuk memotret unit TV Sharp yang telah menyala normal.\n"
        "   d. Sistem kembali mengompresi foto kedua secara otomatis dan menampilkan pratinjau thumbnail kedua foto pada antarmuka.\n\n"
        "6. Langkah 6: Pengiriman Laporan Servis dan Penyelesaian Tiket\n"
        "   a. Periksa kembali seluruh kelengkapan diagnosis, checklist tindakan, dan foto dokumentasi.\n"
        "   b. Ketuk tombol 'Kirim Laporan Servis'. Sistem mengirimkan permintaan PUT /tickets/{id} ke server, mengunggah kedua foto ke Cloud Storage S3, "
        "dan secara otomatis mengubah nilai kolom work_status menjadi 'selesai'.\n"
        "   c. Sistem menampilkan notifikasi toast 'Laporan Servis Berhasil Dikirim' dan tiket otomatis berpindah status menjadi Selesai."
    )

    # =========================================================================
    # 3.3.5 UJI COBA PROGRAM (BLACKBOX TESTING)
    # =========================================================================
    add_h2("3.3.5 Uji Coba Program (Blackbox Testing)")
    add_p(
        "Uji coba program merupakan tahapan penjaminan kualitas perangkat lunak (Software Quality Assurance / SQA) yang bertujuan untuk "
        "menguji, memvalidasi, dan membuktikan bahwa seluruh fungsionalitas sistem ServiceHub berjalan sesuai dengan spesifikasi kebutuhan yang "
        "telah dirancang tanpa menimbulkan galat (error) logika komputasi maupun ketidakkonsistenan data. Pengujian sistem dilakukan menggunakan "
        "metode Pengujian Kotak Hitam (Blackbox Testing) dengan berfokus pada evaluasi fungsionalitas eksternal sistem:\n\n"
        "1. Metodologi Blackbox Testing:\n"
        "   Pengujian Blackbox menitikberatkan pengujian pada masukan masukan (inputs) dan keluaran keluaran (outputs) program tanpa perlu "
        "   memeriksa struktur logika kode internal perangkat lunak. Metodologi yang digunakan mengombinasikan dua teknik utama:\n"
        "   • Equivalence Partitioning (EP): Membagi seluruh himpunan data masukan ke dalam partisi kelas-kelas data valid dan data tidak valid. "
        "     Sistem dievaluasi untuk memastikan bahwa data masukan valid diterima dan diproses secara benar, sedangkan data tidak valid "
        "     secara tepat dicegat oleh modul validasi sistem.\n"
        "   • Boundary Value Analysis (BVA): Menguji nilai-nilai ekstrem pada batas ambang masukan sistem, seperti batasan ukuran berkas "
        "     maksimal pengunggahan (10 MB), pembatasan kuota panjang karakter string, serta keunikan nilai Natural Key pada basis data.\n\n"
        "2. Ruang Lingkup dan Matriks Pengujian Fungsional:\n"
        "   Ruang lingkup pengujian mencakup 15 (lima belas) kasus uji terstruktur yang merepresentasikan seluruh Use Case fungsional "
        "   (UC-01 sampai dengan UC-14) yang telah dimodelkan pada tahap perancangan sistem. Hasil pengujian fungsional dirangkum "
        "   secara komprehensif pada Tabel 3.14 berikut:"
    )

    # TABEL 3.14: MATRIKS PENGUJIAN BLACKBOX TESTING
    add_p("Tabel 3.14 Matriks Rencana dan Hasil Uji Coba Blackbox Testing Sistem ServiceHub", italic=True)
    t_bb = doc.add_table(rows=16, cols=7)
    t_bb.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_bb)

    h_bb = ["No", "Kode Uji", "Use Case", "Skenario Pengujian (Input & Kondisi)", "Hasil yang Diharapkan", "Hasil Aktual", "Status"]
    w_bb = [Inches(0.35), Inches(0.65), Inches(0.65), Inches(1.8), Inches(1.8), Inches(1.2), Inches(0.65)]

    for idx, name in enumerate(h_bb):
        cell = t_bb.cell(0, idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 60, 60, 70, 70)
        set_cell_formatted(cell, name, font_size=8.5, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255, 255, 255))
        cell.width = w_bb[idx]

    bb_data = [
        ("1", "TC-01", "UC-01", "Menginput alamat email valid (admin@sharp-servicehub.com) dan password benar pada formulir login.",
         "Sistem memvalidasi hash Bcrypt, membuat sesi autentikasi, dan mengarahkan pengguna ke /dashboard.",
         "Pengguna berhasil masuk ke dashboard sesuai peran.", "Valid"),
        ("2", "TC-02", "UC-01", "Menginput kata sandi salah atau format email tidak terdaftar pada halaman login.",
         "Sistem menolak login, mencatat percobaan gagal pada rate limiter, dan menampilkan pesan 'Kredensial tidak cocok'.",
         "Sistem menampilkan notifikasi error validasi 422.", "Valid"),
        ("3", "TC-03", "UC-02", "Mengunggah berkas foto lembar formulir SPK Sharp (format JPEG, ukuran 2.4 MB) pada modal pemindai AI.",
         "Layanan VLM memproses citra dan mengisi otomatis seluruh 15 bidang isian formulir tiket digital.",
         "Seluruh kolom form terisi otomatis dalam waktu 2.1 detik.", "Valid"),
        ("4", "TC-04", "UC-02", "Mengunggah berkas bukan gambar (dokumen .pdf) atau berkas berukuran melebihi batas 10 MB.",
         "Form request ScanDocumentController menolak berkas dan menampilkan pesan error validasi ukuran/tipe berkas.",
         "Muncul pesan error 'Format atau ukuran file tidak didukung'.", "Valid"),
        ("5", "TC-05", "UC-03", "Mengisi formulir tiket manual dengan nomor notifikasi unik baru dan seluruh kolom wajib terisi lengkap.",
         "Sistem menyimpan data ke tabel service_tickets dengan work_status='belum_selesai' dan created_by terikat.",
         "Tiket baru tersimpan dan muncul di tabel dashboard.", "Valid"),
        ("6", "TC-06", "UC-03", "Menginput nomor notifikasi SPK yang telah tersimpan sebelumnya pada basis data (duplikasi nilai Notif).",
         "Validasi keunikan database (Unique Key) menolak simpan dan memunculkan notifikasi nomor notifikasi sudah terdaftar.",
         "Sistem menampilkan pesan 'Nomor notifikasi sudah digunakan'.", "Valid"),
        ("7", "TC-07", "UC-04", "Memilih filter dropdown Pusat Servis 'Pulogadung' dan Status 'berbayar' pada dashboard operasional.",
         "Tabel reaktif memuat daftar tiket terfilter secara dinamis via Inertia.js tanpa memuat ulang seluruh halaman peramban.",
         "Daftar tiket tersaring presisi sesuai kriteria terpilih.", "Valid"),
        ("8", "TC-08", "UC-05", "Menekan tombol aksi 'Detail' pada salah satu baris transaksi tiket servis di tabel dashboard.",
         "Modal dialog rincian tiket terbuka menyajikan seluruh data pelanggan, spesifikasi unit, diagnosis, dan foto servis.",
         "Modal detail terbuka lengkap dengan pratinjau foto.", "Valid"),
        ("9", "TC-09", "UC-06", "Menekan tombol 'Download (XLSX)' pada dashboard operasional untuk mengunduh rekapitulasi data servis.",
         "Backend mengompilasi seluruh rekaman tiket terfilter dan menghasilkan unduhan berkas spreadsheet berformat .xlsx.",
         "Berkas Excel terunduh sempurna dan dapat dibuka.", "Valid"),
        ("10", "TC-10", "UC-10", "Memilih multi-kategori tindakan servis ('Service Mayor' dan 'Install Bracket') pada form pelaporan teknisi.",
         "Data array tindakan tersimpan secara native ke dalam kolom JSON work_types di basis data PostgreSQL.",
         "Array JSON tersimpan utuh dan terbaca pada detail tiket.", "Valid"),
        ("11", "TC-11", "UC-11", "Teknisi mengambil foto unit resolusi 12 MP (ukuran 5.1 MB) menggunakan kamera smartphone via PWA.",
         "Modul utilitas Canvas di peramban mengompresi foto secara otomatis menjadi < 400 KB sebelum diunggah ke server.",
         "Foto terkompresi menjadi 334 KB dalam waktu 1.1 detik.", "Valid"),
        ("12", "TC-12", "UC-12", "Teknisi menekan tombol 'Kirim Laporan Servis' dengan foto kedatangan dan foto selesai terlampir lengkap.",
         "Sistem mengunggah berkas ke Cloud Storage S3, memperbarui work_status menjadi 'selesai', dan mencatat jam selesai.",
         "Tiket diperbarui menjadi status Selesai dengan URL foto valid.", "Valid"),
        ("13", "TC-13", "UC-13", "Pengguna menekan tombol 'Keluar' (Logout) pada menu profil akun pengguna.",
         "Sistem menghancurkan sesi autentikasi pada server, meregenerasi token CSRF, dan mengalihkan peramban ke halaman login.",
         "Sesi berakhir dan peramban kembali ke tampilan login.", "Valid"),
        ("14", "TC-14", "UC-14", "Admin menambahkan akun pengguna baru dengan peran 'Teknisi' melalui modul manajemen pengguna (/users).",
         "Akun baru tersimpan pada tabel users dengan password terenkripsi Bcrypt dan muncul pada tabel daftar petugas.",
         "Akun teknisi baru berhasil dibuat dan dapat login.", "Valid"),
        ("15", "TC-15", "UC-14", "Pengguna dengan peran 'Teknisi' mencoba mengakses rute URL Admin (/users) secara langsung via bilah alamat URL.",
         "Middleware otorisasi 'admin' mencegat permintaan dan menolak akses dengan mengembalikan kode HTTP 403 / redirect.",
         "Akses ditolak dan pengguna diarahkan kembali ke dashboard.", "Valid")
    ]

    for row_idx, r_val in enumerate(bb_data, start=1):
        bg = "F9FAFB" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text_val in enumerate(r_val):
            cell = t_bb.cell(row_idx, col_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, 40, 40, 50, 50)
            if col_idx in [0, 1, 2, 6]:
                al = WD_ALIGN_PARAGRAPH.CENTER
            elif col_idx in [3, 4, 5]:
                al = WD_ALIGN_PARAGRAPH.JUSTIFY
            else:
                al = WD_ALIGN_PARAGRAPH.LEFT
            bold_val = True if col_idx == 6 else False
            color_val = RGBColor(22, 163, 74) if (col_idx == 6 and text_val == "Valid") else RGBColor(0, 0, 0)
            set_cell_formatted(cell, text_val, font_size=8.0, bold=bold_val, align=al, color=color_val)
            cell.width = w_bb[col_idx]

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_p(
        "Berdasarkan hasil pelaksanaan uji coba program menggunakan metode Blackbox Testing pada Tabel 3.14, diperoleh ringkasan evaluasi sebagai berikut:\n"
        "1. Tingkat Kelulusan Fungsional 100%: Seluruh 15 (lima belas) kasus uji yang mencakup seluruh Use Case fungsional (UC-01 s/d UC-14) "
        "berhasil dilalui dengan status 'Valid'. Tidak ditemukan adanya kegagalan fungsional, kemacetan alur kerja, maupun galat fatal (fatal crash) "
        "selama proses pengujian berlangsung.\n"
        "2. Integritas Data dan Keandalan Transaksi: Batasan integritas basis data (Unique Constraint pada notif_number, Foreign Key ON DELETE SET NULL "
        "pada created_by, dan tipe native JSON pada work_types) terbukti beroperasi secara konsisten dalam mencegah terjadinya korupsi atau kehilangan data.\n"
        "3. Efektivitas Otomatisasi AI dan Optimasi Kompresi Citra: Pengujian fitur pemindaian AI membuktikan keberhasilan ekstraksi dokumen "
        "secara cepat dengan verifikasi manusia (Human-in-the-Loop), sedangkan modul kompresi citra klien HTML5 Canvas secara nyata mereduksi "
        "ukuran foto sebesar > 90% sehingga menjamin kelancaran transmisi laporan teknisi di lapangan.\n"
        "4. Kesimpulan Kesiapan Operasional: Hasil evaluasi pengujian secara komprehensif membuktikan bahwa sistem ServiceHub telah memenuhi "
        "seluruh kriteria penerimaan perangkat lunak (acceptance criteria) dan siap untuk diimplementasikan secara penuh pada unit layanan purnajual "
        "PT. Sharp Electronics Indonesia.",
        bold_prefix="3. Analisis dan Kesimpulan Hasil Pengujian Blackbox Testing:\n"
    )

    art_dir = r"C:\Users\An\.gemini\antigravity\brain\f58e67fa-53d0-4905-b0e9-27b48316309f"
    art_file = os.path.join(art_dir, "BAB_3_Perancangan_Sistem_ServiceHub.docx")

    saved_path = output_path
    try:
        doc.save(output_path)
        print(f"BAB 3 document successfully generated at: {output_path}")
    except PermissionError:
        saved_path = output_path.replace(".docx", "_updated.docx")
        doc.save(saved_path)
        print(f"[NOTE] {output_path} sedang dibuka di Microsoft Word.")
        print(f"Versi terbaru berhasil disimpan di: {saved_path}")

    # Always sync to artifact directory
    try:
        doc.save(art_file)
        print(f"BAB 3 document also synced to artifact directory: {art_file}")
    except Exception as e:
        print(f"Artifact sync note: {e}")

if __name__ == "__main__":
    out_file = r"c:\Users\An\Herd\servicehub\BAB_3_Perancangan_Sistem_ServiceHub.docx"
    build_bab3_document(out_file)

