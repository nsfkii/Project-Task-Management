<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    // Menampilkan semua task milik user yang sedang login
    public function index(Request $request)
    {
        $query = Task::where('user_id', Auth::id());

        // Fitur Filter (Berdasarkan status / prioritas)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Fitur Search Realtime (Berdasarkan judul atau subject)
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%") // ilike untuk PostgreSQL
                  ->orWhere('subject', 'ilike', "%{$search}%");
            });
        }

        // --- TAMBAHAN BARU UNTUK KALENDER ---
        if ($request->has('all')) {
            return response()->json($query->orderBy('deadline', 'asc')->get());
        }

        // 1. Hitung Statistik DULU sebelum data dipotong (paginate)
        $stats = [
            'total' => $query->count(),
            'done' => (clone $query)->where('status', 'done')->count(),
            'progress' => (clone $query)->where('status', 'progress')->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
        ];

        // 2. Ambil data dengan Pagination (5 data per halaman)
        $tasks = $query->orderBy('deadline', 'asc')->paginate(5);

        // Kembalikan keduanya
        return response()->json([
            'stats' => $stats,
            'tasks' => $tasks
        ]);

        // Urutkan dari deadline terdekat
        $tasks = $query->orderBy('deadline', 'asc')->get();

        return response()->json($tasks);
    }

    // Menambah task baru
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'priority' => 'required|in:low,medium,high',
            'status' => 'nullable|in:pending,progress,done',
            'source_url' => 'nullable|string',
        ]);

        $task = Task::create([
            'user_id' => Auth::id(), // Otomatis ambil ID user yang login
            'title' => $request->title,
            'subject' => $request->subject,
            'description' => $request->description,
            'deadline' => $request->deadline,
            'priority' => $request->priority,
            'status' => $request->status ?? 'pending',
            'source_url' => 'nullable|string',
        ]);

        return response()->json(['message' => 'Task berhasil ditambahkan', 'data' => $task], 201);
    }

    // Melihat detail 1 task
    public function show($id)
    {
        $task = Task::where('user_id', Auth::id())->find($id);

        if (!$task) {
            return response()->json(['message' => 'Task tidak ditemukan'], 404);
        }

        return response()->json($task);
    }

    // Mengubah data task
    public function update(Request $request, $id)
    {
        $task = Task::where('user_id', Auth::id())->find($id);

        if (!$task) {
            return response()->json(['message' => 'Task tidak ditemukan'], 404);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'subject' => 'sometimes|required|string|max:255',
            'deadline' => 'sometimes|required|date',
            'priority' => 'sometimes|required|in:low,medium,high',
            'status' => 'sometimes|required|in:pending,progress,done',
            'source_url' => 'nullable|string',
        ]);

        $task->update($request->all());

        return response()->json(['message' => 'Task berhasil diupdate', 'data' => $task]);
    }

    // Menghapus task
    public function destroy($id)
    {
        $task = Task::where('user_id', Auth::id())->find($id);

        if (!$task) {
            return response()->json(['message' => 'Task tidak ditemukan'], 404);
        }

        $task->delete();

        return response()->json(['message' => 'Task berhasil dihapus']);
    }
}