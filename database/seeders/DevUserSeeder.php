<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Space;
use App\Models\Task;
use App\Models\TaskStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DevUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin Hero',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole('admin');

        // 2. Create Member User
        $member = User::firstOrCreate(
            ['email' => 'member@example.com'],
            [
                'name' => 'Demo Member',
                'password' => Hash::make('password'),
            ]
        );
        $member->assignRole('member');

        // 3. Create a Default Space
        $space = Space::firstOrCreate(
            ['slug' => 'engineering'],
            [
                'name' => 'Engineering',
                'description' => 'Core product development and scaling.',
                'color' => '#6366f1',
                'created_by' => $admin->id,
            ]
        );

        // Ensure member is in the space
        $space->members()->syncWithoutDetaching([
            $admin->id => ['role' => 'admin'],
            $member->id => ['role' => 'member'],
        ]);

        // 4. Create Tasks for the Admin (Lineup)
        $todoStatus = $space->statuses()->where('name', 'To Do')->first();
        $inProgressStatus = $space->statuses()->where('name', 'In Progress')->first();
        $doneStatus = $space->statuses()->where('name', 'Done')->first();

        if ($todoStatus && $inProgressStatus) {
            Task::firstOrCreate(
                ['title' => 'Optimize Redis Caching'],
                [
                    'space_id' => $space->id,
                    'status_id' => $inProgressStatus->id,
                    'assigned_to' => $admin->id,
                    'created_by' => $admin->id,
                    'priority' => 'high',
                    'due_date' => now()->addDays(2),
                ]
            );

            Task::firstOrCreate(
                ['title' => 'Refine ClickUp Navbar'],
                [
                    'space_id' => $space->id,
                    'status_id' => $todoStatus->id,
                    'assigned_to' => $admin->id,
                    'created_by' => $admin->id,
                    'priority' => 'medium',
                    'due_date' => now()->addDays(5),
                ]
            );

            Task::firstOrCreate(
                ['title' => 'System Scalability Test'],
                [
                    'space_id' => $space->id,
                    'status_id' => $todoStatus->id,
                    'assigned_to' => $member->id,
                    'created_by' => $admin->id,
                    'priority' => 'high',
                    'due_date' => now()->addDay(),
                ]
            );
        }
    }
}
