<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizationLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrganizationLinkController extends Controller
{
    public function index()
    {
        $links = OrganizationLink::where('user_id', Auth::id())
            ->orderBy('order')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $links
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:255',
        ]);

        $link = OrganizationLink::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'url' => $request->url,
            'order' => 0,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Link berhasil ditambahkan',
            'data' => $link
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $link = OrganizationLink::where('user_id', Auth::id())->find($id);

        if (!$link) {
            return response()->json(['message' => 'Link tidak ditemukan'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'url' => 'sometimes|url|max:255',
        ]);

        $link->update($request->only(['name', 'url']));

        return response()->json([
            'success' => true,
            'message' => 'Link berhasil diperbarui',
            'data' => $link
        ]);
    }

    public function destroy($id)
    {
        $link = OrganizationLink::where('user_id', Auth::id())->find($id);

        if (!$link) {
            return response()->json(['message' => 'Link tidak ditemukan'], 404);
        }

        $link->delete();

        return response()->json([
            'success' => true,
            'message' => 'Link berhasil dihapus'
        ]);
    }
}