<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityService extends BaseService
{
    protected string $model = ActivityLog::class;

    /**
     * Log an activity.
     */
    public function log(
        User $user,
        string $description,
        ?int $spaceId = null,
        ?int $taskId = null,
        array $properties = []
    ): void {
        \App\Jobs\ProcessActivityLog::dispatch([
            'user_id' => $user->id,
            'space_id' => $spaceId,
            'task_id' => $taskId,
            'description' => $description,
            'properties' => $properties,
        ]);
    }

    /**
     * Get recent activity for a user (across their spaces).
     */
    public function getRecentActivity(User $user, int $limit = 20)
    {
        return ActivityLog::whereIn('space_id', $user->spaces()->pluck('spaces.id'))
            ->with(['user', 'task', 'space'])
            ->latest()
            ->limit($limit)
            ->get();
    }
}
