<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Space;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProjectFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Project::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $name = $this->faker->words(3, true);
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence(),
            'color' => $this->faker->hexColor(),
            'space_id' => Space::factory(),
            'is_active' => true,
            'created_by' => \App\Models\User::factory(),
        ];
    }
}
