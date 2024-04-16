<?php

use App\Models\QuestionType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->longText('description');
            $table->foreignIdFor(QuestionType::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->json('tags')->nullable()->default(null);
            $table->boolean('is_random_options')->default(false);
            $table->boolean('is_true')->nullable()->default(null);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
