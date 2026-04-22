<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    // Kolom yang diizinkan untuk diisi secara massal
    protected $fillable = [
        'user_id', 'name', 'color'
    ];

    // Relasi ke User (setiap mata kuliah dimiliki oleh satu user)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Task (satu mata kuliah bisa memiliki banyak tugas)
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}