<?php

namespace App\Http\Controllers;

use App\Http\Requests\Tasks\StoreTaskRequest;
use App\Http\Requests\Tasks\UpdateTaskRequest;
use App\Models\Space;
use App\Models\Task;
use App\Notifications\GeneralNotification;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function __construct(
        protected TaskService $taskService
    ) {}

    /**
     * List tasks for a specific space (ClickUp-style list view).
     */
    public function index(Request $request, Space $space): Response
    {
        if (! $request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        $tasks = $this->taskService->getTasksForSpace($space->id, $request->all());

        $space->load(['statuses']);
        $space->analytics = $space->getAnalytics();
        $space->projects = $space->getProjectsWithAnalytics();

        return Inertia::render('tasks/index', [
            'space' => $space,
            'tasks' => $tasks,
            'filters' => $request->only(['search', 'status_id', 'priority', 'assigned_to', 'project_id', 'type']),
            'members' => $space->members()->get(['users.id', 'users.name']),
        ]);
    }

    /**
     * Store a newly created task.
     */
    public function store(StoreTaskRequest $request, Space $space)
    {
        if (! $request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        $task = $this->taskService->createWithCreator(
            $request->validated(),
            $request->user()
        );

        // Notify assigned users
        foreach ($task->assignees as $assignee) {
            if ($assignee->id !== $request->user()->id) {
                $assignee->notify(new GeneralNotification(
                    'New Task Assigned',
                    "You have been assigned to: {$task->title}",
                    "/spaces/{$space->slug}/tasks",
                    'task_assigned',
                    ['task_id' => $task->id]
                ));
            }
        }

        if ($request->wantsJson()) {
            return response()->json($task->load(['status', 'assignees', 'parent']));
        }

        return back()->with('success', 'Task created successfully.');
    }

    /**
     * Update the specified task.
     */
    public function update(UpdateTaskRequest $request, Space $space, Task $task)
    {
        if (! $request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        $oldStatusId = $task->status_id;
        $this->taskService->update($task, $request->validated());

        // Notify if status changed
        if ($request->has('status_id') && $request->status_id != $oldStatusId) {
            $task->creator->notify(new GeneralNotification(
                'Task Status Updated',
                "Task '{$task->title}' is now '{$task->status->name}'",
                "/spaces/{$space->slug}/tasks",
                'status_changed',
                ['task_id' => $task->id]
            ));
        }

        return back()->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Request $request, Space $space, Task $task)
    {
        if (! $request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        $this->taskService->delete($task);

        return back()->with('success', 'Task deleted successfully.');
    }

    /**
     * Get activities for a specific task.
     */
    public function activities(Request $request, Space $space, Task $task)
    {
        if (! $request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        return response()->json($task->activities);
    }

    /**
     * Archive the specified task.
     */
    public function archive(Request $request, Space $space, Task $task)
    {
        if (! $request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        $task->archive();

        return back()->with('success', 'Task archived.');
    }

    /**
     * Unarchive the specified task.
     */
    public function unarchive(Request $request, Space $space, Task $task)
    {
        if (! $request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        $task->unarchive();

        return back()->with('success', 'Task unarchived.');
    }
}
