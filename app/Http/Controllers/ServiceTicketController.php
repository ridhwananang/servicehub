<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceTicketRequest;
use App\Http\Requests\UpdateServiceTicketRequest;
use App\Models\ServiceTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ServiceTicketController extends Controller
{
    /**
     * Display a listing of the resource with stats.
     */
    public function index(Request $request)
    {
        $query = $this->buildFilteredQuery($request);

        // Sort Filter
        $sort = $request->input('sort', 'waktu_terbaru');
        if ($sort === 'waktu_terlama') {
            $query->orderBy('service_date', 'asc')->orderBy('created_at', 'asc');
        } elseif ($sort === 'notif_asc') {
            $query->orderBy('notif_number', 'asc');
        } else {
            $query->orderBy('service_date', 'desc')->orderBy('created_at', 'desc');
        }

        $tickets = $query->get();

        // Summary Stats across all tickets
        $allTickets = ServiceTicket::all();
        $totalCount = $allTickets->count();
        $berbayarCount = $allTickets->where('status', 'berbayar')->count();
        $tidakBerbayarCount = $allTickets->where('status', 'tidak_berbayar')->count();
        $completePhotosCount = $allTickets->filter(function ($t) {
            return !empty($t->visit_photo) && !empty($t->completion_photo);
        })->count();

        $pulogadungCount = $allTickets->where('mainwork_center', 'Pulogadung')->count();
        $moiCount = $allTickets->where('mainwork_center', 'MOI')->count();
        $lainLainCenterCount = $allTickets->whereNotIn('mainwork_center', ['Pulogadung', 'MOI'])->count();

        $stats = [
            'total' => $totalCount,
            'complete_photos_count' => $completePhotosCount,
            'berbayar_count' => $berbayarCount,
            'berbayar_percent' => $totalCount > 0 ? round(($berbayarCount / $totalCount) * 100) : 0,
            'tidak_berbayar_count' => $tidakBerbayarCount,
            'tidak_berbayar_percent' => $totalCount > 0 ? round(($tidakBerbayarCount / $totalCount) * 100) : 0,
            'center_counts' => [
                'pulogadung' => $pulogadungCount,
                'moi' => $moiCount,
                'lain_lain' => $lainLainCenterCount,
            ],
        ];

        return Inertia::render('dashboard', [
            'tickets' => $tickets,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'semua'),
                'center' => $request->input('center', 'semua'),
                'work_type' => $request->input('work_type', 'semua'),
                'month' => $request->input('month', 'semua'),
                'sort' => $sort,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceTicketRequest $request)
    {
        $validated = $request->validated();

        if (empty($validated['service_date'])) {
            $validated['service_date'] = now()->toDateString();
        }

        if (empty($validated['deadline'])) {
            $validated['deadline'] = $validated['service_date'] ?? now()->toDateString();
        }
        if (empty($validated['work_status'])) {
            $validated['work_status'] = 'belum_selesai';
        }

        $disk = $this->getStorageDisk();

        // Handle Visit Photo Upload
        if ($request->hasFile('visit_photo')) {
            $path = $request->file('visit_photo')->storePublicly('tickets/visit', $disk);
            $validated['visit_photo'] = Storage::disk($disk)->url($path);
        } elseif ($request->filled('visit_photo_url')) {
            $validated['visit_photo'] = $request->input('visit_photo_url');
        }

        // Handle Completion Photo Upload
        if ($request->hasFile('completion_photo')) {
            $path = $request->file('completion_photo')->storePublicly('tickets/completion', $disk);
            $validated['completion_photo'] = Storage::disk($disk)->url($path);
        } elseif ($request->filled('completion_photo_url')) {
            $validated['completion_photo'] = $request->input('completion_photo_url');
        }

        ServiceTicket::create($validated);

        return redirect()->back()->with('success', 'Tiket Servis berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceTicketRequest $request, ServiceTicket $ticket)
    {
        $validated = $request->validated();

        if (empty($validated['service_date'])) {
            $validated['service_date'] = $validated['deadline'] ?? now()->toDateString();
        }
        if (empty($validated['deadline'])) {
            $validated['deadline'] = $validated['service_date'];
        }

        $disk = $this->getStorageDisk();

        if ($request->hasFile('visit_photo')) {
            $path = $request->file('visit_photo')->storePublicly('tickets/visit', $disk);
            $validated['visit_photo'] = Storage::disk($disk)->url($path);
        } elseif ($request->filled('visit_photo_url')) {
            $validated['visit_photo'] = $request->input('visit_photo_url');
        }

        if ($request->hasFile('completion_photo')) {
            $path = $request->file('completion_photo')->storePublicly('tickets/completion', $disk);
            $validated['completion_photo'] = Storage::disk($disk)->url($path);
        } elseif ($request->filled('completion_photo_url')) {
            $validated['completion_photo'] = $request->input('completion_photo_url');
        }

        $ticket->update($validated);

        return redirect()->back()->with('success', 'Tiket Servis berhasil diperbarui.');
    }

    /**
     * Toggle work status between belum_selesai and selesai.
     */
    public function toggleWorkStatus(Request $request, ServiceTicket $ticket)
    {
        $newStatus = $request->input('work_status');
        if (!in_array($newStatus, ['belum_selesai', 'selesai'])) {
            $newStatus = ($ticket->work_status === 'selesai') ? 'belum_selesai' : 'selesai';
        }

        $ticket->update([
            'work_status' => $newStatus,
        ]);

        $statusLabel = $newStatus === 'selesai' ? 'Selesai' : 'Belum Selesai';

        return redirect()->back()->with('success', "Status pengerjaan tiket {$ticket->notif_number} diubah menjadi {$statusLabel}.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ServiceTicket $ticket)
    {
        abort_if(! $request->user()?->isAdmin(), 403, 'Akses ditolak. Role teknisi tidak memiliki akses untuk menghapus data.');

        $ticket->delete();

        return redirect()->back()->with('success', 'Tiket Servis berhasil dihapus.');
    }

    /**
     * Export tickets to Excel CSV formatted file with formula injection mitigation.
     */
    public function exportXlsx(Request $request)
    {
        $tickets = $this->buildFilteredQuery($request)
            ->orderBy('service_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="aquos_platinum_tiket_' . date('Ymd_His') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $sanitize = function (?string $value): string {
            if ($value === null || $value === '') {
                return '';
            }
            // Prevent CSV Formula Injection
            if (in_array(substr($value, 0, 1), ['=', '+', '-', '@', "\t", "\r"])) {
                return "'" . $value;
            }
            return $value;
        };

        $callback = function () use ($tickets, $sanitize) {
            $file = fopen('php://output', 'w');
            // Write UTF-8 BOM for Microsoft Excel compatibility
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, [
                'NOTIF (UNIQUE)',
                'DEADLINE',
                'STATUS PENGERJAAN',
                'TANGGAL PENGERJAAN',
                'NAMA PELANGGAN',
                'NO TELEPON',
                'ALAMAT PELANGGAN',
                'MODEL UNIT',
                'NO SERI',
                'STATUS GARANSI/PEMBAYARAN',
                'KETERANGAN STATUS',
                'JENIS PENGERJAAN',
                'PENGERJAAN LAIN',
                'MAINWORK CENTER',
                'JAM MULAI',
                'JAM SELESAI',
                'FOTO KUNJUNGAN',
                'FOTO SELESAI',
                'CATATAN',
                'TANGGAL INPUT SISTEM',
            ]);

            foreach ($tickets as $t) {
                $workTypesStr = is_array($t->work_types) ? implode(', ', $t->work_types) : '';

                fputcsv($file, [
                    $sanitize($t->notif_number),
                    $t->deadline ? date('Y-m-d', strtotime($t->deadline)) : ($t->service_date ? date('Y-m-d', strtotime($t->service_date)) : '-'),
                    $t->work_status === 'selesai' ? 'Selesai' : 'Belum Selesai',
                    $t->service_date ? date('Y-m-d', strtotime($t->service_date)) : '-',
                    $sanitize($t->customer_name),
                    $sanitize($t->customer_phone),
                    $sanitize($t->customer_address ?? '-'),
                    $sanitize($t->unit_model),
                    $sanitize($t->serial_number),
                    $t->status === 'berbayar' ? 'Berbayar' : 'Tidak Berbayar',
                    $sanitize($t->status_note ?? '-'),
                    $sanitize($workTypesStr),
                    $sanitize($t->other_work_text ?? '-'),
                    $sanitize($t->mainwork_center),
                    $sanitize($t->start_time ?? '-'),
                    $sanitize($t->finish_time ?? '-'),
                    $t->visit_photo ?? 'Belum ada',
                    $t->completion_photo ?? 'Belum ada',
                    $sanitize($t->notes ?? '-'),
                    $t->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    /**
     * Build the filtered query for service tickets.
     */
    protected function buildFilteredQuery(Request $request)
    {
        $query = ServiceTicket::query();

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('notif_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%")
                    ->orWhere('customer_address', 'like', "%{$search}%")
                    ->orWhere('unit_model', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        // Status Filter
        if ($status = $request->input('status')) {
            if ($status !== 'semua') {
                $query->where('status', $status);
            }
        }

        // Center Filter
        if ($center = $request->input('center')) {
            if ($center !== 'semua') {
                $query->where('mainwork_center', $center);
            }
        }

        // Work Type Filter
        if ($workType = $request->input('work_type')) {
            if ($workType !== 'semua') {
                $query->whereJsonContains('work_types', $workType);
            }
        }

        // Month Filter (format YYYY-MM)
        if ($month = $request->input('month')) {
            if ($month !== 'semua') {
                $query->where(function ($q) use ($month) {
                    $q->where('service_date', 'like', "{$month}%")
                        ->orWhere(function ($sub) use ($month) {
                            $sub->whereNull('service_date')->where('created_at', 'like', "{$month}%");
                        });
                });
            }
        }

        return $query;
    }

    /**
     * Get the active disk for storing ticket attachments.
     * Automatically uses 'public' locally and 's3' (or custom bucket) on Laravel Cloud.
     */
    protected function getStorageDisk(): string
    {
        $default = config('filesystems.default', 'local');
        return $default === 'local' ? 'public' : $default;
    }
}
