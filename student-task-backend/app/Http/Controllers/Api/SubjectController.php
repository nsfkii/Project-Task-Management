<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::where('user_id', Auth::id())->get();
        return SubjectResource::collection($subjects);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:subjects,name,NULL,id,user_id,' . Auth::id(),
            'color' => 'nullable|string|max:7',
        ]);

        $subject = Subject::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'color' => $request->color ?? '#' . substr(md5($request->name), 0, 6),
        ]);

        return response()->json(['message' => 'Mata kuliah berhasil ditambahkan', 'data' => new SubjectResource($subject)], 201);
    }
}