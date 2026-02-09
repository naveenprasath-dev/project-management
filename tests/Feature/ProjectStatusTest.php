<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Space;
use App\Models\User;
use App\Models\TaskStatus;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_space_admin_can_create_project_status()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $project = Project::factory()->create(['space_id' => $space->id]);

        $response = $this->actingAs($user)
            ->post("/spaces/{$space->slug}/projects/{$project->slug}/statuses", [
                'name' => 'Custom Status',
                'color' => '#ffffff',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_statuses', [
            'name' => 'Custom Status',
            'project_id' => $project->id,
            'space_id' => $space->id,
        ]);
    }

    public function test_project_admin_can_create_project_status()
    {
        $admin = User::factory()->create();
        $space = Space::factory()->create();
        $project = Project::factory()->create(['space_id' => $space->id]);

        // Add user as project admin
        $project->members()->attach($admin, ['role' => 'admin']);
        
        // Ensure user is space member
        $space->members()->attach($admin, ['role' => 'member']);

        $response = $this->actingAs($admin)
            ->post("/spaces/{$space->slug}/projects/{$project->slug}/statuses", [
                'name' => 'Project Admin Status',
                'color' => '#000000',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_statuses', [
            'name' => 'Project Admin Status',
            'project_id' => $project->id,
        ]);
    }

    public function test_regular_member_cannot_create_project_status()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create();
        $project = Project::factory()->create(['space_id' => $space->id]);
        
        $space->members()->attach($user, ['role' => 'member']);
        $project->members()->attach($user, ['role' => 'member']);

        $response = $this->actingAs($user)
            ->post("/spaces/{$space->slug}/projects/{$project->slug}/statuses", [
                'name' => 'Illegal Status',
                'color' => '#ffffff',
            ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('task_statuses', ['name' => 'Illegal Status']);
    }

    public function test_can_update_project_status()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $project = Project::factory()->create(['space_id' => $space->id]);
        $status = TaskStatus::create([
            'space_id' => $space->id,
            'project_id' => $project->id,
            'name' => 'Old Name',
            'color' => '#old',
            'order' => 1,
        ]);

        $response = $this->actingAs($user)
            ->patch("/spaces/{$space->slug}/projects/{$project->slug}/statuses/{$status->id}", [
                'name' => 'New Name',
                'color' => '#112233',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_statuses', [
            'id' => $status->id,
            'name' => 'New Name',
        ]);
    }

    public function test_can_delete_project_status()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $project = Project::factory()->create(['space_id' => $space->id]);
        $status = TaskStatus::create([
            'space_id' => $space->id,
            'project_id' => $project->id,
            'name' => 'To Delete',
            'color' => '#del',
            'order' => 1,
        ]);

        $response = $this->actingAs($user)
            ->delete("/spaces/{$space->slug}/projects/{$project->slug}/statuses/{$status->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('task_statuses', ['id' => $status->id]);
    }

    public function test_cannot_delete_status_with_tasks()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $project = Project::factory()->create(['space_id' => $space->id]);
        $status = TaskStatus::create([
            'space_id' => $space->id,
            'project_id' => $project->id,
            'name' => 'Busy Status',
            'color' => '#busy',
            'order' => 1,
        ]);

        Task::factory()->create([
            'space_id' => $space->id,
            'project_id' => $project->id,
            'status_id' => $status->id,
        ]);

        $response = $this->actingAs($user)
            ->delete("/spaces/{$space->slug}/projects/{$project->slug}/statuses/{$status->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertModelExists($status); // Should not be deleted
    }
}
