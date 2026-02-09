<?php

namespace App\Traits;

use App\Models\Space;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasSpaceAccess
{
    /**
     * Spaces the user belongs to.
     */
    public function spaces(): BelongsToMany
    {
        return $this->belongsToMany(Space::class, 'space_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Check if user has access to a specific space.
     */
    public function hasSpaceAccess(int|string $spaceId): bool
    {
        if ($this->hasRole('admin')) {
            return true;
        }

        return \Illuminate\Support\Facades\Cache::remember(
            "user_{$this->id}_space_access_{$spaceId}",
            3600,
            fn () => $this->spaces()->where('space_id', $spaceId)->exists()
        );
    }
}
