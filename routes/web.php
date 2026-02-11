<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\SpaceMemberController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('help', fn () => Inertia::render('help'))->name('help');

    // Space Management
    Route::get('spaces/{space:slug}/settings', [SpaceController::class, 'edit'])->name('spaces.settings');
    Route::resource('spaces', SpaceController::class)->scoped(['space' => 'slug'])->except(['edit']);
    Route::post('spaces/{space:slug}/members', [SpaceMemberController::class, 'store'])->name('spaces.members.store');
    Route::delete('spaces/{space:slug}/members/{user}', [SpaceMemberController::class, 'destroy'])->name('spaces.members.destroy');

    // Task Status Management
    Route::post('spaces/{space:slug}/statuses', [\App\Http\Controllers\TaskStatusController::class, 'store'])->name('spaces.statuses.store');
    Route::patch('spaces/{space:slug}/statuses/{status}', [\App\Http\Controllers\TaskStatusController::class, 'update'])->name('spaces.statuses.update');
    Route::delete('spaces/{space:slug}/statuses/{status}', [\App\Http\Controllers\TaskStatusController::class, 'destroy'])->name('spaces.statuses.destroy');
    Route::post('spaces/{space:slug}/statuses/reorder', [\App\Http\Controllers\TaskStatusController::class, 'reorder'])->name('spaces.statuses.reorder');

    // Project Management
    Route::get('spaces/{space:slug}/projects', [\App\Http\Controllers\ProjectController::class, 'index'])->name('spaces.projects.index');
    Route::post('spaces/{space:slug}/projects', [\App\Http\Controllers\ProjectController::class, 'store'])->name('spaces.projects.store');
    Route::get('spaces/{space:slug}/projects/{project:slug}', [\App\Http\Controllers\ProjectViewController::class, 'show'])->name('projects.show');
    Route::patch('spaces/{space:slug}/projects/{project:slug}', [\App\Http\Controllers\ProjectController::class, 'update'])->name('spaces.projects.update');
    Route::post('spaces/{space:slug}/projects/{project:slug}/toggle-archive', [\App\Http\Controllers\ProjectController::class, 'toggleArchive'])->name('spaces.projects.toggleArchive');
    Route::delete('spaces/{space:slug}/projects/{project:slug}', [\App\Http\Controllers\ProjectController::class, 'destroy'])->name('spaces.projects.destroy');

    // Project Member Management
    Route::post('spaces/{space:slug}/projects/{project:slug}/members', [\App\Http\Controllers\ProjectController::class, 'addMember'])->name('projects.members.add');
    Route::delete('spaces/{space:slug}/projects/{project:slug}/members/{user}', [\App\Http\Controllers\ProjectController::class, 'removeMember'])->name('projects.members.remove');

    // Project Status Management
    Route::post('spaces/{space:slug}/projects/{project:slug}/statuses', [\App\Http\Controllers\ProjectStatusController::class, 'store'])->name('projects.statuses.store');
    Route::patch('spaces/{space:slug}/projects/{project:slug}/statuses/{status}', [\App\Http\Controllers\ProjectStatusController::class, 'update'])->name('projects.statuses.update');
    Route::delete('spaces/{space:slug}/projects/{project:slug}/statuses/{status}', [\App\Http\Controllers\ProjectStatusController::class, 'destroy'])->name('projects.statuses.destroy');

    // Sprint Management
    Route::post('spaces/{space:slug}/projects/{project:slug}/sprints', [\App\Http\Controllers\SprintController::class, 'store'])->name('projects.sprints.store');
    Route::patch('spaces/{space:slug}/projects/{project:slug}/sprints/{sprint}', [\App\Http\Controllers\SprintController::class, 'update'])->name('projects.sprints.update');
    Route::delete('spaces/{space:slug}/projects/{project:slug}/sprints/{sprint}', [\App\Http\Controllers\SprintController::class, 'destroy'])->name('projects.sprints.destroy');
    Route::post('spaces/{space:slug}/projects/{project:slug}/sprints/{sprint}/start', [\App\Http\Controllers\SprintController::class, 'start'])->name('projects.sprints.start');
    Route::post('spaces/{space:slug}/projects/{project:slug}/sprints/{sprint}/complete', [\App\Http\Controllers\SprintController::class, 'complete'])->name('projects.sprints.complete');

    // Task Management (Nested within Spaces)
    Route::get('spaces/{space:slug}/tasks', [TaskController::class, 'index'])->name('spaces.tasks.index');
    Route::post('spaces/{space:slug}/tasks', [TaskController::class, 'store'])->name('spaces.tasks.store');
    Route::patch('spaces/{space:slug}/tasks/{task}', [TaskController::class, 'update'])->name('spaces.tasks.update');
    Route::delete('spaces/{space:slug}/tasks/{task}', [TaskController::class, 'destroy'])->name('spaces.tasks.destroy');
    Route::get('spaces/{space:slug}/tasks/{task}/activities', [TaskController::class, 'activities'])->name('spaces.tasks.activities');
    Route::get('spaces/{space:slug}/tasks/{task}/comments', [CommentController::class, 'index'])->name('spaces.tasks.comments.index');
    Route::post('spaces/{space:slug}/tasks/{task}/comments', [CommentController::class, 'store'])->name('spaces.tasks.comments.store');

    // Chat Management
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('chat', [ChatController::class, 'store'])->name('chat.store');
    // Messaging
    Route::post('chat/typing', [\App\Http\Controllers\ChatController::class, 'typing'])->name('chat.typing');
    Route::get('users/search', [\App\Http\Controllers\UserController::class, 'search'])->name('users.search');

    // My Work
    Route::get('my-tasks', [\App\Http\Controllers\MyWorkController::class, 'tasks'])->name('my-tasks');
    Route::get('calendar', [\App\Http\Controllers\MyWorkController::class, 'calendar'])->name('calendar');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    // Renamed ID parameter to avoid confusion
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

require __DIR__.'/settings.php';
