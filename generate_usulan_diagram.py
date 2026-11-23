import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np

# Set figure and DPI (A4 / Portrait High-Res)
fig_width, fig_height = 13.5, 17.5
fig, ax = plt.subplots(figsize=(fig_width, fig_height), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Font settings
plt.rcParams['font.family'] = 'Segoe UI'

# Color Palette (Modern Clean Enterprise)
BG_CANVAS = "#F8FAFC"       # Slate 50
CONTAINER_BG = "#FFFFFF"    # White
BORDER_OUTER = "#CBD5E1"    # Slate 300
BORDER_DIVIDER = "#E2E8F0"  # Slate 200

# Swimlane Headers
LANE_ADMIN_COLOR  = "#047857"  # Emerald 700
LANE_SYSTEM_COLOR = "#1D4ED8"  # Blue 700
LANE_TECH_COLOR   = "#C2410C"  # Orange 700

TEXT_MAIN  = "#0F172A"      # Slate 900
TEXT_MUTED = "#64748B"      # Slate 500
ARROW_COLOR = "#334155"     # Slate 700

fig.patch.set_facecolor(BG_CANVAS)

# -------------------------------------------------------------
# 1. MAIN HEADER BANNER
# -------------------------------------------------------------
title_box = FancyBboxPatch((4.0, 92.5), 92.0, 6.0, boxstyle="round,pad=0.4,rounding_size=0.8",
                           facecolor="#0F172A", edgecolor="#1E293B", linewidth=1.2, zorder=2)
ax.add_patch(title_box)

ax.text(50.0, 96.0, "ACTIVITY DIAGRAM - SISTEM USULAN (TO-BE / SERVICEHUB)", 
        ha='center', va='center', fontsize=15, fontweight='bold', color="#FFFFFF", zorder=3)
ax.text(50.0, 93.9, "Alur Operasional Layanan Servis Terintegrasi Berbasis Web PWA & AI Vision LPU\n(Studi Kasus: PT. Sharp Electronics Indonesia)", 
        ha='center', va='center', fontsize=9.2, color="#94A3B8", zorder=3)

# -------------------------------------------------------------
# 2. SWIMLANE CONTAINER & PARTITIONS
# -------------------------------------------------------------
L_LEFT = 4.0
L_WIDTH = 92.0
L_TOP = 91.0
L_BOTTOM = 8.5
L_HEIGHT = L_TOP - L_BOTTOM

container = FancyBboxPatch((L_LEFT, L_BOTTOM), L_WIDTH, L_HEIGHT,
                           boxstyle="round,pad=0.2,rounding_size=0.8",
                           facecolor=CONTAINER_BG, edgecolor=BORDER_OUTER, linewidth=1.5, zorder=1)
ax.add_patch(container)

col_w = L_WIDTH / 3.0  # 30.666
col_x0 = L_LEFT
col_x1 = L_LEFT + col_w
col_x2 = L_LEFT + 2 * col_w

# Column divider lines
ax.plot([col_x1, col_x1], [L_BOTTOM, L_TOP], color=BORDER_DIVIDER, linewidth=1.2, linestyle='-', zorder=2)
ax.plot([col_x2, col_x2], [L_BOTTOM, L_TOP], color=BORDER_DIVIDER, linewidth=1.2, linestyle='-', zorder=2)

# Column Headers
HEADER_H = 4.6
headers = [
    {"x": col_x0, "title": "ADMIN SERVICE CENTER", "role": "Pengelola Tiket & Validasi Data", "color": LANE_ADMIN_COLOR},
    {"x": col_x1, "title": "SISTEM SERVICEHUB", "role": "AI Vision Engine, S3 Cloud & PostgreSQL", "color": LANE_SYSTEM_COLOR},
    {"x": col_x2, "title": "TEKNISI LAPANGAN", "role": "Pelaksana Servis Mobile via PWA", "color": LANE_TECH_COLOR}
]

for h in headers:
    h_box = patches.Rectangle((h["x"], L_TOP - HEADER_H), col_w, HEADER_H,
                              facecolor=h["color"], edgecolor="none", zorder=3)
    ax.add_patch(h_box)
    
    ax.text(h["x"] + col_w/2, L_TOP - 1.7, h["title"],
            ha='center', va='center', fontsize=10.5, fontweight='bold', color="#FFFFFF", zorder=4)
    ax.text(h["x"] + col_w/2, L_TOP - 3.3, f"[{h['role']}]",
            ha='center', va='center', fontsize=8.0, color="#E2E8F0", zorder=4)

C1 = col_x0 + col_w / 2  # 19.33 (Admin)
C2 = col_x1 + col_w / 2  # 50.00 (Sistem)
C3 = col_x2 + col_w / 2  # 80.67 (Teknisi)

# -------------------------------------------------------------
# 3. HELPER: DRAW ACTION CARD (UML ACTIVITY NODE)
# -------------------------------------------------------------
def draw_action_card(cx, cy, lines, step_num, tag=None, tag_theme="amber", width=24.2, height=5.3):
    x = cx - width/2
    y = cy - height/2
    
    # Shadow
    shadow = FancyBboxPatch((x + 0.25, y - 0.25), width, height,
                            boxstyle="round,pad=0.2,rounding_size=0.6",
                            facecolor="#E2E8F0", edgecolor="none", zorder=4)
    ax.add_patch(shadow)
    
    # Card Box
    box = FancyBboxPatch((x, y), width, height,
                         boxstyle="round,pad=0.2,rounding_size=0.6",
                         facecolor="#FFFFFF", edgecolor="#64748B", linewidth=1.2, zorder=5)
    ax.add_patch(box)
    
    # Number badge at top-left
    badge_w, badge_h = 3.6, 1.35
    badge = FancyBboxPatch((x + 0.6, y + height - badge_h - 0.45), badge_w, badge_h,
                           boxstyle="round,pad=0.1,rounding_size=0.3",
                           facecolor="#0F172A", edgecolor="none", zorder=6)
    ax.add_patch(badge)
    ax.text(x + 0.6 + badge_w/2, y + height - 0.45 - badge_h/2, f"No. {step_num}",
            ha='center', va='center', fontsize=6.8, fontweight='bold', color="#FFFFFF", zorder=7)
    
    # Optional Tag Badge at top-right
    if tag:
        tag_colors = {
            "amber":  {"bg": "#FEF3C7", "border": "#D97706", "text": "#92400E"},
            "blue":   {"bg": "#DBEAFE", "border": "#2563EB", "text": "#1E40AF"},
            "green":  {"bg": "#DCFCE7", "border": "#16A34A", "text": "#166534"},
            "purple": {"bg": "#F3E8FF", "border": "#9333EA", "text": "#6B21A8"}
        }
        tc = tag_colors.get(tag_theme, tag_colors["amber"])
        tag_w = len(tag) * 0.42 + 2.0
        tag_box = FancyBboxPatch((x + width - tag_w - 0.6, y + height - badge_h - 0.45), tag_w, badge_h,
                                 boxstyle="round,pad=0.1,rounding_size=0.3",
                                 facecolor=tc["bg"], edgecolor=tc["border"], linewidth=0.7, zorder=6)
        ax.add_patch(tag_box)
        ax.text(x + width - tag_w/2 - 0.6, y + height - 0.45 - badge_h/2, tag,
                ha='center', va='center', fontsize=6.5, fontweight='bold', color=tc["text"], zorder=7)
    
    # Content text
    text_content = "\n".join(lines)
    ax.text(cx, cy - 0.45, text_content,
            ha='center', va='center', fontsize=8.6, fontweight='normal', color=TEXT_MAIN,
            multialignment='center', linespacing=1.2, zorder=6)

# -------------------------------------------------------------
# 4. HELPER: ORTHOGONAL ARROWS
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
# 5. NODES PLACEMENT
# -------------------------------------------------------------
ACT_W = 24.2
ACT_H = 5.3

# Initial Node (Start di Admin)
Y_START = 83.2
start_node = Circle((C1, Y_START), 1.25, facecolor="#0F172A", edgecolor="#64748B", linewidth=1.5, zorder=8)
ax.add_patch(start_node)
ax.text(C1, Y_START + 1.8, "START", ha='center', va='bottom', fontsize=7.8, fontweight='bold', color="#475569", zorder=8)

# Step 1 (Admin)
Y1 = 75.5
draw_action_card(C1, Y1,
                 ["Menerima order servis & unggah", "foto lembaran fisik SPK ke modul", "AI Document Scanner"],
                 1, tag="Upload Foto SPK", tag_theme="green", width=ACT_W, height=ACT_H)

# Step 2 (Sistem)
Y2 = 75.5
draw_action_card(C2, Y2,
                 ["Ekstraksi data teks via AI Vision", "(Groq LPU / OCR Fallback) &", "otomatis isi formulir (Auto-Fill)"],
                 2, tag="AI Groq Vision LPU", tag_theme="purple", width=ACT_W, height=ACT_H)

# Step 3 (Admin)
Y3 = 64.0
draw_action_card(C1, Y3,
                 ["Validasi hasil ekstraksi AI,", "periksa kelengkapan data, &", "klik tombol 'Simpan Tiket'"],
                 3, tag="Validasi Petugas", tag_theme="green", width=ACT_W, height=ACT_H)

# Step 4 (Sistem)
Y4 = 64.0
draw_action_card(C2, Y4,
                 ["Simpan data ke basis data PostgreSQL", "& sinkronisasi otomatis ke antrean", "work center teknisi terkait"],
                 4, tag="PostgreSQL & Sync", tag_theme="blue", width=ACT_W, height=ACT_H)

# Step 5 (Teknisi)
Y5 = 52.5
draw_action_card(C3, Y5,
                 ["Buka ServiceHub PWA di smartphone,", "lihat tugas antrean tiket, & ambil", "foto kondisi unit saat tiba di lokasi"],
                 5, tag="PWA Mobile & Foto Tiba", tag_theme="amber", width=ACT_W, height=ACT_H)

# Step 6 (Sistem)
Y6 = 41.0
draw_action_card(C2, Y6,
                 ["Kompresi foto (<400 KB) via Canvas", "di browser & unggah stream gambar", "secara aman ke Cloud Storage S3"],
                 6, tag="Canvas Comp. & S3", tag_theme="blue", width=ACT_W, height=ACT_H)

# Step 7 (Teknisi)
Y7 = 29.5
draw_action_card(C3, Y7,
                 ["Selesaikan perbaikan TV, ambil", "foto bukti purna-jual unit, &", "tekan toggle status 'Selesai'"],
                 7, tag="Foto Selesai & Toggle", tag_theme="amber", width=ACT_W, height=ACT_H)

# Step 8 (Sistem)
Y8 = 18.0
draw_action_card(C2, Y8,
                 ["Update work_status='selesai' di DB,", "catat waktu selesai, & perbarui", "metrik dashboard secara real-time"],
                 8, tag="Real-Time Update", tag_theme="blue", width=ACT_W, height=ACT_H)

# Step 9 (Admin)
Y9 = 18.0
draw_action_card(C1, Y9,
                 ["Pantau status tiket hijau ('Selesai')", "di dashboard & unduh laporan", "rekapitulasi servis (CSV / Excel)"],
                 9, tag="Dashboard & Rekap CSV", tag_theme="green", width=ACT_W, height=ACT_H)

# Final Node (End di Admin)
Y_END = 11.0
end_outer = Circle((C1, Y_END), 1.6, facecolor="none", edgecolor="#0F172A", linewidth=1.8, zorder=8)
end_inner = Circle((C1, Y_END), 1.0, facecolor="#0F172A", edgecolor="none", zorder=9)
ax.add_patch(end_outer)
ax.add_patch(end_inner)
ax.text(C1, Y_END - 2.0, "END (SELESAI)", ha='center', va='top', fontsize=7.8, fontweight='bold', color="#475569", zorder=8)

# -------------------------------------------------------------
# 6. CONNECTING FLOW ARROWS (CLEAN ORTHOGONAL ROUTING)
# -------------------------------------------------------------
# 1. Start -> Step 1 (Top of Step 1)
draw_flow_arrow((C1, Y_START - 1.25), (C1, Y1 + ACT_H/2))

# 2. Step 1 -> Step 2 (Horizontal Admin -> Sistem)
draw_flow_arrow((C1 + ACT_W/2, Y1), (C2 - ACT_W/2, Y2))

# 3. Step 2 -> Step 3: From Step 2 bottom, drops down to midpoint Y, goes left to C1, enters Step 3 TOP
mid_y_23 = (Y2 - ACT_H/2 + Y3 + ACT_H/2) / 2
draw_flow_arrow((C2, Y2 - ACT_H/2), (C1, Y3 + ACT_H/2),
                waypoints=[(C2, mid_y_23), (C1, mid_y_23)])

# 4. Step 3 -> Step 4 (Horizontal Admin -> Sistem)
draw_flow_arrow((C1 + ACT_W/2, Y3), (C2 - ACT_W/2, Y4))

# 5. Step 4 -> Step 5: From Step 4 right, drops down to midpoint Y, goes right to C3, enters Step 5 TOP
mid_y_45 = (Y4 - ACT_H/2 + Y5 + ACT_H/2) / 2
draw_flow_arrow((C2 + ACT_W/2, Y4), (C3, Y5 + ACT_H/2),
                waypoints=[(C2 + ACT_W/2 + 3.0, Y4), (C2 + ACT_W/2 + 3.0, mid_y_45), (C3, mid_y_45)])

# 6. Step 5 -> Step 6: From Step 5 left, drops down to midpoint Y, goes left to C2, enters Step 6 TOP
mid_y_56 = (Y5 - ACT_H/2 + Y6 + ACT_H/2) / 2
draw_flow_arrow((C3 - ACT_W/2, Y5), (C2, Y6 + ACT_H/2),
                waypoints=[(C3 - ACT_W/2 - 3.0, Y5), (C3 - ACT_W/2 - 3.0, mid_y_56), (C2, mid_y_56)])

# 7. Step 6 -> Step 7: From Step 6 right, drops down to midpoint Y, goes right to C3, enters Step 7 TOP
mid_y_67 = (Y6 - ACT_H/2 + Y7 + ACT_H/2) / 2
draw_flow_arrow((C2 + ACT_W/2, Y6), (C3, Y7 + ACT_H/2),
                waypoints=[(C2 + ACT_W/2 + 3.0, Y6), (C2 + ACT_W/2 + 3.0, mid_y_67), (C3, mid_y_67)])

# 8. Step 7 -> Step 8: From Step 7 left, drops down to midpoint Y, goes left to C2, enters Step 8 TOP
mid_y_78 = (Y7 - ACT_H/2 + Y8 + ACT_H/2) / 2
draw_flow_arrow((C3 - ACT_W/2, Y7), (C2, Y8 + ACT_H/2),
                waypoints=[(C3 - ACT_W/2 - 3.0, Y7), (C3 - ACT_W/2 - 3.0, mid_y_78), (C2, mid_y_78)])

# 9. Step 8 -> Step 9 (Horizontal Sistem -> Admin)
draw_flow_arrow((C2 - ACT_W/2, Y8), (C1 + ACT_W/2, Y9))

# 10. Step 9 -> Final Node (Bottom of Step 9 -> Top of End)
draw_flow_arrow((C1, Y9 - ACT_H/2), (C1, Y_END + 1.6))

# -------------------------------------------------------------
# 7. BOTTOM BANNER: KEUNGGULAN SISTEM USULAN
# -------------------------------------------------------------
banner_y = 1.2
banner_h = 5.8
banner_box = FancyBboxPatch((4.0, banner_y), 92.0, banner_h,
                            boxstyle="round,pad=0.3,rounding_size=0.6",
                            facecolor="#F0FDF4", edgecolor="#16A34A", linewidth=1.2, zorder=2)
ax.add_patch(banner_box)

ax.text(6.0, banner_y + 4.2, "KEUNGGULAN SISTEM USULAN SERVICEHUB (SOLUSI ATAS SISTEM BERJALAN):",
        ha='left', va='center', fontsize=9.0, fontweight='bold', color="#166534", zorder=3)

benefits = (
    "• AI Vision & Auto-Fill  : Pindai berkas SPK via Groq Vision LPU secara instan; mengeliminasi entri manual & meminimalisir human error.\n"
    "• Paperless & Real-Time   : Tiket langsung tersinkronisasi ke aplikasi PWA smartphone teknisi di lapangan tanpa menunggu berkas fisik harian.\n"
    "• Bukti Otentik Terpusat : Foto kondisi fisik unit (sebelum & sesudah servis) otomatis dikompresi (<400KB) dan tersimpan aman di S3 Cloud Storage.\n"
    "• Efisiensi Rekapitulasi  : Dashboard memantau status secara langsung (real-time) dan rekapitulasi laporan dapat diunduh (CSV) hanya dalam 1-klik."
)

ax.text(6.0, banner_y + 2.0, benefits,
        ha='left', va='center', fontsize=7.6, color="#14532D", linespacing=1.25, zorder=3)

# Save Outputs
plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
plt.savefig('activity_diagram_sistem_usulan_clean.png', dpi=300, facecolor=fig.patch.get_facecolor(), bbox_inches='tight')
plt.savefig('activity_diagram_sistem_usulan_clean.svg', format='svg', facecolor=fig.patch.get_facecolor(), bbox_inches='tight')
print("Successfully generated clean modern activity diagram sistem usulan with zero overlap!")
