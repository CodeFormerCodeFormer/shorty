<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ShortUrlController;
use App\Models\ShortUrl;
use App\Models\ShortUrlVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/short-urls', [ShortUrlController::class, 'index'])->name('short-urls.index');
    Route::get('/short-urls/create', fn() => Inertia::render('short-urls/create'))->name('short-urls.create');
    Route::post('/short-urls', [ShortUrlController::class, 'store'])->name('short-urls.store');
    Route::get('/short-urls/{id}', [ShortUrlController::class, 'show'])->name('short-urls.show');
    Route::get('/short-urls/{id}/country-clicks', [ShortUrlController::class, 'countryClicks'])->name('short-urls.country-clicks');
    Route::delete('/short-urls/{id}', [ShortUrlController::class, 'destroy'])->name('short-urls.destroy');
    Route::patch('/short-urls/{id}/toggle-active', [App\Http\Controllers\ShortUrlController::class, 'toggleActive'])
        ->middleware(['auth', 'verified'])
        ->name('short-urls.toggle-active');
});

Route::get('/j/{short_code}', function (Request $request, $short_code) {
    $shortUrl = ShortUrl::where('short_code', $short_code)->firstOrFail();

    // Bloqueia se estiver inativo
    if (!$shortUrl->active) {
        abort(410, 'Este link está inativo.');
    }

    // Limite de acessos
    if ($shortUrl->max_visits && $shortUrl->visit_count >= $shortUrl->max_visits) {
        abort(410, 'Limite de acessos atingido.');
    }
    // Expiração
    if ($shortUrl->expires_at && now()->greaterThan($shortUrl->expires_at)) {
        abort(410, 'URL expirada.');
    }

    // Coleta dados do acesso
    $ip = $request->ip();
    $userAgent = $request->userAgent();
    $referer = $request->headers->get('referer');
    $country = null;
    try {
        $geo = Http::get("https://ipapi.co/{$ip}/json/");
        if ($geo->ok()) {
            $json = $geo->json();
            $country = $json['country_name'] ?? null;
        }
    } catch (\Exception $e) {
    }

    // Registra acesso
    DB::transaction(function () use ($shortUrl, $ip, $country, $userAgent, $referer) {
        $shortUrl->increment('visit_count');
        ShortUrlVisit::create([
            'short_url_id' => $shortUrl->id,
            'ip_address' => $ip,
            'country' => $country,
            'user_agent' => $userAgent,
            'referer' => $referer,
            'visited_at' => now(),
        ]);
    });

    // Se for bot/crawler, retorna HTML com meta tags para preview
    $ua = strtolower($userAgent ?? '');
    if (preg_match('/bot|crawl|slack|whatsapp|discord|twitter|facebook|telegram|skype|preview|meta|spider/', $ua)) {
        return response()->view('short-url-preview', [
            'title' => $shortUrl->title,
            'original_url' => $shortUrl->original_url,
        ]);
    }

    // Redireciona usuário
    return redirect()->away($shortUrl->original_url);
})->name('short-urls.redirect');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
