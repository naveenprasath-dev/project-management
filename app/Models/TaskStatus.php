<?php

namespace App\Models;

use App\Traits\BelongsToSpace;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskStatus extends Model
{
    use HasFactory, BelongsToSpace;

    protected $fillable = [
        'space_id',
        'project_id',
        'name',
        'color',
        'order',
        'is_final',
    ];

    protected $casts = [
        'is_final' => 'boolean',
        'order' => 'integer',
        'project_id' => 'integer',
    ];

    /**
     * Get the project that owns the status.
     */
    public function project(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Tasks with this status.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'status_id');
    }
}
