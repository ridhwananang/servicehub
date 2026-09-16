<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

test('guest cannot access document scan endpoint', function () {
    $fakeImage = UploadedFile::fake()->image('struk-servis.jpg');

    $response = $this->post(route('tickets.scan-document'), [
        'document' => $fakeImage,
    ]);

    $response->assertRedirect(route('login'));
});

test('document scan validates file presence and image format', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Missing file
    $res1 = $this->postJson(route('tickets.scan-document'), []);
    $res1->assertStatus(422)
         ->assertJsonValidationErrors(['document']);

    // Non-image file
    $fakeTxt = UploadedFile::fake()->create('dokumen.txt', 100, 'text/plain');
    $res2 = $this->postJson(route('tickets.scan-document'), [
        'document' => $fakeTxt,
    ]);
    $res2->assertStatus(422)
         ->assertJsonValidationErrors(['document']);
});

test('authenticated user can scan document using gemini service', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    config(['services.document_scanner.provider' => 'gemini']);
    config(['services.gemini.api_key' => 'fake-test-gemini-key']);
    config(['services.gemini.model' => 'gemini-2.5-flash']);

    $mockGeminiResponse = [
        'candidates' => [
            [
                'content' => [
                    'parts' => [
                        [
                            'text' => json_encode([
                                'notif_number' => '2026117562',
                                'customer_name' => 'MULYONO',
                                'customer_phone' => '085213579222',
                                'customer_address' => 'Jl. Kereta Kencana 2 Sektor 12 Blok 2 No. 15',
                                'unit_model' => 'AH-A5SAY',
                                'serial_number' => 'SN-99882211',
                                'service_date' => '2026-03-15',
                                'deadline' => '2026-03-15',
                                'status' => 'berbayar',
                                'status_note' => 'Perbaikan motor fan & cuci unit',
                                'work_status' => 'selesai',
                                'work_types' => ['Perbaikan', 'Cuci AC'],
                                'start_time' => '10:00',
                                'finish_time' => '11:30',
                                'notes' => 'AC tidak dingin, sudah dicuci dan freon normal.',
                            ]),
                        ],
                    ],
                ],
            ],
        ],
    ];

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response($mockGeminiResponse, 200),
    ]);

    $fakeImage = UploadedFile::fake()->image('struk-sharp.jpg', 1200, 1600);

    $response = $this->postJson(route('tickets.scan-document'), [
        'document' => $fakeImage,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'provider' => 'gemini',
            'data' => [
                'notif_number' => '2026117562',
                'customer_name' => 'MULYONO',
                'customer_phone' => '085213579222',
                'customer_address' => 'Jl. Kereta Kencana 2 Sektor 12 Blok 2 No. 15',
                'unit_model' => 'AH-A5SAY',
                'serial_number' => 'SN-99882211',
                'service_date' => '2026-03-15',
                'status' => 'berbayar',
                'work_types' => ['Perbaikan', 'Cuci AC'],
            ],
        ]);
});

test('authenticated user can scan document using groq service', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    config(['services.document_scanner.provider' => 'groq']);
    config(['services.groq.api_key' => 'fake-test-groq-key']);
    config(['services.groq.model' => 'qwen/qwen3.8-27b']);

    $mockGroqResponse = [
        'id' => 'chatcmpl-test-123',
        'choices' => [
            [
                'message' => [
                    'role' => 'assistant',
                    'content' => json_encode([
                        'notif_number' => '2026117562',
                        'customer_name' => 'MULYONO',
                        'customer_phone' => '085213579222',
                        'customer_address' => 'Jl. Kereta Kencana 2 Sektor 12 Blok 2 No. 15',
                        'unit_model' => 'AH-A5SAY',
                        'serial_number' => 'SN-99882211',
                        'service_date' => '2026-03-15',
                        'deadline' => '2026-03-15',
                        'status' => 'berbayar',
                        'status_note' => 'Perbaikan motor fan & cuci unit',
                        'work_status' => 'selesai',
                        'work_types' => ['Perbaikan', 'Cuci AC'],
                        'start_time' => '10:00',
                        'finish_time' => '11:30',
                        'notes' => 'AC tidak dingin, sudah dicuci dan freon normal.',
                    ]),
                ],
            ],
        ],
    ];

    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response($mockGroqResponse, 200),
    ]);

    $fakeImage = UploadedFile::fake()->image('struk-sharp.jpg', 1200, 1600);

    $response = $this->postJson(route('tickets.scan-document'), [
        'document' => $fakeImage,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'provider' => 'groq',
            'data' => [
                'notif_number' => '2026117562',
                'customer_name' => 'MULYONO',
                'customer_phone' => '085213579222',
                'customer_address' => 'Jl. Kereta Kencana 2 Sektor 12 Blok 2 No. 15',
                'unit_model' => 'AH-A5SAY',
                'serial_number' => 'SN-99882211',
                'service_date' => '2026-03-15',
                'status' => 'berbayar',
                'work_types' => ['Perbaikan', 'Cuci AC'],
            ],
        ]);
});

test('document scan returns structured error when api key is missing', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    config(['services.document_scanner.provider' => 'groq']);
    config(['services.groq.api_key' => null]);

    $fakeImage = UploadedFile::fake()->image('struk-sharp.jpg');

    $response = $this->postJson(route('tickets.scan-document'), [
        'document' => $fakeImage,
    ]);

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'code' => 'KEY_MISSING',
            'fallback_available' => true,
        ]);
});

test('document scan returns 429 when groq quota is exceeded', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    config(['services.document_scanner.provider' => 'groq']);
    config(['services.groq.api_key' => 'fake-test-key']);

    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'error' => [
                'message' => 'Rate limit reached for model',
                'type' => 'rate_limit_exceeded',
            ],
        ], 429),
    ]);

    $fakeImage = UploadedFile::fake()->image('struk-sharp.jpg');

    $response = $this->postJson(route('tickets.scan-document'), [
        'document' => $fakeImage,
    ]);

    $response->assertStatus(429)
        ->assertJson([
            'success' => false,
            'code' => 'QUOTA_EXCEEDED',
            'fallback_available' => true,
        ]);
});
