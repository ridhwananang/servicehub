<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ScanDocumentController;
use App\Http\Controllers\ServiceTicketController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [ServiceTicketController::class, 'index'])->name('dashboard');
    Route::post('tickets', [ServiceTicketController::class, 'store'])->name('tickets.store');
    Route::post('tickets/scan-document', [ScanDocumentController::class, 'scan'])->name('tickets.scan-document')->middleware('throttle:30,1');
    Route::put('tickets/{ticket}', [ServiceTicketController::class, 'update'])->name('tickets.update');
    Route::patch('tickets/{ticket}/toggle-status', [ServiceTicketController::class, 'toggleWorkStatus'])->name('tickets.toggle-status');
    Route::delete('tickets/{ticket}', [ServiceTicketController::class, 'destroy'])->name('tickets.destroy');
    Route::get('tickets/export', [ServiceTicketController::class, 'exportXlsx'])->name('tickets.export');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

require __DIR__.'/settings.php';

