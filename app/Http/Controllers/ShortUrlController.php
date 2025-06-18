<?php

namespace App\Http\Controllers;

use App\Models\ShortUrl;
use App\Models\ShortUrlVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

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
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'asc');
        $allowedSorts = ['id', 'title', 'original_url', 'short_code', 'expires_at', 'visit_count', 'max_visits'];
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'id';
        }
        if (!in_array($direction, ['asc', 'desc'])) {
            $direction = 'asc';
        }
        $shortUrls = $query->orderBy($sort, $direction)->paginate($perPage)->withQueryString();

        return Inertia::render('short-urls/index', [
            'shortUrls' => $shortUrls,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'sort' => $sort,
            'direction' => $direction,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'original_url' => 'required|url|max:2048',
            'title' => 'required|string|max:255',
            'short_code' => [
                'nullable',
                'alpha_dash',
                'min:3',
                'max:32',
                // Use extracted method for validation
                fn($attribute, $value, $fail) => $this->validateShortCodeReuse($value, $fail),
            ],
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

    public function show($id)
    {
        $shortUrl = ShortUrl::where('user_id', auth()->id())->findOrFail($id);
        $visits = ShortUrlVisit::where('short_url_id', $shortUrl->id)
            ->orderByDesc('visited_at')
            ->get();
        // Gráfico: cliques por dia nos últimos 7 dias
        $start = Carbon::now()->subDays(6)->startOfDay();
        $end = Carbon::now()->endOfDay();
        $clicksByDay = ShortUrlVisit::where('short_url_id', $shortUrl->id)
            ->whereBetween('visited_at', [$start, $end])
            ->get()
            ->groupBy(fn($v) => Carbon::parse($v->visited_at)->format('Y-m-d'));
        $chart = [];
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $key = $date->format('Y-m-d');
            $chart[] = [
                'date' => $key,
                'count' => isset($clicksByDay[$key]) ? count($clicksByDay[$key]) : 0,
            ];
        }
        return response()->json([
            'shortUrl' => $shortUrl,
            'visits' => $visits,
            'chart' => $chart,
        ]);
    }

    public function countryClicks($id)
    {
        $shortUrl = ShortUrl::where('user_id', auth()->id())->findOrFail($id);
        $visits = ShortUrlVisit::where('short_url_id', $shortUrl->id)
            ->whereNotNull('country')
            ->get();
        $byCountry = $visits->groupBy('country')->map(fn($v) => count($v));
        return response()->json($byCountry);
    }

    public function destroy($id)
    {
        $shortUrl = ShortUrl::where('user_id', auth()->id())->findOrFail($id);
        $shortUrl->delete();
        return response()->noContent();
    }

    /**
     * Validates if a short code can be reused according to the 1-year rule.
     */
    private function validateShortCodeReuse($value, $fail)
    {
        if ($value) {
            $existing = ShortUrl::withTrashed()
                ->where('short_code', $value)
                ->orderByDesc('deleted_at')
                ->first();
            if ($existing) {
                if (is_null($existing->deleted_at)) {
                    $fail('This short code has already been used and cannot be reused.');
                } else {
                    $deletedAt = Carbon::parse($existing->deleted_at);
                    if ($deletedAt->gt(now()->subYear())) {
                        $fail('This short code was deleted less than 1 year ago and cannot be reused yet.');
                    }
                }
            }
        }
    }
}
