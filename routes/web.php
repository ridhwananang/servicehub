<?php

use App\Http\Controllers\ServiceTicketController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [ServiceTicketController::class, 'index'])->name('dashboard');
    Route::post('tickets', [ServiceTicketController::class, 'store'])->name('tickets.store');
    Route::put('tickets/{ticket}', [ServiceTicketController::class, 'update'])->name('tickets.update');
    Route::delete('tickets/{ticket}', [ServiceTicketController::class, 'destroy'])->name('tickets.destroy');
    Route::get('tickets/export', [ServiceTicketController::class, 'exportXlsx'])->name('tickets.export');
});

require __DIR__.'/settings.php';
