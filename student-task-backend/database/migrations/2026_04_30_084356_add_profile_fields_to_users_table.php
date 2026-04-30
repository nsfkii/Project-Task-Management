<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Profil Mahasiswa (setelah kolom email)
            $table->string('nim')->nullable()->after('email');
            $table->string('program_studi')->nullable()->after('nim');
            $table->integer('semester')->default(1)->after('program_studi');
            $table->decimal('ipk', 3, 2)->default(0)->after('semester');
            $table->text('bio')->nullable()->after('ipk');
            
            // Social Media Links
            $table->string('github')->nullable()->after('bio');
            $table->string('linkedin')->nullable()->after('github');
            $table->string('instagram')->nullable()->after('linkedin');
            $table->string('website')->nullable()->after('instagram');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'nim', 'program_studi', 'semester', 'ipk', 'bio',
                'github', 'linkedin', 'instagram', 'website'
            ]);
        });
    }
};