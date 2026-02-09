<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $spaceAdmin;
    protected User $projectAdmin;
    protected User $projectMember;
    protected User $regularUser;
    protected Space $space;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Admin role
        \Spatie\Permission\Models\Role::create(['name' => 'admin']);

        // Create Admin
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        // Create Space and Owner (Space Admin)
        $this->spaceAdmin = User::factory()->create();
        $this->space = Space::factory()->create(['created_by' => $this->spaceAdmin->id]);
        $this->space->members()->attach($this->spaceAdmin->id, ['role' => 'admin']);

        // Create Project belonging to space
        $this->project = Project::factory()->create([
            'space_id' => $this->space->id,
            'created_by' => $this->spaceAdmin->id
        ]);

        // Create Project Admin
        $this->projectAdmin = User::factory()->create();
        $this->space->members()->attach($this->projectAdmin->id, ['role' => 'member']);
        $this->project->members()->attach($this->projectAdmin->id, ['role' => 'admin']);

        // Create Project Member
        $this->projectMember = User::factory()->create();
        $this->space->members()->attach($this->projectMember->id, ['role' => 'member']);
        $this->project->members()->attach($this->projectMember->id, ['role' => 'member']);

        // Create Regular User (not in space/project)
        $this->regularUser = User::factory()->create();
    }

    /** @test */
    public function test_admin_can_view_any_project()
    {
        $response = $this->actingAs($this->admin)->get(route('projects.show', [$this->space->slug, $this->project->slug]));
        $response->assertStatus(200);
    }

    /** @test */
    public function test_space_admin_can_view_project_in_their_space()
    {
        $response = $this->actingAs($this->spaceAdmin)->get(route('projects.show', [$this->space->slug, $this->project->slug]));
        $response->assertStatus(200);
    }

    /** @test */
    public function test_project_admin_can_view_their_project()
    {
        $response = $this->actingAs($this->projectAdmin)->get(route('projects.show', [$this->space->slug, $this->project->slug]));
        $response->assertStatus(200);
    }

    /** @test */
    public function test_project_member_can_view_their_project()
    {
        $response = $this->actingAs($this->projectMember)->get(route('projects.show', [$this->space->slug, $this->project->slug]));
        $response->assertStatus(200);
    }

    /** @test */
    public function test_unauthorized_user_cannot_view_project()
    {
        $response = $this->actingAs($this->regularUser)->get(route('projects.show', [$this->space->slug, $this->project->slug]));
        $response->assertStatus(403);
    }

    /** @test */
    public function test_only_admins_can_manage_projects()
    {
        // Project Member tries to update
        $response = $this->actingAs($this->projectMember)->patch(route('spaces.projects.update', [$this->space->slug, $this->project->slug]), [
            'name' => 'Updated Name'
        ]);
        $response->assertStatus(403);

        // Project Admin can update
        $response = $this->actingAs($this->projectAdmin)->patch(route('spaces.projects.update', [$this->space->slug, $this->project->slug]), [
            'name' => 'Updated Name'
        ]);
        $response->assertStatus(302); // Redirect back on success
    }

    /** @test */
    public function test_only_admins_can_manage_members()
    {
        $anotherUser = User::factory()->create();
        $this->space->members()->attach($anotherUser->id, ['role' => 'member']);

        // Project Member tries to add member
        $response = $this->actingAs($this->projectMember)->post(route('projects.members.add', [$this->space->slug, $this->project->slug]), [
            'user_id' => $anotherUser->id,
            'role' => 'member'
        ]);
        $response->assertStatus(403);

        // Project Admin can add member
        $response = $this->actingAs($this->projectAdmin)->post(route('projects.members.add', [$this->space->slug, $this->project->slug]), [
            'user_id' => $anotherUser->id,
            'role' => 'member'
        ]);
        $response->assertStatus(302);
    }
}
