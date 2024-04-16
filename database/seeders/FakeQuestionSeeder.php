<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\QuestionType;
use Illuminate\Database\Seeder;

class FakeQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Question::factory()
            ->count(10)
            ->hasOptions(4)
            ->sequence(fn () => [
                'is_random_options' => (bool) random_int(0, 1),
            ])
            ->create([
                'question_type_id' => QuestionType::where('id', 1)->first()->id,
            ]);

        Question::all()->each(function ($question) {
            $option = $question->options->random();
            $option->is_correct = true;
            $option->save();
        });

        Question::factory()
            ->count(10)
            ->sequence(fn () => [
                'is_true' => (bool) random_int(0, 1),
            ])
            ->create([
                'question_type_id' => QuestionType::where('id', 2)->first()->id,
            ]);
    }
}
