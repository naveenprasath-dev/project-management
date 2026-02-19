<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sprint>
 */
class SprintFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'goal' => $this->faker->sentence(),
            'start_date' => now(),
            'end_date' => now()->addWeeks(2),
            'status' => 'planned',
            'project_id' => \App\Models\Project::factory(),
        ];
    }
}
