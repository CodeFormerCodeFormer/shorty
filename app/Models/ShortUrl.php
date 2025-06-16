<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShortUrl extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'original_url',
        'short_code',
        'expires_at',
        'max_visits',
        'visit_count',
    ];

    protected $dates = [
        'expires_at',
    ];
}
