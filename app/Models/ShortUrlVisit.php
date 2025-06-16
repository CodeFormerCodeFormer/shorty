<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShortUrlVisit extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'short_url_id',
        'ip_address',
        'country',
        'user_agent',
        'referer',
        'visited_at',
    ];
}
