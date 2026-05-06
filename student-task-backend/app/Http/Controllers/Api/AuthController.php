<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

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
            'data' => [
                'user' => $user,
            ],
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
            'message' => 'Register berhasil',
            'access_token' => $token,
            'user' => $user, 
        ], 201);
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
            if ($user->avatar) {
                \Storage::disk('public')->delete($user->avatar);
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data' => [
                'user' => $user,
            ],
        ]);
    }

    // 4. GET USER (PROFILE)
    public function getUser(Request $request)
    {
        return response()->json([
            'data' => $request->user(),
        ]);
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

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Jika email terdaftar, OTP sudah dikirim.',
            ]);
        }

        $otp = (string) random_int(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($otp),
                'created_at' => now(),
            ]
        );

        Mail::raw("Kode OTP reset password Anda: {$otp}. Berlaku 10 menit.", function ($message) use ($user) {
            $message->to($user->email)->subject('OTP Reset Password StudentTask');
        });

        return response()->json([
            'message' => 'Jika email terdaftar, OTP sudah dikirim.',
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();
        if (!$record) {
            throw ValidationException::withMessages(['otp' => 'OTP tidak valid.']);
        }

        if (now()->diffInMinutes($record->created_at) > 10) {
            throw ValidationException::withMessages(['otp' => 'OTP sudah kedaluwarsa.']);
        }

        if (!Hash::check($request->otp, $record->token)) {
            throw ValidationException::withMessages(['otp' => 'OTP tidak valid.']);
        }

        $resetToken = Str::random(64);
        DB::table('password_reset_tokens')->where('email', $request->email)->update([
            'token' => Hash::make($resetToken),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'OTP valid.',
            'data' => [
                'reset_token' => $resetToken,
            ],
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'reset_token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();
        if (!$record || !Hash::check($request->reset_token, $record->token)) {
            throw ValidationException::withMessages(['reset_token' => 'Token reset tidak valid.']);
        }

        if (now()->diffInMinutes($record->created_at) > 10) {
            throw ValidationException::withMessages(['reset_token' => 'Token reset sudah kedaluwarsa.']);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password berhasil direset.',
        ]);
    }
}