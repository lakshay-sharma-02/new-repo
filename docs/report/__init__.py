"""Formatting helpers for the Laundry Roulette final report."""

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

INK = RGBColor(31, 41, 55)
NAVY = RGBColor(30, 58, 138)
SLATE = RGBColor(71, 85, 105)
GREY = RGBColor(107, 114, 128)
RED = RGBColor(153, 27, 27)
WHITE = RGBColor(255, 255, 255)

CONTENT_WIDTH = 6.8  # inches available with 0.85" side margins on A4


# --------------------------------------------------------------------------- doc
def setup_document():
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.75)
    section.left_margin = Inches(0.85)
    section.right_margin = Inches(0.85)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = INK
    normal.paragraph_format.line_spacing = 1.15
    normal.paragraph_format.space_after = Pt(5)

    for name in ("List Bullet", "List Number"):
        style = doc.styles[name]
        style.font.name = "Calibri"
        style.font.size = Pt(10.5)
        style.font.color.rgb = INK
        style.paragraph_format.space_after = Pt(2)
        style.paragraph_format.line_spacing = 1.12

    section.different_first_page_header_footer = True
    add_header_footer(doc)
    return doc


def add_header_footer(doc):
    section = doc.sections[0]
    header = section.header
    hp = header.paragraphs[0]
    hp.text = ""
    run = hp.add_run("INT335 Design Thinking  ·  Laundry Roulette  ·  Project P21 / Team 05")
    run.font.size = Pt(8)
    run.font.color.rgb = GREY
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = fp.add_run("")
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    fp._p.append(fld)
    for r in fp.runs:
        r.font.size = Pt(8)
        r.font.color.rgb = GREY


# ------------------------------------------------------------------------ blocks
def h1(doc, text, page_break=True):
    if page_break:
        doc.add_page_break()
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(19)
    run.font.color.rgb = NAVY
    rule = doc.add_paragraph()
    rule.paragraph_format.space_before = Pt(0)
    rule.paragraph_format.space_after = Pt(12)
    pPr = rule._p.get_or_add_pPr()
    pPr.insert_element_before(parse_xml(
        f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="10" w:space="1" w:color="1E3A8A"/></w:pBdr>'),
        'w:shd', 'w:tabs', 'w:suppressAutoHyphens', 'w:kinsoku', 'w:wordWrap',
        'w:overflowPunct', 'w:topLinePunct', 'w:autoSpaceDE', 'w:autoSpaceDN',
        'w:bidi', 'w:adjustRightInd', 'w:snapToGrid', 'w:spacing', 'w:ind',
        'w:contextualSpacing', 'w:mirrorIndents', 'w:suppressOverlap', 'w:jc',
        'w:textDirection', 'w:textAlignment', 'w:textboxTightWrap', 'w:outlineLvl',
        'w:divId', 'w:cnfStyle', 'w:rPr', 'w:sectPr', 'w:pPrChange')
    return p


def h2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(14)
    run.font.color.rgb = NAVY
    return p


def h3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(11)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(11.5)
    run.font.color.rgb = RGBColor(55, 65, 81)
    return p


def para(doc, text, size=10.5, bold=False, italic=False, color=INK, align=None,
         space_after=5, space_before=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    if align == "center":
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == "justify":
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(size)
    run.font.color.rgb = color
    return p


def bullets(doc, items, style="List Bullet", size=10.5):
    for item in items:
        if isinstance(item, tuple):
            head, rest = item
            p = doc.add_paragraph(style=style)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(head)
            r.bold = True
            r.font.size = Pt(size)
            r2 = p.add_run(rest)
            r2.font.size = Pt(size)
        else:
            p = doc.add_paragraph(item, style=style)
            p.paragraph_format.space_after = Pt(2)
            for run in p.runs:
                run.font.size = Pt(size)


def quote(doc, text, source):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(CONTENT_WIDTH)
    shade(cell, "F8FAFC")
    borders(cell, left=("single", 18, "94A3B8"))
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(f"\u201c{text}\u201d")
    r.italic = True
    r.font.size = Pt(10)
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_after = Pt(4)
    r2 = p2.add_run(f"— {source}")
    r2.bold = True
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = SLATE
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def callout(doc, title, text, fill="EFF6FF", bar="2563EB", title_color=NAVY):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.autofit = False
    cell = tbl.cell(0, 0)
    cell.width = Inches(CONTENT_WIDTH)
    shade(cell, fill)
    borders(cell, left=("single", 24, bar))
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(5)
    p.paragraph_format.space_after = Pt(4)
    if title:
        r = p.add_run(title + "\n")
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = title_color
    r = p.add_run(text)
    r.font.size = Pt(10)
    doc.add_paragraph().paragraph_format.space_after = Pt(3)


def figure(doc, path, caption, width=6.4):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    p.add_run().add_picture(path, width=Inches(width))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(10)
    r = cap.add_run(caption)
    r.italic = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = SLATE


def signature_row(doc, left="Member — signature and date", right="Team Lead — countersigned"):
    tbl = doc.add_table(rows=1, cols=2)
    tbl.autofit = False
    for i, text in enumerate((left, right)):
        cell = tbl.cell(0, i)
        cell.width = Inches(CONTENT_WIDTH / 2)
        borders(cell, top=("single", 6, "9CA3AF"), bottom=("single", 6, "9CA3AF"),
                left=("single", 6, "9CA3AF"), right=("single", 6, "9CA3AF"))
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(22)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(text)
        r.font.size = Pt(8.5)
        r.font.color.rgb = SLATE
    doc.add_paragraph().paragraph_format.space_after = Pt(4)


# ------------------------------------------------------------------------ tables
TC_AFTER_SHD = ('w:noWrap', 'w:tcMar', 'w:textDirection', 'w:tcFitText', 'w:vAlign',
                 'w:hideMark', 'w:headers', 'w:cellIns', 'w:cellDel', 'w:cellMerge',
                 'w:tcPrChange')
TC_AFTER_BORDERS = ('w:shd',) + TC_AFTER_SHD
TC_AFTER_MAR = ('w:textDirection', 'w:tcFitText', 'w:vAlign', 'w:hideMark', 'w:headers',
                'w:cellIns', 'w:cellDel', 'w:cellMerge', 'w:tcPrChange')


def shade(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    for old in tcPr.findall(qn("w:shd")):
        tcPr.remove(old)
    tcPr.insert_element_before(
        parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'), *TC_AFTER_SHD)


def borders(cell, left=None, top=None, bottom=None, right=None):
    parts = []
    for edge, spec in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        if spec:
            val, sz, color = spec
            parts.append(f'<w:{edge} w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>')
        else:
            parts.append(f'<w:{edge} w:val="none" w:sz="0" w:space="0" w:color="auto"/>')
    tcPr = cell._tc.get_or_add_tcPr()
    for old in tcPr.findall(qn("w:tcBorders")):
        tcPr.remove(old)
    tcPr.insert_element_before(
        parse_xml(f'<w:tcBorders {nsdecls("w")}>{"".join(parts)}</w:tcBorders>'),
        *TC_AFTER_BORDERS)


def cell_margins(cell, top=60, bottom=60, left=90, right=90):
    tcPr = cell._tc.get_or_add_tcPr()
    for old in tcPr.findall(qn("w:tcMar")):
        tcPr.remove(old)
    tcPr.insert_element_before(
        parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/>'
                  f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                  f'<w:left w:w="{left}" w:type="dxa"/>'
                  f'<w:right w:w="{right}" w:type="dxa"/></w:tcMar>'),
        *TC_AFTER_MAR)


def table_borders(table, color="D1D5DB"):
    tblPr = table._tbl.tblPr
    for old in tblPr.findall(qn("w:tblBorders")):
        tblPr.remove(old)
    tblPr.insert_element_before(parse_xml(
        f'<w:tblBorders {nsdecls("w")}><w:top w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="none"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/></w:tblBorders>'),
        'w:shd', 'w:tblLayout', 'w:tblCellMar', 'w:tblLook', 'w:tblCaption',
        'w:tblDescription', 'w:tblPrChange')


def _repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))


def table(doc, headers, rows, widths=None, font_size=8.5, header_fill="1E3A8A",
          first_col_bold=False, zebra=True, align=None):
    tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    table_borders(tbl)

    if widths:
        scale = CONTENT_WIDTH / sum(widths)
        widths = [w * scale for w in widths]

    hdr = tbl.rows[0]
    _repeat_header(hdr)
    for i, text in enumerate(headers):
        cell = hdr.cells[i]
        cell.text = ""
        shade(cell, header_fill)
        cell_margins(cell, top=70, bottom=70)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        if align:
            p.alignment = align
        r = p.add_run(str(text))
        r.bold = True
        r.font.size = Pt(font_size)
        r.font.color.rgb = WHITE

    for r_idx, row in enumerate(rows):
        for c_idx, value in enumerate(row):
            cell = tbl.rows[r_idx + 1].cells[c_idx]
            cell.text = ""
            cell_margins(cell)
            if zebra and r_idx % 2 == 1:
                shade(cell, "F8FAFC")
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            r = p.add_run(str(value))
            r.font.size = Pt(font_size)
            r.font.color.rgb = INK
            if first_col_bold and c_idx == 0:
                r.bold = True

    if widths:
        for row in tbl.rows:
            for idx, w in enumerate(widths):
                row.cells[idx].width = Inches(w)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return tbl


def key_value_table(doc, rows, widths=(1.7, 5.1), font_size=9.5):
    tbl = doc.add_table(rows=len(rows), cols=2)
    tbl.autofit = False
    table_borders(tbl)
    scale = CONTENT_WIDTH / sum(widths)
    widths = [w * scale for w in widths]
    for r_idx, (key, value) in enumerate(rows):
        c0, c1 = tbl.rows[r_idx].cells
        for cell in (c0, c1):
            cell.text = ""
            cell_margins(cell, top=80, bottom=80)
        shade(c0, "EEF2FF")
        c0.paragraphs[0].paragraph_format.space_after = Pt(0)
        r = c0.paragraphs[0].add_run(key)
        r.bold = True
        r.font.size = Pt(font_size)
        r.font.color.rgb = NAVY
        c1.paragraphs[0].paragraph_format.space_after = Pt(0)
        r = c1.paragraphs[0].add_run(value)
        r.font.size = Pt(font_size)
        r.font.color.rgb = INK
        c0.width = Inches(widths[0])
        c1.width = Inches(widths[1])
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return tbl


def section_banner(doc, number, role, name, reg, roll):
    doc.add_page_break()
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(60)
    p.paragraph_format.space_after = Pt(6)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(f"SECTION {number}")
    r.bold = True
    r.font.size = Pt(13)
    r.font.color.rgb = GREY

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(18)
    r = p.add_run(role)
    r.bold = True
    r.font.size = Pt(26)
    r.font.color.rgb = NAVY

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(60)
    r = p.add_run(f"Written by {name}\nRegistration No. {reg}  ·  Roll No. {roll}")
    r.font.size = Pt(11)
    r.font.color.rgb = SLATE


def part_status_table(doc, parts):
    table(doc, ["Part", "Title", "Stage of the module"], parts,
          widths=[0.7, 3.6, 2.5], font_size=8.5)


def plain_table(doc, rows, widths=None, font_size=8.8, first_col_fill="EEF2FF",
                bold_first=True, fills=None):
    """A table with no header row, used for two-by-two canvases."""
    tbl = doc.add_table(rows=len(rows), cols=len(rows[0]))
    tbl.autofit = False
    table_borders(tbl)
    if widths:
        scale = CONTENT_WIDTH / sum(widths)
        widths = [w * scale for w in widths]
    for r_idx, row in enumerate(rows):
        for c_idx, value in enumerate(row):
            cell = tbl.rows[r_idx].cells[c_idx]
            cell.text = ""
            cell_margins(cell, top=80, bottom=80)
            if c_idx == 0 and first_col_fill:
                shade(cell, first_col_fill)
            if fills and (r_idx, c_idx) in fills:
                shade(cell, fills[(r_idx, c_idx)])
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.08
            r = p.add_run(str(value))
            r.font.size = Pt(font_size)
            r.font.color.rgb = INK
            if c_idx == 0 and bold_first:
                r.bold = True
                r.font.color.rgb = NAVY
    if widths:
        for row in tbl.rows:
            for idx, w in enumerate(widths):
                row.cells[idx].width = Inches(w)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return tbl


def contribution_block(doc, name, reg, roll, role, contributions, team_statement):
    h2(doc, "Contribution statement and declaration")
    key_value_table(doc, [
        ("Name", name),
        ("Registration no. / Roll no.", f"{reg} / {roll}"),
        ("Role held", role),
    ], widths=(2.0, 4.8), font_size=9.5)

    h3(doc, "What I personally did")
    bullets(doc, contributions)

    h3(doc, "The team's point of view, in my words")
    para(doc, team_statement, size=10, italic=True)

    h3(doc, "DECLARATION")
    para(doc,
         "I confirm that the work described above is my own, that the research evidence I contributed comes "
         "from real participants who gave informed consent, and that every source I used is listed in Part 21 "
         "of this report, including the AI-use statement. I understand that fabricated research voids the marks "
         "for this assessment and is referred as academic misconduct.",
         size=9.5)
    signature_row(doc)
