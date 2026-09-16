<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('admin can visit the user management page', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('users.index'));

    $response->assertOk();
});

test('teknisi cannot visit the user management page', function () {
    $teknisi = User::factory()->teknisi()->create();

    $response = $this->actingAs($teknisi)->get(route('users.index'));

    $response->assertForbidden();
});

test('admin can create a new user with teknisi role', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'Budi Teknisi',
        'email' => 'budi.teknisi@example.com',
        'role' => 'teknisi',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('users', [
        'name' => 'Budi Teknisi',
        'email' => 'budi.teknisi@example.com',
        'role' => 'teknisi',
    ]);
});

test('admin can create a new user with admin role and avatar', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();
    $avatar = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'Admin Baru',
        'email' => 'admin.baru@example.com',
        'role' => 'admin',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'avatar' => $avatar,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $newUser = User::where('email', 'admin.baru@example.com')->first();
    expect($newUser)->not->toBeNull();
    expect($newUser->role)->toBe('admin');
    expect($newUser->avatar)->not->toBeNull();
});

test('teknisi cannot create a new user', function () {
    $teknisi = User::factory()->teknisi()->create();

    $response = $this->actingAs($teknisi)->post(route('users.store'), [
        'name' => 'Unauthorized User',
        'email' => 'unauthorized@example.com',
        'role' => 'teknisi',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('users', [
        'email' => 'unauthorized@example.com',
    ]);
});

test('admin can update a user', function () {
    $admin = User::factory()->admin()->create();
    $targetUser = User::factory()->teknisi()->create([
        'name' => 'Old Name',
    ]);

    $response = $this->actingAs($admin)->put(route('users.update', $targetUser), [
        'name' => 'New Name',
        'email' => $targetUser->email,
        'role' => 'teknisi',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    expect($targetUser->fresh()->name)->toBe('New Name');
});

test('admin cannot demote the last admin to teknisi', function () {
    // Only 1 admin in the system
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->put(route('users.update', $admin), [
        'name' => $admin->name,
        'email' => $admin->email,
        'role' => 'teknisi',
    ]);

    $response->assertSessionHasErrors(['role']);
    expect($admin->fresh()->role)->toBe('admin');
});

test('admin can delete another user', function () {
    $admin = User::factory()->admin()->create();
    $targetUser = User::factory()->teknisi()->create();

    $response = $this->actingAs($admin)->delete(route('users.destroy', $targetUser));

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseMissing('users', [
        'id' => $targetUser->id,
    ]);
});

test('admin cannot delete own account via user management', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->delete(route('users.destroy', $admin));

    $response->assertSessionHasErrors(['delete']);
    $this->assertDatabaseHas('users', [
        'id' => $admin->id,
    ]);
});

test('admin cannot delete the last remaining admin', function () {
    $admin = User::factory()->admin()->create();
    $targetAdmin = $admin; // last admin

    $response = $this->actingAs($admin)->delete(route('users.destroy', $targetAdmin));

    $response->assertSessionHasErrors(['delete']);
    $this->assertDatabaseHas('users', [
        'id' => $admin->id,
    ]);
});
