<?php

use App\Models\Project;
use App\Models\Space;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use App\Notifications\GeneralNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->space = Space::factory()->create(['created_by' => $this->user->id]);
    $this->space->members()->attach($this->user, ['role' => 'admin']);
    $this->project = Project::factory()->create(['space_id' => $this->space->id]);
    $this->status = TaskStatus::factory()->create(['space_id' => $this->space->id, 'project_id' => $this->project->id]);
});

test('it sends email notification to assignees on task creation', function () {
    Notification::fake();

    $assignee = User::factory()->create();
    $this->space->members()->attach($assignee, ['role' => 'member']);

    $response = $this->actingAs($this->user)
        ->post("/spaces/{$this->space->slug}/tasks", [
            'space_id' => $this->space->id,
            'title' => 'New Task',
            'description' => 'Test description',
            'status_id' => $this->status->id,
            'project_id' => $this->project->id,
            'assignee_ids' => [$assignee->id],
            'type' => 'task',
            'priority' => 'medium',
        ]);

    $response->assertStatus(302);

    Notification::assertSentTo(
        $assignee,
        GeneralNotification::class,
        function ($notification, $channels) {
            return in_array('mail', $channels) && $notification->title === 'New Task Assigned';
        }
    );
});

test('it sends email notification to assignees on task status change', function () {
    Notification::fake();

    $assignee = User::factory()->create();
    $this->space->members()->attach($assignee, ['role' => 'member']);

    $task = Task::factory()->create([
        'space_id' => $this->space->id,
        'project_id' => $this->project->id,
        'status_id' => $this->status->id,
        'created_by' => $this->user->id,
    ]);
    $task->assignees()->attach($assignee);

    $newStatus = TaskStatus::factory()->create([
        'space_id' => $this->space->id,
        'project_id' => $this->project->id,
        'name' => 'Done',
    ]);

    $response = $this->actingAs($this->user)
        ->patch("/spaces/{$this->space->slug}/tasks/{$task->id}", [
            'status_id' => $newStatus->id,
        ]);

    $response->assertStatus(302);

    Notification::assertSentTo(
        $assignee,
        GeneralNotification::class,
        function ($notification, $channels) {
            return in_array('mail', $channels) && $notification->title === 'Task Status Updated';
        }
    );
});

test('it sends email notification on comment mention', function () {
    Notification::fake();

    $mentionedUser = User::factory()->create(['name' => 'JohnDoe']);
    $this->space->members()->attach($mentionedUser, ['role' => 'member']);

    $task = Task::factory()->create([
        'space_id' => $this->space->id,
        'project_id' => $this->project->id,
        'status_id' => $this->status->id,
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->post("/spaces/{$this->space->slug}/tasks/{$task->id}/comments", [
            'content' => 'Hey @JohnDoe look at this',
        ]);

    $response->assertStatus(200);

    Notification::assertSentTo(
        $mentionedUser,
        GeneralNotification::class,
        function ($notification, $channels) {
            return in_array('mail', $channels) && $notification->title === 'You were mentioned';
        }
    );
});

test('it sends notification to creator when assignee updates a task field', function () {
    Notification::fake();

    $assignee = User::factory()->create();
    $this->space->members()->attach($assignee, ['role' => 'member']);

    $task = Task::factory()->create([
        'space_id' => $this->space->id,
        'project_id' => $this->project->id,
        'status_id' => $this->status->id,
        'created_by' => $this->user->id,
    ]);
    $task->assignees()->attach($assignee);

    $response = $this->actingAs($assignee)
        ->patch("/spaces/{$this->space->slug}/tasks/{$task->id}", [
            'priority' => 'high',
        ]);

    $response->assertStatus(302);

    Notification::assertSentTo(
        $this->user,
        GeneralNotification::class,
        function ($notification, $channels) {
            return in_array('mail', $channels) && $notification->title === 'Task Updated';
        }
    );
});

test('it sends notification to assignees when creator updates a task field', function () {
    Notification::fake();

    $assignee = User::factory()->create();
    $this->space->members()->attach($assignee, ['role' => 'member']);

    $task = Task::factory()->create([
        'space_id' => $this->space->id,
        'project_id' => $this->project->id,
        'status_id' => $this->status->id,
        'created_by' => $this->user->id,
    ]);
    $task->assignees()->attach($assignee);

    $response = $this->actingAs($this->user)
        ->patch("/spaces/{$this->space->slug}/tasks/{$task->id}", [
            'priority' => 'urgent',
        ]);

    $response->assertStatus(302);

    Notification::assertSentTo(
        $assignee,
        GeneralNotification::class,
        function ($notification, $channels) {
            return in_array('mail', $channels) && $notification->title === 'Task Updated';
        }
    );
});

test('it sends comment notification to all involved parties when someone comments', function () {
    Notification::fake();

    $assignee = User::factory()->create();
    $commenter = User::factory()->create();
    $this->space->members()->attach($assignee, ['role' => 'member']);
    $this->space->members()->attach($commenter, ['role' => 'member']);

    $task = Task::factory()->create([
        'space_id' => $this->space->id,
        'project_id' => $this->project->id,
        'status_id' => $this->status->id,
        'created_by' => $this->user->id,
    ]);
    $task->assignees()->attach($assignee);

    $response = $this->actingAs($commenter)
        ->post("/spaces/{$this->space->slug}/tasks/{$task->id}/comments", [
            'content' => 'Just a regular comment',
        ]);

    $response->assertStatus(200);

    // Creator should be notified
    Notification::assertSentTo(
        $this->user,
        GeneralNotification::class,
        function ($notification, $channels) {
            return in_array('mail', $channels) && $notification->title === 'New Comment on Task';
        }
    );

    // Assignee should be notified
    Notification::assertSentTo(
        $assignee,
        GeneralNotification::class,
        function ($notification, $channels) {
            return in_array('mail', $channels) && $notification->title === 'New Comment on Task';
        }
    );

    // Commenter should NOT be notified
    Notification::assertNotSentTo($commenter, GeneralNotification::class);
});

test('mentioned user gets mention notification not duplicate comment notification', function () {
    Notification::fake();

    $assignee = User::factory()->create(['name' => 'JaneDoe']);
    $this->space->members()->attach($assignee, ['role' => 'member']);

    $task = Task::factory()->create([
        'space_id' => $this->space->id,
        'project_id' => $this->project->id,
        'status_id' => $this->status->id,
        'created_by' => $this->user->id,
    ]);
    $task->assignees()->attach($assignee);

    $response = $this->actingAs($this->user)
        ->post("/spaces/{$this->space->slug}/tasks/{$task->id}/comments", [
            'content' => 'Hey @JaneDoe please check this',
        ]);

    $response->assertStatus(200);

    // Assignee was @mentioned, so gets mention notification only
    Notification::assertSentTo(
        $assignee,
        GeneralNotification::class,
        function ($notification, $channels) {
            return in_array('mail', $channels) && $notification->title === 'You were mentioned';
        }
    );

    // Should NOT also get the generic comment notification (de-duplicated)
    Notification::assertSentToTimes($assignee, GeneralNotification::class, 1);
});
