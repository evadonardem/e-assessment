<?php

use App\Models\Questionnaire;
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
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Questionnaire::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('name');
            $table->string('code')->unique();
            $table->string('session_key')->unique()->nullable()->default(null);
            $table->timestamp('started_at')->nullable()->default(null);
            $table->timestamp('submitted_at')->nullable()->default(null);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
