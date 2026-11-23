import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def add_code_card(doc, code_text, title="Listing Program"):
    """
    Membungkus pseudocode ke dalam container card profesional:
    - Header box biru Sharp (#1E3A8A) dengan judul listing
    - Background box abu-abu terang (#F8FAFC)
    - Border tipis rapi (#CBD5E1)
    - Font Consolas 9.0 pt, spasi 1.0, dengan syntax highlighting
    """
    table = doc.add_table(rows=2, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # 1. Header Row
    cell_hdr = table.cell(0, 0)
    tcPr0 = cell_hdr._tc.get_or_add_tcPr()
    shd0 = parse_xml(f'<w:shd {nsdecls("w")} w:fill="1E3A8A"/>')
    tcPr0.append(shd0)
    tcMar0 = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="80" w:type="dxa"/>'
        f'<w:bottom w:w="80" w:type="dxa"/>'
        f'<w:left w:w="160" w:type="dxa"/>'
        f'<w:right w:w="160" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr0.append(tcMar0)

    p_hdr = cell_hdr.paragraphs[0]
    p_hdr.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_hdr.paragraph_format.line_spacing = 1.0
    p_hdr.paragraph_format.space_before = Pt(2)
    p_hdr.paragraph_format.space_after = Pt(2)
    r_hdr = p_hdr.add_run(f"  {title}")
    r_hdr.font.name = 'Consolas'
    r_hdr.font.size = Pt(9.5)
    r_hdr.font.bold = True
    r_hdr.font.color.rgb = RGBColor(255, 255, 255)

    # 2. Body Row
    cell_body = table.cell(1, 0)
    tcPr1 = cell_body._tc.get_or_add_tcPr()
    shd1 = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F8FAFC"/>')
    tcPr1.append(shd1)
    tcMar1 = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="120" w:type="dxa"/>'
        f'<w:bottom w:w="120" w:type="dxa"/>'
        f'<w:left w:w="160" w:type="dxa"/>'
        f'<w:right w:w="160" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr1.append(tcMar1)

    # Table Borders
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

    lines = code_text.strip().split("\n")
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

        # Parse comments
        if "//" in line:
            code_part, comment_part = line.split("//", 1)
            comment_text = "//" + comment_part
        else:
            code_part = line
            comment_text = ""

        # Check major header keywords
        trimmed = code_part.strip()
        is_major = any(trimmed.startswith(k) for k in keywords_major)

        # Tokenize code_part
        # Replace arrow '<-' with run
        tokens = re.split(r'(\b[A-Z_]{2,}\b|<-|\'[^\']*\'|\b\d+\b)', code_part)
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

    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    return table

doc = Document()
sample_code = """ALGORITMA EkstraksiDokumenSPK_VLM
MASUKAN : BerkasGambar (File formulir fisik SPK Sharp dalam format JPEG/PNG/WEBP)
KELUARAN: ObjekDTO_ParsedData (Data terstruktur 15 entitas dokumen SPK)
DEKLARASI:
    base64Data, mimeType, promptTeks, skemaJSON : String
    payloadHTTP, responseAPI, dataArray : Objek / Array
LANGKAH-LANGKAH:
    1. JIKA UkuranBerkas(BerkasGambar) > 10 MB ATAU FormatTidakValid(BerkasGambar) MAKA
           LEMPAR PengecualianValidasi('Format atau ukuran berkas tidak memenuhi syarat')
       AKHIR JIKA
    2. base64Data <- EncodeBase64(BacaBiner(BerkasGambar))
    3. mimeType   <- DapatkanMimeType(BerkasGambar)
    4. promptTeks <- BangunSystemPromptSpkSharp()
    5. skemaJSON  <- BangunSkemaResponJson()
    6. payloadHTTP <- SusunPayload({
           model: 'qwen/qwen3.8-27b',
           temperature: 0.1
       })
    7. COBA
           responseAPI <- KirimHttpPost(EndpointAPI, payloadHTTP, Timeout=30s, Retry=2)
           KEMBALIKAN ParsedDocumentData::fromArray(dataArray)
       TANGKAP Pengecualian e MAKA
           CatatLogKesalahan(e.Pesan)
           AktifkanFallbackFormManual() // Fallback ke form manual jika API error
           LEMPAR e
       AKHIR COBA
SELESAI ALGORITMA"""

add_code_card(doc, sample_code, "Listing 3.1: Pseudocode Ekstraksi Dokumen SPK Berbasis VLM")
doc.save("test_output_code_card.docx")
print("Saved test_output_code_card.docx successfully!")
