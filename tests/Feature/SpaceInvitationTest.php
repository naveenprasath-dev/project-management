<?php

use App\Mail\SpaceInvitationMail;
use App\Models\Space;
use App\Models\SpaceInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create();
    $this->space = Space::factory()->create(['created_by' => $this->admin->id]);
    $this->space->members()->attach($this->admin, ['role' => 'admin']);
});

test('it adds existing user directly when inviting by email', function () {
    $existingUser = User::factory()->create(['email' => 'existing@example.com']);

    $this->actingAs($this->admin)
        ->post("/spaces/{$this->space->slug}/members", [
            'email' => 'existing@example.com',
            'role' => 'member',
        ])
        ->assertRedirect();

    expect($this->space->members()->where('user_id', $existingUser->id)->exists())->toBeTrue();
});

test('it sends invitation email when inviting unknown email', function () {
    Mail::fake();

    $this->actingAs($this->admin)
        ->post("/spaces/{$this->space->slug}/members", [
            'email' => 'newuser@example.com',
            'role' => 'member',
        ])
        ->assertRedirect();

    Mail::assertQueued(SpaceInvitationMail::class, fn ($mail) => $mail->hasTo('newuser@example.com'));

    expect(SpaceInvitation::where('email', 'newuser@example.com')->exists())->toBeTrue();
});

test('it stores invitation with correct role and expiry', function () {
    Mail::fake();

    $this->actingAs($this->admin)
        ->post("/spaces/{$this->space->slug}/members", [
            'email' => 'viewer@example.com',
            'role' => 'viewer',
        ]);

    $invitation = SpaceInvitation::where('email', 'viewer@example.com')->first();

    expect($invitation->role)->toBe('viewer')
        ->and($invitation->space_id)->toBe($this->space->id)
        ->and($invitation->invited_by)->toBe($this->admin->id)
        ->and($invitation->expires_at->isFuture())->toBeTrue()
        ->and($invitation->accepted_at)->toBeNull();
});

test('it shows the invitation acceptance page', function () {
    $invitation = SpaceInvitation::factory()->create([
        'space_id' => $this->space->id,
        'invited_by' => $this->admin->id,
        'email' => 'guest@example.com',
        'role' => 'member',
        'token' => Str::random(64),
        'expires_at' => now()->addDays(7),
    ]);

    $this->get("/invitations/{$invitation->token}")
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('invitations/show')
            ->has('invitation')
            ->where('invitation.space_name', $this->space->name)
            ->where('invitation.role', 'member')
            ->where('invitation.is_expired', false)
        );
});

test('logged-in user can accept invitation and joins the space', function () {
    Notification::fake();

    $user = User::factory()->create();
    $invitation = SpaceInvitation::factory()->create([
        'space_id' => $this->space->id,
        'invited_by' => $this->admin->id,
        'email' => $user->email,
        'role' => 'member',
        'token' => Str::random(64),
        'expires_at' => now()->addDays(7),
    ]);

    $this->actingAs($user)
        ->post("/invitations/{$invitation->token}/accept")
        ->assertRedirect("/spaces/{$this->space->slug}");

    expect($this->space->members()->where('user_id', $user->id)->exists())->toBeTrue();
    expect($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('expired invitation cannot be accepted', function () {
    $user = User::factory()->create();
    $invitation = SpaceInvitation::factory()->create([
        'space_id' => $this->space->id,
        'invited_by' => $this->admin->id,
        'email' => $user->email,
        'role' => 'member',
        'token' => Str::random(64),
        'expires_at' => now()->subDay(),
    ]);

    $this->actingAs($user)
        ->post("/invitations/{$invitation->token}/accept")
        ->assertRedirect();

    expect($this->space->members()->where('user_id', $user->id)->exists())->toBeFalse();
});

test('pending invitations are auto-applied on registration', function () {
    Mail::fake();
    Notification::fake();

    // Create a pending invitation
    $invitation = SpaceInvitation::factory()->create([
        'space_id' => $this->space->id,
        'invited_by' => $this->admin->id,
        'email' => 'newreg@example.com',
        'role' => 'member',
        'token' => Str::random(64),
        'expires_at' => now()->addDays(7),
    ]);

    // Register a new user with that email
    $this->post('/register', [
        'name' => 'New User',
        'email' => 'newreg@example.com',
        'password' => 'Password@123',
        'password_confirmation' => 'Password@123',
    ])->assertRedirect();

    $newUser = User::where('email', 'newreg@example.com')->first();

    expect($this->space->members()->where('user_id', $newUser->id)->exists())->toBeTrue();
    expect($invitation->fresh()->accepted_at)->not->toBeNull();
});
