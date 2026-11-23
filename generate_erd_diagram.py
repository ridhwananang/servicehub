import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle
import os

# --- SETUP FIGURE (Ultra HD 18 x 11.5 inches at 300 DPI -> 5400 x 3450 px) ---
fig_w, fig_h = 18.0, 11.5
fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=300)
ax.set_xlim(0, 180)
ax.set_ylim(0, 115)
ax.axis('off')

plt.rcParams['font.family'] = 'Segoe UI'

# --- COLOR PALETTE ---
BG_PAGE       = "#F8FAFC"   # Slate 50
HEADER_BG     = "#0F172A"   # Slate 900
HEADER_BORDER = "#1E293B"   # Slate 800

USERS_HDR_BG   = "#1E3A8A"   # Blue 900
USERS_BOX_BG   = "#FFFFFF"
USERS_BORDER   = "#2563EB"   # Blue 600

TICKETS_HDR_BG = "#0F766E"   # Teal 700
TICKETS_BOX_BG = "#FFFFFF"
TICKETS_BORDER = "#0D9488"   # Teal 600

PK_COLOR       = "#DC2626"   # Red 600
FK_COLOR       = "#D97706"   # Amber 600
UK_COLOR       = "#7C3AED"   # Purple 600
REQ_COLOR      = "#2563EB"   # Blue 600
OPT_COLOR      = "#64748B"   # Slate 500
SYS_COLOR      = "#94A3B8"   # Slate 400

fig.patch.set_facecolor(BG_PAGE)

# -------------------------------------------------------------------------
# 1. MAIN BANNER HEADER
# -------------------------------------------------------------------------
top_banner = FancyBboxPatch((5.0, 104.0), 170.0, 8.0, boxstyle="round,pad=0.3,rounding_size=0.8",
                            facecolor=HEADER_BG, edgecolor=HEADER_BORDER, linewidth=1.2, zorder=2)
ax.add_patch(top_banner)

ax.text(90.0, 109.0, "ENTITY-RELATIONSHIP DIAGRAM (ERD) - SISTEM SERVICEHUB",
        ha='center', va='center', fontsize=14.5, fontweight='bold', color="#FFFFFF", zorder=3)
ax.text(90.0, 106.0, "PT. Sharp Electronics Indonesia (Pusat Servis Aquos Platinum Pulogadung & MOI Kelapa Gading)",
        ha='center', va='center', fontsize=9.2, color="#94A3B8", zorder=3)

# -------------------------------------------------------------------------
# 2. ENTITY 1: USERS (LEFT BOX)
# -------------------------------------------------------------------------
U_LEFT   = 6.0
U_WIDTH  = 56.0
U_TOP    = 99.0
U_BOTTOM = 24.0
U_HEIGHT = U_TOP - U_BOTTOM

# Outer Entity Box
users_box = FancyBboxPatch((U_LEFT, U_BOTTOM), U_WIDTH, U_HEIGHT,
                           boxstyle="round,pad=0.2,rounding_size=0.8",
                           facecolor=USERS_BOX_BG, edgecolor=USERS_BORDER, linewidth=1.8, zorder=2)
ax.add_patch(users_box)

# Entity Header Box
users_hdr = FancyBboxPatch((U_LEFT, U_TOP - 6.8), U_WIDTH, 6.8,
                           boxstyle="round,pad=0.2,rounding_size=0.8",
                           facecolor=USERS_HDR_BG, edgecolor=USERS_BORDER, linewidth=1.5, zorder=3)
ax.add_patch(users_hdr)

ax.text(U_LEFT + U_WIDTH/2, U_TOP - 2.6, "USERS",
        ha='center', va='center', fontsize=12.5, fontweight='bold', color="#FFFFFF", zorder=4)
ax.text(U_LEFT + U_WIDTH/2, U_TOP - 5.0, "<<Master Entity / Akun Pengguna>>",
        ha='center', va='center', fontsize=8.2, fontstyle='italic', color="#93C5FD", zorder=4)

# Subtitle bar for attributes
ax.text(U_LEFT + 2.5, U_TOP - 9.0, "ATRIBUT & TIPE DATA POSTGRESQL",
        fontsize=8.0, fontweight='bold', color="#475569", zorder=4)

# List of attributes for USERS
users_attrs = [
    ("[PK]", "id", "BIGINT IDENTITY", "Kunci Utama"),
    ("[UK]", "email", "VARCHAR(255)", "Email Akun (Login Unik)"),
    ("[REQ]", "name", "VARCHAR(255)", "Nama Lengkap Staf/Teknisi"),
    ("[REQ]", "role", "VARCHAR(255)", "Hak Akses ('admin' / 'teknisi')"),
    ("[REQ]", "password", "VARCHAR(255)", "Hash Kredensial Keamanan"),
    ("[OPT]", "avatar", "VARCHAR(255)", "URL/Path Foto Profil"),
    ("[OPT]", "email_verified_at", "TIMESTAMP", "Waktu Verifikasi Email"),
    ("[SYS]", "remember_token", "VARCHAR(100)", "Token Sesi Remember Me"),
    ("[SYS]", "two_factor_secret", "TEXT", "Kunci Rahasia 2FA"),
    ("[SYS]", "two_factor_recovery", "TEXT", "Kode Pemulihan Cadangan 2FA"),
    ("[SYS]", "two_factor_confirmed", "TIMESTAMP", "Waktu Konfirmasi 2FA"),
    ("[SYS]", "created_at", "TIMESTAMP", "Waktu Pendaftaran Akun"),
    ("[SYS]", "updated_at", "TIMESTAMP", "Waktu Pembaruan Terakhir"),
]

curr_y = U_TOP - 12.2
for badge, name, dtype, desc in users_attrs:
    bcolor = PK_COLOR if badge == "[PK]" else (UK_COLOR if badge == "[UK]" else (REQ_COLOR if badge == "[REQ]" else (OPT_COLOR if badge == "[OPT]" else SYS_COLOR)))
    
    ax.text(U_LEFT + 2.0, curr_y, badge, fontsize=7.5, fontweight='bold', color=bcolor, va='center', zorder=4)
    ax.text(U_LEFT + 7.8, curr_y, name, fontsize=8.0, fontweight='bold' if badge in ["[PK]", "[UK]"] else 'normal', color="#0F172A", va='center', zorder=4)
    ax.text(U_LEFT + 27.5, curr_y, f": {dtype}", fontsize=7.2, color="#334155", va='center', zorder=4)
    ax.text(U_LEFT + U_WIDTH - 2.0, curr_y, desc, fontsize=7.0, fontstyle='italic', color="#64748B", ha='right', va='center', zorder=4)
    
    ax.plot([U_LEFT + 1.5, U_LEFT + U_WIDTH - 1.5], [curr_y - 2.1, curr_y - 2.1], color="#E2E8F0", linewidth=0.6, zorder=3)
    curr_y -= 4.4

# -------------------------------------------------------------------------
# 3. ENTITY 2: SERVICE_TICKETS (RIGHT BOX)
# -------------------------------------------------------------------------
T_LEFT   = 118.0
T_WIDTH  = 56.0
T_TOP    = 99.0
T_BOTTOM = 6.0
T_HEIGHT = T_TOP - T_BOTTOM

# Outer Entity Box
tickets_box = FancyBboxPatch((T_LEFT, T_BOTTOM), T_WIDTH, T_HEIGHT,
                             boxstyle="round,pad=0.2,rounding_size=0.8",
                             facecolor=TICKETS_BOX_BG, edgecolor=TICKETS_BORDER, linewidth=1.8, zorder=2)
ax.add_patch(tickets_box)

# Entity Header Box
tickets_hdr = FancyBboxPatch((T_LEFT, T_TOP - 6.8), T_WIDTH, 6.8,
                             boxstyle="round,pad=0.2,rounding_size=0.8",
                             facecolor=TICKETS_HDR_BG, edgecolor=TICKETS_BORDER, linewidth=1.5, zorder=3)
ax.add_patch(tickets_hdr)

ax.text(T_LEFT + T_WIDTH/2, T_TOP - 2.6, "SERVICE_TICKETS",
        ha='center', va='center', fontsize=12.5, fontweight='bold', color="#FFFFFF", zorder=4)
ax.text(T_LEFT + T_WIDTH/2, T_TOP - 5.0, "<<Transaction Entity / Nota SPK Servis>>",
        ha='center', va='center', fontsize=8.2, fontstyle='italic', color="#99F6E4", zorder=4)

# Subtitle bar for attributes
ax.text(T_LEFT + 2.5, T_TOP - 9.0, "ATRIBUT & TIPE DATA POSTGRESQL",
        fontsize=8.0, fontweight='bold', color="#475569", zorder=4)

# List of attributes for SERVICE_TICKETS (23 physical columns)
ticket_attrs = [
    ("[PK]", "id", "BIGINT IDENTITY", "Kunci Utama"),
    ("[FK]", "created_by", "BIGINT (NULL)", "Akun Pencatat (users.id)"),
    ("[UK]", "notif_number", "VARCHAR(255)", "Nomor SPK Sharp (Unik)"),
    ("[REQ]", "customer_name", "VARCHAR(255)", "Nama Pelanggan"),
    ("[REQ]", "customer_phone", "VARCHAR(255)", "No Telepon Pelanggan"),
    ("[OPT]", "customer_address", "TEXT", "Alamat Domisili Servis"),
    ("[REQ]", "unit_model", "VARCHAR(255)", "Model Unit Produk"),
    ("[REQ]", "serial_number", "VARCHAR(255)", "Nomor Seri Perangkat"),
    ("[OPT]", "service_date", "DATE", "Tanggal Pengerjaan"),
    ("[OPT]", "deadline", "DATE", "Batas Waktu Servis (SLA)"),
    ("[REQ]", "status", "VARCHAR(255)", "Status Biaya Servis"),
    ("[OPT]", "status_note", "VARCHAR(255)", "Garansi / Free Service"),
    ("[REQ]", "work_status", "VARCHAR(255)", "Status Pengerjaan"),
    ("[REQ]", "work_types", "JSON", "Array Tipe Pekerjaan"),
    ("[OPT]", "other_work_text", "VARCHAR(255)", "Deskripsi Kerja Lain-lain"),
    ("[REQ]", "mainwork_center", "VARCHAR(255)", "Cabang (Pulogadung / MOI)"),
    ("[OPT]", "start_time", "VARCHAR(255)", "Jam Mulai Servis"),
    ("[OPT]", "finish_time", "VARCHAR(255)", "Jam Selesai Servis"),
    ("[OPT]", "visit_photo", "VARCHAR(255)", "Path Foto Kunjungan"),
    ("[OPT]", "completion_photo", "VARCHAR(255)", "Path Foto Selesai"),
    ("[OPT]", "notes", "TEXT", "Catatan Teknis Perbaikan"),
    ("[SYS]", "created_at", "TIMESTAMP", "Waktu Input Sistem"),
    ("[SYS]", "updated_at", "TIMESTAMP", "Waktu Pembaruan Terakhir"),
]

curr_y = T_TOP - 11.8
for badge, name, dtype, desc in ticket_attrs:
    bcolor = PK_COLOR if badge == "[PK]" else (FK_COLOR if badge == "[FK]" else (UK_COLOR if badge == "[UK]" else (REQ_COLOR if badge == "[REQ]" else (OPT_COLOR if badge == "[OPT]" else SYS_COLOR))))
    
    ax.text(T_LEFT + 2.0, curr_y, badge, fontsize=7.2, fontweight='bold', color=bcolor, va='center', zorder=4)
    ax.text(T_LEFT + 7.8, curr_y, name, fontsize=7.6, fontweight='bold' if badge in ["[PK]", "[FK]", "[UK]"] else 'normal', color="#0F172A", va='center', zorder=4)
    ax.text(T_LEFT + 26.5, curr_y, f": {dtype}", fontsize=6.8, color="#334155", va='center', zorder=4)
    ax.text(T_LEFT + T_WIDTH - 2.0, curr_y, desc, fontsize=6.7, fontstyle='italic', color="#64748B", ha='right', va='center', zorder=4)
    
    ax.plot([T_LEFT + 1.5, T_LEFT + T_WIDTH - 1.5], [curr_y - 1.7, curr_y - 1.7], color="#E2E8F0", linewidth=0.5, zorder=3)
    curr_y -= 3.52

# -------------------------------------------------------------------------
# 4. RELATIONSHIP CONNECTOR IN THE MIDDLE (CROW'S FOOT NOTATION)
# -------------------------------------------------------------------------
REL_X = 90.0
REL_Y = 61.5

# Central Relationship Box
rel_box = FancyBboxPatch((REL_X - 16.0, REL_Y - 5.0), 32.0, 10.0,
                         boxstyle="round,pad=0.3,rounding_size=0.6",
                         facecolor="#1E293B", edgecolor="#334155", linewidth=1.5, zorder=4)
ax.add_patch(rel_box)

ax.text(REL_X, REL_Y + 1.6, "Mencatat / Membuat",
        ha='center', va='center', fontsize=9.8, fontweight='bold', color="#FFFFFF", zorder=5)
ax.text(REL_X, REL_Y - 2.0, "(creates / records)",
        ha='center', va='center', fontsize=7.8, fontstyle='italic', color="#94A3B8", zorder=5)

# Cardinality badge: USERS 1 : N SERVICE_TICKETS
card_badge = FancyBboxPatch((REL_X - 16.5, REL_Y - 9.8), 33.0, 3.8,
                            boxstyle="round,pad=0.2,rounding_size=0.4",
                            facecolor="#2563EB", edgecolor="#1D4ED8", linewidth=1.0, zorder=4)
ax.add_patch(card_badge)
ax.text(REL_X, REL_Y - 7.9, "USERS 1 : N SERVICE_TICKETS",
        ha='center', va='center', fontsize=7.8, fontweight='bold', color="#FFFFFF", zorder=5)

# Connecting lines: USERS -> REL_BOX -> SERVICE_TICKETS
LINE_Y = REL_Y
ax.plot([U_LEFT + U_WIDTH, REL_X - 16.0], [LINE_Y, LINE_Y], color="#0F172A", linewidth=2.2, zorder=3)
ax.plot([REL_X + 16.0, T_LEFT], [LINE_Y, LINE_Y], color="#0F172A", linewidth=2.2, zorder=3)

# CROW'S FOOT NOTATION:
# On USERS side (Left): Zero or One (0..1) because created_by is NULLABLE -> Circle + Vertical bar
X_USER_CONN = U_LEFT + U_WIDTH + 4.0
# Circle (Zero / Optional participation)
circ_u = Circle((X_USER_CONN + 2.0, LINE_Y), radius=1.8, facecolor="#FFFFFF", edgecolor="#0F172A", linewidth=2.2, zorder=5)
ax.add_patch(circ_u)
# Vertical bar (One)
ax.plot([X_USER_CONN + 6.0, X_USER_CONN + 6.0], [LINE_Y - 4.0, LINE_Y + 4.0], color="#0F172A", linewidth=2.4, zorder=5)
ax.text(X_USER_CONN + 4.0, LINE_Y + 5.5, "0..1 (Nullable User)", fontsize=8.2, fontweight='bold', color="#1E3A8A", ha='center', zorder=5)

# On TICKETS side (Right): Zero-or-Many (0..N) -> Circle + Crow's foot
X_TICK_CONN = T_LEFT - 4.0
# Circle (Zero / Optional participation)
circ_t = Circle((X_TICK_CONN - 6.0, LINE_Y), radius=1.8, facecolor="#FFFFFF", edgecolor="#0F172A", linewidth=2.2, zorder=5)
ax.add_patch(circ_t)
# Crow's foot prongs
ax.plot([X_TICK_CONN - 3.0, X_TICK_CONN], [LINE_Y, LINE_Y + 4.2], color="#0F172A", linewidth=2.4, zorder=5)
ax.plot([X_TICK_CONN - 3.0, X_TICK_CONN], [LINE_Y, LINE_Y - 4.2], color="#0F172A", linewidth=2.4, zorder=5)
ax.plot([X_TICK_CONN - 3.0, X_TICK_CONN], [LINE_Y, LINE_Y], color="#0F172A", linewidth=2.4, zorder=5)
ax.text(X_TICK_CONN - 2.5, LINE_Y + 5.5, "0..N (Banyak Tiket)", fontsize=8.2, fontweight='bold', color="#0F766E", ha='center', zorder=5)

# Foreign Key & Integrity Card in Center-Bottom
fk_card = FancyBboxPatch((REL_X - 22.0, REL_Y - 30.0), 44.0, 17.5,
                         boxstyle="round,pad=0.3,rounding_size=0.6",
                         facecolor="#FFFFFF", edgecolor="#CBD5E1", linewidth=1.2, zorder=3)
ax.add_patch(fk_card)

ax.text(REL_X, REL_Y - 15.5, "ATURAN INTEGRITAS RELASI",
        ha='center', va='center', fontsize=8.6, fontweight='bold', color="#1E293B", zorder=4)
rules_text = (
    "• Kunci Tamu: created_by -> users.id\n"
    "• Kardinalitas: USERS 1 : N SERVICE_TICKETS\n"
    "• Optionality: 0..1 pada created_by (Nullable)\n"
    "• Aksi Penghapusan: ON DELETE SET NULL\n"
    "• Makna: Akun Pengguna/Staf Pencatat Tiket\n"
    "• Sifat: Data tiket tetap dipertahankan ketika akun\n"
    "  pencatat dihapus, sedangkan nilai created_by menjadi NULL."
)
ax.text(REL_X, REL_Y - 23.5, rules_text,
        ha='center', va='center', fontsize=7.2, color="#475569", zorder=4)

# -------------------------------------------------------------------------
# 5. LEGEND / KETERANGAN KOTAK BAWAH
# -------------------------------------------------------------------------
leg_box = FancyBboxPatch((U_LEFT, 6.0), 104.0, 14.0,
                        boxstyle="round,pad=0.3,rounding_size=0.6",
                        facecolor="#FFFFFF", edgecolor="#CBD5E1", linewidth=1.0, zorder=2)
ax.add_patch(leg_box)

ax.text(U_LEFT + 2.5, 17.0, "KETERANGAN SIMBOL & NOTASI ERD:",
        fontsize=8.4, fontweight='bold', color="#0F172A", zorder=3)

legends = [
    ("[PK]", "Primary Key (Kunci Utama Identitas PostgreSQL)"),
    ("[FK]", "Foreign Key (Kunci Tamu Relasi Antar-Entitas)"),
    ("[UK]", "Unique Key (Kunci Unik)"),
    ("[REQ]", "Mandatory Attribute (Wajib Diisi / NOT NULL)"),
    ("[OPT]", "Optional Attribute (Dapat Bernilai NULL)"),
    ("[SYS]", "System Audit Attribute (Timestamp & Keamanan Laravel)"),
]

col1_x = U_LEFT + 2.5
col2_x = U_LEFT + 53.0

for i, (sym, lbl) in enumerate(legends):
    target_x = col1_x if i < 3 else col2_x
    target_y = 13.8 - (i % 3) * 3.2
    color = PK_COLOR if sym == "[PK]" else (FK_COLOR if sym == "[FK]" else (UK_COLOR if sym == "[UK]" else (REQ_COLOR if sym == "[REQ]" else (OPT_COLOR if sym == "[OPT]" else SYS_COLOR))))
    
    ax.text(target_x, target_y, sym, fontsize=7.5, fontweight='bold', color=color, va='center', zorder=3)
    ax.text(target_x + 6.5, target_y, lbl, fontsize=7.2, color="#334155", va='center', zorder=3)

# Save figure
out_png = r"c:\Users\An\Herd\servicehub\erd_servicehub_clean.png"
out_svg = r"c:\Users\An\Herd\servicehub\erd_servicehub_clean.svg"

plt.savefig(out_png, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
plt.savefig(out_svg, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()

print(f"ERD diagrams successfully regenerated to:\n- {out_png}\n- {out_svg}")
