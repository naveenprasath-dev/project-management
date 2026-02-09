<?php

namespace App\Models;

use App\Traits\BelongsToSpace;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    use HasFactory, BelongsToSpace;

    protected $fillable = [
        'space_id',
        'task_id',
        'user_id',
        'content',
    ];

    /**
     * Message sender.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Associated task (if any).
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * User mentions in this message.
     */
    public function mentions(): HasMany
    {
        return $this->hasMany(Mention::class);
    }
}
