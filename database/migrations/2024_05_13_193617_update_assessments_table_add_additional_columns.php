<?php

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
        Schema::table('assessments', function (Blueprint $table) {
            $table->unsignedSmallInteger('duration_in_seconds')->after('questionnaire_id')->nullable()->default(null);
            $table->unsignedTinyInteger('max_attempts_on_blur')->after('duration_in_seconds')->nullable()->default(null);
            $table->unsignedTinyInteger('attempts_on_blur')->after('session_key')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn(['duration_in_seconds', 'max_attempts_on_blur', 'attempts_on_blur']);
        });
    }
};
