<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Space;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProjectManagementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Users
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        $member1 = User::create([
            'name' => 'Alice Member',
            'email' => 'alice@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $member1->assignRole('member');

        $member2 = User::create([
            'name' => 'Bob Member',
            'email' => 'bob@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $member2->assignRole('member');

        $allUsers = [$admin, $member1, $member2];

        // 2. Spaces Definition
        $spacesData = [
            [
                'name' => 'Product Development',
                'color' => '#4f46e5', // Indigo
                'description' => 'Main software engineering and product design space.',
            ],
            [
                'name' => 'Marketing & Growth',
                'color' => '#db2777', // Pink
                'description' => 'Brand management, social media, and user acquisition.',
            ],
        ];

        foreach ($spacesData as $index => $sData) {
            $space = Space::create([
                'name' => $sData['name'],
                'slug' => Str::slug($sData['name']),
                'description' => $sData['description'],
                'color' => $sData['color'],
                'created_by' => $admin->id,
            ]);

            // Add all users to the space
            $space->members()->attach([
                $admin->id => ['role' => 'admin'],
                $member1->id => ['role' => 'member'],
                $member2->id => ['role' => 'member'],
            ]);

            // Get statuses created by observer or manually if needed
            // Default TaskStatus has name/color/is_final/order/space_id
            $todo = TaskStatus::where('space_id', $space->id)->where('name', 'To Do')->first() 
                   ?? TaskStatus::create(['space_id' => $space->id, 'name' => 'To Do', 'color' => '#94a3b8', 'order' => 1]);
            
            $inProgress = TaskStatus::where('space_id', $space->id)->where('name', 'In Progress')->first()
                         ?? TaskStatus::create(['space_id' => $space->id, 'name' => 'In Progress', 'color' => '#3b82f6', 'order' => 2]);
            
            $review = TaskStatus::where('space_id', $space->id)->where('name', 'Review')->first()
                      ?? TaskStatus::create(['space_id' => $space->id, 'name' => 'Review', 'color' => '#f59e0b', 'order' => 3]);
            
            $done = TaskStatus::where('space_id', $space->id)->where('name', 'Done')->first()
                    ?? TaskStatus::create(['space_id' => $space->id, 'name' => 'Done', 'color' => '#10b981', 'is_final' => true, 'order' => 4]);

            $statuses = [$todo, $inProgress, $review, $done];

            // 3. Create 2 Projects per Space
            for ($p = 1; $p <= 2; $p++) {
                $projectName = $sData['name'] . " - Project " . $p;
                $project = Project::create([
                    'space_id' => $space->id,
                    'name' => $projectName,
                    'description' => "Description for " . $projectName,
                    'color' => $sData['color'],
                    'created_by' => $admin->id,
                ]);

                // Add members to project
                $project->members()->attach([
                    $admin->id => ['role' => 'admin'],
                    $member1->id => ['role' => 'member'],
                    $member2->id => ['role' => 'member'],
                ]);

                // 4. Create 5 Tasks per Project
                for ($t = 1; $t <= 5; $t++) {
                    $assignee = $allUsers[array_rand($allUsers)];
                    $status = $statuses[array_rand($statuses)];
                    
                    $task = Task::create([
                        'space_id' => $space->id,
                        'project_id' => $project->id,
                        'status_id' => $status->id,
                        'title' => "Task $t in " . $project->name,
                        'description' => "Detailed requirements for task $t.",
                        'priority' => ['low', 'medium', 'high', 'urgent'][array_rand(['low', 'medium', 'high', 'urgent'])],
                        'due_date' => now()->addDays(rand(1, 14)),
                        'created_by' => $admin->id,
                        'assigned_to' => $assignee->id,
                        'order' => $t,
                    ]);

                    // Mirror to task_assignees table if used
                    $task->assignees()->attach($assignee->id);
                }
            }
        }
    }
}
