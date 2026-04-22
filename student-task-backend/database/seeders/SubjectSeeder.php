<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            'Pemrograman Web',
            'Basis Data',
            'Sistem Informasi Manajemen',
            'Jaringan Komputer',
            'UI/UX Design',
        ];

        foreach ($subjects as $subject) {
            Subject::create([
                'user_id' => 1, // Ganti dengan ID user yang valid
                'name' => $subject,
                'color' => '#' . substr(md5($subject), 0, 6),
            ]);
        }
    }
}