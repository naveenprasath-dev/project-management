<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('space.{spaceId}', function ($user, $spaceId) {
    if ($user->hasSpaceAccess((int) $spaceId)) {
        return [
            'id' => $user->id,
            'name' => $user->name,
        ];
    }
});

Broadcast::channel('task.{taskId}', function ($user, $taskId) {
    $task = \App\Models\Task::find($taskId);
    if ($task && $user->hasSpaceAccess($task->space_id)) {
        return [
            'id' => $user->id,
            'name' => $user->name,
        ];
    }
});
