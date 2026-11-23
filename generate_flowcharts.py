import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Polygon

# Ensure output directories
out_dir = r"c:\Users\An\Herd\servicehub"
art_dir = r"C:\Users\An\.gemini\antigravity\brain\f58e67fa-53d0-4905-b0e9-27b48316309f"
os.makedirs(art_dir, exist_ok=True)

# Set global styles
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS FOR FLOWCHART SHAPES
# -----------------------------------------------------------------------------
def draw_terminal(ax, x, y, w, h, text, color="#0F2A4A", text_color="white", fontsize=9):
    """Draws a stadium / rounded terminal box."""
    box = FancyBboxPatch(
        (x - w/2, y - h/2), w, h,
        boxstyle="round,pad=0.05,rounding_size=0.35",
        facecolor=color, edgecolor="#0F172A", linewidth=1.5, zorder=3
    )
    ax.add_patch(box)
    ax.text(x, y, text, ha="center", va="center", color=text_color,
            fontsize=fontsize, fontweight="bold", zorder=4)

def draw_process(ax, x, y, w, h, text, bg="#EFF6FF", border="#0284C7", text_color="#0F172A", fontsize=8.5, bold=False):
    """Draws a rectangular process box."""
    box = FancyBboxPatch(
        (x - w/2, y - h/2), w, h,
        boxstyle="round,pad=0.02,rounding_size=0.08",
        facecolor=bg, edgecolor=border, linewidth=1.5, zorder=3
    )
    ax.add_patch(box)
    fw = "bold" if bold else "normal"
    ax.text(x, y, text, ha="center", va="center", color=text_color,
            fontsize=fontsize, fontweight=fw, linespacing=1.2, zorder=4)

def draw_decision(ax, x, y, w, h, text, bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8):
    """Draws a diamond decision box."""
    pts = [
        [x, y + h/2],      # top
        [x + w/2, y],      # right
        [x, y - h/2],      # bottom
        [x - w/2, y]       # left
    ]
    poly = Polygon(pts, closed=True, facecolor=bg, edgecolor=border, linewidth=1.6, zorder=3)
    ax.add_patch(poly)
    ax.text(x, y, text, ha="center", va="center", color=text_color,
            fontsize=fontsize, fontweight="bold", linespacing=1.1, zorder=4)

def draw_io(ax, x, y, w, h, text, bg="#F3E8FF", border="#7C3AED", text_color="#4C1D95", fontsize=8.5):
    """Draws a parallelogram input/output box."""
    slant = w * 0.12
    pts = [
        [x - w/2 + slant, y + h/2],  # top-left
        [x + w/2, y + h/2],          # top-right
        [x + w/2 - slant, y - h/2],  # bottom-right
        [x - w/2, y - h/2]           # bottom-left
    ]
    poly = Polygon(pts, closed=True, facecolor=bg, edgecolor=border, linewidth=1.5, zorder=3)
    ax.add_patch(poly)
    ax.text(x, y, text, ha="center", va="center", color=text_color,
            fontsize=fontsize, fontweight="normal", linespacing=1.2, zorder=4)

def draw_arrow(ax, start, end, label=None, label_pos=None, color="#334155", lw=1.5, rad=0.0):
    """Draws an arrow between points."""
    arrowprops = dict(
        arrowstyle="-|>",
        color=color,
        linewidth=lw,
        mutation_scale=12,
        shrinkA=3,
        shrinkB=3,
        connectionstyle=f"arc3,rad={rad}" if rad != 0.0 else "arc3"
    )
    ax.annotate("", xy=end, xytext=start, arrowprops=arrowprops, zorder=2)
    if label and label_pos:
        ax.text(label_pos[0], label_pos[1], label, ha="center", va="center",
                fontsize=7.5, fontweight="bold", color="#B45309" if label in ["Ya", "Admin"] else "#DC2626" if label in ["Tidak", "Gagal"] else "#2563EB",
                bbox=dict(boxstyle="round,pad=0.2", facecolor="white", edgecolor="#E2E8F0", linewidth=0.8),
                zorder=5)

# =============================================================================
# 1. FLOWCHART SISTEM UTAMA SERVICEHUB (GAMBAR 3.9)
# =============================================================================
def generate_main_flowchart():
    fig, ax = plt.subplots(figsize=(11, 16), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("white")

    # Title header block
    ax.text(50, 98.2, "FLOWCHART SISTEM UTAMA SERVICEHUB",
            ha="center", va="center", fontsize=13, fontweight="bold", color="#0F2A4A")
    ax.text(50, 96.6, "Arsitektur Multi-Peran: Admin Service Center & Teknisi Lapangan",
            ha="center", va="center", fontsize=9.5, color="#64748B")

    # Start
    draw_terminal(ax, 50, 93.5, 20, 3.2, "MULAI", color="#0F2A4A")

    # I/O: Akses & Input Kredensial
    draw_io(ax, 50, 87.5, 36, 4.2, "Pengguna Akses /login &\nInput Email & Kata Sandi",
            bg="#F1F5F9", border="#64748B", text_color="#1E293B", fontsize=8.5)
    draw_arrow(ax, (50, 91.9), (50, 89.6))

    # Process: Verifikasi Autentikasi
    draw_process(ax, 50, 81.2, 34, 3.8, "Verifikasi Hash Kredensial\n(Laravel Fortify & Hash::check)",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=8.5)
    draw_arrow(ax, (50, 85.4), (50, 83.1))

    # Decision: Kredensial Valid?
    draw_decision(ax, 50, 73.8, 26, 6.2, "Kredensial\nValid?",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8.5)
    draw_arrow(ax, (50, 79.3), (50, 76.9))

    # Error Loop if Invalid
    # Arrow left then up back to /login
    ax.plot([37, 24, 24, 32], [73.8, 73.8, 87.5, 87.5], color="#DC2626", lw=1.4, zorder=2)
    draw_arrow(ax, (24, 87.5), (32, 87.5), label="Tidak (Pesan Error)", label_pos=(24, 80.5))

    # Decision: Role Pengguna?
    draw_decision(ax, 50, 64.0, 28, 6.0, "Peran Pengguna\n(Role)?",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8.5)
    draw_arrow(ax, (50, 70.7), (50, 67.0), label="Ya", label_pos=(52.5, 68.8))

    # ---------------- ADMIN BRANCH (LEFT: x=25) ----------------
    # Label branch
    ax.plot([36, 25, 25], [64.0, 64.0, 59.5], color="#0284C7", lw=1.5, zorder=2)
    draw_arrow(ax, (25, 60.5), (25, 59.2), label="Role = Admin", label_pos=(30.5, 65.2))

    # Admin: Dashboard
    draw_process(ax, 25, 57.0, 32, 3.8, "Tampilkan Dashboard Admin\n(/dashboard - Ringkasan & Tabel)",
                 bg="#E0F2FE", border="#0284C7", text_color="#0369A1", fontsize=8.5, bold=True)

    # Admin: Menu Pilihan
    draw_decision(ax, 25, 49.5, 26, 6.0, "Pilih Aksi\nOperasional?",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8)
    draw_arrow(ax, (25, 55.1), (25, 52.5))

    # Admin Actions:
    # 1. AI SPK Scanner
    draw_process(ax, 11, 41.5, 18, 4.2, "Ekstraksi SPK via AI\n(VLM Multi-Engine)\n& Simpan Tiket",
                 bg="#F0FDF4", border="#16A34A", text_color="#14532D", fontsize=7.5)
    # 2. Input Manual
    draw_process(ax, 25, 33.5, 22, 3.8, "Entri Tiket Manual\n(Form Tambah Tiket)",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=7.8)
    # 3. Filter & Export
    draw_process(ax, 11, 26.5, 18, 4.0, "Filter, Pencarian &\nExport Excel (.xlsx)",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=7.5)
    # 4. Kelola User
    draw_process(ax, 25, 20.0, 22, 3.8, "Kelola Akun Petugas\n(/users - Admin Only)",
                 bg="#F5F3FF", border="#7C3AED", text_color="#4C1D95", fontsize=7.8)

    # Connect admin decision to actions
    draw_arrow(ax, (18, 48.0), (13, 43.6), label="Scan AI", label_pos=(14.5, 46.5))
    draw_arrow(ax, (25, 46.5), (25, 35.4), label="Manual", label_pos=(27.5, 40.5))
    ax.plot([12, 11, 11], [49.5, 49.5, 28.5], color="#0284C7", lw=1.2, zorder=2)
    draw_arrow(ax, (11, 29.5), (11, 28.5))
    ax.plot([38, 38, 30], [49.5, 20.0, 20.0], color="#7C3AED", lw=1.2, zorder=2)
    draw_arrow(ax, (36, 20.0), (36, 20.0))

    # Database Operation Admin
    draw_process(ax, 25, 13.5, 30, 3.8, "Kueri Basis Data PostgreSQL\n(INSERT / UPDATE / SELECT)",
                 bg="#F1F5F9", border="#475569", text_color="#0F172A", fontsize=8, bold=True)
    draw_arrow(ax, (11, 39.4), (16, 15.4))
    draw_arrow(ax, (25, 31.6), (25, 15.4))
    draw_arrow(ax, (11, 24.5), (18, 15.4))
    draw_arrow(ax, (25, 18.1), (25, 15.4))

    # ---------------- TECHNICIAN BRANCH (RIGHT: x=75) ----------------
    # Label branch
    ax.plot([64, 75, 75], [64.0, 64.0, 59.5], color="#16A34A", lw=1.5, zorder=2)
    draw_arrow(ax, (75, 60.5), (75, 59.2), label="Role = Teknisi", label_pos=(69.5, 65.2))

    # Technician: PWA Mobile Interface
    draw_process(ax, 75, 57.0, 32, 3.8, "Tampilkan Antarmuka PWA Mobile\n(Daftar Tiket Lapangan)",
                 bg="#DCFCE7", border="#16A34A", text_color="#14532D", fontsize=8.5, bold=True)

    # Technician: Buka Detail
    draw_process(ax, 75, 49.5, 30, 3.8, "Pilih & Buka Rincian Tiket Servis\n(Periksa Lokasi & Keluhan Unit)",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=8.2)
    draw_arrow(ax, (75, 55.1), (75, 51.4))

    # Technician: Update Status Pengerjaan
    draw_process(ax, 75, 42.5, 32, 3.8, "Perbarui Status: In Progress\n(Unit Mulai Ditangani)",
                 bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8.2)
    draw_arrow(ax, (75, 47.6), (75, 44.4))

    # Technician: Pelaporan & Kompresi Foto
    draw_process(ax, 75, 34.5, 32, 4.8, "Input Diagnosis & Tindakan,\nAmbil Foto Bukti Servis &\nKompresi Citra HTML5 Canvas",
                 bg="#F0FDF4", border="#16A34A", text_color="#14532D", fontsize=8, bold=True)
    draw_arrow(ax, (75, 40.6), (75, 36.9))

    # Technician: Submit Selesai
    draw_process(ax, 75, 25.5, 32, 4.0, "Kirim Laporan Servis (PUT /tickets)\n& Finalisasi Status Completed",
                 bg="#DCFCE7", border="#16A34A", text_color="#14532D", fontsize=8.2)
    draw_arrow(ax, (75, 32.1), (75, 27.5))

    # Connect Technician to DB
    ax.plot([75, 75, 41], [23.5, 13.5, 13.5], color="#475569", lw=1.4, zorder=2)
    draw_arrow(ax, (43, 13.5), (40, 13.5))

    # ---------------- LOGOUT & END ----------------
    # Decision: Ingin Keluar?
    draw_decision(ax, 50, 7.5, 22, 5.0, "Pengguna\nLogout?",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8)
    draw_arrow(ax, (25, 11.6), (42, 8.5))
    draw_arrow(ax, (65, 13.5), (58, 8.5))

    # Terminal: Selesai
    draw_terminal(ax, 50, 2.0, 20, 2.8, "SELESAI", color="#0F2A4A")
    draw_arrow(ax, (50, 5.0), (50, 3.4), label="Ya", label_pos=(52.5, 4.2))

    # Loop back if not logout
    ax.plot([61, 95, 95, 50], [7.5, 7.5, 57.0, 57.0], color="#94A3B8", lw=1.2, ls="--", zorder=2)
    draw_arrow(ax, (95, 57.0), (91, 57.0), label="Tidak", label_pos=(95, 30.0))

    # Save outputs
    plt.tight_layout()
    f1 = os.path.join(out_dir, "flowchart_sistem_utama_clean.png")
    f1_art = os.path.join(art_dir, "flowchart_sistem_utama_clean.png")
    fig.savefig(f1, dpi=300, bbox_inches="tight")
    fig.savefig(f1_art, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Flowchart 1 generated successfully:", f1)

# =============================================================================
# 2. FLOWCHART EKSTRAKSI DOKUMEN AI VLM (GAMBAR 3.10)
# =============================================================================
def generate_vlm_flowchart():
    fig, ax = plt.subplots(figsize=(10, 15), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("white")

    # Header
    ax.text(50, 98.2, "FLOWCHART PIPELINE EKSTRAKSI DOKUMEN AI VLM",
            ha="center", va="center", fontsize=12.5, fontweight="bold", color="#0F2A4A")
    ax.text(50, 96.6, "Arsitektur Vision-Language Model Multi-Engine (Groq Qwen 3.8 / Gemini)",
            ha="center", va="center", fontsize=9.5, color="#64748B")

    # Start
    draw_terminal(ax, 50, 93.5, 20, 3.2, "MULAI", color="#0F2A4A")

    # IO: Upload / Tangkap Berkas SPK
    draw_io(ax, 50, 87.2, 40, 4.4, "Admin Klik 'Scan SPK' &\nPilih / Tangkap Berkas Foto SPK",
            bg="#F3E8FF", border="#7C3AED", text_color="#4C1D95", fontsize=8.5)
    draw_arrow(ax, (50, 91.9), (50, 89.4))

    # Decision: Validasi Berkas
    draw_decision(ax, 50, 79.5, 28, 5.8, "Ekstensi Citra &\nUkuran <= 10 MB?",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8)
    draw_arrow(ax, (50, 85.0), (50, 82.4))

    # Reject Loop
    ax.plot([36, 22, 22, 30], [79.5, 79.5, 87.2, 87.2], color="#DC2626", lw=1.3, zorder=2)
    draw_arrow(ax, (22, 87.2), (30, 87.2), label="Tidak (Validasi Gagal)", label_pos=(22, 83.5))

    # Process: Encode Base64
    draw_process(ax, 50, 71.5, 42, 3.8, "Baca File Stream & Konversi Citra ke Base64\n($base64Image = base64_encode($file->get()))",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=8)
    draw_arrow(ax, (50, 76.6), (50, 73.4), label="Ya", label_pos=(52.5, 75.0))

    # Process: Siapkan Payload & Prompt
    draw_process(ax, 50, 64.2, 42, 4.4, "Siapkan Structured System Prompt Sharp &\nParameter Skema JSON (DTO ParsedDocumentData)",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=8)
    draw_arrow(ax, (50, 69.6), (50, 66.4))

    # Process: HTTP Request ke Provider
    draw_process(ax, 50, 56.5, 42, 4.6, "Kirim Permintaan POST ke VLM Provider (Groq / Gemini)\n(Provider Default: Groq Qwen 3.8 | Fallback: Gemini)\nPayload: Inline Image Data (Base64) + Structured Prompt",
                 bg="#F0FDF4", border="#16A34A", text_color="#14532D", fontsize=7.6, bold=True)
    draw_arrow(ax, (50, 62.0), (50, 58.8))

    # Decision: HTTP 200 & Response Valid?
    draw_decision(ax, 50, 47.5, 28, 6.0, "Status HTTP 200 &\nJSON Valid?",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8)
    draw_arrow(ax, (50, 54.2), (50, 50.5))

    # Error Fallback (Right side)
    draw_process(ax, 82, 47.5, 24, 4.5, "Tangkap Exception &\nLog Kesalahan (Timeout/Key)\nFallback ke Form Kosong",
                 bg="#FEE2E2", border="#EF4444", text_color="#991B1B", fontsize=7.5)
    draw_arrow(ax, (64, 47.5), (70, 47.5), label="Tidak", label_pos=(66.5, 48.8))

    # Process: Parse JSON ke DTO
    draw_process(ax, 50, 39.0, 42, 4.2, "Parsing JSON String ke DTO Objek\nEkstrak: notif_number, customer_name, phone,\naddress, model_unit, serial_number, keluhan",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=7.8)
    draw_arrow(ax, (50, 44.5), (50, 41.1), label="Ya", label_pos=(52.5, 42.8))

    # IO: Auto-Fill Form & Review
    draw_io(ax, 50, 30.5, 44, 4.6, "Auto-fill Bidang Input Modal Scanner &\nPratinjau Data (Human-in-the-Loop Review)",
            bg="#F3E8FF", border="#7C3AED", text_color="#4C1D95", fontsize=8.2)
    draw_arrow(ax, (50, 36.9), (50, 32.8))
    # Fallback joins here
    ax.plot([82, 82, 72], [45.2, 30.5, 30.5], color="#EF4444", lw=1.2, ls="--", zorder=2)
    draw_arrow(ax, (74, 30.5), (72, 30.5))

    # Decision: Admin Simpan Tiket?
    draw_decision(ax, 50, 21.5, 28, 5.8, "Admin Menyetujui\n& Simpan Tiket?",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8)
    draw_arrow(ax, (50, 28.2), (50, 24.4))

    # Cancel branch
    ax.plot([36, 20, 20], [21.5, 21.5, 9.0], color="#64748B", lw=1.2, zorder=2)
    draw_arrow(ax, (20, 9.0), (40, 9.0), label="Batal", label_pos=(20, 15.0))

    # Process: Simpan ke PostgreSQL
    draw_process(ax, 50, 13.5, 42, 3.8, "Eksekusi POST /tickets ke Controller &\nINSERT Rekaman Baru ke Tabel service_tickets",
                 bg="#DCFCE7", border="#16A34A", text_color="#14532D", fontsize=8, bold=True)
    draw_arrow(ax, (50, 18.6), (50, 15.4), label="Ya", label_pos=(52.5, 17.0))

    # Output: Notifikasi Sukses
    draw_io(ax, 50, 7.5, 36, 3.5, "Tampilkan Toast Sukses &\nRefresh Daftar Tiket Dashboard",
            bg="#F1F5F9", border="#64748B", text_color="#0F172A", fontsize=8)
    draw_arrow(ax, (50, 11.6), (50, 9.25))

    # End
    draw_terminal(ax, 50, 2.0, 20, 2.8, "SELESAI", color="#0F2A4A")
    draw_arrow(ax, (50, 5.75), (50, 3.4))

    # Save
    plt.tight_layout()
    f2 = os.path.join(out_dir, "flowchart_ekstraksi_vlm_clean.png")
    f2_art = os.path.join(art_dir, "flowchart_ekstraksi_vlm_clean.png")
    fig.savefig(f2, dpi=300, bbox_inches="tight")
    fig.savefig(f2_art, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Flowchart 2 generated successfully:", f2)

# =============================================================================
# 3. FLOWCHART KOMPRESI CITRA CANVAS (GAMBAR 3.11)
# =============================================================================
def generate_canvas_flowchart():
    fig, ax = plt.subplots(figsize=(10, 16), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    fig.patch.set_facecolor("white")

    # Header
    ax.text(50, 98.2, "FLOWCHART KOMPRESI CITRA KLIEN HTML5 CANVAS",
            ha="center", va="center", fontsize=12.5, fontweight="bold", color="#0F2A4A")
    ax.text(50, 96.6, "Algoritma Client-Side Resampling & JPEG Compression (PWA Mobile)",
            ha="center", va="center", fontsize=9.5, color="#64748B")

    # Start
    draw_terminal(ax, 50, 93.5, 20, 3.2, "MULAI", color="#0F2A4A")

    # IO: Input file
    draw_io(ax, 50, 87.2, 42, 4.4, "Teknisi Memilih / Menangkap Foto via Kamera PWA\n(Menerima Objek File Asli)",
            bg="#F3E8FF", border="#7C3AED", text_color="#4C1D95", fontsize=8.5)
    draw_arrow(ax, (50, 91.9), (50, 89.4))

    # Decision: Validasi Tipe Citra
    draw_decision(ax, 50, 79.5, 28, 5.8, "Tipe MIME Citra?\n(file.type image/*)",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=8)
    draw_arrow(ax, (50, 85.0), (50, 82.4))

    # Bypass if not image
    ax.plot([64, 86, 86], [79.5, 79.5, 12.0], color="#94A3B8", lw=1.3, ls="--", zorder=2)
    draw_arrow(ax, (86, 12.0), (68, 12.0), label="Bukan Citra (Return File Asli)", label_pos=(86, 45.0))

    # Process: Load to Image
    draw_process(ax, 50, 71.5, 42, 4.0, "Buat Object URL via URL.createObjectURL(file) &\nMuat Citra ke Objek new Image()",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=8)
    draw_arrow(ax, (50, 76.6), (50, 73.5), label="Ya", label_pos=(52.5, 75.0))

    # Process: Tunggu Onload & Baca Dimensi
    draw_process(ax, 50, 64.0, 42, 4.2, "Event img.onload Terpicu:\nBaca Lebar (width) & Tinggi (height) Asli;\nRevoke URL via URL.revokeObjectURL()",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=8)
    draw_arrow(ax, (50, 69.5), (50, 66.1))

    # Decision: Melebihi Batas Dimensi?
    draw_decision(ax, 50, 55.5, 30, 6.2, "Dimensi > Batas Maks?\n(width > 1600 ATAU\nheight > 1600)",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=7.8)
    draw_arrow(ax, (50, 61.9), (50, 58.6))

    # Decision: Hitung Rasio Aspek
    draw_decision(ax, 32, 45.0, 24, 6.0, "Rasio Aspek:\n(W/H > 1600/1600)?",
                  bg="#FEF3C7", border="#D97706", text_color="#78350F", fontsize=7.5)
    draw_arrow(ax, (35, 55.5), (32, 48.0), label="Ya (Perlu Scaling)", label_pos=(30.5, 52.0))

    # Scaling Formula 1 (Landscape / W > H)
    draw_process(ax, 16, 36.5, 26, 4.4, "Koreksi Skala Landscape:\nheight = round((H * 1600) / W)\nwidth = 1600",
                 bg="#F0FDF4", border="#16A34A", text_color="#14532D", fontsize=7.5)
    draw_arrow(ax, (20, 45.0), (16, 38.7), label="Ya", label_pos=(16.5, 43.0))

    # Scaling Formula 2 (Portrait / H >= W)
    draw_process(ax, 44, 36.5, 26, 4.4, "Koreksi Skala Portrait:\nwidth = round((W * 1600) / H)\nheight = 1600",
                 bg="#F0FDF4", border="#16A34A", text_color="#14532D", fontsize=7.5)
    draw_arrow(ax, (44, 45.0), (44, 38.7), label="Tidak", label_pos=(44.5, 42.5))

    # No scale needed branch (Right: x=72)
    draw_process(ax, 72, 45.0, 22, 3.8, "Pertahankan Dimensi Asli:\nwidth = width, height = height",
                 bg="#F1F5F9", border="#64748B", text_color="#334155", fontsize=7.5)
    draw_arrow(ax, (65, 55.5), (72, 46.9), label="Tidak (<=1600px)", label_pos=(71.0, 52.0))

    # Process: Canvas Creation & Rendering
    draw_process(ax, 50, 26.5, 46, 4.8, "Inisialisasi Off-Screen Canvas (width x height) &\nRender Ulang Citra via 2D Context:\nctx.drawImage(img, 0, 0, width, height)",
                 bg="#EFF6FF", border="#0284C7", text_color="#1E3A8A", fontsize=8, bold=True)
    # Join scaling arrows to canvas
    draw_arrow(ax, (16, 34.3), (35, 28.9))
    draw_arrow(ax, (44, 34.3), (46, 28.9))
    draw_arrow(ax, (72, 43.1), (62, 28.9))

    # Process: toBlob compression
    draw_process(ax, 50, 18.5, 46, 4.4, "Kompresi Format JPEG Kualitas 0.82:\ncanvas.toBlob(callback, 'image/jpeg', 0.82) ->\nReduksi Ukuran Berkas dari ~5 MB menjadi < 500 KB",
                 bg="#DCFCE7", border="#16A34A", text_color="#14532D", fontsize=8, bold=True)
    draw_arrow(ax, (50, 24.1), (50, 20.7))

    # IO: Output File Baru
    draw_io(ax, 50, 11.0, 42, 4.0, "Instansiasi new File([blob], file.name) &\nKembalikan Berkas Terkompresi Siap Unggah",
            bg="#F3E8FF", border="#7C3AED", text_color="#4C1D95", fontsize=8.2)
    draw_arrow(ax, (50, 16.3), (50, 13.0))

    # End
    draw_terminal(ax, 50, 2.8, 20, 2.8, "SELESAI", color="#0F2A4A")
    draw_arrow(ax, (50, 9.0), (50, 4.2))

    # Save
    plt.tight_layout()
    f3 = os.path.join(out_dir, "flowchart_kompresi_canvas_clean.png")
    f3_art = os.path.join(art_dir, "flowchart_kompresi_canvas_clean.png")
    fig.savefig(f3, dpi=300, bbox_inches="tight")
    fig.savefig(f3_art, dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Flowchart 3 generated successfully:", f3)

if __name__ == "__main__":
    generate_main_flowchart()
    generate_vlm_flowchart()
    generate_canvas_flowchart()
    print("ALL 3 FLOWCHARTS GENERATED SUCCESSFULLY AT 300 DPI!")
