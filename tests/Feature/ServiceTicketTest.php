<?php

use App\Models\ServiceTicket;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('authenticated user can view tickets on dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('tickets')
        ->has('stats')
    );
});

test('user can create a ticket with multi-select work types and custom text', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $data = [
        'notif_number' => 'NTF-TEST-9999',
        'customer_name' => 'Bambang Sudiro',
        'customer_phone' => '081299998888',
        'unit_model' => 'Mesin Cuci Inverter 8kg',
        'serial_number' => 'MC-INV-881',
        'status' => 'berbayar',
        'status_note' => null,
        'work_types' => ['Install Standart', 'Install Bracket', 'Lain-lain'],
        'other_work_text' => 'Pemasangan stop kontak water proof',
        'mainwork_center' => 'Pulogadung',
        'start_time' => '10:00',
        'finish_time' => '11:30',
        'notes' => 'Unit selesai dites dan berfungsi normal.',
    ];

    $response = $this->post(route('tickets.store'), $data);
    $response->assertRedirect();

    $this->assertDatabaseHas('service_tickets', [
        'notif_number' => 'NTF-TEST-9999',
        'customer_name' => 'Bambang Sudiro',
        'other_work_text' => 'Pemasangan stop kontak water proof',
    ]);

    $ticket = ServiceTicket::where('notif_number', 'NTF-TEST-9999')->first();
    expect($ticket->work_types)->toContain('Install Standart');
    expect($ticket->work_types)->toContain('Install Bracket');
    expect($ticket->work_types)->toContain('Lain-lain');
});

test('file upload rejects non-image files for security', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $fakeTxt = UploadedFile::fake()->create('malicious.txt', 100, 'text/plain');

    $data = [
        'notif_number' => 'NTF-SEC-0001',
        'customer_name' => 'Hacker Test',
        'customer_phone' => '081122334455',
        'unit_model' => 'Model X',
        'serial_number' => 'SN-001',
        'status' => 'berbayar',
        'work_types' => ['Install Standart'],
        'mainwork_center' => 'MOI',
        'visit_photo' => $fakeTxt,
    ];

    $response = $this->post(route('tickets.store'), $data);
    $response->assertSessionHasErrors(['visit_photo']);
});

test('file upload accepts valid image files', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $this->actingAs($user);

    $fakeImage = UploadedFile::fake()->image('visit.jpg', 600, 600);

    $data = [
        'notif_number' => 'NTF-IMG-0002',
        'customer_name' => 'Image Test',
        'customer_phone' => '081122334466',
        'unit_model' => 'Model Y',
        'serial_number' => 'SN-002',
        'status' => 'berbayar',
        'work_types' => ['Service Minor'],
        'mainwork_center' => 'Pulogadung',
        'visit_photo' => $fakeImage,
    ];

    $response = $this->post(route('tickets.store'), $data);
    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $ticket = ServiceTicket::where('notif_number', 'NTF-IMG-0002')->first();
    expect($ticket->visit_photo)->not->toBeNull();
});

test('user can update a ticket', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $ticket = ServiceTicket::create([
        'notif_number' => 'NTF-UP-100',
        'customer_name' => 'Original Name',
        'customer_phone' => '0812345678',
        'unit_model' => 'Kulkas 2 Pintu',
        'serial_number' => 'KLK-100',
        'status' => 'berbayar',
        'work_types' => ['Service Minor'],
        'mainwork_center' => 'MOI',
    ]);

    $updateData = [
        'notif_number' => 'NTF-UP-100', // Keeps same notif_number
        'customer_name' => 'Updated Name',
        'customer_phone' => '0812345678',
        'unit_model' => 'Kulkas 2 Pintu Inverter',
        'serial_number' => 'KLK-100',
        'status' => 'tidak_berbayar',
        'status_note' => 'Garansi 6 Bulan',
        'work_types' => ['Service Mayor'],
        'mainwork_center' => 'MOI',
    ];

    $response = $this->put(route('tickets.update', $ticket), $updateData);
    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('service_tickets', [
        'id' => $ticket->id,
        'customer_name' => 'Updated Name',
        'status' => 'tidak_berbayar',
        'status_note' => 'Garansi 6 Bulan',
    ]);
});

test('admin can delete a ticket', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $ticket = ServiceTicket::create([
        'notif_number' => 'NTF-DEL-200',
        'customer_name' => 'Delete Me',
        'customer_phone' => '0812345678',
        'unit_model' => 'Dispenser',
        'serial_number' => 'DSP-200',
        'status' => 'berbayar',
        'work_types' => ['Service Minor'],
        'mainwork_center' => 'Pulogadung',
    ]);

    $response = $this->delete(route('tickets.destroy', $ticket));
    $response->assertRedirect();

    $this->assertDatabaseMissing('service_tickets', [
        'id' => $ticket->id,
    ]);
});

test('teknisi cannot delete a ticket', function () {
    $teknisi = User::factory()->teknisi()->create();
    $this->actingAs($teknisi);

    $ticket = ServiceTicket::create([
        'notif_number' => 'NTF-DEL-201',
        'customer_name' => 'Cannot Delete Me',
        'customer_phone' => '0812345678',
        'unit_model' => 'Dispenser',
        'serial_number' => 'DSP-201',
        'status' => 'berbayar',
        'work_types' => ['Service Minor'],
        'mainwork_center' => 'Pulogadung',
    ]);

    $response = $this->delete(route('tickets.destroy', $ticket));
    $response->assertForbidden();

    $this->assertDatabaseHas('service_tickets', [
        'id' => $ticket->id,
    ]);
});

test('user can export tickets to xlsx format with csv formula mitigation', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    ServiceTicket::create([
        'notif_number' => '=1+1', // Formula attempt
        'customer_name' => '+FormulaName',
        'customer_phone' => '0812345678',
        'unit_model' => 'AC Split',
        'serial_number' => 'AC-001',
        'status' => 'berbayar',
        'work_types' => ['Service Minor'],
        'mainwork_center' => 'Pulogadung',
    ]);

    $response = $this->get(route('tickets.export'));
    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $content = $response->streamedContent();
    expect($content)->toContain("'=1+1");
    expect($content)->toContain("'+FormulaName");
});

test('user can filter tickets by month on dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Ticket in September 2026
    ServiceTicket::create([
        'notif_number' => 'NTF-SEP-001',
        'customer_name' => 'Budi September',
        'customer_phone' => '0812345678',
        'unit_model' => 'AC Split',
        'serial_number' => 'AC-SEP-001',
        'status' => 'berbayar',
        'work_types' => ['Service Minor'],
        'mainwork_center' => 'Pulogadung',
        'service_date' => '2026-09-10',
    ]);

    // Ticket in August 2026
    ServiceTicket::create([
        'notif_number' => 'NTF-AUG-001',
        'customer_name' => 'Andi Agustus',
        'customer_phone' => '0812345679',
        'unit_model' => 'Kulkas Inverter',
        'serial_number' => 'KLK-AUG-001',
        'status' => 'tidak_berbayar',
        'work_types' => ['Service Mayor'],
        'mainwork_center' => 'MOI',
        'service_date' => '2026-08-15',
    ]);

    $response = $this->get(route('dashboard', ['month' => '2026-09']));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('filters.month', '2026-09')
        ->has('tickets', 1)
        ->where('tickets.0.notif_number', 'NTF-SEP-001')
    );
});

test('user can export tickets filtered by month', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    ServiceTicket::create([
        'notif_number' => 'NTF-EXP-SEP',
        'customer_name' => 'Pelanggan September',
        'customer_phone' => '0812345678',
        'unit_model' => 'Mesin Cuci',
        'serial_number' => 'MC-SEP-01',
        'status' => 'berbayar',
        'work_types' => ['Install Standart'],
        'mainwork_center' => 'Pulogadung',
        'service_date' => '2026-09-05',
    ]);

    ServiceTicket::create([
        'notif_number' => 'NTF-EXP-AUG',
        'customer_name' => 'Pelanggan Agustus',
        'customer_phone' => '0812345679',
        'unit_model' => 'TV LED',
        'serial_number' => 'TV-AUG-01',
        'status' => 'berbayar',
        'work_types' => ['Install Bracket'],
        'mainwork_center' => 'MOI',
        'service_date' => '2026-08-20',
    ]);

    $response = $this->get(route('tickets.export', ['month' => '2026-09']));
    $response->assertOk();

    $content = $response->streamedContent();
    expect($content)->toContain('NTF-EXP-SEP');
    expect($content)->not->toContain('NTF-EXP-AUG');
    expect($content)->toContain('DEADLINE');
    expect($content)->toContain('STATUS PENGERJAAN');
});

test('user can create ticket with deadline and default work status is belum_selesai', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $data = [
        'notif_number' => 'NTF-DL-001',
        'customer_name' => 'Budi Santoso',
        'customer_phone' => '081234567890',
        'unit_model' => 'Smart TV 55 Inch',
        'serial_number' => 'TV-55-999',
        'deadline' => '2026-09-20',
        'status' => 'berbayar',
        'work_types' => ['Install Bracket'],
        'mainwork_center' => 'Pulogadung',
    ];

    $response = $this->post(route('tickets.store'), $data);
    $response->assertRedirect();

    $ticket = ServiceTicket::where('notif_number', 'NTF-DL-001')->first();
    expect($ticket)->not->toBeNull();
    expect($ticket->work_status)->toBe('belum_selesai');
    expect($ticket->deadline->toDateString())->toBe('2026-09-20');
});

test('user can toggle ticket work status between belum_selesai and selesai', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $ticket = ServiceTicket::create([
        'notif_number' => 'NTF-TOGGLE-001',
        'customer_name' => 'Rina Marlina',
        'customer_phone' => '081299887766',
        'unit_model' => 'AC Inverter 1PK',
        'serial_number' => 'AC-INV-001',
        'deadline' => '2026-09-18',
        'status' => 'berbayar',
        'work_status' => 'belum_selesai',
        'work_types' => ['Service Minor'],
        'mainwork_center' => 'MOI',
    ]);

    // Toggle to selesai
    $response = $this->patch(route('tickets.toggle-status', $ticket->id), [
        'work_status' => 'selesai',
    ]);
    $response->assertRedirect();
    $ticket->refresh();
    expect($ticket->work_status)->toBe('selesai');

    // Toggle back to belum_selesai without explicit param
    $response2 = $this->patch(route('tickets.toggle-status', $ticket->id));
    $response2->assertRedirect();
    $ticket->refresh();
    expect($ticket->work_status)->toBe('belum_selesai');
});
