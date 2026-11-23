import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Rectangle, Circle

out_dir = r"c:\Users\An\Herd\servicehub"
art_dir = r"C:\Users\An\.gemini\antigravity\brain\dcbd55fb-38f6-46db-b6e3-9b160c1ca30f"

plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

# -----------------------------------------------------------------------------
# HELPER: DRAW ROUNDED BOX
# -----------------------------------------------------------------------------
def draw_card(ax, x, y, w, h, bg="white", border="#CBD5E1", lw=1.2, radius=0.03):
    box = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.0,rounding_size={radius}",
                         facecolor=bg, edgecolor=border, linewidth=lw, zorder=2)
    ax.add_patch(box)

def draw_badge(ax, x, y, w, h, text, bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=7.5):
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.08",
                         facecolor=bg, edgecolor=border, linewidth=1, zorder=4)
    ax.add_patch(box)
    ax.text(x + w/2, y + h/2, text, ha="center", va="center", color=text_color,
            fontsize=fontsize, fontweight="bold", zorder=5)

def save_fig(fig, filename):
    plt.tight_layout()
    p1 = os.path.join(out_dir, filename)
    p2 = os.path.join(art_dir, filename)
    fig.savefig(p1, dpi=300, bbox_inches="tight")
    fig.savefig(p2, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Saved:", p1)

# =============================================================================
# 1. WIREFRAME LOGIN (GAMBAR 3.12)
# =============================================================================
def generate_wireframe_login():
    fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")

    # Browser window mockup
    draw_card(ax, 5, 5, 90, 90, bg="#FFFFFF", border="#94A3B8", lw=1.5, radius=1.5)
    # Browser bar
    ax.add_patch(Rectangle((5, 87), 90, 8, facecolor="#E2E8F0", edgecolor="#94A3B8", linewidth=1))
    ax.add_patch(Circle((9, 91), 1.2, facecolor="#EF4444"))
    ax.add_patch(Circle((12.5, 91), 1.2, facecolor="#F59E0B"))
    ax.add_patch(Circle((16, 91), 1.2, facecolor="#10B981"))
    draw_card(ax, 22, 88.5, 56, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.5)
    ax.text(25, 91, "https://servicehub.sharp-electronics.id/login", fontsize=8, color="#64748B", va="center")

    # Center Login Card (Wireframe Style)
    draw_card(ax, 30, 18, 40, 62, bg="#F8FAFC", border="#64748B", lw=1.5, radius=1.0)

    # Logo Placeholder
    draw_card(ax, 45, 71, 10, 5, bg="#E2E8F0", border="#94A3B8", lw=1, radius=0.3)
    ax.text(50, 73.5, "[ LOGO ]", ha="center", va="center", fontsize=8, color="#475569", fontweight="bold")
    ax.text(50, 67, "ServiceHub - Aquos Platinum", ha="center", va="center", fontsize=10, fontweight="bold", color="#1E293B")
    ax.text(50, 64, "Silakan masuk ke akun operasional Anda", ha="center", va="center", fontsize=7.5, color="#64748B")

    # Email field
    ax.text(34, 58, "Alamat Email *", fontsize=8, color="#334155", fontweight="bold")
    draw_card(ax, 34, 51.5, 32, 5, bg="#FFFFFF", border="#94A3B8", lw=1, radius=0.4)
    ax.text(36, 54, "nama.petugas@sharp.co.id", fontsize=7.5, color="#94A3B8")

    # Password field
    ax.text(34, 46, "Kata Sandi *", fontsize=8, color="#334155", fontweight="bold")
    draw_card(ax, 34, 39.5, 32, 5, bg="#FFFFFF", border="#94A3B8", lw=1, radius=0.4)
    ax.text(36, 42, "••••••••••••", fontsize=8, color="#94A3B8")

    # Remember & Forgot
    ax.add_patch(Rectangle((34, 34), 2.5, 2.5, facecolor="#FFFFFF", edgecolor="#64748B"))
    ax.text(38, 35.2, "Ingat saya", fontsize=7.5, color="#475569")
    ax.text(66, 35.2, "Lupa sandi?", fontsize=7.5, color="#2563EB", ha="right")

    # Submit button
    draw_card(ax, 34, 25, 32, 6, bg="#0F2A4A", border="#0F2A4A", lw=1, radius=0.5)
    ax.text(50, 28, "MASUK KE SISTEM", ha="center", va="center", fontsize=8.5, color="#FFFFFF", fontweight="bold")

    save_fig(fig, "wireframe_login.png")

# =============================================================================
# 2. WIREFRAME DASHBOARD (GAMBAR 3.13)
# =============================================================================
def generate_wireframe_dashboard():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")

    # Window frame
    draw_card(ax, 2, 2, 96, 96, bg="#FFFFFF", border="#94A3B8", lw=1.5, radius=1.5)
    # Header
    ax.add_patch(Rectangle((2, 90), 96, 8, facecolor="#0F2A4A", edgecolor="#0F2A4A"))
    ax.text(5, 94, "SHARP | ServiceHub Admin Center", fontsize=11, color="white", fontweight="bold", va="center")
    ax.text(80, 94, "[Admin: Bpk. Joko] | [Keluar]", fontsize=8, color="#93C5FD", va="center")

    # Sidebar (left)
    draw_card(ax, 4, 4, 18, 84, bg="#F1F5F9", border="#CBD5E1", lw=1, radius=0.5)
    ax.text(13, 83, "MENU UTAMA", ha="center", fontsize=8, color="#64748B", fontweight="bold")
    draw_card(ax, 6, 75, 14, 5, bg="#0284C7", border="#0284C7", lw=1, radius=0.3)
    ax.text(13, 77.5, "Dashboard", ha="center", fontsize=8, color="white", fontweight="bold")
    draw_card(ax, 6, 68, 14, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(13, 70.5, "Data Tiket", ha="center", fontsize=8, color="#334155")
    draw_card(ax, 6, 61, 14, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(13, 63.5, "Pengguna", ha="center", fontsize=8, color="#334155")
    draw_card(ax, 6, 54, 14, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(13, 56.5, "Laporan", ha="center", fontsize=8, color="#334155")

    # Main Area (right)
    # 4 Stat Cards
    stats = [
        ("Total Tiket", "48", "#EFF6FF", "#3B82F6"),
        ("Pending", "12", "#FEF3C7", "#D97706"),
        ("In Progress", "18", "#E0F2FE", "#0284C7"),
        ("Completed", "18", "#DCFCE7", "#16A34A")
    ]
    for idx, (title, val, bg, col) in enumerate(stats):
        x = 24 + idx * 18
        draw_card(ax, x, 73, 16.5, 13, bg=bg, border=col, lw=1.2, radius=0.5)
        ax.text(x + 2, 82, title, fontsize=8, color="#475569")
        ax.text(x + 2, 76.5, val, fontsize=14, color=col, fontweight="bold")

    # Action Toolbar
    draw_card(ax, 24, 64, 25, 6, bg="#FFFFFF", border="#94A3B8", lw=1, radius=0.4)
    ax.text(26, 67, "Cari Nomor SPK / Nama...", fontsize=8, color="#94A3B8", va="center")

    draw_card(ax, 51, 64, 13, 6, bg="#E11D48", border="#E11D48", lw=1, radius=0.4)
    ax.text(57.5, 67, "[+] Scan SPK (AI)", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    draw_card(ax, 65.5, 64, 14, 6, bg="#0284C7", border="#0284C7", lw=1, radius=0.4)
    ax.text(72.5, 67, "+ Tambah Manual", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    draw_card(ax, 81, 64, 14.5, 6, bg="#10B981", border="#10B981", lw=1, radius=0.4)
    ax.text(88.2, 67, "Ekspor Excel", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    # Data Table Wireframe
    draw_card(ax, 24, 6, 71.5, 55, bg="#FFFFFF", border="#94A3B8", lw=1, radius=0.5)
    # Table Header
    ax.add_patch(Rectangle((24, 55), 71.5, 6, facecolor="#F1F5F9", edgecolor="#CBD5E1"))
    cols = [(26, "No. SPK"), (38, "Nama Pelanggan"), (52, "Model Unit"), (64, "Status"), (76, "Tenggat"), (86, "Aksi")]
    for cx, ch in cols:
        ax.text(cx, 58, ch, fontsize=7.5, color="#1E293B", fontweight="bold")

    # 4 Sample Rows
    rows = [
        ("2410080012", "Hendra Gunawan", "AH-XP10UHY", "In Progress", "09/10/2026"),
        ("2410080013", "Siti Rahmawati", "2T-C42BD1I", "Pending", "10/10/2026"),
        ("2410080014", "Budi Santoso", "SJ-X165MG", "Completed", "08/10/2026"),
        ("2410080015", "Dewi Lestari", "ES-FL1082", "In Progress", "11/10/2026"),
    ]
    for r_idx, r in enumerate(rows):
        ry = 47 - r_idx * 10
        ax.plot([24, 95.5], [ry+8, ry+8], color="#E2E8F0", lw=0.8)
        ax.text(26, ry+3.5, r[0], fontsize=7.5, color="#0284C7")
        ax.text(38, ry+3.5, r[1], fontsize=7.5, color="#334155")
        ax.text(52, ry+3.5, r[2], fontsize=7.5, color="#334155")
        # Status pill
        draw_card(ax, 63, ry+1.5, 10, 4.5, bg="#E2E8F0", border="#94A3B8", lw=0.8, radius=0.4)
        ax.text(68, ry+3.8, r[3], fontsize=6.8, ha="center", va="center", color="#1E293B")
        ax.text(76, ry+3.5, r[4], fontsize=7.5, color="#64748B")
        ax.text(86, ry+3.5, "[Detail] [Ubah]", fontsize=7, color="#0284C7")

    save_fig(fig, "wireframe_dashboard.png")

# =============================================================================
# 3. WIREFRAME MODAL SCANNER SPK VLM (GAMBAR 3.14)
# =============================================================================
def generate_wireframe_modal_scanner():
    fig, ax = plt.subplots(figsize=(8.5, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#E2E8F0")

    # Backdrop & Modal
    draw_card(ax, 10, 5, 80, 90, bg="#FFFFFF", border="#64748B", lw=1.8, radius=1.0)
    # Modal Header
    ax.add_patch(Rectangle((10, 86), 80, 9, facecolor="#0F2A4A", edgecolor="#0F2A4A"))
    ax.text(14, 90.5, "Ekstraksi SPK Otomatis via AI Vision-Language Model", fontsize=9.5, color="white", fontweight="bold", va="center")
    ax.text(87, 90.5, "[X]", fontsize=9, color="white", va="center")

    # Top Area: Upload Dropzone
    draw_card(ax, 14, 58, 72, 25, bg="#F8FAFC", border="#94A3B8", lw=1.2, radius=0.6)
    ax.text(50, 74, "[ FOTO DOKUMEN SPK SHARP ]", ha="center", fontsize=8.5, color="#475569", fontweight="bold")
    ax.text(50, 70, "Tarik & lepas foto nota SPK atau klik tombol di bawah (Maks. 10 MB)", ha="center", fontsize=7.5, color="#64748B")
    draw_card(ax, 38, 62, 24, 5.5, bg="#0284C7", border="#0284C7", lw=1, radius=0.4)
    ax.text(50, 64.8, "PILIH / AMBIL FOTO", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    # Middle: AI Extraction Preview Title
    ax.text(14, 53, "Hasil Ekstraksi AI VLM (Verifikasi Data Sebelum Disimpan):", fontsize=8.5, color="#0F2A4A", fontweight="bold")

    # Fields (2 columns)
    # Left Col
    ax.text(14, 48, "Nomor SPK *", fontsize=7.5, color="#475569")
    draw_card(ax, 14, 42, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(16, 44.5, "2410080012", fontsize=7.5, color="#1E293B")

    ax.text(14, 38, "Nama Pelanggan *", fontsize=7.5, color="#475569")
    draw_card(ax, 14, 32, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(16, 34.5, "Hendra Gunawan", fontsize=7.5, color="#1E293B")

    ax.text(14, 28, "Model Unit *", fontsize=7.5, color="#475569")
    draw_card(ax, 14, 22, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(16, 24.5, "AH-XP10UHY (AC Inverter)", fontsize=7.5, color="#1E293B")

    # Right Col
    ax.text(52, 48, "No. Telepon / HP *", fontsize=7.5, color="#475569")
    draw_card(ax, 52, 42, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(54, 44.5, "081234567890", fontsize=7.5, color="#1E293B")

    ax.text(52, 38, "Nomor Seri Unit", fontsize=7.5, color="#475569")
    draw_card(ax, 52, 32, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(54, 34.5, "SH89201124", fontsize=7.5, color="#1E293B")

    ax.text(52, 28, "Keluhan Konsumen", fontsize=7.5, color="#475569")
    draw_card(ax, 52, 22, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(54, 24.5, "Unit AC tidak dingin, timer kedip", fontsize=7.5, color="#1E293B")

    # Bottom Actions
    draw_card(ax, 50, 10, 16, 6, bg="#F1F5F9", border="#CBD5E1", lw=1, radius=0.4)
    ax.text(58, 13, "Batal", ha="center", va="center", fontsize=8, color="#475569")

    draw_card(ax, 68, 10, 20, 6, bg="#10B981", border="#10B981", lw=1, radius=0.4)
    ax.text(78, 13, "SIMPAN TIKET", ha="center", va="center", fontsize=8, color="white", fontweight="bold")

    save_fig(fig, "wireframe_modal_scanner.png")

# =============================================================================
# 4. WIREFRAME FORM MANUAL (GAMBAR 3.15)
# =============================================================================
def generate_wireframe_form_manual():
    fig, ax = plt.subplots(figsize=(8.5, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")

    draw_card(ax, 8, 4, 84, 92, bg="#FFFFFF", border="#94A3B8", lw=1.5, radius=1.0)
    ax.add_patch(Rectangle((8, 87), 84, 9, facecolor="#0F2A4A", edgecolor="#0F2A4A"))
    ax.text(12, 91.5, "Formulir Entri Tiket Servis Manual", fontsize=10, color="white", fontweight="bold", va="center")

    # Section 1: Pelanggan
    ax.text(12, 82, "1. Informasi Pelanggan", fontsize=8.5, color="#0284C7", fontweight="bold")
    ax.text(12, 76, "Nomor SPK *", fontsize=7.5, color="#475569")
    draw_card(ax, 12, 70, 38, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)

    ax.text(54, 76, "Nama Pelanggan *", fontsize=7.5, color="#475569")
    draw_card(ax, 54, 70, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)

    ax.text(12, 65, "Nomor Telepon *", fontsize=7.5, color="#475569")
    draw_card(ax, 12, 59, 38, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)

    ax.text(54, 65, "Alamat Domisili *", fontsize=7.5, color="#475569")
    draw_card(ax, 54, 59, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)

    # Section 2: Unit Sharp
    ax.text(12, 52, "2. Informasi Perangkat Sharp", fontsize=8.5, color="#0284C7", fontweight="bold")
    ax.text(12, 46, "Jenis Produk (AC / TV / Kulkas) *", fontsize=7.5, color="#475569")
    draw_card(ax, 12, 40, 38, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)

    ax.text(54, 46, "Model Unit *", fontsize=7.5, color="#475569")
    draw_card(ax, 54, 40, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)

    # Section 3: Keluhan & Deadline
    ax.text(12, 33, "3. Detail Keluhan & Status", fontsize=8.5, color="#0284C7", fontweight="bold")
    ax.text(12, 27, "Deskripsi Keluhan Unit", fontsize=7.5, color="#475569")
    draw_card(ax, 12, 19, 38, 7, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)

    ax.text(54, 27, "Tenggat Waktu Layanan (Deadline)", fontsize=7.5, color="#475569")
    draw_card(ax, 54, 21, 34, 5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)

    # Buttons
    draw_card(ax, 52, 10, 16, 6, bg="#F1F5F9", border="#CBD5E1", lw=1, radius=0.4)
    ax.text(60, 13, "Batal", ha="center", va="center", fontsize=8, color="#475569")

    draw_card(ax, 70, 10, 20, 6, bg="#0284C7", border="#0284C7", lw=1, radius=0.4)
    ax.text(80, 13, "SIMPAN DATA", ha="center", va="center", fontsize=8, color="white", fontweight="bold")

    save_fig(fig, "wireframe_form_manual.png")

# =============================================================================
# 5. WIREFRAME MOBILE PWA TEKNISI (GAMBAR 3.16)
# =============================================================================
def generate_wireframe_mobile_pwa():
    fig, ax = plt.subplots(figsize=(5, 8.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")

    # Smartphone frame
    draw_card(ax, 8, 2, 84, 96, bg="#FFFFFF", border="#1E293B", lw=2, radius=3.0)
    # Speaker notch
    draw_card(ax, 40, 95, 20, 1.5, bg="#0F172A", border="#0F172A", lw=1, radius=0.5)

    # Top App Bar
    ax.add_patch(Rectangle((8, 87), 84, 6.5, facecolor="#0F2A4A", edgecolor="#0F2A4A"))
    ax.text(14, 90.2, "ServiceHub Mobile", fontsize=9, color="white", fontweight="bold", va="center")
    ax.text(84, 90.2, "[Teknisi]", fontsize=7.5, color="#93C5FD", va="center")

    # Ticket info card
    draw_card(ax, 12, 73, 76, 12, bg="#F1F5F9", border="#CBD5E1", lw=1, radius=0.6)
    ax.text(15, 81.5, "SPK: 2410080012", fontsize=8, color="#0284C7", fontweight="bold")
    draw_badge(ax, 66, 80, 18, 3.5, "IN PROGRESS", bg="#E0F2FE", border="#0284C7", text_color="#0369A1", fontsize=6)
    ax.text(15, 77.5, "Hendra Gunawan | 081234567890", fontsize=7, color="#334155")
    ax.text(15, 74.5, "Jl. Pulo Gadung No. 45, Jakarta Timur", fontsize=6.8, color="#64748B")

    # Work report section
    ax.text(12, 69, "Laporan Diagnosis Kerusakan:", fontsize=7.5, color="#1E293B", fontweight="bold")
    draw_card(ax, 12, 61, 76, 7, bg="#FFFFFF", border="#94A3B8", lw=1, radius=0.4)
    ax.text(14, 65, "Thermistor indoor rusak & freon berkurang...", fontsize=7, color="#94A3B8")

    # Checklist work_types
    ax.text(12, 57, "Tindakan Servis (work_types):", fontsize=7.5, color="#1E293B", fontweight="bold")
    draw_card(ax, 12, 44, 76, 12, bg="#F8FAFC", border="#CBD5E1", lw=1, radius=0.4)
    ax.add_patch(Rectangle((15, 51.5), 2.5, 2.5, facecolor="#0284C7", edgecolor="#0284C7"))
    ax.text(19, 52.5, "[X] Perbaikan Modul PCB", fontsize=6.8, color="#1E293B")

    ax.add_patch(Rectangle((54, 51.5), 2.5, 2.5, facecolor="#0284C7", edgecolor="#0284C7"))
    ax.text(58, 52.5, "[X] Tambah Freon R32", fontsize=6.8, color="#1E293B")

    ax.add_patch(Rectangle((15, 46.5), 2.5, 2.5, facecolor="#FFFFFF", edgecolor="#94A3B8"))
    ax.text(19, 47.5, "[ ] Pembersihan Filter", fontsize=6.8, color="#64748B")

    ax.add_patch(Rectangle((54, 46.5), 2.5, 2.5, facecolor="#FFFFFF", edgecolor="#94A3B8"))
    ax.text(58, 47.5, "[ ] Ganti Kompresor", fontsize=6.8, color="#64748B")

    # Photos section (visit & completion)
    ax.text(12, 40, "Dokumentasi Foto Bukti Servis:", fontsize=7.5, color="#1E293B", fontweight="bold")

    draw_card(ax, 12, 22, 36, 16.5, bg="#F1F5F9", border="#94A3B8", lw=1, radius=0.5)
    ax.text(30, 31, "[ FOTO KUNJUNGAN ]", ha="center", fontsize=6.5, color="#475569", fontweight="bold")
    ax.text(30, 27, "Kompresi: 318 KB", ha="center", fontsize=6, color="#16A34A")
    draw_badge(ax, 18, 23, 24, 3, "AMBIL FOTO", bg="#0284C7", border="#0284C7", text_color="white", fontsize=5.5)

    draw_card(ax, 52, 22, 36, 16.5, bg="#F1F5F9", border="#94A3B8", lw=1, radius=0.5)
    ax.text(70, 31, "[ FOTO SELESAI ]", ha="center", fontsize=6.5, color="#475569", fontweight="bold")
    ax.text(70, 27, "Kompresi: 342 KB", ha="center", fontsize=6, color="#16A34A")
    draw_badge(ax, 58, 23, 24, 3, "AMBIL FOTO", bg="#0284C7", border="#0284C7", text_color="white", fontsize=5.5)

    # Submit button
    draw_card(ax, 12, 12, 76, 7, bg="#16A34A", border="#16A34A", lw=1, radius=0.5)
    ax.text(50, 15.5, "KIRIM LAPORAN SERVIS (SELESAI)", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    save_fig(fig, "wireframe_mobile_pwa.png")

# =============================================================================
# 6. UI IMPLEMENTASI LOGIN (GAMBAR 3.17)
# =============================================================================
def generate_ui_login():
    fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#F1F5F9")

    # Browser chrome
    draw_card(ax, 5, 5, 90, 90, bg="#FFFFFF", border="#CBD5E1", lw=1.2, radius=1.5)
    ax.add_patch(Rectangle((5, 87), 90, 8, facecolor="#0F172A", edgecolor="#0F172A"))
    ax.add_patch(Circle((9, 91), 1.2, facecolor="#EF4444"))
    ax.add_patch(Circle((12.5, 91), 1.2, facecolor="#F59E0B"))
    ax.add_patch(Circle((16, 91), 1.2, facecolor="#10B981"))
    draw_card(ax, 22, 88.5, 56, 5, bg="#1E293B", border="#334155", lw=0.8, radius=0.5)
    ax.text(25, 91, "https://servicehub.sharp-electronics.id/login", fontsize=8, color="#94A3B8", va="center")

    # Centered modern card
    draw_card(ax, 30, 16, 40, 66, bg="#FFFFFF", border="#E2E8F0", lw=1.2, radius=1.2)

    # Top brand bar Sharp red
    ax.add_patch(Rectangle((30, 80), 40, 2, facecolor="#E11D48", edgecolor="#E11D48"))

    # Sharp Brand Header
    draw_badge(ax, 43, 73.5, 14, 4.5, "SHARP", bg="#E11D48", border="#E11D48", text_color="white", fontsize=8.5)
    ax.text(50, 69.5, "ServiceHub Portal", ha="center", fontsize=11, fontweight="bold", color="#0F2A4A")
    ax.text(50, 66.5, "Pusat Layanan Servis Aquos Platinum", ha="center", fontsize=7.5, color="#64748B")

    # Email
    ax.text(34, 60, "Alamat Email", fontsize=7.8, color="#334155", fontweight="bold")
    draw_card(ax, 34, 53.5, 32, 5.2, bg="#F8FAFC", border="#CBD5E1", lw=1, radius=0.4)
    ax.text(36, 56, "admin@sharp-service.co.id", fontsize=7.8, color="#0F172A")

    # Password
    ax.text(34, 48, "Kata Sandi", fontsize=7.8, color="#334155", fontweight="bold")
    draw_card(ax, 34, 41.5, 32, 5.2, bg="#F8FAFC", border="#CBD5E1", lw=1, radius=0.4)
    ax.text(36, 44, "••••••••••••", fontsize=8.5, color="#0F172A")
    ax.text(63, 44, "[eye]", fontsize=7, color="#94A3B8")

    # Checkbox
    draw_card(ax, 34, 35, 2.5, 2.5, bg="#0284C7", border="#0284C7", lw=1, radius=0.2)
    ax.text(35.2, 36.2, "[V]", color="white", fontsize=6.5, ha="center", va="center")
    ax.text(38, 36.2, "Ingat saya", fontsize=7.5, color="#475569")
    ax.text(66, 36.2, "Lupa sandi?", fontsize=7.5, color="#0284C7", ha="right")

    # Login Button
    draw_card(ax, 34, 25, 32, 6.5, bg="#0F2A4A", border="#0F2A4A", lw=1, radius=0.5)
    ax.text(50, 28.2, "Masuk ke Sistem", ha="center", va="center", fontsize=8.5, color="white", fontweight="bold")

    # Footer note
    ax.text(50, 20, "PT. Sharp Electronics Indonesia © 2026", ha="center", fontsize=6.8, color="#94A3B8")

    save_fig(fig, "ui_login.png")

# =============================================================================
# 7. UI IMPLEMENTASI DASHBOARD (GAMBAR 3.18)
# =============================================================================
def generate_ui_dashboard():
    fig, ax = plt.subplots(figsize=(10.5, 6.8), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#F1F5F9")

    # Window
    draw_card(ax, 1, 1, 98, 98, bg="#F8FAFC", border="#CBD5E1", lw=1, radius=1.0)
    # Header bar
    ax.add_patch(Rectangle((1, 91), 98, 8, facecolor="#0F2A4A", edgecolor="#0F2A4A"))
    draw_badge(ax, 3, 93, 11, 4, "SHARP", bg="#E11D48", border="#E11D48", text_color="white", fontsize=8)
    ax.text(16, 95, "ServiceHub | Mainwork Service Center", fontsize=9.5, color="white", fontweight="bold", va="center")
    ax.text(82, 95, "Admin: Budi Pratama | Pulogadung", fontsize=8, color="#93C5FD", va="center")

    # Sidebar
    draw_card(ax, 3, 3, 17, 86, bg="#FFFFFF", border="#E2E8F0", lw=1, radius=0.5)
    draw_badge(ax, 5, 81, 13, 4.5, "Dashboard", bg="#0284C7", border="#0284C7", text_color="white", fontsize=7.5)
    ax.text(7, 75, "Tiket Servis", fontsize=7.5, color="#475569")
    ax.text(7, 69, "Kelola Pengguna", fontsize=7.5, color="#475569")
    ax.text(7, 63, "Laporan Excel", fontsize=7.5, color="#475569")
    ax.text(7, 57, "Pengaturan", fontsize=7.5, color="#475569")

    # 4 Metric Cards
    m_data = [
        ("Total Tiket", "48", "#EFF6FF", "#1E40AF", "Semua SPK Masuk"),
        ("Pending", "12", "#FEF3C7", "#B45309", "Menunggu Teknisi"),
        ("In Progress", "18", "#E0F2FE", "#0369A1", "Dalam Pengerjaan"),
        ("Completed", "18", "#DCFCE7", "#15803D", "Selesai Diservis")
    ]
    for idx, (title, val, bg, col, desc) in enumerate(m_data):
        x = 22 + idx * 19
        draw_card(ax, x, 75, 17.5, 13, bg=bg, border=col, lw=1, radius=0.6)
        ax.text(x + 2, 84.5, title, fontsize=8, color="#475569")
        ax.text(x + 2, 79.5, val, fontsize=13, color=col, fontweight="bold")
        ax.text(x + 2, 76.5, desc, fontsize=6.5, color="#64748B")

    # Toolbar
    draw_card(ax, 22, 67, 26, 5.5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.4)
    ax.text(24, 69.8, " Cari Nomor SPK atau Nama...", fontsize=7.5, color="#94A3B8")

    draw_card(ax, 50, 67, 14, 5.5, bg="#E11D48", border="#E11D48", lw=1, radius=0.4)
    ax.text(57, 69.8, " Scan SPK AI", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    draw_card(ax, 65.5, 67, 15, 5.5, bg="#0284C7", border="#0284C7", lw=1, radius=0.4)
    ax.text(73, 69.8, "+ Tambah Manual", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    draw_card(ax, 82, 67, 15, 5.5, bg="#10B981", border="#10B981", lw=1, radius=0.4)
    ax.text(89.5, 69.8, " Ekspor (.xlsx)", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    # Table
    draw_card(ax, 22, 5, 75, 59, bg="#FFFFFF", border="#E2E8F0", lw=1, radius=0.6)
    # Header
    ax.add_patch(Rectangle((22, 58), 75, 6, facecolor="#F8FAFC", edgecolor="#E2E8F0"))
    th = [(24, "No. Notifikasi SPK"), (38, "Nama Konsumen"), (52, "Model Unit"), (65, "Status"), (76, "Tenggat Waktu"), (88, "Aksi")]
    for tx, tt in th:
        ax.text(tx, 61, tt, fontsize=7.5, color="#0F172A", fontweight="bold")

    # Rows
    rows = [
        ("2410080012", "Hendra Gunawan", "AH-XP10UHY", "in_progress", "09/10/2026", "#0284C7", "#E0F2FE", "#0369A1"),
        ("2410080013", "Siti Rahmawati", "2T-C42BD1I", "pending", "10/10/2026", "#D97706", "#FEF3C7", "#B45309"),
        ("2410080014", "Budi Santoso", "SJ-X165MG", "completed", "08/10/2026", "#16A34A", "#DCFCE7", "#15803D"),
        ("2410080015", "Dewi Lestari", "ES-FL1082", "in_progress", "11/10/2026", "#0284C7", "#E0F2FE", "#0369A1"),
        ("2410080016", "Agus Wijaya", "AH-A5SAY", "pending", "12/10/2026", "#D97706", "#FEF3C7", "#B45309")
    ]
    for r_idx, r in enumerate(rows):
        ry = 50 - r_idx * 9
        ax.plot([22, 97], [ry+7, ry+7], color="#F1F5F9", lw=1)
        ax.text(24, ry+2.5, r[0], fontsize=7.5, color="#0284C7", fontweight="bold")
        ax.text(38, ry+2.5, r[1], fontsize=7.5, color="#1E293B")
        ax.text(52, ry+2.5, r[2], fontsize=7.5, color="#334155")
        draw_badge(ax, 64, ry+0.8, 10, 4, r[3].replace("_", " ").upper(), bg=r[6], border=r[5], text_color=r[7], fontsize=6)
        ax.text(76, ry+2.5, r[4], fontsize=7.2, color="#64748B")
        ax.text(88, ry+2.5, "[Lihat] [Edit]", fontsize=7, color="#0284C7")

    save_fig(fig, "ui_dashboard.png")

# =============================================================================
# 8. UI IMPLEMENTASI MODAL SCANNER AI VLM (GAMBAR 3.19)
# =============================================================================
def generate_ui_modal_scanner():
    fig, ax = plt.subplots(figsize=(8.5, 6.8), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#CBD5E1")

    # Modal window
    draw_card(ax, 8, 3, 84, 94, bg="#FFFFFF", border="#94A3B8", lw=1.5, radius=1.0)

    # Modal Header
    ax.add_patch(Rectangle((8, 89), 84, 8, facecolor="#0F2A4A", edgecolor="#0F2A4A"))
    ax.text(12, 93, " Pemindai Formulir SPK Sharp - Google Gemini 1.5 Flash VLM", fontsize=8.8, color="white", fontweight="bold", va="center")
    ax.text(88, 93, "[X]", fontsize=9, color="white", va="center")

    # Uploaded image thumbnail preview
    draw_card(ax, 12, 63, 76, 23, bg="#F0FDF4", border="#16A34A", lw=1.2, radius=0.6)
    draw_badge(ax, 14, 78, 20, 5, "[V] AI EKSTRAKSI SUKSES", bg="#DCFCE7", border="#16A34A", text_color="#15803D", fontsize=7)
    ax.text(36, 80.5, "Berkas SPK: spk_sharp_2410080012.jpg (3.2 MB) | Durasi: 2.1 detik", fontsize=7.2, color="#166534")

    # Simulated document visual snippet
    draw_card(ax, 14, 65, 72, 11, bg="#FFFFFF", border="#CBD5E1", lw=0.8, radius=0.3)
    ax.text(16, 72, "SHARP SERVICE WORK ORDER (SPK) #2410080012", fontsize=7.5, color="#E11D48", fontweight="bold")
    ax.text(16, 68.5, "Customer: Hendra Gunawan | Phone: 081234567890 | Unit: AC Inverter AH-XP10UHY", fontsize=7, color="#334155")
    ax.text(16, 66, "Complaint: Unit tidak dingin, hembusan angin lemah, indikator timer kedip", fontsize=6.8, color="#64748B")

    # Form Fields Grid (Auto-filled by AI)
    ax.text(12, 59, "Hasil Ekstraksi Entitas Data (Silakan periksa dan koreksi bila perlu):", fontsize=8, color="#0F2A4A", fontweight="bold")

    # Left
    ax.text(12, 54, "Nomor Notifikasi SPK *", fontsize=7.2, color="#475569")
    draw_card(ax, 12, 48.5, 36, 5, bg="#F8FAFC", border="#10B981", lw=1, radius=0.3)
    ax.text(14, 51, "2410080012", fontsize=7.5, color="#0F172A", fontweight="bold")

    ax.text(12, 44, "Nama Konsumen *", fontsize=7.2, color="#475569")
    draw_card(ax, 12, 38.5, 36, 5, bg="#F8FAFC", border="#10B981", lw=1, radius=0.3)
    ax.text(14, 41, "Hendra Gunawan", fontsize=7.5, color="#0F172A")

    ax.text(12, 34, "Model Unit *", fontsize=7.2, color="#475569")
    draw_card(ax, 12, 28.5, 36, 5, bg="#F8FAFC", border="#10B981", lw=1, radius=0.3)
    ax.text(14, 31, "AH-XP10UHY", fontsize=7.5, color="#0F172A")

    # Right
    ax.text(52, 54, "Nomor Telepon / HP *", fontsize=7.2, color="#475569")
    draw_card(ax, 52, 48.5, 36, 5, bg="#F8FAFC", border="#10B981", lw=1, radius=0.3)
    ax.text(54, 51, "081234567890", fontsize=7.5, color="#0F172A")

    ax.text(52, 44, "Nomor Seri Unit (Serial Number)", fontsize=7.2, color="#475569")
    draw_card(ax, 52, 38.5, 36, 5, bg="#F8FAFC", border="#10B981", lw=1, radius=0.3)
    ax.text(54, 41, "SH89201124", fontsize=7.5, color="#0F172A")

    ax.text(52, 34, "Status Garansi (Warranty)", fontsize=7.2, color="#475569")
    draw_card(ax, 52, 28.5, 36, 5, bg="#F8FAFC", border="#10B981", lw=1, radius=0.3)
    ax.text(54, 31, "Garansi Resmi Sharp (1 Tahun)", fontsize=7.5, color="#0F172A")

    # Full Width Complaint
    ax.text(12, 24, "Keluhan Konsumen", fontsize=7.2, color="#475569")
    draw_card(ax, 12, 17, 76, 5.5, bg="#F8FAFC", border="#10B981", lw=1, radius=0.3)
    ax.text(14, 19.8, "Unit tidak dingin, hembusan angin lemah, indikator timer berkedip merah", fontsize=7.2, color="#0F172A")

    # Buttons
    draw_card(ax, 52, 8, 16, 6, bg="#F1F5F9", border="#CBD5E1", lw=1, radius=0.4)
    ax.text(60, 11, "Batal", ha="center", va="center", fontsize=7.8, color="#475569")

    draw_card(ax, 70, 8, 18, 6, bg="#10B981", border="#10B981", lw=1, radius=0.4)
    ax.text(79, 11, "[V] Simpan Tiket", ha="center", va="center", fontsize=8, color="white", fontweight="bold")

    save_fig(fig, "ui_modal_scanner.png")

# =============================================================================
# 9. UI IMPLEMENTASI FORM MANUAL (GAMBAR 3.20)
# =============================================================================
def generate_ui_form_manual():
    fig, ax = plt.subplots(figsize=(8.5, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")

    draw_card(ax, 8, 4, 84, 92, bg="#FFFFFF", border="#CBD5E1", lw=1.2, radius=1.0)
    ax.add_patch(Rectangle((8, 88), 84, 8, facecolor="#0F2A4A", edgecolor="#0F2A4A"))
    ax.text(12, 92, "Formulir Entri Tiket Servis Baru (Input Manual)", fontsize=9.5, color="white", fontweight="bold", va="center")

    # Section 1
    ax.text(12, 83, "1. INFORMASI PELANGGAN", fontsize=8, color="#0284C7", fontweight="bold")
    ax.text(12, 77.5, "Nomor SPK *", fontsize=7, color="#475569")
    draw_card(ax, 12, 72, 38, 4.8, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(14, 74.5, "2410080017", fontsize=7.5, color="#0F172A")

    ax.text(54, 77.5, "Nama Lengkap Konsumen *", fontsize=7, color="#475569")
    draw_card(ax, 54, 72, 34, 4.8, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(56, 74.5, "Ibu Ratna Dewi", fontsize=7.5, color="#0F172A")

    ax.text(12, 67, "Nomor Telepon / WhatsApp *", fontsize=7, color="#475569")
    draw_card(ax, 12, 61.5, 38, 4.8, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(14, 64, "081987654321", fontsize=7.5, color="#0F172A")

    ax.text(54, 67, "Alamat Lengkap Domisili *", fontsize=7, color="#475569")
    draw_card(ax, 54, 61.5, 34, 4.8, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(56, 64, "Komplek Billy Moon Blok M No. 8, Duren Sawit", fontsize=7, color="#0F172A")

    # Section 2
    ax.text(12, 55, "2. INFORMASI PERANGKAT SHARP", fontsize=8, color="#0284C7", fontweight="bold")
    ax.text(12, 49.5, "Jenis Perangkat *", fontsize=7, color="#475569")
    draw_card(ax, 12, 44, 38, 4.8, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(14, 46.5, "Kulkas (Refrigerator)", fontsize=7.5, color="#0F172A")

    ax.text(54, 49.5, "Model Unit *", fontsize=7, color="#475569")
    draw_card(ax, 54, 44, 34, 4.8, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(56, 46.5, "SJ-X165MG", fontsize=7.5, color="#0F172A")

    # Section 3
    ax.text(12, 37.5, "3. DETAIL KELUHAN & JADWAL LAYANAN", fontsize=8, color="#0284C7", fontweight="bold")
    ax.text(12, 32, "Keluhan Konsumen", fontsize=7, color="#475569")
    draw_card(ax, 12, 23.5, 38, 7.5, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(14, 28, "Kompresor tidak hidup, lampu dalam mati", fontsize=7.2, color="#0F172A")

    ax.text(54, 32, "Tenggat Waktu Servis (Deadline)", fontsize=7, color="#475569")
    draw_card(ax, 54, 26, 34, 4.8, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(56, 28.5, "12/10/2026 (3 Hari Kerja)", fontsize=7.2, color="#0F172A")

    # Actions
    draw_card(ax, 52, 10, 16, 6, bg="#F1F5F9", border="#CBD5E1", lw=1, radius=0.4)
    ax.text(60, 13, "Batal", ha="center", va="center", fontsize=7.8, color="#475569")

    draw_card(ax, 70, 10, 18, 6, bg="#0284C7", border="#0284C7", lw=1, radius=0.4)
    ax.text(79, 13, "+ Simpan Tiket", ha="center", va="center", fontsize=8, color="white", fontweight="bold")

    save_fig(fig, "ui_form_manual.png")

# =============================================================================
# 10. UI IMPLEMENTASI MOBILE PWA TEKNISI (GAMBAR 3.21)
# =============================================================================
def generate_ui_mobile_pwa():
    fig, ax = plt.subplots(figsize=(5, 8.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")

    # Smartphone shell
    draw_card(ax, 6, 2, 88, 96, bg="#FFFFFF", border="#0F172A", lw=2, radius=3.0)
    # Speaker notch
    draw_card(ax, 40, 95.2, 20, 1.2, bg="#0F172A", border="#0F172A", lw=1, radius=0.4)

    # Top PWA App Bar
    ax.add_patch(Rectangle((6, 88), 88, 6.5, facecolor="#0F2A4A", edgecolor="#0F2A4A"))
    draw_badge(ax, 8, 89.2, 9, 3.8, "SHARP", bg="#E11D48", border="#E11D48", text_color="white", fontsize=6)
    ax.text(19, 91.2, "ServiceHub PWA", fontsize=8.5, color="white", fontweight="bold", va="center")
    ax.text(82, 91.2, "Teknisi: Ahmad", fontsize=6.8, color="#93C5FD", va="center")

    # Active Ticket Banner
    draw_card(ax, 10, 74, 80, 12.5, bg="#F0FDF4", border="#16A34A", lw=1, radius=0.5)
    ax.text(13, 83, "Tiket SPK #2410080012", fontsize=7.8, color="#0284C7", fontweight="bold")
    draw_badge(ax, 68, 81.5, 18, 3.5, "IN PROGRESS", bg="#E0F2FE", border="#0284C7", text_color="#0369A1", fontsize=6)
    ax.text(13, 79, "Hendra Gunawan | 081234567890", fontsize=7, color="#1E293B")
    ax.text(13, 76, "Jl. Pulo Gadung No. 45, Jakarta Timur (AC Inverter)", fontsize=6.5, color="#64748B")

    # Diagnosis Field
    ax.text(10, 70, "Catatan Diagnosis Teknis:", fontsize=7.2, color="#0F172A", fontweight="bold")
    draw_card(ax, 10, 62, 80, 7, bg="#FFFFFF", border="#CBD5E1", lw=1, radius=0.3)
    ax.text(12, 65.5, "Sensor thermistor putus, freon berkurang ke 80 psi.", fontsize=6.8, color="#334155")

    # Multi-select work_types
    ax.text(10, 58, "Tindakan Pekerjaan (work_types JSON):", fontsize=7.2, color="#0F172A", fontweight="bold")
    draw_card(ax, 10, 46, 80, 11, bg="#F8FAFC", border="#E2E8F0", lw=1, radius=0.4)

    # Checked 1
    draw_badge(ax, 12, 52.5, 36, 3.5, "[V] Ganti Modul Sensor", bg="#DCFCE7", border="#16A34A", text_color="#15803D", fontsize=6)
    # Checked 2
    draw_badge(ax, 52, 52.5, 36, 3.5, "[V] Isi Ulang Freon R32", bg="#DCFCE7", border="#16A34A", text_color="#15803D", fontsize=6)
    # Unchecked 3
    draw_badge(ax, 12, 47.5, 36, 3.5, "+ Cuci / Steam AC", bg="#FFFFFF", border="#CBD5E1", text_color="#64748B", fontsize=6)
    # Unchecked 4
    draw_badge(ax, 52, 47.5, 36, 3.5, "+ Penggantian Motor Fan", bg="#FFFFFF", border="#CBD5E1", text_color="#64748B", fontsize=6)

    # Photos Section with Canvas Compressor labels
    ax.text(10, 42, "Foto Bukti Servis (Kompresi Otomatis Canvas):", fontsize=7.2, color="#0F172A", fontweight="bold")

    # Visit photo box
    draw_card(ax, 10, 24, 38, 17, bg="#F1F5F9", border="#10B981", lw=1, radius=0.4)
    ax.text(29, 34, " FOTO KUNJUNGAN", ha="center", fontsize=6.5, color="#0F172A", fontweight="bold")
    ax.text(29, 30.5, "Ukuran: 318 KB", ha="center", fontsize=6.2, color="#15803D", fontweight="bold")
    ax.text(29, 27.5, "(Reduksi 93.4% dari 4.8 MB)", ha="center", fontsize=5.5, color="#64748B")
    draw_badge(ax, 16, 24.5, 26, 2.8, "GANTI FOTO", bg="#FFFFFF", border="#CBD5E1", text_color="#475569", fontsize=5.5)

    # Completion photo box
    draw_card(ax, 52, 24, 38, 17, bg="#F1F5F9", border="#10B981", lw=1, radius=0.4)
    ax.text(71, 34, " FOTO SELESAI", ha="center", fontsize=6.5, color="#0F172A", fontweight="bold")
    ax.text(71, 30.5, "Ukuran: 342 KB", ha="center", fontsize=6.2, color="#15803D", fontweight="bold")
    ax.text(71, 27.5, "(Reduksi 93.5% dari 5.2 MB)", ha="center", fontsize=5.5, color="#64748B")
    draw_badge(ax, 58, 24.5, 26, 2.8, "GANTI FOTO", bg="#FFFFFF", border="#CBD5E1", text_color="#475569", fontsize=5.5)

    # Submit Button
    draw_card(ax, 10, 14, 80, 7.5, bg="#16A34A", border="#16A34A", lw=1, radius=0.5)
    ax.text(50, 17.8, "[V] KIRIM LAPORAN SERVIS (SELESAI)", ha="center", va="center", fontsize=7.5, color="white", fontweight="bold")

    # Bottom home indicator
    draw_card(ax, 38, 4, 24, 1.2, bg="#64748B", border="#64748B", lw=1, radius=0.4)

    save_fig(fig, "ui_mobile_pwa.png")

if __name__ == "__main__":
    generate_wireframe_login()
    generate_wireframe_dashboard()
    generate_wireframe_modal_scanner()
    generate_wireframe_form_manual()
    generate_wireframe_mobile_pwa()

    generate_ui_login()
    generate_ui_dashboard()
    generate_ui_modal_scanner()
    generate_ui_form_manual()
    generate_ui_mobile_pwa()

    print("ALL 10 WIREFRAME & UI IMAGES GENERATED AT 300 DPI!")
