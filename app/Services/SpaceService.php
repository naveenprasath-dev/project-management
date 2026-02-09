<?php

namespace App\Services;

use App\Models\Space;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SpaceService extends BaseService
{
    protected string $model = Space::class;

    /**
     * Create a new space with default statuses and members.
     */
    public function createWithDefaults(array $data, User $creator): Space
    {
        return DB::transaction(function () use ($data, $creator) {
            /** @var Space $space */
            $space = $this->create([
                ...$data,
                'slug' => Str::slug($data['name']),
                'created_by' => $creator->id,
            ]);

            // Add creator as admin member
            $space->members()->attach($creator->id, ['role' => 'admin']);

            // Create default statuses
            $this->createDefaultStatuses($space);

            return $space;
        });
    }

    /**
     * Invite a user to a space.
     */
    public function addMember(Space $space, User $user, string $role = 'member'): void
    {
        $space->members()->syncWithoutDetaching([
            $user->id => ['role' => $role]
        ]);
    }

    /**
     * Remove a member from a space.
     */
    public function removeMember(Space $space, int $userId): void
    {
        $space->members()->detach($userId);
    }

    /**
     * Create default statuses for a new space.
     */
    protected function createDefaultStatuses(Space $space): void
    {
        $defaults = [
            ['name' => 'To Do', 'color' => '#d3d3d3', 'order' => 0, 'is_final' => false],
            ['name' => 'In Progress', 'color' => '#3498db', 'order' => 1, 'is_final' => false],
            ['name' => 'Done', 'color' => '#2ecc71', 'order' => 2, 'is_final' => true],
        ];

        foreach ($defaults as $status) {
            $space->statuses()->create($status);
        }
    }
}
