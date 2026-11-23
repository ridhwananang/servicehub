import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch
import os
import shutil

# --- SETUP FIGURE (Ultra HD 21 x 13 inches at 300 DPI -> 6300 x 3900 px) ---
fig_w, fig_h = 21.0, 13.0
fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=300)
ax.set_xlim(0, 210)
ax.set_ylim(0, 130)
ax.axis('off')

plt.rcParams['font.family'] = 'Segoe UI'

# --- COLOR PALETTE ---
BG_PAGE       = "#F8FAFC"   # Slate 50
HEADER_BG     = "#0F172A"   # Slate 900
HEADER_BORDER = "#1E293B"   # Slate 800

USERS_HDR_BG   = "#1E3A8A"   # Blue 900
USERS_BORDER   = "#2563EB"   # Blue 600

TICKETS_HDR_BG = "#047857"   # Emerald 700
TICKETS_BORDER = "#059669"   # Emerald 600

PK_COLOR       = "#DC2626"   # Red 600 (Primary Key)
FK_COLOR       = "#D97706"   # Amber 600 (Foreign Key)
UK_COLOR       = "#7C3AED"   # Purple 600 (Unique Key)
IDX_COLOR      = "#0284C7"   # Sky 600 (Index)
REQ_COLOR      = "#334155"   # Slate 700 (NOT NULL)
OPT_COLOR      = "#64748B"   # Slate 500 (NULLABLE)

fig.patch.set_facecolor(BG_PAGE)

# -------------------------------------------------------------------------
# 1. MAIN BANNER HEADER
# -------------------------------------------------------------------------
top_banner = FancyBboxPatch((5.0, 118.0), 200.0, 8.5, boxstyle="round,pad=0.3,rounding_size=0.8",
                            facecolor=HEADER_BG, edgecolor=HEADER_BORDER, linewidth=1.2, zorder=2)
ax.add_patch(top_banner)

ax.text(105.0, 123.2, "DIAGRAM RELASI TABEL BASIS DATA (POSTGRESQL)",
        ha='center', va='center', fontsize=15.0, fontweight='bold', color="#FFFFFF", zorder=3)
ax.text(105.0, 120.0, "Sistem Pelaporan Teknisi ServiceHub - PT. Sharp Electronics Indonesia",
        ha='center', va='center', fontsize=9.6, color="#94A3B8", zorder=3)

# -------------------------------------------------------------------------
# 2. TABLE 1: users (LEFT BOX)
# -------------------------------------------------------------------------
U_LEFT   = 5.0
U_WIDTH  = 60.0
U_TOP    = 114.0
U_BOTTOM = 30.0
U_HEIGHT = U_TOP - U_BOTTOM

# Outer Table Box
users_box = FancyBboxPatch((U_LEFT, U_BOTTOM), U_WIDTH, U_HEIGHT,
                           boxstyle="round,pad=0.2,rounding_size=0.8",
                           facecolor="#FFFFFF", edgecolor=USERS_BORDER, linewidth=1.8, zorder=2)
ax.add_patch(users_box)

# Table Header Box
users_hdr = FancyBboxPatch((U_LEFT, U_TOP - 6.5), U_WIDTH, 6.5,
                           boxstyle="round,pad=0.2,rounding_size=0.8",
                           facecolor=USERS_HDR_BG, edgecolor=USERS_BORDER, linewidth=1.5, zorder=3)
ax.add_patch(users_hdr)

ax.text(U_LEFT + 3.0, U_TOP - 3.2, "TABLE: users",
        fontsize=12.2, fontweight='bold', color="#FFFFFF", va='center', zorder=4)
ax.text(U_LEFT + U_WIDTH - 2.5, U_TOP - 3.2, "[13 Kolom Fisik]",
        fontsize=8.8, color="#93C5FD", ha='right', va='center', zorder=4)

# Table Columns Header Sub-bar
sub_hdr_u = FancyBboxPatch((U_LEFT + 1.0, U_TOP - 10.2), U_WIDTH - 2.0, 3.4,
                           boxstyle="round,pad=0.1,rounding_size=0.3",
                           facecolor="#F1F5F9", edgecolor="#CBD5E1", linewidth=0.8, zorder=3)
ax.add_patch(sub_hdr_u)

ax.text(U_LEFT + 2.0, U_TOP - 8.5, "KUNCI", fontsize=7.4, fontweight='bold', color="#475569", va='center', zorder=4)
ax.text(U_LEFT + 11.0, U_TOP - 8.5, "NAMA KOLOM", fontsize=7.4, fontweight='bold', color="#475569", va='center', zorder=4)
ax.text(U_LEFT + 32.5, U_TOP - 8.5, "TIPE DATA", fontsize=7.4, fontweight='bold', color="#475569", va='center', zorder=4)
ax.text(U_LEFT + U_WIDTH - 2.5, U_TOP - 8.5, "CONSTRAINT", fontsize=7.4, fontweight='bold', color="#475569", ha='right', va='center', zorder=4)

# Data Columns for users (13 columns) - Exact physical schema
users_cols = [
    ("[PK]", "id", "BIGINT IDENTITY", "NOT NULL, PRIMARY KEY", PK_COLOR),
    ("[UK]", "email", "VARCHAR(255)", "NOT NULL, UNIQUE", UK_COLOR),
    ("[IDX]", "role", "VARCHAR(255)", "NOT NULL, DEFAULT 'teknisi'", IDX_COLOR),
    ("-", "name", "VARCHAR(255)", "NOT NULL", REQ_COLOR),
    ("-", "avatar", "VARCHAR(255)", "NULLABLE", OPT_COLOR),
    ("-", "password", "VARCHAR(255)", "NOT NULL", REQ_COLOR),
    ("-", "email_verified_at", "TIMESTAMP", "NULLABLE", OPT_COLOR),
    ("-", "remember_token", "VARCHAR(100)", "NULLABLE", OPT_COLOR),
    ("-", "two_factor_secret", "TEXT", "NULLABLE", OPT_COLOR),
    ("-", "two_factor_recovery_codes", "TEXT", "NULLABLE", OPT_COLOR),
    ("-", "two_factor_confirmed_at", "TIMESTAMP", "NULLABLE", OPT_COLOR),
    ("-", "created_at", "TIMESTAMP", "NULLABLE", OPT_COLOR),
    ("-", "updated_at", "TIMESTAMP", "NULLABLE", OPT_COLOR),
]

curr_y = U_TOP - 13.5
for key_tag, cname, ctype, ccons, tag_color in users_cols:
    if key_tag != "-":
        ax.text(U_LEFT + 2.0, curr_y, key_tag, fontsize=7.4, fontweight='bold', color=tag_color, va='center', zorder=4)
    else:
        ax.text(U_LEFT + 3.5, curr_y, "•", fontsize=7.4, color="#94A3B8", va='center', zorder=4)
        
    ax.text(U_LEFT + 11.0, curr_y, cname, fontsize=7.8, fontweight='bold' if key_tag in ["[PK]", "[UK]"] else 'normal', color="#0F172A", va='center', zorder=4)
    ax.text(U_LEFT + 32.5, curr_y, ctype, fontsize=7.2, color="#334155", va='center', zorder=4)
    ax.text(U_LEFT + U_WIDTH - 2.5, curr_y, ccons, fontsize=6.8, fontstyle='italic', color="#64748B", ha='right', va='center', zorder=4)
    
    ax.plot([U_LEFT + 1.5, U_LEFT + U_WIDTH - 1.5], [curr_y - 2.6, curr_y - 2.6], color="#E2E8F0", linewidth=0.5, zorder=3)
    curr_y -= 5.4

Y_USERS_ID = U_TOP - 13.5

# -------------------------------------------------------------------------
# 3. TABLE 2: service_tickets (RIGHT BOX)
# -------------------------------------------------------------------------
T_LEFT   = 120.0
T_WIDTH  = 85.0
T_TOP    = 114.0
T_BOTTOM = 6.0
T_HEIGHT = T_TOP - T_BOTTOM

# Outer Table Box
tickets_box = FancyBboxPatch((T_LEFT, T_BOTTOM), T_WIDTH, T_HEIGHT,
                             boxstyle="round,pad=0.2,rounding_size=0.8",
                             facecolor="#FFFFFF", edgecolor=TICKETS_BORDER, linewidth=1.8, zorder=2)
ax.add_patch(tickets_box)

# Table Header Box
tickets_hdr = FancyBboxPatch((T_LEFT, T_TOP - 6.5), T_WIDTH, 6.5,
                             boxstyle="round,pad=0.2,rounding_size=0.8",
                             facecolor=TICKETS_HDR_BG, edgecolor=TICKETS_BORDER, linewidth=1.5, zorder=3)
ax.add_patch(tickets_hdr)

ax.text(T_LEFT + 3.0, T_TOP - 3.2, "TABLE: service_tickets",
        fontsize=12.2, fontweight='bold', color="#FFFFFF", va='center', zorder=4)
ax.text(T_LEFT + T_WIDTH - 2.5, T_TOP - 3.2, "[23 Kolom Fisik]",
        fontsize=8.8, color="#A7F3D0", ha='right', va='center', zorder=4)

# Table Columns Header Sub-bar
sub_hdr_t = FancyBboxPatch((T_LEFT + 1.0, T_TOP - 10.2), T_WIDTH - 2.0, 3.4,
                           boxstyle="round,pad=0.1,rounding_size=0.3",
                           facecolor="#F1F5F9", edgecolor="#CBD5E1", linewidth=0.8, zorder=3)
ax.add_patch(sub_hdr_t)

ax.text(T_LEFT + 2.0, T_TOP - 8.5, "KUNCI", fontsize=7.4, fontweight='bold', color="#475569", va='center', zorder=4)
ax.text(T_LEFT + 10.5, T_TOP - 8.5, "NAMA KOLOM", fontsize=7.4, fontweight='bold', color="#475569", va='center', zorder=4)
ax.text(T_LEFT + 34.0, T_TOP - 8.5, "TIPE DATA", fontsize=7.4, fontweight='bold', color="#475569", va='center', zorder=4)
ax.text(T_LEFT + T_WIDTH - 2.5, T_TOP - 8.5, "CONSTRAINT / ATRIBUT", fontsize=7.4, fontweight='bold', color="#475569", ha='right', va='center', zorder=4)

# Data Columns for service_tickets (23 columns) - Exact physical schema
ticket_cols = [
    ("[PK]", "id", "BIGINT IDENTITY", "NOT NULL, PRIMARY KEY", PK_COLOR),
    ("[FK]", "created_by", "BIGINT", "NULLABLE, REF users(id) ON DELETE SET NULL", FK_COLOR),
    ("[UK]", "notif_number", "VARCHAR(255)", "NOT NULL, UNIQUE KEY", UK_COLOR),
    ("[IDX]", "customer_phone", "VARCHAR(255)", "NOT NULL, INDEX", IDX_COLOR),
    ("[IDX]", "service_date", "DATE", "NULLABLE, INDEX", IDX_COLOR),
    ("[IDX]", "deadline", "DATE", "NULLABLE, COMPOSITE INDEX", IDX_COLOR),
    ("[IDX]", "status", "VARCHAR(255)", "NOT NULL, INDEX ('berbayar' / 'tidak_berbayar')", IDX_COLOR),
    ("[IDX]", "work_status", "VARCHAR(255)", "NOT NULL, DEFAULT 'belum_selesai'", IDX_COLOR),
    ("[IDX]", "mainwork_center", "VARCHAR(255)", "NOT NULL, INDEX ('Pulogadung' / 'MOI' / ...)", IDX_COLOR),
    ("-", "customer_name", "VARCHAR(255)", "NOT NULL", REQ_COLOR),
    ("-", "customer_address", "TEXT", "NULLABLE", OPT_COLOR),
    ("-", "unit_model", "VARCHAR(255)", "NOT NULL", REQ_COLOR),
    ("-", "serial_number", "VARCHAR(255)", "NOT NULL", REQ_COLOR),
    ("-", "status_note", "VARCHAR(255)", "NULLABLE ('Garansi' / 'Free Service')", OPT_COLOR),
    ("-", "work_types", "JSON", "NOT NULL (Array Tipe Pekerjaan)", REQ_COLOR),
    ("-", "other_work_text", "VARCHAR(255)", "NULLABLE", OPT_COLOR),
    ("-", "start_time", "VARCHAR(255)", "NULLABLE (Format 'hh:mm')", OPT_COLOR),
    ("-", "finish_time", "VARCHAR(255)", "NULLABLE (Format 'hh:mm')", OPT_COLOR),
    ("-", "visit_photo", "VARCHAR(255)", "NULLABLE (Storage URL / Path)", OPT_COLOR),
    ("-", "completion_photo", "VARCHAR(255)", "NULLABLE (Storage URL / Path)", OPT_COLOR),
    ("-", "notes", "TEXT", "NULLABLE (Catatan Teknisi)", OPT_COLOR),
    ("-", "created_at", "TIMESTAMP", "NULLABLE", OPT_COLOR),
    ("-", "updated_at", "TIMESTAMP", "NULLABLE", OPT_COLOR),
]

curr_y = T_TOP - 13.0
Y_TICKETS_CREATED_BY = None

for idx, (key_tag, cname, ctype, ccons, tag_color) in enumerate(ticket_cols):
    if cname == "created_by":
        Y_TICKETS_CREATED_BY = curr_y

    if key_tag != "-":
        ax.text(T_LEFT + 2.0, curr_y, key_tag, fontsize=7.4, fontweight='bold', color=tag_color, va='center', zorder=4)
    else:
        ax.text(T_LEFT + 3.5, curr_y, "•", fontsize=7.4, color="#94A3B8", va='center', zorder=4)
        
    ax.text(T_LEFT + 10.5, curr_y, cname, fontsize=7.6, fontweight='bold' if key_tag in ["[PK]", "[FK]", "[UK]"] else 'normal', color="#0F172A", va='center', zorder=4)
    ax.text(T_LEFT + 34.0, curr_y, ctype, fontsize=7.0, color="#334155", va='center', zorder=4)
    ax.text(T_LEFT + T_WIDTH - 2.5, curr_y, ccons, fontsize=6.8, fontstyle='italic', color="#64748B", ha='right', va='center', zorder=4)
    
    ax.plot([T_LEFT + 1.5, T_LEFT + T_WIDTH - 1.5], [curr_y - 1.9, curr_y - 1.9], color="#E2E8F0", linewidth=0.45, zorder=3)
    curr_y -= 3.9

# -------------------------------------------------------------------------
# 4. PHYSICAL RELATION CONNECTOR: service_tickets.created_by -> users.id
# -------------------------------------------------------------------------
REL_CENTER_X = 92.5

# Path of connector:
# Start from right of users.id (U_LEFT + U_WIDTH, Y_USERS_ID)
# To left of service_tickets.created_by (T_LEFT, Y_TICKETS_CREATED_BY)

ax.plot([U_LEFT + U_WIDTH, REL_CENTER_X - 12.0], [Y_USERS_ID, Y_USERS_ID], color="#D97706", linewidth=2.5, zorder=5)
ax.plot([REL_CENTER_X - 12.0, REL_CENTER_X - 12.0], [Y_USERS_ID, Y_TICKETS_CREATED_BY], color="#D97706", linewidth=2.5, zorder=5)
ax.plot([REL_CENTER_X - 12.0, T_LEFT], [Y_TICKETS_CREATED_BY, Y_TICKETS_CREATED_BY], color="#D97706", linewidth=2.5, zorder=5)

# End arrow pointing to created_by
arrow = FancyArrowPatch((T_LEFT - 2.5, Y_TICKETS_CREATED_BY), (T_LEFT, Y_TICKETS_CREATED_BY),
                        arrowstyle='-|>', mutation_scale=15, color="#D97706", linewidth=2.5, zorder=6)
ax.add_patch(arrow)

# Circle on PK users.id side
pk_circ = Circle((U_LEFT + U_WIDTH, Y_USERS_ID), radius=1.1, facecolor="#D97706", edgecolor="#B45309", zorder=6)
ax.add_patch(pk_circ)

# Badge on Connector Line (Foreign Key Info)
mid_y = (Y_USERS_ID + Y_TICKETS_CREATED_BY) / 2
fk_box = FancyBboxPatch((REL_CENTER_X - 24.0, mid_y - 5.8), 48.0, 11.6,
                        boxstyle="round,pad=0.3,rounding_size=0.6",
                        facecolor="#FFFFFF", edgecolor="#D97706", linewidth=1.6, zorder=7)
ax.add_patch(fk_box)

ax.text(REL_CENTER_X, mid_y + 3.2, "FOREIGN KEY CONSTRAINT",
        ha='center', va='center', fontsize=8.4, fontweight='bold', color="#B45309", zorder=8)
ax.text(REL_CENTER_X, mid_y + 0.6, "service_tickets(created_by) -> users(id)",
        ha='center', va='center', fontsize=7.6, fontweight='bold', color="#0F172A", zorder=8)
ax.text(REL_CENTER_X, mid_y - 2.2, "Aksi Integritas: ON DELETE SET NULL",
        ha='center', va='center', fontsize=7.2, color="#475569", zorder=8)
ax.text(REL_CENTER_X, mid_y - 4.4, "Kardinalitas: 0..1 (Nullable FK)",
        ha='center', va='center', fontsize=7.0, fontstyle='italic', color="#64748B", zorder=8)

# -------------------------------------------------------------------------
# 5. DATABASE INDEXES & TECHNICAL HIGHLIGHT CARD (CENTER-BOTTOM)
# -------------------------------------------------------------------------
idx_card = FancyBboxPatch((REL_CENTER_X - 24.0, 30.0), 48.0, 35.0,
                         boxstyle="round,pad=0.3,rounding_size=0.6",
                         facecolor="#FFFFFF", edgecolor="#CBD5E1", linewidth=1.2, zorder=3)
ax.add_patch(idx_card)

ax.text(REL_CENTER_X, 61.8, "STRUKTUR PENGINDEKSAN (INDEXES)",
        ha='center', va='center', fontsize=8.6, fontweight='bold', color="#1E293B", zorder=4)

idx_text = (
    "• Primary Key Index (B-Tree):\n"
    "   - users_pkey ON users(id)\n"
    "   - service_tickets_pkey ON service_tickets(id)\n\n"
    "• Unique Constraint Index:\n"
    "   - users_email_unique ON users(email)\n"
    "   - service_tickets_notif_number_unique\n"
    "     ON service_tickets(notif_number)\n\n"
    "• Single-Column B-Tree Index:\n"
    "   - users_role_index ON users(role)\n"
    "   - idx_service_tickets_service_date\n"
    "   - idx_service_tickets_status\n"
    "   - idx_service_tickets_mainwork_center\n"
    "   - idx_service_tickets_customer_phone\n\n"
    "• Composite B-Tree Index:\n"
    "   - service_tickets_work_status_deadline_index\n"
    "     ON (work_status, deadline)"
)
ax.text(REL_CENTER_X - 21.5, 45.0, idx_text,
        va='center', fontsize=6.8, color="#334155", zorder=4)

# -------------------------------------------------------------------------
# 6. LEGEND / KETERANGAN KOTAK BAWAH
# -------------------------------------------------------------------------
leg_box = FancyBboxPatch((U_LEFT, 6.0), 108.0, 20.0,
                        boxstyle="round,pad=0.3,rounding_size=0.6",
                        facecolor="#FFFFFF", edgecolor="#CBD5E1", linewidth=1.0, zorder=2)
ax.add_patch(leg_box)

ax.text(U_LEFT + 2.5, 23.2, "KETERANGAN SIMBOL KUNCI & CONSTRAINT SKEMA FISIK:",
        fontsize=8.5, fontweight='bold', color="#0F172A", zorder=3)

legends = [
    ("[PK]", "Primary Key (Kunci Utama PostgreSQL Identity / Auto Increment)"),
    ("[FK]", "Foreign Key (Kunci Tamu Relasi Fisik Antar-Tabel)"),
    ("[UK]", "Unique Key (Batasan Nilai Unik Kolom / Candidate Key)"),
    ("[IDX]", "Indexed Column (Kolom dengan Pengindeksan B-Tree Aktif)"),
    ("NOT NULL", "Mandatory Column (Kolom Fisik Wajib Berisi Data Skalar)"),
    ("NULLABLE", "Optional Column (Dapat Bernilai NULL / Tidak Wajib Diisi)"),
]

col1_x = U_LEFT + 2.5
col2_x = U_LEFT + 55.0

for i, (sym, lbl) in enumerate(legends):
    target_x = col1_x if i < 3 else col2_x
    target_y = 19.0 - (i % 3) * 4.4
    color = PK_COLOR if sym == "[PK]" else (FK_COLOR if sym == "[FK]" else (UK_COLOR if sym == "[UK]" else (IDX_COLOR if sym == "[IDX]" else REQ_COLOR)))
    
    ax.text(target_x, target_y, sym, fontsize=7.6, fontweight='bold', color=color, va='center', zorder=3)
    ax.text(target_x + 9.5, target_y, lbl, fontsize=7.1, color="#334155", va='center', zorder=3)

# Save figure
out_png = r"c:\Users\An\Herd\servicehub\relasi_tabel_servicehub_clean.png"
out_svg = r"c:\Users\An\Herd\servicehub\relasi_tabel_servicehub_clean.svg"

plt.savefig(out_png, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
plt.savefig(out_svg, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()

# Copy to artifact dir
art_dir = r"C:\Users\An\.gemini\antigravity\brain\dcbd55fb-38f6-46db-b6e3-9b160c1ca30f"
if os.path.exists(art_dir):
    shutil.copy(out_png, os.path.join(art_dir, "relasi_tabel_servicehub_clean.png"))
    shutil.copy(out_svg, os.path.join(art_dir, "relasi_tabel_servicehub_clean.svg"))

print(f"Relasi Tabel diagrams successfully saved and synced!")
