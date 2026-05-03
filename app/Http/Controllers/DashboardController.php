<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\ActivityService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected ActivityService $activityService
    ) {}

    /**
     * Display the rich ClickUp-style dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Lineup: Tasks assigned to user that are due soon or overdue
        $lineup = Task::where('assigned_to', $user->id)
            ->whereIn('status_id', function ($query) {
                $query->select('id')->from('task_statuses')->whereNotIn('name', ['Done', 'Completed', 'Closed']);
            })
            ->with(['space', 'status'])
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get();

        // Recent Activity: Fetch real logs
        $recentActivity = $this->activityService->getRecentActivity($user);

        // My Work: Counts
        $counts = [
            'to_do' => Task::where('assigned_to', $user->id)
                ->whereIn('status_id', function ($query) {
                    $query->select('id')->from('task_statuses')->where('name', 'To Do');
                })->count(),
            'in_progress' => Task::where('assigned_to', $user->id)
                ->whereIn('status_id', function ($query) {
                    $query->select('id')->from('task_statuses')->where('name', 'In Progress');
                })->count(),
            'done' => Task::where('assigned_to', $user->id)
                ->whereIn('status_id', function ($query) {
                    $query->select('id')->from('task_statuses')->where('name', 'Done');
                })->count(),
        ];

        return Inertia::render('dashboard', [
            'lineup' => $lineup,
            'counts' => $counts,
            'recentActivity' => $recentActivity,
            'spaces' => $user->spaces()
                ->with([
                    'statuses',
                    'projects:id,space_id,name,slug,color,is_archived',
                    'members:id,name,email',
                ])
                ->withCount('tasks')
                ->get(),
        ]);
    }
}
