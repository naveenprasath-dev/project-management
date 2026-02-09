<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            'view spaces', 'create spaces', 'edit spaces', 'delete spaces',
            'view tasks', 'create tasks', 'edit tasks', 'delete tasks',
            'view chat', 'send messages',
            'manage users', 'manage roles'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles and assign permissions
        
        // Admin: Everything
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Member: Standard usage
        $memberRole = Role::firstOrCreate(['name' => 'member']);
        $memberRole->givePermissionTo([
            'view spaces', 'create spaces', 'edit spaces',
            'view tasks', 'create tasks', 'edit tasks',
            'view chat', 'send messages'
        ]);

        // Guest: Read-only
        $guestRole = Role::firstOrCreate(['name' => 'guest']);
        $guestRole->givePermissionTo([
            'view spaces',
            'view tasks',
            'view chat'
        ]);
    }
}
