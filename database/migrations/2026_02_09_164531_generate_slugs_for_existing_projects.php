<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $projects = DB::table('projects')->whereNull('slug')->get();

        foreach ($projects as $project) {
            $baseSlug = Str::slug($project->name);
            $slug = $baseSlug;
            $counter = 1;

            // Ensure slug is unique within the space
            while (DB::table('projects')
                ->where('space_id', $project->space_id)
                ->where('slug', $slug)
                ->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            DB::table('projects')
                ->where('id', $project->id)
                ->update(['slug' => $slug]);
        }

        // After generating slugs, make the column NOT NULL
        Schema::table('projects', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
            $table->unique(['space_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropUnique(['space_id', 'slug']);
        });
    }
};
