<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->onDelete('cascade');
            $table->foreignId('status_id')->constrained('task_statuses')->onDelete('cascade');
            $table->string('title');
            $table->longText('description')->nullable();
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->timestamp('due_date')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('space_id');
            $table->index('status_id');
            $table->index('assigned_to');
            $table->index(['space_id', 'order']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
