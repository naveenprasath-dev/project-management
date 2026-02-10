<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Comment;
use App\Models\Space;
use App\Models\Task;
use App\Models\User;
use App\Notifications\GeneralNotification;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    /**
     * Display a listing of comments for a task.
     */
    public function index(Request $request, Space $space, Task $task)
    {
        if (!$request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        return response()->json($task->comments()->with('user')->get());
    }

    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request, Space $space, Task $task)
    {
        if (!$request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        $comment = DB::transaction(function () use ($request, $task) {
            $comment = $task->comments()->create([
                'user_id' => $request->user()->id,
                'content' => $request->content,
            ]);

            // Simple mention parsing for notifications
            // Logic: find "@[Name]" or "@Name"
            preg_match_all('/@([\w\s]+?)(?=\s|$)/', $request->content, $matches);
            
            if (!empty($matches[1])) {
                $mentionedNames = array_map('trim', $matches[1]);
                $users = User::whereIn('name', $mentionedNames)->get();

                foreach ($users as $user) {
                    if ($user->id !== $request->user()->id) {
                        $user->notify(new GeneralNotification(
                            "You were mentioned",
                            "{$request->user()->name} mentioned you in a comment on: {$task->title}",
                            "/spaces/{$task->space->slug}/tasks",
                            'task_mention',
                            ['task_id' => $task->id, 'comment_id' => $comment->id]
                        ));
                    }
                }
            }

            return $comment;
        });

        return response()->json($comment->load('user'));
    }
}
