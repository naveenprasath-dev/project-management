<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Index for "My Tasks" / Dashboard Lineup
            $table->index(['assigned_to', 'status_id', 'due_date'], 'tasks_assigned_status_due_index');
            
            // Index for Space List View with search/filter
            $table->index(['space_id', 'status_id', 'priority', 'order'], 'tasks_space_filter_index');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            // Index for Space/Task activity feed
            $table->index(['space_id', 'task_id', 'created_at'], 'activity_logs_lookup_index');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('tasks_assigned_status_due_index');
            $table->dropIndex('tasks_space_filter_index');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('activity_logs_lookup_index');
        });
    }
};
