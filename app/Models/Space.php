<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

class Space extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'is_private',
        'created_by',
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    /**
     * Space creator.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Space members.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'space_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Check if user is a member of the space.
     */
    public function hasMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Space tasks.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Space status workflows.
     */
    public function statuses(): HasMany
    {
        return $this->hasMany(TaskStatus::class);
    }

    /**
     * Space projects.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Space messages.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get aggregate analytics for the space.
     */
    public function getAnalytics(): array
    {
        $totalTasks = $this->tasks()->count();
        $completedTasks = $this->tasks()
            ->whereHas('status', fn($q) => $q->where('is_final', true))
            ->count();
        
        return [
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'completion_rate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0,
            'total_members' => $this->members()->count(),
            'total_projects' => $this->projects()->count(),
        ];
    }

    /**
     * Get detailed analytics for all projects in the space.
     */
    public function getProjectsWithAnalytics()
    {
        $projects = $this->projects()
            ->withCount(['tasks', 'members'])
            ->get();

        if ($projects->isEmpty()) {
            return $projects;
        }

        $projectIds = $projects->pluck('id');
        
        $statusCounts = Task::whereIn('project_id', $projectIds)
            ->selectRaw('project_id, status_id, count(*) as count')
            ->groupBy('project_id', 'status_id')
            ->with('status:id,name,color,is_final')
            ->get();

        $projects->each(function($project) use ($statusCounts) {
            $project->status_summary = $statusCounts->where('project_id', $project->id)->values();
            
            $project->completed_tasks_count = $statusCounts
                ->where('project_id', $project->id)
                ->filter(fn($summary) => optional($summary->status)->is_final)
                ->sum('count');
        });

        return $projects;
    }
}
