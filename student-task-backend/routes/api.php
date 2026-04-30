<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\OrganizationLinkController;

// Public Routes (Bisa diakses tanpa login)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Google OAuth Routes
Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

// Protected Routes (Hanya bisa diakses jika punya token / sudah login)
Route::middleware('auth:sanctum')->group(function () {
    
    // User & Profile
    Route::get('/user', [AuthController::class, 'getUser']); // Pakai method getUser
    Route::post('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Route untuk Task (CRUD)
    Route::apiResource('/tasks', TaskController::class);
    
    // Route untuk Subject (Full Resource: index, store, update, destroy)
    Route::apiResource('/subjects', SubjectController::class);
    
    // Organization Links (CRUD)
    Route::get('/organization-links', [OrganizationLinkController::class, 'index']);
    Route::post('/organization-links', [OrganizationLinkController::class, 'store']);
    Route::put('/organization-links/{id}', [OrganizationLinkController::class, 'update']);
    Route::delete('/organization-links/{id}', [OrganizationLinkController::class, 'destroy']);
});