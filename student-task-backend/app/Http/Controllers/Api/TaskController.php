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
        $query = Task::with('subject')->where('user_id', Auth::id());

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhereHas('subject', function($sq) use ($search) {
                      $sq->where('name', 'ilike', "%{$search}%");
                  });
            });
        }

        if ($request->has('all')) {
            return response()->json($query->orderBy('deadline', 'asc')->get());
        }

        $stats = [
            'total' => $query->count(),
            'done' => (clone $query)->where('status', 'done')->count(),
            'progress' => (clone $query)->where('status', 'progress')->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
        ];

        $tasks = $query->orderBy('deadline', 'asc')->paginate(5);

        return response()->json(['stats' => $stats, 'tasks' => $tasks]);
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
        return response()->json($task);
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