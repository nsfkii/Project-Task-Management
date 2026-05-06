<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Task::with('subject')->where('user_id', Auth::id());

        if ($request->has('status')) {
            $baseQuery->where('status', $request->status);
        }
        if ($request->has('priority')) {
            $baseQuery->where('priority', $request->priority);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $baseQuery->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('subject', function($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'done' => (clone $baseQuery)->where('status', 'done')->count(),
            'progress' => (clone $baseQuery)->where('status', 'progress')->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
        ];

        if ($request->boolean('all')) {
            return response()->json([
                'data' => [
                    'tasks' => (clone $baseQuery)->orderBy('deadline', 'asc')->get(),
                    'stats' => $stats,
                ],
            ]);
        }

        $tasks = (clone $baseQuery)->orderBy('deadline', 'asc')->paginate(6);

        return response()->json([
            'data' => [
                'tasks' => $tasks,
                'stats' => $stats,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subject_id' => 'required|exists:subjects,id',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'priority' => 'required|in:low,medium,high',
            'status' => 'nullable|in:pending,progress,done',
            'source_url' => 'nullable|url',
        ]);

        $task = Task::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'subject_id' => $request->subject_id,
            'description' => $request->description,
            'deadline' => $request->deadline,
            'priority' => $request->priority,
            'status' => $request->status ?? 'pending',
            'source_url' => $request->source_url,
        ]);

        return response()->json(['message' => 'Task berhasil ditambahkan', 'data' => $task->load('subject')], 201);
    }

    public function show($id)
    {
        $task = Task::with('subject')->where('user_id', Auth::id())->find($id);
        if (!$task) return response()->json(['message' => 'Task tidak ditemukan'], 404);
        return response()->json(['data' => $task]);
    }

    public function update(Request $request, $id)
    {
        $task = Task::where('user_id', Auth::id())->find($id);
        if (!$task) return response()->json(['message' => 'Task tidak ditemukan'], 404);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'subject_id' => 'sometimes|required|exists:subjects,id',
            'deadline' => 'sometimes|required|date',
            'priority' => 'sometimes|required|in:low,medium,high',
            'status' => 'sometimes|required|in:pending,progress,done',
            'source_url' => 'nullable|url',
        ]);

        $task->update($request->only(['title', 'subject_id', 'description', 'deadline', 'priority', 'status', 'source_url']));

        return response()->json(['message' => 'Task berhasil diupdate', 'data' => $task->load('subject')]);
    }

    public function destroy($id)
    {
        $task = Task::where('user_id', Auth::id())->find($id);
        if (!$task) return response()->json(['message' => 'Task tidak ditemukan'], 404);
        $task->delete();
        return response()->json(['message' => 'Task berhasil dihapus']);
    }
}