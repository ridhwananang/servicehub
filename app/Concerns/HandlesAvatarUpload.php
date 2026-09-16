<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait HandlesAvatarUpload
{
    /**
     * Get the active storage disk for avatars.
     */
    protected function getAvatarDisk(): string
    {
        $default = config('filesystems.default', 'local');

        return $default === 'local' ? 'public' : $default;
    }

    /**
     * Store avatar file and return its public URL.
     */
    protected function uploadAvatar(UploadedFile $file): string
    {
        $disk = $this->getAvatarDisk();
        $path = $file->storePublicly('avatars', $disk);

        return Storage::disk($disk)->url($path);
    }

    /**
     * Delete existing avatar file from storage disk.
     */
    protected function deleteAvatar(?string $avatarUrl): void
    {
        if (empty($avatarUrl)) {
            return;
        }

        $disk = $this->getAvatarDisk();
        $baseUrl = Storage::disk($disk)->url('');
        $relative = str_replace($baseUrl, '', $avatarUrl);
        $relative = ltrim($relative, '/');

        if ($relative && Storage::disk($disk)->exists($relative)) {
            Storage::disk($disk)->delete($relative);
        }
    }
}
