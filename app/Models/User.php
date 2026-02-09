<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;
use App\Traits\HasSpaceAccess;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles, HasSpaceAccess, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Check if the user is a system admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if the user can view the given space.
     */
    public function canViewSpace(\App\Models\Space $space): bool
    {
        return $this->isAdmin() ||
            $space->created_by === $this->id ||
            $this->spaces()->where('spaces.id', $space->id)->exists();
    }

    /**
     * Check if user can manage (edit/invite) a space.
     */
    public function canManageSpace(\App\Models\Space $space): bool
    {
        if ($this->isAdmin() || $space->created_by === $this->id) {
            return true;
        }

        return $this->spaces()
            ->where('spaces.id', $space->id)
            ->wherePivot('role', 'admin')
            ->exists();
    }

    /**
     * Check if user can delete a space.
     */
    public function canDeleteSpace(\App\Models\Space $space): bool
    {
        return $this->isAdmin() || 
               $space->created_by === $this->id ||
               $this->spaces()->where('spaces.id', $space->id)->wherePivot('role', 'admin')->exists();
    }

    /**
     * Check if the user can view the given project.
     */
    public function canViewProject(\App\Models\Project $project): bool
    {
        return $this->isAdmin() ||
            $project->created_by === $this->id ||
            $this->canViewSpace($project->space) ||
            $project->hasUser($this);
    }

    /**
     * Check if the user can manage (edit/invite/statuses) the given project.
     */
    public function canManageProject(\App\Models\Project $project): bool
    {
        return $this->isAdmin() ||
            $project->created_by === $this->id ||
            $this->canManageSpace($project->space) ||
            $project->isUserAdmin($this);
    }

    /**
     * Check if the user can delete the given project.
     */
    public function canDeleteProject(\App\Models\Project $project): bool
    {
        return $this->isAdmin() ||
            $project->created_by === $this->id ||
            $this->canManageSpace($project->space) ||
            $project->isUserAdmin($this);
    }

    /**
     * Tasks assigned to the user.
     */
    public function assignedTasks(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_assignees')
            ->withTimestamps();
    }
}
