import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Ellipse
import numpy as np

# Set figure and DPI (Ultra HD 17.5 x 13.5 inches at 300 DPI -> 5250 x 4050 px)
fig_width, fig_height = 17.5, 13.5
fig, ax = plt.subplots(figsize=(fig_width, fig_height), dpi=300)
ax.set_xlim(0, 175)
ax.set_ylim(0, 135)
ax.axis('off')

# Font settings
plt.rcParams['font.family'] = 'Segoe UI'

# Color Palette
BG_CANVAS = "#F8FAFC"       # Slate 50
CONTAINER_BG = "#FFFFFF"    # White
BORDER_SLATE = "#CBD5E1"    # Slate 300
BORDER_DASH  = "#3B82F6"    # Blue 500

TEXT_MAIN  = "#0F172A"      # Slate 900
TEXT_MUTED = "#64748B"      # Slate 500

# Actors Palette
COLOR_ADMIN = "#047857"     # Emerald 700
COLOR_TECH  = "#C2410C"     # Orange 700
COLOR_LINE_ADMIN = "#059669" # Emerald 600
COLOR_LINE_TECH  = "#EA580C" # Orange 600

fig.patch.set_facecolor(BG_CANVAS)

# -------------------------------------------------------------
# 1. MAIN HEADER BANNER
# -------------------------------------------------------------
title_box = FancyBboxPatch((5.0, 123.5), 165.0, 7.5, boxstyle="round,pad=0.4,rounding_size=0.8",
                           facecolor="#0F172A", edgecolor="#1E293B", linewidth=1.2, zorder=2)
ax.add_patch(title_box)

ax.text(87.5, 127.8, "USE CASE DIAGRAM - SISTEM SERVICEHUB (AQUOS PLATINUM)",
        ha='center', va='center', fontsize=15, fontweight='bold', color="#FFFFFF", zorder=3)
ax.text(87.5, 125.2, "Pemodelan Interaksi Fungsional Pengguna pada Platform Servis TV Berbasis Web PWA & AI Vision (Studi Kasus: PT. Sharp Electronics Indonesia)",
        ha='center', va='center', fontsize=9.2, color="#94A3B8", zorder=3)

# -------------------------------------------------------------
# 2. SYSTEM BOUNDARY (KOTAK BATAS SISTEM)
# -------------------------------------------------------------
B_LEFT = 38.0
B_WIDTH = 99.0
B_TOP = 121.0
B_BOTTOM = 18.0
B_HEIGHT = B_TOP - B_BOTTOM

sys_box = FancyBboxPatch((B_LEFT, B_BOTTOM), B_WIDTH, B_HEIGHT,
                         boxstyle="round,pad=0.3,rounding_size=1.0",
                         facecolor="#FFFFFF", edgecolor="#2563EB", linewidth=1.8, linestyle='--', zorder=1)
ax.add_patch(sys_box)

sys_label_box = FancyBboxPatch((B_LEFT + 20.0, B_TOP - 4.5), B_WIDTH - 40.0, 4.0,
                               boxstyle="round,pad=0.2,rounding_size=0.5",
                               facecolor="#EFF6FF", edgecolor="#BFDBFE", linewidth=1.0, zorder=2)
ax.add_patch(sys_label_box)

ax.text(B_LEFT + B_WIDTH/2, B_TOP - 2.5, "«system» ServiceHub Platform (Core Web, AI Vision & PWA)",
        ha='center', va='center', fontsize=10.0, fontweight='bold', color="#1E40AF", zorder=3)

# -------------------------------------------------------------
# 3. HELPER: DRAW ACTOR (STICK FIGURE + ROLE CARD)
# -------------------------------------------------------------
def draw_actor(x, y, name, subtitle, color, is_left=True):
    # Head
    head = Circle((x, y + 14.0), 2.5, facecolor="#FFFFFF", edgecolor=color, linewidth=2.2, zorder=10)
    ax.add_patch(head)
    
    # Body
    ax.plot([x, x], [y + 11.5, y + 3.0], color=color, linewidth=2.4, zorder=10)
    
    # Arms
    ax.plot([x - 4.5, x + 4.5], [y + 8.5, y + 8.5], color=color, linewidth=2.4, zorder=10)
    
    # Legs
    ax.plot([x, x - 3.8], [y + 3.0, y - 5.5], color=color, linewidth=2.4, zorder=10)
    ax.plot([x, x + 3.8], [y + 3.0, y - 5.5], color=color, linewidth=2.4, zorder=10)
    
    # Actor Label Card below
    card_w, card_h = 28.0, 6.2
    card_x = x - card_w/2
    card_y = y - 13.5
    
    actor_card = FancyBboxPatch((card_x, card_y), card_w, card_h,
                                boxstyle="round,pad=0.2,rounding_size=0.6",
                                facecolor="#FFFFFF", edgecolor=color, linewidth=1.4, zorder=10)
    ax.add_patch(actor_card)
    
    # Header strip inside card
    strip_h = 2.4
    strip = FancyBboxPatch((card_x, card_y + card_h - strip_h), card_w, strip_h,
                           boxstyle="round,pad=0.1,rounding_size=0.4",
                           facecolor=color, edgecolor="none", zorder=11)
    ax.add_patch(strip)
    
    ax.text(x, card_y + card_h - strip_h/2, name,
            ha='center', va='center', fontsize=8.8, fontweight='bold', color="#FFFFFF", zorder=12)
    ax.text(x, card_y + 1.8, subtitle,
            ha='center', va='center', fontsize=7.2, color=TEXT_MUTED, zorder=12)

# Draw Actors
draw_actor(18.0, 68.0, "Admin Service Center", "Petugas Validasi & Koordinator", COLOR_ADMIN, is_left=True)
draw_actor(157.0, 68.0, "Teknisi Lapangan", "Pelaksana Servis Mobile PWA", COLOR_TECH, is_left=False)

# -------------------------------------------------------------
# 4. USE CASE PILLS
# -------------------------------------------------------------
use_cases_data = [
    {"id": "UC-01", "name": "Autentikasi & RBAC (2FA / Passkey)", "sub": "Login aman & otorisasi peran pengguna", "y": 110.5, "w": 62.0, "h": 6.8, "admin": True, "tech": True},
    {"id": "UC-02", "name": "Kelola Akun Pengguna (CRUD User)", "sub": "Pendaftaran, edit role, & mutasi teknisi", "y": 99.5, "w": 62.0, "h": 6.8, "admin": True, "tech": False},
    {"id": "UC-03", "name": "Pencatatan Tiket Servis Manual", "sub": "Form input data pelanggan & keluhan TV", "y": 88.5, "w": 62.0, "h": 6.8, "admin": True, "tech": False},
    {"id": "UC-04", "name": "Pindai Lembar SPK via AI Vision", "sub": "Ekstraksi citra otomatis (Groq / Gemini VLM)", "y": 77.5, "w": 62.0, "h": 6.8, "admin": True, "tech": False},
    {"id": "UC-05", "name": "Ekstraksi Teks Fallback OCR", "sub": "Pencadangan jika kuota / koneksi AI terganggu", "y": 66.5, "w": 62.0, "h": 6.8, "admin": True, "tech": False},
    {"id": "UC-06", "name": "Pencarian & Filter Tiket Servis", "sub": "Filter per work center, status, & no. seri", "y": 55.5, "w": 62.0, "h": 6.8, "admin": True, "tech": True},
    {"id": "UC-07", "name": "Unggah Foto Bukti Fisik Servis", "sub": "Kompresi Canvas & upload S3 (tiba & selesai)", "y": 44.5, "w": 62.0, "h": 6.8, "admin": True, "tech": True},
    {"id": "UC-08", "name": "Pembaruan Status Servis (Toggle)", "sub": "Ubah status belum_selesai -> selesai", "y": 33.5, "w": 62.0, "h": 6.8, "admin": True, "tech": True},
    {"id": "UC-09", "name": "Monitoring Dashboard & Rekap CSV", "sub": "Visualisasi performa real-time & unduh laporan", "y": 22.5, "w": 62.0, "h": 6.8, "admin": True, "tech": False},
]

UC_X = B_LEFT + B_WIDTH/2  # 87.5
uc_coords = {}

for uc in use_cases_data:
    uy = uc["y"]
    uw = uc["w"]
    uh = uc["h"]
    
    # Shadow
    shadow = FancyBboxPatch((UC_X - uw/2 + 0.3, uy - uh/2 - 0.3), uw, uh,
                            boxstyle="round,pad=0.2,rounding_size=3.0",
                            facecolor="#E2E8F0", edgecolor="none", zorder=3)
    ax.add_patch(shadow)
    
    # Pill Box
    pill = FancyBboxPatch((UC_X - uw/2, uy - uh/2), uw, uh,
                          boxstyle="round,pad=0.2,rounding_size=3.0",
                          facecolor="#F0F9FF", edgecolor="#0284C7", linewidth=1.4, zorder=4)
    ax.add_patch(pill)
    
    # Badge ID
    badge_w, badge_h = 7.2, 2.2
    badge = FancyBboxPatch((UC_X - uw/2 + 2.5, uy - badge_h/2), badge_w, badge_h,
                           boxstyle="round,pad=0.1,rounding_size=0.4",
                           facecolor="#0369A1", edgecolor="none", zorder=5)
    ax.add_patch(badge)
    ax.text(UC_X - uw/2 + 2.5 + badge_w/2, uy, uc["id"],
            ha='center', va='center', fontsize=7.2, fontweight='bold', color="#FFFFFF", zorder=6)
    
    # Label & Subtext
    ax.text(UC_X + 2.0, uy + 0.9, uc["name"],
            ha='center', va='center', fontsize=8.8, fontweight='bold', color="#0C4A6E", zorder=5)
    ax.text(UC_X + 2.0, uy - 1.2, uc["sub"],
            ha='center', va='center', fontsize=7.0, color="#64748B", zorder=5)
    
    uc_coords[uc["id"]] = {
        "x_left": UC_X - uw/2,
        "x_right": UC_X + uw/2,
        "y": uy
    }

# -------------------------------------------------------------
# 5. DRAW ASSOCIATION LINES (AKTOR -> USE CASE)
# -------------------------------------------------------------
ADMIN_PT = (18.0 + 4.5, 68.0 + 8.5)
TECH_PT  = (157.0 - 4.5, 68.0 + 8.5)

for uc in use_cases_data:
    if uc["admin"]:
        tgt = (uc_coords[uc["id"]]["x_left"], uc_coords[uc["id"]]["y"])
        ax.plot([ADMIN_PT[0], tgt[0]], [ADMIN_PT[1], tgt[1]],
                color=COLOR_LINE_ADMIN, linewidth=1.2, linestyle='-', zorder=2)

for uc in use_cases_data:
    if uc["tech"]:
        tgt = (uc_coords[uc["id"]]["x_right"], uc_coords[uc["id"]]["y"])
        ax.plot([TECH_PT[0], tgt[0]], [TECH_PT[1], tgt[1]],
                color=COLOR_LINE_TECH, linewidth=1.2, linestyle='-', zorder=2)

# -------------------------------------------------------------
# 6. STEREOTYPE RELATIONS (<<extend>>)
# -------------------------------------------------------------
p_uc4_top = (UC_X, uc_coords["UC-04"]["y"] + 3.4)
p_uc3_bot = (UC_X, uc_coords["UC-03"]["y"] - 3.4)

arrow_ext1 = FancyArrowPatch(p_uc4_top, p_uc3_bot,
                             arrowstyle='-|>', mutation_scale=11,
                             color="#2563EB", linewidth=1.2, linestyle='--', zorder=8)
ax.add_patch(arrow_ext1)

badge_ext1 = FancyBboxPatch((UC_X + 2.5, (p_uc4_top[1] + p_uc3_bot[1])/2 - 0.9), 12.0, 1.8,
                            boxstyle="round,pad=0.1,rounding_size=0.3",
                            facecolor="#EFF6FF", edgecolor="#3B82F6", linewidth=0.8, zorder=9)
ax.add_patch(badge_ext1)
ax.text(UC_X + 8.5, (p_uc4_top[1] + p_uc3_bot[1])/2, "«extend»",
        ha='center', va='center', fontsize=6.8, fontweight='bold', color="#1D4ED8", zorder=10)

p_uc5_top = (UC_X, uc_coords["UC-05"]["y"] + 3.4)
p_uc4_bot = (UC_X, uc_coords["UC-04"]["y"] - 3.4)

arrow_ext2 = FancyArrowPatch(p_uc5_top, p_uc4_bot,
                             arrowstyle='-|>', mutation_scale=11,
                             color="#2563EB", linewidth=1.2, linestyle='--', zorder=8)
ax.add_patch(arrow_ext2)

badge_ext2 = FancyBboxPatch((UC_X + 2.5, (p_uc5_top[1] + p_uc4_bot[1])/2 - 0.9), 12.0, 1.8,
                            boxstyle="round,pad=0.1,rounding_size=0.3",
                            facecolor="#EFF6FF", edgecolor="#3B82F6", linewidth=0.8, zorder=9)
ax.add_patch(badge_ext2)
ax.text(UC_X + 8.5, (p_uc5_top[1] + p_uc4_bot[1])/2, "«extend»",
        ha='center', va='center', fontsize=6.8, fontweight='bold', color="#1D4ED8", zorder=10)

# -------------------------------------------------------------
# 7. BOTTOM LEGEND / METADATA PANEL
# -------------------------------------------------------------
legend_box = FancyBboxPatch((5.0, 2.0), 165.0, 14.0,
                           boxstyle="round,pad=0.3,rounding_size=0.8",
                           facecolor="#FFFFFF", edgecolor=BORDER_SLATE, linewidth=1.2, zorder=2)
ax.add_patch(legend_box)

ax.text(87.5, 13.5, "MATRIKS HAK AKSES PERAN (ROLE-BASED ACCESS CONTROL - RBAC) & STEREOTIPE RELASI",
        ha='center', va='center', fontsize=9.2, fontweight='bold', color="#0F172A", zorder=3)

lx = [8.0, 48.0, 92.0, 132.0]
ax.text(lx[0], 10.8, "[*] Garis Hijau : Relasi Asosiasi Admin", ha='left', va='center', fontsize=7.6, fontweight='bold', color=COLOR_ADMIN, zorder=3)
ax.text(lx[1], 10.8, "[*] Garis Oranye : Relasi Asosiasi Teknisi", ha='left', va='center', fontsize=7.6, fontweight='bold', color=COLOR_TECH, zorder=3)
ax.text(lx[2], 10.8, "[- - >] Panah Putus : Relasi «extend»", ha='left', va='center', fontsize=7.6, fontweight='bold', color="#1D4ED8", zorder=3)
ax.text(lx[3], 10.8, "[«system»] : Lingkup Web Platform", ha='left', va='center', fontsize=7.6, fontweight='bold', color="#475569", zorder=3)

ax.plot([8.0, 167.0], [9.5, 9.5], color="#E2E8F0", linewidth=1.0, zorder=3)

rbac_notes = (
    "- Admin Service Center : Memiliki hak penuh atas penerbitan tiket (manual / AI scanner), kelola akun pengguna, monitoring real-time, dan ekspor data CSV.\n"
    "- Teknisi Lapangan     : Diberikan hak akses mobile (PWA) untuk melihat antrean tiket kerja, mengunggah foto bukti fisik, dan memperbarui status pengerjaan.\n"
    "- Relasi «extend»      : AI Vision Scanner memperluas (extend) pencatatan manual secara opsional; dan Fallback OCR memperluas AI Scanner jika terjadi kendala jaringan."
)
ax.text(8.0, 5.8, rbac_notes, ha='left', va='center', fontsize=7.3, color="#334155", linespacing=1.25, zorder=3)

# Save Outputs
plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
plt.savefig('use_case_diagram_servicehub_clean.png', dpi=300, facecolor=fig.patch.get_facecolor(), bbox_inches='tight')
plt.savefig('use_case_diagram_servicehub_clean.svg', format='svg', facecolor=fig.patch.get_facecolor(), bbox_inches='tight')
print("Successfully generated clean modern Use Case diagram without font errors!")
