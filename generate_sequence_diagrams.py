import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Output directories
out_dir = r"c:\Users\An\Herd\servicehub"
art_dir = r"C:\Users\An\.gemini\antigravity\brain\f58e67fa-53d0-4905-b0e9-27b48316309f"
os.makedirs(out_dir, exist_ok=True)
os.makedirs(art_dir, exist_ok=True)

# Common styling constants
FONT_FAMILY = "DejaVu Sans"
HEADER_BG = "#0F2A4A"       # Dark Navy
BANNER_SUBTITLE = "#94A3B8"  # Slate Light
BORDER_COLOR = "#0284C7"     # Accent Cyan

COLOR_ACTOR = "#16A34A"      # Green
COLOR_BOUNDARY = "#0284C7"   # Blue
COLOR_CONTROLLER = "#6366F1" # Indigo
COLOR_SERVICE = "#EC4899"    # Pink / Magenta
COLOR_ENTITY = "#F59E0B"     # Amber
COLOR_DB = "#475569"         # Slate Dark
COLOR_ACTIVATION = "#E0F2FE" # Light Blue
COLOR_ARROW = "#1E293B"      # Dark Slate
COLOR_RETURN = "#64748B"     # Muted Slate
COLOR_ALT_BG = "#F8FAFC"     # Very Light Slate
COLOR_ALT_BORDER = "#94A3B8" # Slate Border

def draw_header(ax, title, subtitle):
    # Top banner background
    rect = patches.FancyBboxPatch((0, 91), 100, 9, boxstyle="square,pad=0",
                                  facecolor=HEADER_BG, edgecolor="none", zorder=1)
    ax.add_patch(rect)
    
    # Accent bar
    accent = patches.Rectangle((0, 90.5), 100, 0.5, facecolor="#38BDF8", edgecolor="none", zorder=2)
    ax.add_patch(accent)

    # Title & Subtitle text
    ax.text(50, 95.5, title, ha="center", va="center", color="#FFFFFF",
            fontsize=12, fontweight="bold", family=FONT_FAMILY, zorder=3)
    ax.text(50, 92.5, subtitle, ha="center", va="center", color=BANNER_SUBTITLE,
            fontsize=8, family=FONT_FAMILY, zorder=3)

def draw_lifeline(ax, x, top_y, bot_y, label, stereotype, color):
    # Header box for lifeline
    box_w, box_h = 12, 5
    box = patches.FancyBboxPatch((x - box_w/2, top_y - box_h/2), box_w, box_h,
                                 boxstyle="round,pad=0.2,rounding_size=0.8",
                                 facecolor="#FFFFFF", edgecolor=color, linewidth=2, zorder=10)
    ax.add_patch(box)
    
    # Stereotype & Name
    ax.text(x, top_y + 0.8, stereotype, ha="center", va="center", color=color,
            fontsize=7, fontweight="bold", family=FONT_FAMILY, zorder=11)
    ax.text(x, top_y - 1.2, label, ha="center", va="center", color="#0F172A",
            fontsize=8, fontweight="bold", family=FONT_FAMILY, zorder=11)
    
    # Vertical dashed line
    ax.plot([x, x], [top_y - box_h/2, bot_y], color="#94A3B8", linestyle="--", linewidth=1.2, zorder=2)

def draw_actor(ax, x, top_y, bot_y, label):
    # Draw stick figure head
    circle = patches.Circle((x, top_y + 1.2), 1.0, facecolor="#DCFCE7", edgecolor=COLOR_ACTOR, linewidth=2, zorder=10)
    ax.add_patch(circle)
    # Body
    ax.plot([x, x], [top_y + 0.2, top_y - 1.2], color=COLOR_ACTOR, linewidth=2, zorder=10)
    # Arms
    ax.plot([x - 1.2, x + 1.2], [top_y - 0.3, top_y - 0.3], color=COLOR_ACTOR, linewidth=2, zorder=10)
    # Legs
    ax.plot([x, x - 1.0], [top_y - 1.2, top_y - 2.4], color=COLOR_ACTOR, linewidth=2, zorder=10)
    ax.plot([x, x + 1.0], [top_y - 1.2, top_y - 2.4], color=COLOR_ACTOR, linewidth=2, zorder=10)
    
    # Label
    ax.text(x, top_y - 3.4, label, ha="center", va="center", color="#0F172A",
            fontsize=8, fontweight="bold", family=FONT_FAMILY, zorder=11)
    
    # Lifeline
    ax.plot([x, x], [top_y - 4.2, bot_y], color="#94A3B8", linestyle="--", linewidth=1.2, zorder=2)

def draw_activation(ax, x, y_start, y_end):
    w = 1.6
    rect = patches.Rectangle((x - w/2, y_end), w, y_start - y_end,
                             facecolor=COLOR_ACTIVATION, edgecolor="#0284C7", linewidth=1.2, zorder=5)
    ax.add_patch(rect)

def draw_message(ax, x1, x2, y, text, is_return=False):
    offset = 0.8
    if not is_return:
        # Solid arrow
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="-|>", color=COLOR_ARROW, lw=1.3, mutation_scale=10),
                    zorder=6)
        mid_x = (x1 + x2) / 2
        ax.text(mid_x, y + offset, text, ha="center", va="bottom", color=COLOR_ARROW,
                fontsize=7.2, fontweight="bold", family=FONT_FAMILY, zorder=7)
    else:
        # Dashed return arrow
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", color=COLOR_RETURN, lw=1.2, linestyle="--", mutation_scale=10),
                    zorder=6)
        mid_x = (x1 + x2) / 2
        ax.text(mid_x, y + offset, text, ha="center", va="bottom", color=COLOR_RETURN,
                fontsize=7.0, family=FONT_FAMILY, style="italic", zorder=7)

def draw_self_call(ax, x, y_start, y_end, text):
    # Loop arrow from x to x
    dx = 3.0
    ax.plot([x + 0.8, x + 0.8 + dx, x + 0.8 + dx, x + 0.8], [y_start, y_start, y_end, y_end],
            color=COLOR_ARROW, lw=1.2, zorder=6)
    ax.annotate("", xy=(x + 0.8, y_end), xytext=(x + 0.8 + 1.0, y_end),
                arrowprops=dict(arrowstyle="-|>", color=COLOR_ARROW, lw=1.2, mutation_scale=10),
                zorder=6)
    ax.text(x + 0.8 + dx + 0.5, (y_start + y_end)/2, text, ha="left", va="center", color=COLOR_ARROW,
            fontsize=7.0, fontweight="bold", family=FONT_FAMILY, zorder=7)


# =============================================================================
# 1. SEQUENCE DIAGRAM: AUTENTIKASI PENGGUNA (LOGIN - UC-01)
# =============================================================================
def generate_seq_login():
    fig, ax = plt.subplots(figsize=(11, 8.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")

    draw_header(ax, "SEQUENCE DIAGRAM: PROSES AUTENTIKASI PENGGUNA (LOGIN - UC-01)",
                "Sistem Pelaporan Teknisi ServiceHub - PT. Sharp Electronics Indonesia")

    bot_y = 6
    # Positions
    x_act = 10
    x_bnd = 30
    x_ctl = 52
    x_ent = 74
    x_db  = 92

    draw_actor(ax, x_act, 84, bot_y, "Pengguna\n(Admin/Teknisi)")
    draw_lifeline(ax, x_bnd, 84, bot_y, ":LoginPage", "<<boundary>>", COLOR_BOUNDARY)
    draw_lifeline(ax, x_ctl, 84, bot_y, ":AuthSessionController", "<<controller>>", COLOR_CONTROLLER)
    draw_lifeline(ax, x_ent, 84, bot_y, ":User", "<<entity>>", COLOR_ENTITY)
    draw_lifeline(ax, x_db,  84, bot_y, ":PostgreSQL", "<<database>>", COLOR_DB)

    # Activations
    draw_activation(ax, x_bnd, 77, 10)
    draw_activation(ax, x_ctl, 68, 14)
    draw_activation(ax, x_ent, 65, 54)
    draw_activation(ax, x_db,  62, 57)

    # Messages
    draw_message(ax, x_act, x_bnd, 76, "1: Akses URL /login")
    draw_self_call(ax, x_bnd, 74, 71, "2: Render form login")
    draw_message(ax, x_act, x_bnd, 69, "3: Submit form (email, password)")
    draw_message(ax, x_bnd, x_ctl, 67, "4: POST /login")
    draw_message(ax, x_ctl, x_ent, 64, "5: where('email', $email)->first()")
    draw_message(ax, x_ent, x_db,  61, "6: SELECT * FROM users WHERE email=?")
    draw_message(ax, x_db,  x_ent, 58, "7: Return user row", is_return=True)
    draw_message(ax, x_ent, x_ctl, 55, "8: Return User instance", is_return=True)
    draw_self_call(ax, x_ctl, 53, 50, "9: Hash::check(password, hash)")

    # Alt Box (Valid vs Invalid)
    alt_top, alt_bot = 48, 10
    alt_box = patches.FancyBboxPatch((20, alt_bot), 78, alt_top - alt_bot,
                                     boxstyle="round,pad=0.2,rounding_size=0.6",
                                     facecolor="#F8FAFC", edgecolor="#94A3B8", linewidth=1.2, zorder=3)
    ax.add_patch(alt_box)
    
    # Tag 'alt'
    tag = patches.FancyBboxPatch((20, alt_top - 3.5), 9, 3.5, boxstyle="square,pad=0",
                                 facecolor="#E2E8F0", edgecolor="#94A3B8", linewidth=1.2, zorder=4)
    ax.add_patch(tag)
    ax.text(24.5, alt_top - 1.8, "alt", ha="center", va="center", fontsize=8, fontweight="bold", color="#334155")
    
    # Condition 1: Valid
    ax.text(31, alt_top - 2.0, "[Kredensial Valid & Cocok]", fontsize=7.2, fontweight="bold", color="#16A34A")
    draw_activation(ax, x_db, 43, 37)
    draw_message(ax, x_ctl, x_db, 42, "10: regenerateSession() & update last_activity")
    draw_message(ax, x_db, x_ctl, 38, "11: Session created", is_return=True)
    draw_message(ax, x_ctl, x_bnd, 34, "12: Redirect response (/dashboard)", is_return=True)
    draw_message(ax, x_bnd, x_act, 31, "13: Tampilkan Dashboard sesuai peran (Admin/Teknisi)", is_return=True)

    # Dividing line
    ax.plot([20, 98], [27, 27], color="#94A3B8", linestyle="--", linewidth=1.2, zorder=4)

    # Condition 2: Invalid
    ax.text(31, 25.0, "[Kredensial Tidak Valid]", fontsize=7.2, fontweight="bold", color="#DC2626")
    draw_message(ax, x_ctl, x_bnd, 20, "14: ValidationException (422 Unprocessable)", is_return=True)
    draw_message(ax, x_bnd, x_act, 15, "15: Tampilkan pesan error 'Kredensial tidak cocok'", is_return=True)

    plt.tight_layout()
    out_file = os.path.join(out_dir, "sequence_diagram_login_clean.png")
    plt.savefig(out_file, dpi=300, facecolor="#FFFFFF")
    try:
        plt.savefig(os.path.join(art_dir, "sequence_diagram_login_clean.png"), dpi=300, facecolor="#FFFFFF")
    except Exception:
        pass
    plt.close()
    print("Generated:", out_file)


# =============================================================================
# 2. SEQUENCE DIAGRAM: PEMBUATAN TIKET & EKSTRAKSI AI VLM (UC-02)
# =============================================================================
def generate_seq_ticket_vlm():
    fig, ax = plt.subplots(figsize=(12, 9), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")

    draw_header(ax, "SEQUENCE DIAGRAM: PEMBUATAN TIKET & EKSTRAKSI DOKUMEN AI VLM (UC-02)",
                "Sistem Pelaporan Teknisi ServiceHub - PT. Sharp Electronics Indonesia")

    bot_y = 6
    # 6 Lifelines
    x_act = 8
    x_bnd = 24
    x_sctl = 41
    x_srv  = 57
    x_vlm  = 73
    x_tctl = 86
    x_db   = 96

    draw_actor(ax, x_act, 84, bot_y, "Admin\nService Center")
    draw_lifeline(ax, x_bnd, 84, bot_y, ":ScannerModal", "<<boundary>>", COLOR_BOUNDARY)
    draw_lifeline(ax, x_sctl, 84, bot_y, ":ScanDocController", "<<controller>>", COLOR_CONTROLLER)
    draw_lifeline(ax, x_srv,  84, bot_y, ":DocScannerService", "<<service>>", COLOR_SERVICE)
    draw_lifeline(ax, x_vlm,  84, bot_y, ":Groq/Gemini API", "<<external API>>", "#DC2626")
    draw_lifeline(ax, x_tctl, 84, bot_y, ":ServiceTicketController", "<<controller>>", COLOR_CONTROLLER)
    draw_lifeline(ax, x_db,   84, bot_y, ":PostgreSQL", "<<database>>", COLOR_DB)

    # Activations
    draw_activation(ax, x_bnd, 77, 10)
    draw_activation(ax, x_sctl, 74, 48)
    draw_activation(ax, x_srv,  71, 51)
    draw_activation(ax, x_vlm,  68, 56)
    draw_activation(ax, x_tctl, 30, 15)
    draw_activation(ax, x_db,   26, 18)

    # Step 1: Scan Document Flow
    draw_message(ax, x_act, x_bnd, 76, "1: Upload foto lembar SPK")
    draw_message(ax, x_bnd, x_sctl, 73, "2: POST /tickets/scan-document (file)")
    draw_message(ax, x_sctl, x_srv, 70, "3: scan(UploadedFile $document)")
    draw_message(ax, x_srv, x_vlm, 67, "4: scan(base64Image, jsonPrompt)")
    draw_self_call(ax, x_vlm, 64, 61, "5: Multimodal VLM OCR extraction")
    draw_message(ax, x_vlm, x_srv, 57, "6: Return multimodal JSON text", is_return=True)
    draw_self_call(ax, x_srv, 55, 52, "7: ParsedDocumentData::fromArray()")
    draw_message(ax, x_srv, x_sctl, 49, "8: Return ParsedDocumentData DTO", is_return=True)
    draw_message(ax, x_sctl, x_bnd, 46, "9: Return JsonResponse {success: true, data}", is_return=True)
    draw_self_call(ax, x_bnd, 44, 41, "10: Auto-populate input form dialog")

    # Step 2: Validate & Store Flow
    draw_message(ax, x_act, x_bnd, 38, "11: Periksa/Koreksi data & klik Simpan")
    draw_message(ax, x_bnd, x_tctl, 32, "12: POST /tickets (validated form data)")
    draw_self_call(ax, x_tctl, 30, 27, "13: Set created_by & work_status='belum_selesai'")
    draw_message(ax, x_tctl, x_db, 25, "14: INSERT INTO service_tickets ...")
    draw_message(ax, x_db, x_tctl, 20, "15: Return new ServiceTicket row", is_return=True)
    draw_message(ax, x_tctl, x_bnd, 16, "16: Redirect back with success message", is_return=True)
    draw_message(ax, x_bnd, x_act, 12, "17: Tampilkan pesan 'Tiket Berhasil Ditambahkan'", is_return=True)

    plt.tight_layout()
    out_file = os.path.join(out_dir, "sequence_diagram_ticket_vlm_clean.png")
    plt.savefig(out_file, dpi=300, facecolor="#FFFFFF")
    try:
        plt.savefig(os.path.join(art_dir, "sequence_diagram_ticket_vlm_clean.png"), dpi=300, facecolor="#FFFFFF")
    except Exception:
        pass
    plt.close()
    print("Generated:", out_file)


# =============================================================================
# 3. SEQUENCE DIAGRAM: PELAPORAN SERVIS OLEH TEKNISI (UC-10, UC-11, UC-12)
# =============================================================================
def generate_seq_technician_report():
    fig, ax = plt.subplots(figsize=(12, 9), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")

    draw_header(ax, "SEQUENCE DIAGRAM: PELAPORAN & PENYELESAIAN SERVIS TEKNISI (UC-10, 11, 12)",
                "Sistem Pelaporan Teknisi ServiceHub - PT. Sharp Electronics Indonesia")

    bot_y = 6
    # 6 Lifelines
    x_act = 8
    x_bnd = 25
    x_cmp = 42
    x_ctl = 60
    x_sto = 78
    x_db  = 94

    draw_actor(ax, x_act, 84, bot_y, "Teknisi\nLapangan")
    draw_lifeline(ax, x_bnd, 84, bot_y, ":TicketDialogPWA", "<<boundary>>", COLOR_BOUNDARY)
    draw_lifeline(ax, x_cmp, 84, bot_y, ":ImageCompressor", "<<utility>>", COLOR_SERVICE)
    draw_lifeline(ax, x_ctl, 84, bot_y, ":ServiceTicketController", "<<controller>>", COLOR_CONTROLLER)
    draw_lifeline(ax, x_sto, 84, bot_y, ":StorageDisk(S3)", "<<storage>>", "#0D9488")
    draw_lifeline(ax, x_db,  84, bot_y, ":PostgreSQL", "<<database>>", COLOR_DB)

    # Activations
    draw_activation(ax, x_bnd, 77, 10)
    draw_activation(ax, x_cmp, 68, 56)
    draw_activation(ax, x_ctl, 48, 15)
    draw_activation(ax, x_sto, 44, 34)
    draw_activation(ax, x_db,  30, 20)

    # Messages
    draw_message(ax, x_act, x_bnd, 76, "1: Buka tiket servis & akses form pelaporan")
    draw_message(ax, x_act, x_bnd, 72, "2: Input diagnosis teknis & pilih work_types")
    draw_message(ax, x_act, x_bnd, 68, "3: Ambil foto kamera unit (visit & completion)")
    draw_message(ax, x_bnd, x_cmp, 66, "4: compressImage(file, max=1600, q=0.82)")
    draw_self_call(ax, x_cmp, 64, 60, "5: HTML5 Canvas resize & JPEG compression")
    draw_message(ax, x_cmp, x_bnd, 57, "6: Return optimized File (< 500 KB)", is_return=True)
    draw_message(ax, x_act, x_bnd, 51, "7: Submit Laporan Servis (work_status='selesai')")
    draw_message(ax, x_bnd, x_ctl, 47, "8: PUT /tickets/{id} (multipart form data)")
    draw_message(ax, x_ctl, x_sto, 43, "9: storePublicly('tickets/visit & completion')")
    draw_self_call(ax, x_sto, 40, 37, "10: Simpan berkas citra digital")
    draw_message(ax, x_sto, x_ctl, 35, "11: Return public URL photo paths", is_return=True)
    draw_message(ax, x_ctl, x_db,  29, "12: UPDATE service_tickets SET work_status='selesai' ...")
    draw_message(ax, x_db,  x_ctl, 23, "13: Affected rows success", is_return=True)
    draw_message(ax, x_ctl, x_bnd, 17, "14: Redirect back with success message", is_return=True)
    draw_message(ax, x_bnd, x_act, 12, "15: Tampilkan pesan 'Laporan Servis Berhasil Dikirim'", is_return=True)

    plt.tight_layout()
    out_file = os.path.join(out_dir, "sequence_diagram_technician_report_clean.png")
    plt.savefig(out_file, dpi=300, facecolor="#FFFFFF")
    try:
        plt.savefig(os.path.join(art_dir, "sequence_diagram_technician_report_clean.png"), dpi=300, facecolor="#FFFFFF")
    except Exception:
        pass
    plt.close()
    print("Generated:", out_file)


if __name__ == "__main__":
    generate_seq_login()
    generate_seq_ticket_vlm()
    generate_seq_technician_report()
