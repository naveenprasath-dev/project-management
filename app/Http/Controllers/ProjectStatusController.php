<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Space;
use App\Models\TaskStatus;
use Illuminate\Http\Request;

class ProjectStatusController extends Controller
{
    /**
     * Store a newly created status in storage.
     */
    public function store(Request $request, Space $space, Project $project)
    {
        if (!$request->user()->canManageSpace($space) && !$project->isUserAdmin($request->user())) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
        ]);

        $project->statuses()->create([
            'space_id' => $space->id,
            'name' => $validated['name'],
            'color' => $validated['color'],
            'order' => $project->statuses()->max('order') + 1,
        ]);

        return back()->with('success', 'Status created successfully.');
    }

    /**
     * Update the specified status in storage.
     */
    public function update(Request $request, Space $space, Project $project, TaskStatus $status)
    {
        if (!$request->user()->canManageSpace($space) && !$project->isUserAdmin($request->user())) {
            abort(403);
        }

        if ($status->project_id !== $project->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
        ]);

        $status->update($validated);

        return back()->with('success', 'Status updated successfully.');
    }

    /**
     * Remove the specified status from storage.
     */
    public function destroy(Request $request, Space $space, Project $project, TaskStatus $status)
    {
        if (!$request->user()->canManageSpace($space) && !$project->isUserAdmin($request->user())) {
             abort(403);
        }

        if ($status->project_id !== $project->id) {
            abort(404);
        }

        if ($status->tasks()->exists()) {
             return back()->with('error', 'Cannot delete status with existing tasks.');
        }

        $status->delete();

        return back()->with('success', 'Status deleted successfully.');
    }
}
