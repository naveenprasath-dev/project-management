<?php

namespace App\Http\Controllers;

use App\Services\TaskService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyWorkController extends Controller
{
    public function __construct(
        protected TaskService $taskService
    ) {}

    /**
     * Display all tasks assigned to the authenticated user.
     */
    public function tasks(Request $request): Response
    {
        $tasks = $this->taskService->getGlobalTasksForUser(
            $request->user()->id,
            $request->all()
        );

        // Get all unique statuses from the user's tasks
        $statusIds = $tasks->pluck('status_id')->unique();
        $statuses = \App\Models\TaskStatus::whereIn('id', $statusIds)->get();

        $spaces = $request->user()->spaces()
            ->with(['members', 'statuses', 'projects' => function ($q) {
                $q->where('is_archived', false)->with('sprints');
            }])
            ->get();

        return Inertia::render('my-work/tasks', [
            'tasks' => $tasks,
            'statuses' => $statuses,
            'spaces' => $spaces,
            'filters' => $request->only(['search', 'status_id', 'priority']),
        ]);
    }

    /**
     * Display a calendar view of tasks.
     */
    public function calendar(Request $request): Response
    {
        // For calendar, we might want a larger set of tasks or a specific date range
        $tasks = $this->taskService->getGlobalTasksForUser(
            $request->user()->id,
            array_merge($request->all(), ['per_page' => 1000]) // Get more for calendar
        );

        // Fetch user's spaces with necessary details for TaskModal
        $spaces = $request->user()->spaces()
            ->with(['members', 'statuses', 'projects' => function ($q) {
                $q->where('is_archived', false)->with('sprints');
            }])
            ->get();

        return Inertia::render('my-work/calendar', [
            'tasks' => $tasks->items(),
            'spaces' => $spaces,
        ]);
    }
}
