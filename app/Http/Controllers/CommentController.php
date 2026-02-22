<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Space;
use App\Models\Task;
use App\Models\User;
use App\Notifications\GeneralNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    /**
     * Display a listing of comments for a task.
     */
    public function index(Request $request, Space $space, Task $task)
    {
        if (! $request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        return response()->json($task->comments()->with('user')->get());
    }

    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request, Space $space, Task $task)
    {
        if (! $request->user()->hasSpaceAccess($space->id)) {
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

            $task->load(['assignees', 'creator', 'space']);
            $notifiedIds = [$request->user()->id];

            // Handle @mention notifications first (more specific, takes priority)
            preg_match_all('/@([\w\s]+?)(?=\s|$)/', $request->content, $matches);

            if (! empty($matches[1])) {
                $mentionedNames = array_map('trim', $matches[1]);
                $mentionedUsers = User::whereIn('name', $mentionedNames)->get();

                foreach ($mentionedUsers as $user) {
                    if (! in_array($user->id, $notifiedIds)) {
                        $user->notify(new GeneralNotification(
                            'You were mentioned',
                            "{$request->user()->name} mentioned you in a comment on: {$task->title}",
                            "/spaces/{$task->space->slug}/tasks",
                            'task_mention',
                            ['task_id' => $task->id, 'comment_id' => $comment->id]
                        ));
                        $notifiedIds[] = $user->id;
                    }
                }
            }

            // Notify remaining involved parties (assignees + creator) about the new comment
            $commentNotification = new GeneralNotification(
                'New Comment on Task',
                "{$request->user()->name} commented on: {$task->title}",
                "/spaces/{$task->space->slug}/tasks",
                'task_comment',
                ['task_id' => $task->id, 'comment_id' => $comment->id]
            );

            foreach ($task->assignees as $assignee) {
                if (! in_array($assignee->id, $notifiedIds)) {
                    $assignee->notify($commentNotification);
                    $notifiedIds[] = $assignee->id;
                }
            }

            if ($task->creator && ! in_array($task->created_by, $notifiedIds)) {
                $task->creator->notify($commentNotification);
            }

            return $comment;
        });

        return response()->json($comment->load('user'));
    }
}
