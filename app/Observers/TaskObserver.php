<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        $this->logActivity($task, 'created');
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        $trackedFields = ['status_id', 'priority', 'title', 'description', 'due_date'];

        foreach ($trackedFields as $field) {
            if ($task->isDirty($field)) {
                $oldValue = $task->getOriginal($field);
                $newValue = $task->$field;

                // For status_id, we might want to log the status names instead of IDs in metadata for easier display
                $metadata = [];
                if ($field === 'status_id') {
                    $metadata['old_status'] = \App\Models\TaskStatus::find($oldValue)?->name;
                    $metadata['new_status'] = \App\Models\TaskStatus::find($newValue)?->name;
                }

                $this->logActivity($task, 'updated', $field, $oldValue, $newValue, $metadata);
            }
        }
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        $this->logActivity($task, 'deleted');
    }

    /**
     * Helper to log activity.
     */
    protected function logActivity(Task $task, string $type, ?string $field = null, $oldValue = null, $newValue = null, array $metadata = []): void
    {
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'type' => $type,
            'field' => $field,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'metadata' => $metadata,
        ]);
    }
}
