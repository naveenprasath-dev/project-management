<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Space;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    /**
     * Display a listing of projects for a space.
     */
    public function index(Request $request, Space $space): Response
    {
        if (!$request->user()->hasSpaceAccess($space->id)) {
            abort(403);
        }

        $projects = $this->projectService->getProjectsForSpace($space, $request->all());

        return Inertia::render('spaces/projects', [
            'space' => $space,
            'projects' => $projects,
            'filters' => $request->only(['search', 'is_archived']),
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request, Space $space)
    {
        if (!$request->user()->canManageSpace($space)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        $project = $this->projectService->createProject($space, $validated);

        return back()->with('success', 'Project created successfully.');
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Space $space, Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        $project = $this->projectService->updateProject($project, $validated);

        return back()->with('success', 'Project updated successfully.');
    }

    /**
     * Toggle archive status of the project.
     */
    public function toggleArchive(Request $request, Space $space, Project $project)
    {
        $this->authorize('update', $project);

        $this->projectService->toggleArchive($project);

        return back()->with('success', $project->is_archived ? 'Project archived.' : 'Project restored.');
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Request $request, Space $space, Project $project)
    {
        $this->authorize('delete', $project);

        $this->projectService->deleteProject($project);

        return back()->with('success', 'Project deleted successfully.');
    }

    /**
     * Add a member to the project.
     */
    public function addMember(Request $request, Space $space, Project $project)
    {
        $this->authorize('manageMembers', $project);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:admin,member',
        ]);

        $user = \App\Models\User::find($validated['user_id']);

        // Ensure the user is a space member
        if (!$space->hasMember($user)) {
            return back()->withErrors(['user_id' => 'User must be a space member first.']);
        }

        $project->addMember($user, $validated['role']);

        return back()->with('success', 'Member added to project successfully.');
    }

    /**
     * Remove a member from the project.
     */
    public function removeMember(Request $request, Space $space, Project $project, \App\Models\User $user)
    {
        $this->authorize('manageMembers', $project);

        $project->removeMember($user);

        return back()->with('success', 'Member removed from project.');
    }
}
