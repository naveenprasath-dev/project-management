<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('space_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role')->default('member'); // admin, member, viewer
            $table->timestamps();

            $table->unique(['space_id', 'user_id']);
            $table->index(['user_id', 'space_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_members');
    }
};
