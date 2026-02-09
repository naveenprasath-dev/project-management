<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('task_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('color')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_final')->default(false);
            $table->timestamps();

            $table->index(['space_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_statuses');
    }
};
