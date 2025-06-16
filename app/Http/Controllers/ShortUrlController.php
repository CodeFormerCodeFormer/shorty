<?php

namespace App\Http\Controllers;

use App\Models\ShortUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ShortUrlController extends Controller
{
    public function index(Request $request)
    {
        $query = ShortUrl::where('user_id', $request->user()->id);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('original_url', 'like', "%$search%")
                  ->orWhere('short_code', 'like', "%$search%")
                  ->orWhere('title', 'like', "%$search%")
                ;
            });
        }

        $perPage = $request->input('per_page', 10);
        $shortUrls = $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();

        return Inertia::render('short-urls/index', [
            'shortUrls' => $shortUrls,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'original_url' => 'required|url|max:2048',
            'title' => 'required|string|max:255',
            'short_code' => 'nullable|alpha_dash|min:3|max:32|unique:short_urls,short_code',
            'expires_at' => 'nullable|date',
            'max_visits' => 'nullable|integer|min:1',
        ]);

        $shortCode = $validated['short_code'] ?? Str::random(8);

        $shortUrl = ShortUrl::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'original_url' => $validated['original_url'],
            'short_code' => $shortCode,
            'expires_at' => $validated['expires_at'] ?? null,
            'max_visits' => $validated['max_visits'] ?? null,
        ]);

        return redirect()->route('short-urls.index');
    }
}
