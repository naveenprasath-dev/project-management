<?php

namespace App\Models;

use App\Enums\TaskType;
use App\Traits\BelongsToSpace;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use BelongsToSpace, HasFactory, SoftDeletes;

    protected $fillable = [
        'space_id',
        'project_id',
        'status_id',
        'parent_id',
        'title',
        'description',
        'type',
        'priority',
        'due_date',
        'created_by',
        'assigned_to',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'datetime',
            'order' => 'integer',
            'type' => TaskType::class,
        ];
    }

    /**
     * Task status.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(TaskStatus::class, 'status_id');
    }

    /**
     * Support for subtasks.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    /**
     * Project that owns the task.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Task owner.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Task assignees (Many-to-Many).
     */
    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_assignees')
            ->withTimestamps();
    }

    /**
     * Legacy single assignee.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Task messages.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Task comments.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->with('user')->latest();
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::observe(\App\Observers\TaskObserver::class);
    }

    /**
     * Task activities/logs.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class)->with('user')->latest();
    }

    public function scopeAssignedToMe(Builder $query): Builder
    {
        return $query->where('assigned_to', auth()->id())
            ->orWhereHas('assignees', fn ($q) => $q->where('user_id', auth()->id()));
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('due_date', '<', now())
            ->whereHas('status', fn ($q) => $q->where('is_final', false));
    }
}
