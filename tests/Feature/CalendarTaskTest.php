<?php

namespace Tests\Feature;

use App\Models\Space;
use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class CalendarTaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_calendar_page_receives_tasks_and_spaces()
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['created_by' => $user->id]);
        $space->members()->attach($user->id, ['role' => 'admin']);
        
        Task::factory()->count(3)->create([
            'space_id' => $space->id,
            'assigned_to' => $user->id,
            'due_date' => now()->format('Y-m-d'),
        ]);

        $response = $this->actingAs($user)
            ->get('/calendar');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('my-work/calendar')
            ->has('tasks', 3)
            ->has('spaces', 1)
            ->where('spaces.0.id', $space->id)
        );
    }
}
