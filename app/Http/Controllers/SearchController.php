<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = trim($request->string('q'));

        if (strlen($query) < 2) {
            return response()->json(['tasks' => [], 'spaces' => [], 'projects' => []]);
        }

        $user = $request->user();
        $spaceIds = $user->spaces()->pluck('spaces.id');

        $tasks = Task::whereIn('space_id', $spaceIds)
            ->where('title', 'like', "%{$query}%")
            ->whereNull('parent_id')
            ->whereNull('archived_at')
            ->with(['space:id,name,slug,color', 'status:id,name,color'])
            ->select('id', 'title', 'space_id', 'status_id', 'priority')
            ->limit(5)
            ->get()
            ->map(fn (Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'priority' => $task->priority,
                'status' => $task->status ? ['name' => $task->status->name, 'color' => $task->status->color] : null,
                'space' => ['name' => $task->space->name, 'slug' => $task->space->slug, 'color' => $task->space->color],
                'url' => "/spaces/{$task->space->slug}/tasks",
            ]);

        $spaces = $user->spaces()
            ->where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'slug', 'color')
            ->limit(3)
            ->get()
            ->map(fn ($space) => [
                'id' => $space->id,
                'name' => $space->name,
                'color' => $space->color,
                'url' => "/spaces/{$space->slug}",
            ]);

        $projects = Project::whereIn('space_id', $spaceIds)
            ->where('name', 'like', "%{$query}%")
            ->where('is_archived', false)
            ->with('space:id,name,slug')
            ->select('id', 'name', 'slug', 'color', 'space_id')
            ->limit(3)
            ->get()
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'color' => $project->color,
                'space_name' => $project->space->name,
                'url' => "/spaces/{$project->space->slug}/projects/{$project->slug}",
            ]);

        return response()->json([
            'tasks' => $tasks,
            'spaces' => $spaces,
            'projects' => $projects,
        ]);
    }
}
