<?php

namespace App\Services;

use App\Models\User;

class UserService extends BaseService
{
    protected string $model = User::class;

    /**
     * Create a new user with a specified role.
     */
    public function createWithRole(array $data, string $role): User
    {
        /** @var User $user */
        $user = $this->create($data);
        $user->assignRole($role);

        return $user;
    }
}
