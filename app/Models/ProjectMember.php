<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMember extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'role',
    ];

    /**
     * Get the project that this member belongs to.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user associated with this project member.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if this member is an admin of the project.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
