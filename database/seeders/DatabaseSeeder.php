<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Question;
use App\Models\QuestionType;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Question::create([
            'description' => 'Test MCQ',
            'question_type_id' => QuestionType::where('code', 'MCQ')->first()->id,
        ]);

        Question::create([
            'description' => 'Test ARQ',
            'question_type_id' => QuestionType::where('code', 'ARQ')->first()->id,
        ]);
    }
}
