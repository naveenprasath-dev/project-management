<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class SpaceMember extends Pivot
{
    protected $table = 'space_members';

    public $incrementing = true;

    protected $fillable = [
        'space_id',
        'user_id',
        'role',
    ];
}
