<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Space;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectViewController extends Controller
{
    /**
     * Display the specified project.
     */
    public function show(Space $space, Project $project, Request $request): Response
    {
        // Check if user has access to view the project
        $this->authorize('view', $project);

        // Capture filters
        $filters = $request->only(['search', 'status_id', 'priority', 'assigned_to']);

        // Load project with relationships
        $project->load([
            'members',
            'statuses',
            'tasks' => function ($query) use ($filters) {
                // Apply filters
                if (!empty($filters['search'])) {
                    $query->where(function ($q) use ($filters) {
                        $q->where('title', 'like', "%{$filters['search']}%")
                          ->orWhere('description', 'like', "%{$filters['search']}%");
                    });
                }
                
                if (!empty($filters['status_id']) && $filters['status_id'] !== 'all') {
                    $query->where('status_id', $filters['status_id']);
                }
                
                if (!empty($filters['priority']) && $filters['priority'] !== 'all') {
                    $query->where('priority', $filters['priority']);
                }
                
                if (!empty($filters['assigned_to']) && $filters['assigned_to'] !== 'all') {
                     $query->where(function ($q) use ($filters) {
                        $q->where('assigned_to', $filters['assigned_to'])
                          ->orWhereHas('assignees', fn($sq) => $sq->where('user_id', $filters['assigned_to']));
                    });
                }

                // Ensure correct relationships on tasks
                $query->with(['assignees', 'status'])->latest();
            }
        ]);

        // Transform members to match frontend interface
        $project->setRelation('members', $project->members->map(function ($user) {
            return [
                'id' => $user->id,
                'user' => $user,
                'role' => $user->pivot->role ?? 'member',
            ];
        }));

        return Inertia::render('projects/show', [
            'space' => $space->load(['members', 'statuses', 'projects']),
            'project' => $project,
            'filters' => $filters,
            'can' => [
                'manageMembers' => $request->user()->can('manageMembers', $project),
            ],
        ]);
    }
}
