<?php

namespace App\Http\Controllers\Importer;

use App\Http\Controllers\Controller;
use App\Models\Option;
use App\Models\Question;
use App\Models\QuestionType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MultipleChoiceQuestionImporter extends Controller
{
    private int $questionTypeId;

    public function __construct(
        protected Option $optionModel,
        protected Question $questionModel,
        protected QuestionType $questionType,
    ) {
        $this->questionTypeId =
            $this->questionType->newQuery()
                ->where('code', 'MCQ')
                ->first()?->id ?? 0;
    }

    public function index(Request $request)
    {
        $key = $request->input('key');
        $path = Storage::disk('local')->path("mcq_bucket/$key.csv");
        $fileHandle = fopen($path, 'r');
        while ($row = fgetcsv($fileHandle)) {
            $question = trim($row[0]);
            $options = [
                [
                    'description' => trim($row[1]),
                    'is_correct' => 1,
                ],
                [
                    'description' => trim($row[2]),
                ],
                [
                    'description' => trim($row[3]),
                ],
                [
                    'description' => trim($row[4]),
                ],
            ];

            $isNew = ! $this->questionModel->newQuery()
                ->where('description', $question)
                ->exists();

            if ($isNew) {
                $question = $this->questionModel->newQuery()->create([
                    'description' => $question,
                    'question_type_id' => $this->questionTypeId,
                    'tags' => [$key],
                    'is_random_options' => 1,
                    'is_published' => 1,
                ]);
                $question->options()->createMany($options);
            }
        }
        fclose($fileHandle);
    }

    public function dataFeed()
    {
        $files = Storage::disk('local')->files('data_feeds');
        foreach ($files as $path) {
            $storagePath = Storage::disk('local')->path($path);
            $tag = Str::of($storagePath)->explode('/');
            $tag = Str::of($tag->last())->explode('.')->first();

            $data = File::json($storagePath);
            foreach ($data as $question) {
                $questionDescription = $question['description'];
                $isNew = ! $this->questionModel->newQuery()
                    ->where('description', $questionDescription)
                    ->exists();
                if ($isNew) {
                    $newQuestionData = [
                        'description' => $questionDescription,
                        'question_type_id' => $this->questionTypeId,
                        'tags' => [$tag],
                        'is_random_options' => 1,
                        'is_published' => 1,
                    ];

                    $correctOptionIndex = $question['answer'];
                    $newQuestionOptionsData = collect($question['options'])
                        ->map(function ($optionDescription, $key) use ($correctOptionIndex) {
                            return [
                                'description' => $optionDescription,
                                'is_correct' => $key == $correctOptionIndex,
                            ];
                        })->toArray();
                    $question = $this->questionModel->newQuery()->create($newQuestionData);
                    $question->options()->createMany($newQuestionOptionsData);
                }
            }
        }
    }
}
