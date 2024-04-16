<?php

use App\Models\Assessment;
use App\Models\Option;
use App\Models\Question;
use App\Models\QuestionnaireSection;
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
        Schema::create('assessment_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Assessment::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreignIdFor(QuestionnaireSection::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignIdFor(Question::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignIdFor(Option::class)
                ->nullable()
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('restrict')
                ->default(null);
            $table->boolean('is_true')->nullable()->default(null);
            $table->timestamps();

            $table->unique([
                'assessment_id',
                'questionnaire_section_id',
                'question_id',
            ], 'unique_answer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_answers');
    }
};
