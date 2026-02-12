<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Space;
use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    /**
     * Display the specified sprint.
     */
    public function show(Request $request, Space $space, Project $project, Sprint $sprint)
    {
        $this->authorize('view', $project);

        // Capture filters
        $filters = $request->only(['search', 'status_id', 'priority', 'assigned_to', 'type']);

        // Load sprint tasks with filters
        $sprint->load(['tasks' => function ($query) use ($filters) {
            $query->whereNull('parent_id');

            // Apply filters
            if (! empty($filters['search'])) {
                $query->where(function ($q) use ($filters) {
                    $q->where('title', 'like', "%{$filters['search']}%")
                        ->orWhere('description', 'like', "%{$filters['search']}%");
                });
            }

            if (! empty($filters['status_id']) && $filters['status_id'] !== 'all') {
                $query->where('status_id', $filters['status_id']);
            }

            if (! empty($filters['priority']) && $filters['priority'] !== 'all') {
                $query->where('priority', $filters['priority']);
            }

            if (! empty($filters['assigned_to']) && $filters['assigned_to'] !== 'all') {
                $query->where(function ($q) use ($filters) {
                    $q->where('assigned_to', $filters['assigned_to'])
                        ->orWhereHas('assignees', fn ($sq) => $sq->where('user_id', $filters['assigned_to']));
                });
            }

            if (! empty($filters['type']) && $filters['type'] !== 'all') {
                $query->where('type', $filters['type']);
            }

            // Ensure correct relationships on tasks
            $query->with(['assignees', 'status', 'children.status', 'children.assignees', 'children.parent', 'parent', 'space'])->latest();
        }]);

        // Transform members to match frontend interface (reusing logic from ProjectViewController)
        $project->load('members');
        $project->setRelation('members', $project->members->map(function ($user) {
            return [
                'id' => $user->id,
                'user' => $user,
                'role' => $user->pivot->role ?? 'member',
            ];
        }));

        return \Inertia\Inertia::render('projects/sprints/show', [
            'space' => $space->load(['members', 'statuses', 'projects']),
            'project' => $project,
            'sprint' => $sprint,
            'filters' => $filters,
            'can' => [
                'manageMembers' => $request->user()->can('manageMembers', $project),
            ],
        ]);
    }

    /**
     * Store a newly created sprint.
     */
    public function store(Request $request, Space $space, Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'goal' => 'nullable|string',
        ]);

        $project->sprints()->create($validated);

        return back()->with('success', 'Sprint created successfully.');
    }

    /**
     * Update the specified sprint.
     */
    public function update(Request $request, Space $space, Project $project, Sprint $sprint)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'goal' => 'nullable|string',
            'status' => 'sometimes|required|in:planned,active,completed',
        ]);

        $sprint->update($validated);

        return back()->with('success', 'Sprint updated successfully.');
    }

    /**
     * Remove the specified sprint.
     */
    public function destroy(Space $space, Project $project, Sprint $sprint)
    {
        $this->authorize('update', $project);

        $sprint->delete();

        return back()->with('success', 'Sprint deleted successfully.');
    }

    /**
     * Start the sprint.
     */
    public function start(Request $request, Space $space, Project $project, Sprint $sprint)
    {
        $this->authorize('update', $project);

        // Deactivate any currently active sprints for this project
        $project->sprints()->where('status', 'active')->update(['status' => 'planned']);

        $sprint->update(['status' => 'active', 'start_date' => now()]);

        return back()->with('success', 'Sprint started!');
    }

    /**
     * Complete the sprint.
     */
    public function complete(Request $request, Space $space, Project $project, Sprint $sprint)
    {
        $this->authorize('update', $project);

        $sprint->update(['status' => 'completed', 'end_date' => now()]);

        return back()->with('success', 'Sprint completed!');
    }
}
