import re

with open("create_bab3_doc.py", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update def add_code_listing
old_func = '''    def add_code_listing(code_text, caption=""):
        """Listing program dicetak dengan ukuran 10, dengan spasi 1 (Panduan UNPAM)."""
        if caption:
            add_caption(caption)
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.0  # Spasi 1
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(code_text)
        r.font.name = 'Consolas'
        r.font.size = Pt(10)  # Ukuran 10
        r.font.color.rgb = RGBColor(0, 0, 0)
        return p'''

new_func = '''    def add_code_listing(code_text, caption=""):
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

        lines = code_text.strip().split("\\n")
        p_body = cell_body.paragraphs[0]
        p_body.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_body.paragraph_format.line_spacing = 1.0
        p_body.paragraph_format.space_before = Pt(0)
        p_body.paragraph_format.space_after = Pt(1.5)

        keywords_major = ["ALGORITMA", "MASUKAN", "KELUARAN", "DEKLARASI", "LANGKAH-LANGKAH", "SELESAI ALGORITMA"]
        control_flow = ["JIKA", "MAKA", "AKHIR JIKA", "SEBALIKNYA", "COBA", "TANGKAP", "AKHIR COBA", "LEMPAR", "KEMBALIKAN", "TUNGGU"]

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

            tokens = re.split(r'(\\b[A-Z_]{2,}\\b|<-|\'[^\']*\'|\\b\\d+\\b)', code_part)
            for tok in tokens:
                if not tok:
                    continue
                r = p_line.add_run(tok)
                r.font.name = 'Consolas'
                r.font.size = Pt(9.0)
                if is_major and any(k in tok for k in keywords_major):
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
        return table'''

if old_func in text:
    text = text.replace(old_func, new_func)
    print("Updated add_code_listing function successfully!")
else:
    print("Warning: old_func pattern not found!")

# 2. Update calls to pass captions
old_call1 = "    add_code_listing(pseudocode_vlm)"
new_call1 = "    add_code_listing(pseudocode_vlm, caption=\"Listing 3.1 Pseudocode Ekstraksi Dokumen SPK Berbasis VLM\")"

old_call2 = "    add_code_listing(pseudocode_comp)"
new_call2 = "    add_code_listing(pseudocode_comp, caption=\"Listing 3.2 Pseudocode Kompresi Citra Klien Berbasis HTML5 Canvas\")"

if old_call1 in text:
    text = text.replace(old_call1, new_call1)
    print("Updated call 1 successfully!")
else:
    print("Warning: old_call1 not found!")

if old_call2 in text:
    text = text.replace(old_call2, new_call2)
    print("Updated call 2 successfully!")
else:
    print("Warning: old_call2 not found!")

with open("create_bab3_doc.py", "w", encoding="utf-8") as f:
    f.write(text)

print("create_bab3_doc.py saved.")
