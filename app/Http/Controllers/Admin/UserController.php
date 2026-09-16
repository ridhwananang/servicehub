<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\HandlesAvatarUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use HandlesAvatarUpload;

    /**
     * Display a listing of users with search, filtering, and stats.
     */
    public function index(Request $request): Response
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            if ($role !== 'semua') {
                $query->where('role', $role);
            }
        }

        $users = $query->orderBy('id', 'desc')->get();

        $allUsers = User::all();
        $stats = [
            'total' => $allUsers->count(),
            'admin_count' => $allUsers->where('role', 'admin')->count(),
            'teknisi_count' => $allUsers->where('role', 'teknisi')->count(),
        ];

        return Inertia::render('users/index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'role' => $request->input('role', 'semua'),
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $avatarUrl = null;
        if ($request->hasFile('avatar')) {
            $avatarUrl = $this->uploadAvatar($request->file('avatar'));
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'] ?? 'teknisi',
            'avatar' => $avatarUrl,
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $roleLabel = $user->role === 'admin' ? 'Admin' : 'Teknisi';

        return redirect()->back()->with('success', "Pengguna '{$user->name}' berhasil ditambahkan sebagai {$roleLabel}.");
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        // Prevent demoting the last admin to teknisi
        if ($user->role === 'admin' && $validated['role'] === 'teknisi') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return redirect()->back()->withErrors([
                    'role' => 'Tidak dapat mengubah role admin ini karena sistem membutuhkan minimal satu akun Administrator.',
                ]);
            }
        }

        if ($request->boolean('remove_avatar')) {
            $this->deleteAvatar($user->avatar);
            $user->avatar = null;
        } elseif ($request->hasFile('avatar')) {
            $this->deleteAvatar($user->avatar);
            $user->avatar = $this->uploadAvatar($request->file('avatar'));
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->back()->with('success', "Data pengguna '{$user->name}' berhasil diperbarui.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Prevent deleting own account
        if ($request->user()->id === $user->id) {
            return redirect()->back()->withErrors([
                'delete' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ]);
        }

        // Prevent deleting the last admin
        if ($user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return redirect()->back()->withErrors([
                    'delete' => 'Tidak dapat menghapus admin terakhir. Sistem membutuhkan minimal satu Administrator.',
                ]);
            }
        }

        $this->deleteAvatar($user->avatar);
        $userName = $user->name;
        $user->delete();

        return redirect()->back()->with('success', "Pengguna '{$userName}' berhasil dihapus.");
    }
}
