<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class TaskService extends BaseService
{
    protected string $model = Task::class;

    public function __construct(
        protected ActivityService $activityService
    ) {}

    /**
     * Search and filter tasks within a space.
     */
    public function getTasksForSpace(int $spaceId, array $filters = []): LengthAwarePaginator
    {
        $query = Task::where('space_id', $spaceId)
            ->with(['status', 'assignees', 'creator', 'space', 'project'])
            ->orderBy('order')
            ->orderBy('created_at', 'desc');

        $this->applyFilters($query, $filters);

        return $query->paginate($filters['per_page'] ?? 50);
    }

    /**
     * Get all tasks assigned to a specific user across all spaces.
     */
    public function getGlobalTasksForUser(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Task::where(function ($q) use ($userId) {
            $q->where('assigned_to', $userId)
                ->orWhereHas('assignees', fn ($sq) => $sq->where('user_id', $userId));
        })
            ->with(['status', 'assignees', 'creator', 'space'])
            ->orderBy('due_date', 'asc')
            ->orderBy('priority', 'desc');

        $this->applyFilters($query, $filters);

        return $query->paginate($filters['per_page'] ?? 50);
    }

    /**
     * Apply filters to the task query.
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (! empty($filters['status_id'])) {
            $query->where('status_id', $filters['status_id']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (! empty($filters['assigned_to'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('assigned_to', $filters['assigned_to'])
                    ->orWhereHas('assignees', fn ($sq) => $sq->where('user_id', $filters['assigned_to']));
            });
        }

        if (isset($filters['is_overdue']) && $filters['is_overdue']) {
            $query->overdue();
        }

        if (! empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
    }

    /**
     * Create a new task with creator.
     */
    public function createWithCreator(array $data, User $creator): Task
    {
        $assigneeIds = $data['assignee_ids'] ?? [];
        unset($data['assignee_ids']);

        /** @var Task $task */
        $task = $this->create([
            ...$data,
            'created_by' => $creator->id,
            'assigned_to' => $assigneeIds[0] ?? null, // Sync first one to legacy column
        ]);

        if (! empty($assigneeIds)) {
            $task->assignees()->sync($assigneeIds);
        }

        $this->activityService->log(
            $creator,
            "created task: {$task->title}",
            $task->space_id,
            $task->id,
            ['action' => 'created']
        );

        return $task;
    }

    /**
     * Update an existing task.
     */
    public function update(Model $model, array $data): bool
    {
        /** @var Task $model */
        $oldStatus = $model->status->name ?? 'Unknown';

        $assigneeIds = $data['assignee_ids'] ?? null;
        if (isset($data['assignee_ids'])) {
            unset($data['assignee_ids']);
            $data['assigned_to'] = $assigneeIds[0] ?? null; // Sync first one to legacy
        }

        $result = parent::update($model, $data);

        if ($result) {
            if ($assigneeIds !== null) {
                $model->assignees()->sync($assigneeIds);
            }

            if (isset($data['status_id'])) {
                $model->refresh();
                $this->activityService->log(
                    auth()->user(),
                    "changed status of '{$model->title}' from {$oldStatus} to {$model->status->name}",
                    $model->space_id,
                    $model->id,
                    ['action' => 'status_change', 'old_status' => $oldStatus, 'new_status' => $model->status->name]
                );
            }
        }

        return $result;
    }
}
