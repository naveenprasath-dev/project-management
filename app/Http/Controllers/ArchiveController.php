<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Space;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArchiveController extends Controller
{
    /**
     * Show archived sprints and tasks for a project.
     */
    public function index(Request $request, Space $space, Project $project): Response
    {
        $this->authorize('view', $project);

        $archivedSprints = $project->sprints()
            ->archived()
            ->withCount('tasks')
            ->latest('archived_at')
            ->get();

        $archivedTasks = $project->tasks()
            ->archived()
            ->whereNull('parent_id')
            ->with(['status', 'assignees', 'sprint'])
            ->latest('archived_at')
            ->get();

        return Inertia::render('projects/archive', [
            'space' => $space->load(['members', 'statuses']),
            'project' => $project->load(['members']),
            'archivedSprints' => $archivedSprints,
            'archivedTasks' => $archivedTasks,
            'can' => [
                'manageMembers' => $request->user()->can('manageMembers', $project),
            ],
        ]);
    }
}
