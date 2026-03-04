<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // Kolom yang diizinkan untuk diisi secara massal
        protected $fillable = [
            'user_id', 'title', 'subject', 'source_url', 'description', 
            'deadline', 'priority', 'status'
        ];
    // Relasi balik ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
