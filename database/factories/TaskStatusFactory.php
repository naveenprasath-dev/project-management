<?php

namespace Database\Factories;

use App\Models\TaskStatus;
use App\Models\Space;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskStatusFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = TaskStatus::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->word,
            'color' => $this->faker->hexColor,
            'order' => $this->faker->numberBetween(1, 100),
            'is_default' => false,
            'is_final' => false,
            'space_id' => Space::factory(),
            'project_id' => null,
        ];
    }
}
