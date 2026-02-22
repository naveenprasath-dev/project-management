<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SpaceInvitation>
 */
class SpaceInvitationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->safeEmail(),
            'role' => 'member',
            'token' => \Illuminate\Support\Str::random(64),
            'accepted_at' => null,
            'expires_at' => now()->addDays(7),
        ];
    }
}
