import docx
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = docx.Document()
section = doc.sections[0]
section.different_first_page_header_footer = True

# First page footer (centered page number)
p_ff = section.first_page_footer.paragraphs[0]
p_ff.alignment = WD_ALIGN_PARAGRAPH.CENTER
xml_fld1 = f'<w:fldSimple {nsdecls("w")} w:instr="PAGE"/>'
p_ff._p.append(parse_xml(xml_fld1))

# Subsequent pages header (right-aligned page number)
p_h = section.header.paragraphs[0]
p_h.alignment = WD_ALIGN_PARAGRAPH.RIGHT
xml_fld2 = f'<w:fldSimple {nsdecls("w")} w:instr="PAGE"/>'
p_h._p.append(parse_xml(xml_fld2))

doc.add_paragraph('Page 1 content with Chapter Title')
doc.add_page_break()
doc.add_paragraph('Page 2 content')
doc.save('scratch_test_page_no.docx')
print('Successfully saved scratch test with page numbering!')
