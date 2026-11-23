import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np

# Set figure and DPI (Ultra HD Widescreen 24 x 15 inches at 300 DPI)
fig_width, fig_height = 24.0, 15.2
fig, ax = plt.subplots(figsize=(fig_width, fig_height), dpi=300)
ax.set_xlim(0, 240)
ax.set_ylim(0, 152)
ax.axis('off')

# Font settings
plt.rcParams['font.family'] = 'Segoe UI'

# Color Palette
BG_CANVAS = "#F1F5F9"       # Slate 100
CARD_BG = "#FFFFFF"         # White
BORDER_SLATE = "#CBD5E1"    # Slate 300
BORDER_LINE = "#E2E8F0"     # Slate 200

TEXT_DARK = "#0F172A"       # Slate 900
TEXT_MUTED = "#64748B"      # Slate 500
ARROW_COLOR = "#334155"     # Slate 700

fig.patch.set_facecolor(BG_CANVAS)

# -------------------------------------------------------------
# 1. MAIN BANNER TITLE
# -------------------------------------------------------------
title_box = FancyBboxPatch((6.0, 140.5), 228.0, 8.5, boxstyle="round,pad=0.4,rounding_size=1.0",
                           facecolor="#0F172A", edgecolor="#1E293B", linewidth=1.5, zorder=2)
ax.add_patch(title_box)

ax.text(120.0, 145.8, "PERBANDINGAN ARSITEKTUR PROSES BISNIS: SISTEM BERJALAN (AS-IS) VS SISTEM USULAN (TO-BE)",
        ha='center', va='center', fontsize=16, fontweight='bold', color="#FFFFFF", zorder=3)
ax.text(120.0, 142.6, "Transformasi Operasional Servis TV Sharp Aquos dari Berkas Fisik SPK Kertas Rangkap Tiga ke Platform Digital ServiceHub (AI Vision & PWA)",
        ha='center', va='center', fontsize=10.0, color="#94A3B8", zorder=3)

# -------------------------------------------------------------
# HELPER: Draw Mini-Diagram Box
# -------------------------------------------------------------
def draw_card(cx, cy, lines, step_num, tag, tag_type="warn", w=31.0, h=7.0):
    x = cx - w/2
    y = cy - h/2
    
    # Shadow
    shadow = FancyBboxPatch((x + 0.3, y - 0.3), w, h,
                            boxstyle="round,pad=0.2,rounding_size=0.6",
                            facecolor="#E2E8F0", edgecolor="none", zorder=4)
    ax.add_patch(shadow)
    
    # Main box
    box = FancyBboxPatch((x, y), w, h,
                         boxstyle="round,pad=0.2,rounding_size=0.6",
                         facecolor="#FFFFFF", edgecolor="#64748B", linewidth=1.1, zorder=5)
    ax.add_patch(box)
    
    # Step badge
    badge_w, badge_h = 4.8, 1.8
    badge = FancyBboxPatch((x + 0.8, y + h - badge_h - 0.6), badge_w, badge_h,
                           boxstyle="round,pad=0.1,rounding_size=0.3",
                           facecolor="#0F172A", edgecolor="none", zorder=6)
    ax.add_patch(badge)
    ax.text(x + 0.8 + badge_w/2, y + h - 0.6 - badge_h/2, f"No. {step_num}",
            ha='center', va='center', fontsize=8.0, fontweight='bold', color="#FFFFFF", zorder=7)
    
    # Tag Badge
    tag_colors = {
        "warn":    {"bg": "#FEF3C7", "border": "#D97706", "text": "#92400E"},
        "danger":  {"bg": "#FEE2E2", "border": "#DC2626", "text": "#991B1B"},
        "success": {"bg": "#DCFCE7", "border": "#16A34A", "text": "#166534"},
        "blue":    {"bg": "#DBEAFE", "border": "#2563EB", "text": "#1E40AF"},
        "purple":  {"bg": "#F3E8FF", "border": "#9333EA", "text": "#6B21A8"}
    }
    tc = tag_colors.get(tag_type, tag_colors["warn"])
    tag_w = len(tag) * 0.52 + 2.5
    tag_box = FancyBboxPatch((x + w - tag_w - 0.8, y + h - badge_h - 0.6), tag_w, badge_h,
                             boxstyle="round,pad=0.1,rounding_size=0.3",
                             facecolor=tc["bg"], edgecolor=tc["border"], linewidth=0.8, zorder=6)
    ax.add_patch(tag_box)
    ax.text(x + w - tag_w/2 - 0.8, y + h - 0.6 - badge_h/2, tag,
            ha='center', va='center', fontsize=7.6, fontweight='bold', color=tc["text"], zorder=7)
    
    # Text
    text_content = "\n".join(lines)
    ax.text(cx, cy - 0.6, text_content,
            ha='center', va='center', fontsize=9.2, color=TEXT_DARK,
            multialignment='center', linespacing=1.2, zorder=6)

def draw_arrow(p1, p2, waypoints=None):
    pts = [p1]
    if waypoints:
        pts.extend(waypoints)
    pts.append(p2)
    for i in range(len(pts) - 1):
        pt_a = pts[i]
        pt_b = pts[i+1]
        if i == len(pts) - 2:
            arrow = FancyArrowPatch(pt_a, pt_b, arrowstyle='-|>', mutation_scale=13,
                                    color=ARROW_COLOR, linewidth=1.4, zorder=8)
            ax.add_patch(arrow)
        else:
            ax.plot([pt_a[0], pt_b[0]], [pt_a[1], pt_b[1]], color=ARROW_COLOR, linewidth=1.4, zorder=7)

# =============================================================
# PANEL KIRI: SISTEM BERJALAN (AS-IS / MANUAL)
# =============================================================
P1_LEFT = 6.0
P1_WIDTH = 111.0
P1_TOP = 138.0
P1_BOTTOM = 18.0
P1_HEIGHT = P1_TOP - P1_BOTTOM

# Outer Card Panel 1
panel1 = FancyBboxPatch((P1_LEFT, P1_BOTTOM), P1_WIDTH, P1_HEIGHT,
                        boxstyle="round,pad=0.2,rounding_size=0.8",
                        facecolor="#FFFFFF", edgecolor="#DC2626", linewidth=1.5, zorder=1)
ax.add_patch(panel1)

# Header Panel 1
p1_hdr = FancyBboxPatch((P1_LEFT, P1_TOP - 7.5), P1_WIDTH, 7.5,
                        boxstyle="round,pad=0.2,rounding_size=0.8",
                        facecolor="#7F1D1D", edgecolor="none", zorder=2)
ax.add_patch(p1_hdr)
p1_sq = patches.Rectangle((P1_LEFT, P1_TOP - 7.5), P1_WIDTH, 2.5, facecolor="#7F1D1D", edgecolor="none", zorder=2)
ax.add_patch(p1_sq)

ax.text(P1_LEFT + P1_WIDTH/2, P1_TOP - 2.8, "1. SISTEM BERJALAN (AS-IS / MANUAL)",
        ha='center', va='center', fontsize=12.5, fontweight='bold', color="#FFFFFF", zorder=3)
ax.text(P1_LEFT + P1_WIDTH/2, P1_TOP - 5.5, "Karakteristik: Ketergantungan Kertas Fisik Rangkap 3 | Redundansi Entri Excel | Status Black-Box",
        ha='center', va='center', fontsize=8.2, color="#FECACA", zorder=3)

# 3 Swimlanes for As-Is
w1 = P1_WIDTH / 3.0
ax.plot([P1_LEFT + w1, P1_LEFT + w1], [P1_BOTTOM + 8.5, P1_TOP - 7.5], color=BORDER_LINE, linewidth=1.1, zorder=2)
ax.plot([P1_LEFT + 2*w1, P1_LEFT + 2*w1], [P1_BOTTOM + 8.5, P1_TOP - 7.5], color=BORDER_LINE, linewidth=1.1, zorder=2)

# Swimlane subheaders
sub_h = 3.6
sl_as_is = [
    {"x": P1_LEFT, "title": "PELANGGAN", "bg": "#1E3A8A"},
    {"x": P1_LEFT + w1, "title": "ADMIN SERVICE CENTER", "bg": "#065F46"},
    {"x": P1_LEFT + 2*w1, "title": "TEKNISI LAPANGAN", "bg": "#9A3412"}
]
for s in sl_as_is:
    sh = patches.Rectangle((s["x"], P1_TOP - 7.5 - sub_h), w1, sub_h, facecolor=s["bg"], edgecolor="none", zorder=3)
    ax.add_patch(sh)
    ax.text(s["x"] + w1/2, P1_TOP - 7.5 - sub_h/2, s["title"],
            ha='center', va='center', fontsize=8.5, fontweight='bold', color="#FFFFFF", zorder=4)

C_IS_1 = P1_LEFT + w1/2      # 24.5
C_IS_2 = P1_LEFT + 1.5*w1    # 61.5
C_IS_3 = P1_LEFT + 2.5*w1    # 98.5

# Steps As-Is
Y_START_IS = 122.5
node_start_is = Circle((C_IS_1, Y_START_IS), 1.6, facecolor="#0F172A", edgecolor="#94A3B8", linewidth=1.5, zorder=8)
ax.add_patch(node_start_is)
ax.text(C_IS_1, Y_START_IS + 2.4, "START", ha='center', va='bottom', fontsize=7.5, fontweight='bold', color="#475569")

# Step 1 (Pelanggan)
draw_card(C_IS_1, 112.0, ["Menyampaikan keluhan kerusakan", "unit TV Sharp via lisan/telepon"], 1, "Media: Lisan", "warn")
# Step 2 (Admin)
draw_card(C_IS_2, 112.0, ["Mencatat manual rincian", "ke formulir fisik SPK rangkap 3"], 2, "Fisik: Kertas SPK x3", "danger")
# Step 3 (Admin)
draw_card(C_IS_2, 97.0, ["Meletakkan lembar SPK ke", "baki / keranjang piket fisik"], 3, "Fisik: Keranjang Baki", "danger")
# Step 4 (Teknisi)
draw_card(C_IS_3, 97.0, ["Mengambil tumpukan berkas fisik", "SPK saat jadwal piket operasional"], 4, "Fisik: Ambil Kertas", "danger")
# Step 5 (Teknisi)
draw_card(C_IS_3, 82.0, ["Mendatangi lokasi pelanggan &", "memeriksa unit fisik TV Sharp"], 5, "Cek Fisik Lapangan", "warn")
# Step 6 (Teknisi)
draw_card(C_IS_3, 67.0, ["Memperbaiki TV, catat sparepart,", "& minta TTD basah pelanggan"], 6, "Fisik: TTD Basah Kertas", "danger")
# Step 7 (Teknisi)
draw_card(C_IS_3, 52.0, ["Membawa pulang berkas SPK ke", "kantor (sore hari / besoknya)"], 7, "Kurir Kertas Fisik", "danger")
# Step 8 (Admin)
draw_card(C_IS_2, 52.0, ["Menerima berkas SPK & ketik ulang", "seluruh data ke spreadsheet Excel"], 8, "Duplikasi: Entri Excel", "danger")

# End Node As-Is
Y_END_IS = 38.0
end_is_out = Circle((C_IS_2, Y_END_IS), 2.0, facecolor="none", edgecolor="#0F172A", linewidth=2.0, zorder=8)
end_is_in  = Circle((C_IS_2, Y_END_IS), 1.2, facecolor="#0F172A", edgecolor="none", zorder=9)
ax.add_patch(end_is_out)
ax.add_patch(end_is_in)
ax.text(C_IS_2, Y_END_IS - 2.8, "END (SELESAI)", ha='center', va='top', fontsize=7.5, fontweight='bold', color="#475569")

# Arrows As-Is
draw_arrow((C_IS_1, Y_START_IS - 1.6), (C_IS_1, 112.0 + 3.5))
draw_arrow((C_IS_1 + 15.5, 112.0), (C_IS_2 - 15.5, 112.0))
draw_arrow((C_IS_2, 112.0 - 3.5), (C_IS_2, 97.0 + 3.5))
draw_arrow((C_IS_2 + 15.5, 97.0), (C_IS_3 - 15.5, 97.0))
draw_arrow((C_IS_3, 97.0 - 3.5), (C_IS_3, 82.0 + 3.5))
draw_arrow((C_IS_3, 82.0 - 3.5), (C_IS_3, 67.0 + 3.5))
draw_arrow((C_IS_3, 67.0 - 3.5), (C_IS_3, 52.0 + 3.5))
draw_arrow((C_IS_3 - 15.5, 52.0), (C_IS_2 + 15.5, 52.0))
draw_arrow((C_IS_2, 52.0 - 3.5), (C_IS_2, Y_END_IS + 2.0))

# Bottom Box As-Is (Pain Points)
as_is_box = FancyBboxPatch((P1_LEFT + 2.0, P1_BOTTOM + 1.5), P1_WIDTH - 4.0, 7.5,
                           boxstyle="round,pad=0.2,rounding_size=0.5",
                           facecolor="#FEF2F2", edgecolor="#EF4444", linewidth=1.0, zorder=2)
ax.add_patch(as_is_box)
ax.text(P1_LEFT + 4.0, P1_BOTTOM + 6.8, "TITIK LEMAH UTAMA (PAIN POINTS AS-IS):",
        ha='left', va='center', fontsize=8.2, fontweight='bold', color="#991B1B", zorder=3)
ax.text(P1_LEFT + 4.0, P1_BOTTOM + 3.8,
        "- Risiko Berkas Fisik  : SPK kertas rangkap 3 rawan basah, hilang di jalan, atau tulisan tangan tak terbaca.\n"
        "- Duplikasi Data Input : Admin input 2 kali (tulis di lembar SPK lalu ketik ulang ke lembar Excel).\n"
        "- Nol Pemantauan       : Status pekerjaan tidak diketahui oleh kantor selama teknisi berada di lapangan.",
        ha='left', va='center', fontsize=7.2, color="#7F1D1D", linespacing=1.2, zorder=3)


# =============================================================
# PANEL KANAN: SISTEM USULAN (TO-BE / SERVICEHUB)
# =============================================================
P2_LEFT = 123.0
P2_WIDTH = 111.0
P2_TOP = 138.0
P2_BOTTOM = 18.0
P2_HEIGHT = P2_TOP - P2_BOTTOM

# Outer Card Panel 2
panel2 = FancyBboxPatch((P2_LEFT, P2_BOTTOM), P2_WIDTH, P2_HEIGHT,
                        boxstyle="round,pad=0.2,rounding_size=0.8",
                        facecolor="#FFFFFF", edgecolor="#16A34A", linewidth=1.5, zorder=1)
ax.add_patch(panel2)

# Header Panel 2
p2_hdr = FancyBboxPatch((P2_LEFT, P2_TOP - 7.5), P2_WIDTH, 7.5,
                        boxstyle="round,pad=0.2,rounding_size=0.8",
                        facecolor="#14532D", edgecolor="none", zorder=2)
ax.add_patch(p2_hdr)
p2_sq = patches.Rectangle((P2_LEFT, P2_TOP - 7.5), P2_WIDTH, 2.5, facecolor="#14532D", edgecolor="none", zorder=2)
ax.add_patch(p2_sq)

ax.text(P2_LEFT + P2_WIDTH/2, P2_TOP - 2.8, "2. SISTEM USULAN (TO-BE / SERVICEHUB)",
        ha='center', va='center', fontsize=12.5, fontweight='bold', color="#FFFFFF", zorder=3)
ax.text(P2_LEFT + P2_WIDTH/2, P2_TOP - 5.5, "Karakteristik: AI Vision Auto-Fill | Paperless Digital Tasking (PWA) | Cloud Storage & Real-Time Sync",
        ha='center', va='center', fontsize=8.2, color="#BBF7D0", zorder=3)

# 3 Swimlanes for To-Be
w2 = P2_WIDTH / 3.0
ax.plot([P2_LEFT + w2, P2_LEFT + w2], [P2_BOTTOM + 8.5, P2_TOP - 7.5], color=BORDER_LINE, linewidth=1.1, zorder=2)
ax.plot([P2_LEFT + 2*w2, P2_LEFT + 2*w2], [P2_BOTTOM + 8.5, P2_TOP - 7.5], color=BORDER_LINE, linewidth=1.1, zorder=2)

sl_to_be = [
    {"x": P2_LEFT, "title": "ADMIN SERVICE CENTER", "bg": "#065F46"},
    {"x": P2_LEFT + w2, "title": "SISTEM SERVICEHUB (CLOUD & AI)", "bg": "#1D4ED8"},
    {"x": P2_LEFT + 2*w2, "title": "TEKNISI LAPANGAN (PWA)", "bg": "#C2410C"}
]
for s in sl_to_be:
    sh = patches.Rectangle((s["x"], P2_TOP - 7.5 - sub_h), w2, sub_h, facecolor=s["bg"], edgecolor="none", zorder=3)
    ax.add_patch(sh)
    ax.text(s["x"] + w2/2, P2_TOP - 7.5 - sub_h/2, s["title"],
            ha='center', va='center', fontsize=8.2, fontweight='bold', color="#FFFFFF", zorder=4)

C_TO_1 = P2_LEFT + w2/2      # 141.5 (Admin)
C_TO_2 = P2_LEFT + 1.5*w2    # 178.5 (Sistem)
C_TO_3 = P2_LEFT + 2.5*w2    # 215.5 (Teknisi)

# Steps To-Be
Y_START_TO = 124.0
node_start_to = Circle((C_TO_1, Y_START_TO), 1.6, facecolor="#0F172A", edgecolor="#94A3B8", linewidth=1.5, zorder=8)
ax.add_patch(node_start_to)
ax.text(C_TO_1, Y_START_TO + 2.4, "START", ha='center', va='bottom', fontsize=7.5, fontweight='bold', color="#475569")

# Step 1 (Admin)
draw_card(C_TO_1, 114.5, ["Unggah foto fisik SPK ke modul", "AI Document Scanner di web"], 1, "Upload Foto SPK", "blue")
# Step 2 (Sistem)
draw_card(C_TO_2, 114.5, ["Ekstraksi teks via AI Vision &", "otomatis isi formulir (Auto-Fill)"], 2, "AI Groq Vision LPU", "purple")
# Step 3 (Admin)
draw_card(C_TO_1, 101.5, ["Validasi data hasil AI scanner", "& klik tombol 'Simpan Tiket'"], 3, "Validasi Petugas", "success")
# Step 4 (Sistem)
draw_card(C_TO_2, 101.5, ["Simpan data ke PostgreSQL &", "sinkron ke antrean PWA teknisi"], 4, "PostgreSQL & Sync", "blue")
# Step 5 (Teknisi)
draw_card(C_TO_3, 88.5, ["Buka PWA di HP, lihat tiket, &", "foto kondisi unit saat tiba"], 5, "PWA & Foto Tiba", "warn")
# Step 6 (Sistem)
draw_card(C_TO_2, 75.5, ["Kompresi otomatis (<400KB) &", "unggah stream aman ke Cloud S3"], 6, "Canvas Comp. & S3", "blue")
# Step 7 (Teknisi)
draw_card(C_TO_3, 62.5, ["Selesaikan servis, foto unit, &", "tekan toggle status 'Selesai'"], 7, "Foto Selesai & Toggle", "warn")
# Step 8 (Sistem)
draw_card(C_TO_2, 49.5, ["Update status 'selesai' di DB &", "perbarui metrik dashboard live"], 8, "Real-Time Update", "blue")
# Step 9 (Admin)
draw_card(C_TO_1, 49.5, ["Pantau tiket hijau di dashboard", "& unduh rekapitulasi file CSV"], 9, "Dashboard & Rekap CSV", "success")

# End Node To-Be
Y_END_TO = 38.0
end_to_out = Circle((C_TO_1, Y_END_TO), 2.0, facecolor="none", edgecolor="#0F172A", linewidth=2.0, zorder=8)
end_to_in  = Circle((C_TO_1, Y_END_TO), 1.2, facecolor="#0F172A", edgecolor="none", zorder=9)
ax.add_patch(end_to_out)
ax.add_patch(end_to_in)
ax.text(C_TO_1, Y_END_TO - 2.8, "END (SELESAI)", ha='center', va='top', fontsize=7.5, fontweight='bold', color="#475569")

# Arrows To-Be (Zero Overlap Routing)
draw_arrow((C_TO_1, Y_START_TO - 1.6), (C_TO_1, 114.5 + 3.5))
draw_arrow((C_TO_1 + 15.5, 114.5), (C_TO_2 - 15.5, 114.5))

# Step 2 -> Step 3
mid_23 = (114.5 - 3.5 + 101.5 + 3.5) / 2
draw_arrow((C_TO_2, 114.5 - 3.5), (C_TO_1, 101.5 + 3.5), waypoints=[(C_TO_2, mid_23), (C_TO_1, mid_23)])

# Step 3 -> Step 4
draw_arrow((C_TO_1 + 15.5, 101.5), (C_TO_2 - 15.5, 101.5))

# Step 4 -> Step 5
mid_45 = (101.5 - 3.5 + 88.5 + 3.5) / 2
draw_arrow((C_TO_2 + 15.5, 101.5), (C_TO_3, 88.5 + 3.5),
           waypoints=[(C_TO_2 + 15.5 + 3.0, 101.5), (C_TO_2 + 15.5 + 3.0, mid_45), (C_TO_3, mid_45)])

# Step 5 -> Step 6
mid_56 = (88.5 - 3.5 + 75.5 + 3.5) / 2
draw_arrow((C_TO_3 - 15.5, 88.5), (C_TO_2, 75.5 + 3.5),
           waypoints=[(C_TO_3 - 15.5 - 3.0, 88.5), (C_TO_3 - 15.5 - 3.0, mid_56), (C_TO_2, mid_56)])

# Step 6 -> Step 7
mid_67 = (75.5 - 3.5 + 62.5 + 3.5) / 2
draw_arrow((C_TO_2 + 15.5, 75.5), (C_TO_3, 62.5 + 3.5),
           waypoints=[(C_TO_2 + 15.5 + 3.0, 75.5), (C_TO_2 + 15.5 + 3.0, mid_67), (C_TO_3, mid_67)])

# Step 7 -> Step 8
mid_78 = (62.5 - 3.5 + 49.5 + 3.5) / 2
draw_arrow((C_TO_3 - 15.5, 62.5), (C_TO_2, 49.5 + 3.5),
           waypoints=[(C_TO_3 - 15.5 - 3.0, 62.5), (C_TO_3 - 15.5 - 3.0, mid_78), (C_TO_2, mid_78)])

# Step 8 -> Step 9
draw_arrow((C_TO_2 - 15.5, 49.5), (C_TO_1 + 15.5, 49.5))

# Step 9 -> End
draw_arrow((C_TO_1, 49.5 - 3.5), (C_TO_1, Y_END_TO + 2.0))

# Bottom Box To-Be (Key Solutions)
to_be_box = FancyBboxPatch((P2_LEFT + 2.0, P2_BOTTOM + 1.5), P2_WIDTH - 4.0, 7.5,
                           boxstyle="round,pad=0.2,rounding_size=0.5",
                           facecolor="#F0FDF4", edgecolor="#22C55E", linewidth=1.0, zorder=2)
ax.add_patch(to_be_box)
ax.text(P2_LEFT + 4.0, P2_BOTTOM + 6.8, "SOLUSI UTAMA (SOLUTIONS TO-BE SERVICEHUB):",
        ha='left', va='center', fontsize=8.2, fontweight='bold', color="#166534", zorder=3)
ax.text(P2_LEFT + 4.0, P2_BOTTOM + 3.8,
        "+ AI Vision Scanner   : Pindai lembar SPK secara instan & auto-fill, hilangkan duplikasi ketik Excel.\n"
        "+ Paperless Mobile PWA : Penugasan tiket langsung sinkron ke smartphone teknisi tanpa berkas fisik.\n"
        "+ Cloud Storage & Live : Foto bukti tersimpan terpusat di S3, status kerja ter-update real-time 100%.",
        ha='left', va='center', fontsize=7.2, color="#14532D", linespacing=1.2, zorder=3)

# =============================================================
# FOOTER COMPARISON SUMMARY
# =============================================================
ft_box = FancyBboxPatch((6.0, 1.5), 228.0, 14.5, boxstyle="round,pad=0.3,rounding_size=0.8",
                        facecolor="#FFFFFF", edgecolor=BORDER_SLATE, linewidth=1.2, zorder=2)
ax.add_patch(ft_box)

ax.text(120.0, 13.5, "MATRIKS REKAPITULASI PERBEDAAN ARSITEKTURAL (AS-IS VS TO-BE)",
        ha='center', va='center', fontsize=10.5, fontweight='bold', color="#0F172A", zorder=3)

cols_x = [12.0, 52.0, 110.0, 175.0]
headers_mat = ["DIMENSI EVALUASI", "SISTEM BERJALAN (AS-IS MANUAL)", "SISTEM USULAN (TO-BE SERVICEHUB)", "DAMPAK / EFISIENSI"]

for idx, h in enumerate(headers_mat):
    ax.text(cols_x[idx], 11.2, h, ha='left', va='center', fontsize=8.2, fontweight='bold', color="#475569", zorder=3)

ax.plot([10.0, 230.0], [10.2, 10.2], color="#E2E8F0", linewidth=1.0, zorder=3)

matrix_data = [
    ("1. Kehadiran Kolom Sistem", "Nihil (Hanya 3 Manusia / Aktor Fisik)", "Hadir Swimlane 'Sistem ServiceHub (Cloud & AI)'", "Sentralisasi logika & otomasi basis data"),
    ("2. Metode Input Data Tiket", "Tulis tangan di formulir SPK kertas rangkap 3", "AI Document Scanner (Groq Vision) & Auto-Fill", "Pangkas waktu entri tiket >80% & bebas typo"),
    ("3. Distribusi Penugasan", "Kertas SPK ditaruh di keranjang baki piket", "Push penugasan digital ke ServiceHub PWA teknisi", "Paperless, teknisi langsung jalan tanpa antre berkas"),
    ("4. Dokumentasi & Bukti Servis", "Tanda tangan basah di kertas (rentan rusak/hilang)", "Foto bukti sebelum & sesudah servis diunggah ke S3 Cloud", "Validasi klaim garansi otentik & terarsip aman"),
    ("5. Monitoring & Laporan", "Ketik ulang sore hari ke Excel / Buku Rekap", "Dashboard real-time & ekspor laporan CSV 1-klik", "Status transparan seketika, laporan instan siap pakai")
]

y_pos = 8.5
for row in matrix_data:
    ax.text(cols_x[0], y_pos, row[0], ha='left', va='center', fontsize=7.4, fontweight='semibold', color="#0F172A", zorder=3)
    ax.text(cols_x[1], y_pos, row[1], ha='left', va='center', fontsize=7.2, color="#991B1B", zorder=3)
    ax.text(cols_x[2], y_pos, row[2], ha='left', va='center', fontsize=7.2, color="#166534", zorder=3)
    ax.text(cols_x[3], y_pos, row[3], ha='left', va='center', fontsize=7.2, color="#1E40AF", zorder=3)
    y_pos -= 1.4

# Save Outputs
plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
plt.savefig('komparasi_activity_diagram_as_is_vs_to_be_hd.png', dpi=300, facecolor=fig.patch.get_facecolor(), bbox_inches='tight')
plt.savefig('komparasi_activity_diagram_as_is_vs_to_be_hd.svg', format='svg', facecolor=fig.patch.get_facecolor(), bbox_inches='tight')
print("Successfully generated Ultra-HD side-by-side comparison diagram!")
