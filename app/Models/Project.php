<?php

namespace App\Models;

use App\Traits\BelongsToSpace;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Project extends Model
{
    use BelongsToSpace, HasFactory;

    protected $fillable = [
        'space_id',
        'name',
        'slug',
        'description',
        'color',
        'is_archived',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Boot the model and generate slug automatically.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = static::generateUniqueSlug($project->name, $project->space_id);
            }
        });

        static::updating(function ($project) {
            if ($project->isDirty('name') && empty($project->slug)) {
                $project->slug = static::generateUniqueSlug($project->name, $project->space_id);
            }
        });
    }

    /**
     * Generate a unique slug for the project within its space.
     */
    protected static function generateUniqueSlug(string $name, int $spaceId): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (static::where('space_id', $spaceId)->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    public function statuses(): HasMany
    {
        return $this->hasMany(TaskStatus::class);
    }

    /**
     * Get the space that owns the project.
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    /**
     * Get all tasks for this project.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get all sprints for this project.
     */
    public function sprints(): HasMany
    {
        return $this->hasMany(Sprint::class);
    }

    /**
     * Get the user who created the project.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope to get only non-archived projects.
     */
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    /**
     * Scope to get only archived projects.
     */
    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    /**
     * Get all members of this project.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Check if a user is a member of this project.
     */
    public function hasUser(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Add a member to this project.
     */
    public function addMember(User $user, string $role = 'member'): void
    {
        if (! $this->hasUser($user)) {
            $this->members()->attach($user->id, ['role' => $role]);
        }
    }

    /**
     * Remove a member from this project.
     */
    public function removeMember(User $user): void
    {
        $this->members()->detach($user->id);
    }

    /**
     * Check if a user is an admin of this project.
     */
    public function isUserAdmin(User $user): bool
    {
        $member = $this->members()->where('user_id', $user->id)->first();

        return $member && $member->pivot->role === 'admin';
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
