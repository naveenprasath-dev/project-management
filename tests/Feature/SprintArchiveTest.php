<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Space;
use App\Models\Sprint;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SprintArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_archive_a_sprint()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $project = Project::factory()->create(['space_id' => $space->id]);
        $sprint = Sprint::factory()->create([
            'project_id' => $project->id,
            'archived_at' => null
        ]);

        $response = $this->actingAs($user)
            ->post("/spaces/{$space->slug}/projects/{$project->slug}/sprints/{$sprint->id}/archive");

        $response->assertRedirect();
        $this->assertNotNull($sprint->fresh()->archived_at);
    }

    public function test_user_can_unarchive_a_sprint()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $project = Project::factory()->create(['space_id' => $space->id]);
        $sprint = Sprint::factory()->create([
            'project_id' => $project->id,
            'archived_at' => now()
        ]);

        $response = $this->actingAs($user)
            ->post("/spaces/{$space->slug}/projects/{$project->slug}/sprints/{$sprint->id}/unarchive");

        $response->assertRedirect();
        $this->assertNull($sprint->fresh()->archived_at);
    }

    public function test_archived_sprints_are_hidden_from_default_project_view()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $project = Project::factory()->create(['space_id' => $space->id]);
        
        $activeSprint = Sprint::factory()->create([
            'project_id' => $project->id, 
            'archived_at' => null
        ]);
        
        $archivedSprint = Sprint::factory()->create([
            'project_id' => $project->id, 
            'archived_at' => now()
        ]);

        $response = $this->actingAs($user)
            ->get("/spaces/{$space->slug}/projects/{$project->slug}");

        $response->assertStatus(200);
        
        $projectData = $response->original->getData()['page']['props']['project'];
        $sprintIds = collect($projectData['sprints'])->pluck('id');

        $this->assertTrue($sprintIds->contains($activeSprint->id));
        $this->assertFalse($sprintIds->contains($archivedSprint->id));
    }
}
