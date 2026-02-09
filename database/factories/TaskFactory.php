<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Space;
use App\Models\Project;
use App\Models\TaskStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'space_id' => Space::factory(),
            'project_id' => Project::factory(),
            'status_id' => TaskStatus::factory(),
            'title' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'due_date' => $this->faker->dateTimeBetween('+1 week', '+1 month'),
            'created_by' => \App\Models\User::factory(),
        ];
    }
}
