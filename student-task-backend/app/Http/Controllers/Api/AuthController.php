<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // 1. REGISTER
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // theme otomatis 'light' dari database default
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Register berhasil',
            'access_token' => $token,
            'user' => $user
        ], 201);
    }

    // 2. LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'user' => $user
        ]);
    }

    // 3. UPDATE PROFILE (LENGKAP)
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email,'.$user->id,
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'nim' => 'nullable|string|max:20',
            'program_studi' => 'nullable|string|max:255',
            'semester' => 'nullable|integer|min:1|max:14',
            'ipk' => 'nullable|numeric|min:0|max:4',
            'bio' => 'nullable|string',
            'github' => 'nullable|url',
            'linkedin' => 'nullable|url',
            'instagram' => 'nullable|url',
            'website' => 'nullable|url',
        ]);

        // Update basic info
        $user->name = $request->name;
        $user->email = $request->email;
        
        // Update profile fields
        $user->nim = $request->nim;
        $user->program_studi = $request->program_studi;
        $user->semester = $request->semester ?? $user->semester ?? 1;
        $user->ipk = $request->ipk ?? $user->ipk ?? 0;
        $user->bio = $request->bio;
        $user->github = $request->github;
        $user->linkedin = $request->linkedin;
        $user->instagram = $request->instagram;
        $user->website = $request->website;

        // Upload avatar if exists
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $user
        ]);
    }

    // 4. GET USER (PROFILE)
    public function getUser(Request $request)
    {
        return response()->json($request->user());
    }

    // 5. LOGOUT
    public function logout(Request $request)
    {
        // Menghapus token yang sedang digunakan
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}