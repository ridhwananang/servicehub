<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('user can upload an avatar photo from profile settings', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $avatar = UploadedFile::fake()->image('profile.jpg');

    $response = $this->actingAs($user)->patch(route('profile.update'), [
        'name' => 'Updated Name',
        'email' => $user->email,
        'avatar' => $avatar,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('profile.edit'));

    $user->refresh();
    expect($user->name)->toBe('Updated Name');
    expect($user->avatar)->not->toBeNull();
});

test('user can remove their avatar photo', function () {
    Storage::fake('public');
    $user = User::factory()->create([
        'avatar' => 'http://localhost/storage/avatars/old.jpg',
    ]);

    $response = $this->actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name,
        'email' => $user->email,
        'remove_avatar' => true,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('profile.edit'));

    expect($user->fresh()->avatar)->toBeNull();
});
