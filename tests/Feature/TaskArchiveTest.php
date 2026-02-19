<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Space;
use App\Models\Task;
use App\Models\User;
use App\Models\TaskStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_archive_a_task()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $space->members()->attach($user, ['role' => 'admin']);
        $project = Project::factory()->create(['space_id' => $space->id]);
        $status = TaskStatus::factory()->create(['space_id' => $space->id, 'project_id' => $project->id]);
        $task = Task::factory()->create([
            'project_id' => $project->id,
            'space_id' => $space->id,
            'status_id' => $status->id,
            'archived_at' => null
        ]);

        $response = $this->actingAs($user)
            ->post("/spaces/{$space->slug}/tasks/{$task->id}/archive");

        $response->assertRedirect();
        $this->assertNotNull($task->fresh()->archived_at);
    }

    public function test_user_can_unarchive_a_task()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $space->members()->attach($user, ['role' => 'admin']);
        $project = Project::factory()->create(['space_id' => $space->id]);
        $status = TaskStatus::factory()->create(['space_id' => $space->id, 'project_id' => $project->id]);
        $task = Task::factory()->create([
            'project_id' => $project->id,
            'space_id' => $space->id,
            'status_id' => $status->id,
            'archived_at' => now()
        ]);

        $response = $this->actingAs($user)
            ->post("/spaces/{$space->slug}/tasks/{$task->id}/unarchive");

        $response->assertRedirect();
        $this->assertNull($task->fresh()->archived_at);
    }

    public function test_archived_tasks_are_hidden_from_default_project_view()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $space->members()->attach($user, ['role' => 'admin']);
        $project = Project::factory()->create(['space_id' => $space->id]);
        $status = TaskStatus::factory()->create(['space_id' => $space->id, 'project_id' => $project->id]);
        
        $activeTask = Task::factory()->create([
            'project_id' => $project->id, 
            'space_id' => $space->id,
            'status_id' => $status->id,
            'archived_at' => null,
            'parent_id' => null
        ]);
        
        $archivedTask = Task::factory()->create([
            'project_id' => $project->id, 
            'space_id' => $space->id,
            'status_id' => $status->id,
            'archived_at' => now(),
            'parent_id' => null
        ]);

        $response = $this->actingAs($user)
            ->get("/spaces/{$space->slug}/projects/{$project->slug}");

        $response->assertStatus(200);
        
        $projectData = $response->original->getData()['page']['props']['project'];
        $taskIds = collect($projectData['tasks'])->pluck('id');

        $this->assertTrue($taskIds->contains($activeTask->id));
        $this->assertFalse($taskIds->contains($archivedTask->id));
    }
}
