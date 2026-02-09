<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Http\Requests\SendMessageRequest;
use App\Models\Message;
use App\Models\Space;
use App\Models\Task;
use App\Models\User;
use App\Notifications\GeneralNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Get message history for a space or task.
     */
    public function index(Request $request)
    {
        $request->validate([
            'space_id' => ['nullable', 'exists:spaces,id'],
            'task_id' => ['nullable', 'exists:tasks,id'],
        ]);

        $query = Message::with(['user', 'mentions.user'])
            ->orderBy('created_at', 'desc');

        if ($request->task_id) {
            $query->where('task_id', $request->task_id);
        } else {
            $query->where('space_id', $request->space_id)->whereNull('task_id');
        }

        return response()->json(
            $query->paginate(50)->through(function ($message) {
                return $message;
            })
        );
    }

    /**
     * Send a new message.
     */
    public function store(SendMessageRequest $request)
    {
        $message = DB::transaction(function () use ($request) {
            $message = Message::create([
                ...$request->validated(),
                'user_id' => $request->user()->id,
            ]);

            // Simple Mention Extraction: @[Name](user_id)
            preg_match_all('/@\[([^\]]+)\]\((\d+)\)/', $message->content, $matches);
            
            if (!empty($matches[2])) {
                foreach (array_unique($matches[2]) as $userId) {
                    $message->mentions()->create(['user_id' => $userId]);
                    
                    if ($userId != $message->user_id) {
                        $mentionedUser = User::find($userId);
                        $mentionedUser->notify(new GeneralNotification(
                            "New Mention",
                            "{$message->user->name} mentioned you in chat: " . substr($message->content, 0, 50) . "...",
                            $message->task_id ? "/spaces/{$message->space->slug}/tasks" : "/spaces/{$message->space->slug}/tasks",
                            'mention',
                            ['message_id' => $message->id]
                        ));
                    }
                }
            }

            return $message;
        });

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message->load(['user', 'mentions.user']));
    }

    /**
     * Broadcast typing event.
     */
    public function typing(Request $request)
    {
        $request->validate([
            'target_id' => ['required', 'integer'],
            'type' => ['required', 'in:space,task'],
        ]);

        broadcast(new UserTyping(
            $request->user(),
            $request->target_id,
            $request->type
        ))->toOthers();

        return response()->json(['status' => 'ok']);
    }
}
