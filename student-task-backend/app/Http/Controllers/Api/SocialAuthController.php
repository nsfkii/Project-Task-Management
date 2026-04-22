<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Exception;

class SocialAuthController extends Controller
{
    // 1. Endpoint untuk redirect ke Google
    public function redirectToGoogle()
    {
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl(),
        ]);
    }

    // 2. Endpoint callback dari Google
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Register jika belum punya akun
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => bcrypt(Str::random(16)),
                    'email_verified_at' => now(),
                ]);
            }

            Auth::login($user);
            $token = $user->createToken('auth-token')->plainTextToken;

            return redirect()->away(env('FRONTEND_URL') . '/auth/callback?token=' . $token . '&user=' . urlencode($user->toJson()));

        } catch (Exception $e) {
            return redirect()->away(env('FRONTEND_URL') . '/login?error=Unable to login, try again.');
        }
    }
}