import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np

# Set figure and DPI
fig_width, fig_height = 13.5, 16.5
fig, ax = plt.subplots(figsize=(fig_width, fig_height), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Font settings
plt.rcParams['font.family'] = 'Segoe UI'

# Color Palette (Enterprise Modern Clean)
BG_CANVAS = "#F8FAFC"       # Slate 50
CONTAINER_BG = "#FFFFFF"    # White
BORDER_OUTER = "#CBD5E1"    # Slate 300
BORDER_DIVIDER = "#E2E8F0"  # Slate 200

# Swimlane Header Colors
COLOR_CUSTOMER = {"header": "#1E40AF", "sub": "#3B82F6", "badge": "#DBEAFE", "badge_text": "#1E40AF"} # Blue
COLOR_ADMIN    = {"header": "#0F766E", "sub": "#14B8A6", "badge": "#CCFBF1", "badge_text": "#0F766E"} # Teal
COLOR_TECH     = {"header": "#C2410C", "sub": "#F97316", "badge": "#FFEDD5", "badge_text": "#9A3412"} # Orange

TEXT_MAIN = "#0F172A"       # Slate 900
TEXT_MUTED = "#64748B"      # Slate 500
ARROW_COLOR = "#334155"     # Slate 700

fig.patch.set_facecolor(BG_CANVAS)

# -------------------------------------------------------------
# 1. MAIN HEADER BANNER
# -------------------------------------------------------------
title_box = FancyBboxPatch((4.0, 92.2), 92.0, 6.2, boxstyle="round,pad=0.4,rounding_size=0.8",
                           facecolor="#0F172A", edgecolor="#1E293B", linewidth=1.2, zorder=2)
ax.add_patch(title_box)

ax.text(50.0, 95.8, "ACTIVITY DIAGRAM - SISTEM BERJALAN (AS-IS / MANUAL)", 
        ha='center', va='center', fontsize=15, fontweight='bold', color="#FFFFFF", zorder=3)
ax.text(50.0, 93.6, "Prosedur Operasional Penanganan Servis Unit TV Sharp Aquos Menggunakan SPK Kertas Rangkap Tiga", 
        ha='center', va='center', fontsize=9.5, color="#94A3B8", zorder=3)

# -------------------------------------------------------------
# 2. SWIMLANE CONTAINER & PARTITIONS (GRID UNIFIED)
# -------------------------------------------------------------
L_LEFT = 4.0
L_WIDTH = 92.0
L_TOP = 90.6
L_BOTTOM = 8.5
L_HEIGHT = L_TOP - L_BOTTOM

# Unified background container
container = FancyBboxPatch((L_LEFT, L_BOTTOM), L_WIDTH, L_HEIGHT,
                           boxstyle="round,pad=0.2,rounding_size=0.8",
                           facecolor=CONTAINER_BG, edgecolor=BORDER_OUTER, linewidth=1.5, zorder=1)
ax.add_patch(container)

# 3 Columns
col_w = L_WIDTH / 3.0  # 30.666
col_x0 = L_LEFT
col_x1 = L_LEFT + col_w
col_x2 = L_LEFT + 2 * col_w

# Column divider lines
ax.plot([col_x1, col_x1], [L_BOTTOM, L_TOP], color=BORDER_DIVIDER, linewidth=1.2, linestyle='-', zorder=2)
ax.plot([col_x2, col_x2], [L_BOTTOM, L_TOP], color=BORDER_DIVIDER, linewidth=1.2, linestyle='-', zorder=2)

# Column Headers
HEADER_H = 4.8
headers = [
    {"x": col_x0, "title": "PELANGGAN (CUSTOMER)", "role": "Pelapor / Pemilik Perangkat", "color": "#1E3A8A"},
    {"x": col_x1, "title": "ADMIN SERVICE CENTER", "role": "Penerima Keluhan & Administrasi", "color": "#065F46"},
    {"x": col_x2, "title": "TEKNISI LAPANGAN", "role": "Pelaksana Servis Kunjungan Fisik", "color": "#9A3412"}
]

for idx, h in enumerate(headers):
    # Header box
    h_box = patches.Rectangle((h["x"], L_TOP - HEADER_H), col_w, HEADER_H,
                              facecolor=h["color"], edgecolor="none", zorder=3)
    ax.add_patch(h_box)
    
    # Title & Role Text
    ax.text(h["x"] + col_w/2, L_TOP - 1.8, h["title"],
            ha='center', va='center', fontsize=11.0, fontweight='bold', color="#FFFFFF", zorder=4)
    ax.text(h["x"] + col_w/2, L_TOP - 3.4, f"[{h['role']}]",
            ha='center', va='center', fontsize=8.2, color="#E2E8F0", zorder=4)

# Center of each swimlane
C1 = col_x0 + col_w / 2  # 19.33
C2 = col_x1 + col_w / 2  # 50.00
C3 = col_x2 + col_w / 2  # 80.67

# -------------------------------------------------------------
# 3. HELPER: DRAW ACTION BOX (UML ACTIVITY NODE)
# -------------------------------------------------------------
def draw_action_card(cx, cy, lines, step_num, tag=None, width=24.0, height=5.5):
    x = cx - width/2
    y = cy - height/2
    
    # Base Box with subtle shadow effect
    shadow = FancyBboxPatch((x + 0.25, y - 0.25), width, height,
                            boxstyle="round,pad=0.2,rounding_size=0.6",
                            facecolor="#E2E8F0", edgecolor="none", zorder=4)
    ax.add_patch(shadow)
    
    box = FancyBboxPatch((x, y), width, height,
                         boxstyle="round,pad=0.2,rounding_size=0.6",
                         facecolor="#FFFFFF", edgecolor="#64748B", linewidth=1.2, zorder=5)
    ax.add_patch(box)
    
    # Number badge at top-left
    badge_w, badge_h = 3.6, 1.4
    badge = FancyBboxPatch((x + 0.6, y + height - badge_h - 0.5), badge_w, badge_h,
                           boxstyle="round,pad=0.1,rounding_size=0.3",
                           facecolor="#0F172A", edgecolor="none", zorder=6)
    ax.add_patch(badge)
    ax.text(x + 0.6 + badge_w/2, y + height - 0.5 - badge_h/2, f"No. {step_num}",
            ha='center', va='center', fontsize=6.8, fontweight='bold', color="#FFFFFF", zorder=7)
    
    # Optional tag badge at top-right
    if tag:
        tag_w = len(tag) * 0.42 + 2.0
        tag_box = FancyBboxPatch((x + width - tag_w - 0.6, y + height - badge_h - 0.5), tag_w, badge_h,
                                 boxstyle="round,pad=0.1,rounding_size=0.3",
                                 facecolor="#FEF3C7", edgecolor="#D97706", linewidth=0.7, zorder=6)
        ax.add_patch(tag_box)
        ax.text(x + width - tag_w/2 - 0.6, y + height - 0.5 - badge_h/2, tag,
                ha='center', va='center', fontsize=6.5, fontweight='bold', color="#92400E", zorder=7)
    
    # Text content (centered vertically in lower area)
    text_content = "\n".join(lines)
    ax.text(cx, cy - 0.5, text_content,
            ha='center', va='center', fontsize=8.8, fontweight='normal', color=TEXT_MAIN,
            multialignment='center', linespacing=1.2, zorder=6)

# -------------------------------------------------------------
# 4. HELPER: ARROWS & CONNECTORS
# -------------------------------------------------------------
def draw_flow_arrow(p_start, p_end, waypoints=None):
    pts = [p_start]
    if waypoints:
        pts.extend(waypoints)
    pts.append(p_end)
    
    for i in range(len(pts) - 1):
        p1 = pts[i]
        p2 = pts[i+1]
        if i == len(pts) - 2:
            arrow = FancyArrowPatch(p1, p2,
                                    arrowstyle='-|>',
                                    mutation_scale=13,
                                    color=ARROW_COLOR,
                                    linewidth=1.4,
                                    zorder=8)
            ax.add_patch(arrow)
        else:
            ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=ARROW_COLOR, linewidth=1.4, zorder=7)

# -------------------------------------------------------------
# 5. NODES PLACEMENT (SYMMETRIC & ALIGNED)
# -------------------------------------------------------------
ACT_W = 24.0
ACT_H = 5.6

# 1. Start Node (Pelanggan)
Y_START = 81.5
start_node = Circle((C1, Y_START), 1.25, facecolor="#0F172A", edgecolor="#64748B", linewidth=1.5, zorder=8)
ax.add_patch(start_node)
ax.text(C1, Y_START + 1.8, "START", ha='center', va='bottom', fontsize=7.8, fontweight='bold', color="#475569", zorder=8)

# Step 1 (Pelanggan)
Y1 = 73.0
draw_action_card(C1, Y1, 
                 ["Menyampaikan keluhan & rincian", "kerusakan unit TV Sharp Aquos", "(via Telepon / Datang Langsung)"],
                 1, tag="Media: Lisan / Tatap Muka", width=ACT_W, height=ACT_H)

# Step 2 (Admin)
Y2 = 73.0
draw_action_card(C2, Y2,
                 ["Menerima keluhan & mencatat", "manual rincian ke lembar fisik SPK", "(Formulir Kertas Rangkap Tiga)"],
                 2, tag="Fisik: Lembar SPK x3", width=ACT_W, height=ACT_H)

# Step 3 (Admin)
Y3 = 61.5
draw_action_card(C2, Y3,
                 ["Meletakkan lembaran fisik SPK", "ke baki / keranjang penugasan", "jadwal harian teknisi lapangan"],
                 3, tag="Fisik: Baki Tugas", width=ACT_W, height=ACT_H)

# Step 4 (Teknisi)
Y4 = 61.5
draw_action_card(C3, Y4,
                 ["Mengambil tumpukan berkas SPK", "saat piket & menyusun rute", "perjalanan kunjungan servis"],
                 4, tag="Fisik: Berkas SPK", width=ACT_W, height=ACT_H)

# Step 5 (Teknisi)
Y5 = 50.0
draw_action_card(C3, Y5,
                 ["Mendatangi lokasi pelanggan,", "memeriksa unit fisik TV Sharp,", "serta mendiagnosa kerusakan"],
                 5, tag="Aktivitas Lapangan", width=ACT_W, height=ACT_H)

# Step 6 (Teknisi)
Y6 = 38.5
draw_action_card(C3, Y6,
                 ["Melakukan perbaikan unit, mencatat", "suku cadang di kertas SPK, &", "meminta TTD basah pelanggan"],
                 6, tag="Fisik: TTD Basah", width=ACT_W, height=ACT_H)

# Step 7 (Teknisi)
Y7 = 27.0
draw_action_card(C3, Y7,
                 ["Membawa pulang lembaran SPK", "ke kantor service center Sharp", "(sore hari / keesokan harinya)"],
                 7, tag="Kurir Berkas Fisik", width=ACT_W, height=ACT_H)

# Step 8 (Admin)
Y8 = 27.0
draw_action_card(C2, Y8,
                 ["Menerima berkas SPK bertanda tangan", "& mengetik ulang data pengerjaan", "ke spreadsheet Excel / rekap buku"],
                 8, tag="Duplikasi: Entri Excel", width=ACT_W, height=ACT_H)

# Final Node (Admin)
Y_END = 14.5
end_outer = Circle((C2, Y_END), 1.6, facecolor="none", edgecolor="#0F172A", linewidth=1.8, zorder=8)
end_inner = Circle((C2, Y_END), 1.0, facecolor="#0F172A", edgecolor="none", zorder=9)
ax.add_patch(end_outer)
ax.add_patch(end_inner)
ax.text(C2, Y_END - 2.2, "END (SELESAI)", ha='center', va='top', fontsize=7.8, fontweight='bold', color="#475569", zorder=8)

# -------------------------------------------------------------
# 6. CONNECTING FLOW ARROWS
# -------------------------------------------------------------
# Start -> Step 1
draw_flow_arrow((C1, Y_START - 1.25), (C1, Y1 + ACT_H/2))

# Step 1 -> Step 2 (Horizontal across Pelanggan -> Admin)
draw_flow_arrow((C1 + ACT_W/2, Y1), (C2 - ACT_W/2, Y2))

# Step 2 -> Step 3 (Downwards inside Admin)
draw_flow_arrow((C2, Y2 - ACT_H/2), (C2, Y3 + ACT_H/2))

# Step 3 -> Step 4 (Horizontal across Admin -> Teknisi)
draw_flow_arrow((C2 + ACT_W/2, Y3), (C3 - ACT_W/2, Y4))

# Step 4 -> Step 5 (Downwards inside Teknisi)
draw_flow_arrow((C3, Y4 - ACT_H/2), (C3, Y5 + ACT_H/2))

# Step 5 -> Step 6 (Downwards inside Teknisi)
draw_flow_arrow((C3, Y5 - ACT_H/2), (C3, Y6 + ACT_H/2))

# Step 6 -> Step 7 (Downwards inside Teknisi)
draw_flow_arrow((C3, Y6 - ACT_H/2), (C3, Y7 + ACT_H/2))

# Step 7 -> Step 8 (Horizontal across Teknisi -> Admin)
draw_flow_arrow((C3 - ACT_W/2, Y7), (C2 + ACT_W/2, Y8))

# Step 8 -> End Node
draw_flow_arrow((C2, Y8 - ACT_H/2), (C2, Y_END + 1.6))

# -------------------------------------------------------------
# 7. BOTTOM BANNER: ANALISIS KELEMAHAN SISTEM BERJALAN
# -------------------------------------------------------------
banner_y = 1.2
banner_h = 5.8
banner_box = FancyBboxPatch((4.0, banner_y), 92.0, banner_h,
                            boxstyle="round,pad=0.3,rounding_size=0.6",
                            facecolor="#FFFBEB", edgecolor="#F59E0B", linewidth=1.2, zorder=2)
ax.add_patch(banner_box)

ax.text(6.0, banner_y + 4.2, "IDENTIFIKASI KELEMAHAN SISTEM BERJALAN (AS-IS BOTTLENECKS):",
        ha='left', va='center', fontsize=9.0, fontweight='bold', color="#B45309", zorder=3)

pain_points = (
    "• Risiko Fisik Dokumen  : Berkas SPK kertas rangkap 3 rentan robek, basah, tercecer saat mobilitas, atau tulisan tangan teknisi tidak terbaca.\n"
    "• Duplikasi Input Data   : Pekerjaan entri berulang (Admin catat kertas -> Teknisi catat suku cadang -> Admin ketik ulang ke Excel/Spreadsheet).\n"
    "• Ketiadaan Real-Time    : Status servis menjadi 'black-box' bagi pelanggan & manajemen; tidak dapat dipantau langsung sebelum teknisi kembali.\n"
    "• Dokumentasi Fisik Nihil : Tidak ada foto bukti kondisi fisik TV (sebelum vs sesudah pengerjaan) & minim validasi barcode unit secara otomatis."
)

ax.text(6.0, banner_y + 2.0, pain_points,
        ha='left', va='center', fontsize=7.6, color="#78350F", linespacing=1.25, zorder=3)

# Save Outputs
plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
plt.savefig('activity_diagram_sistem_berjalan_clean.png', dpi=300, facecolor=fig.patch.get_facecolor(), bbox_inches='tight')
plt.savefig('activity_diagram_sistem_berjalan_clean.svg', format='svg', facecolor=fig.patch.get_facecolor(), bbox_inches='tight')
print("Successfully generated clean modern activity diagram!")
