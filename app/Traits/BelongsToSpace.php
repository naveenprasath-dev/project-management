<?php

namespace App\Traits;

use App\Models\Space;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToSpace
{
    /**
     * Model belongs to a space.
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    /**
     * Scope query to a specific space.
     */
    public function scopeInSpace(Builder $query, int|string $spaceId): Builder
    {
        return $query->where('space_id', $spaceId);
    }
}
