<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Space;
use Illuminate\Pagination\LengthAwarePaginator;

class ProjectService
{
    /**
     * Get all projects for a space.
     */
    public function getProjectsForSpace(Space $space, array $filters = []): LengthAwarePaginator
    {
        $query = $space->projects()->with(['creator', 'tasks']);

        // Filter by archived status
        if (isset($filters['is_archived'])) {
            $query->where('is_archived', $filters['is_archived']);
        } else {
            // By default, show only active projects
            $query->active();
        }

        // Search by name
        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 50);
    }

    /**
     * Create a new project.
     */
    public function createProject(Space $space, array $data): Project
    {
        $project = $space->projects()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? null,
            'created_by' => auth()->id(),
        ]);

        // Add creator as project admin
        $project->members()->attach(auth()->id(), ['role' => 'admin']);

        return $project;
    }

    /**
     * Update an existing project.
     */
    public function updateProject(Project $project, array $data): Project
    {
        $project->update([
            'name' => $data['name'] ?? $project->name,
            'description' => $data['description'] ?? $project->description,
            'color' => $data['color'] ?? $project->color,
        ]);

        return $project->fresh();
    }

    /**
     * Archive/unarchive a project.
     */
    public function toggleArchive(Project $project): Project
    {
        $project->update([
            'is_archived' => !$project->is_archived,
        ]);

        return $project->fresh();
    }

    /**
     * Delete a project.
     */
    public function deleteProject(Project $project): bool
    {
        // Optionally, you might want to handle tasks differently
        // For now, we'll set their project_id to null (handled by nullOnDelete in migration)
        return $project->delete();
    }
}
