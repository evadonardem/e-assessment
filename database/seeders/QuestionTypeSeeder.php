<?php

namespace Database\Seeders;

use App\Models\QuestionType;
use Illuminate\Database\Seeder;

class QuestionTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questionTypes = [
            [
                'code' => 'MCQ',
                'description' => 'Multiple Choice Question',
            ],
            [
                'code' => 'ARQ',
                'description' => 'Alternate Response Question',
            ],
        ];

        $model = new QuestionType;
        foreach ($questionTypes as $questionType) {
            $isExist = $model->newQuery()
                ->where('code', $questionType['code'])
                ->count() > 0;

            if (! $isExist) {
                $model->newQuery()
                    ->create($questionType);
            }
        }
    }
}
