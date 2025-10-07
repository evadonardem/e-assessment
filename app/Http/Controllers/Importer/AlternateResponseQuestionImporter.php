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

class AlternateResponseQuestionImporter extends Controller
{
    private int $questionTypeId;

    public function __construct(
        protected Option $optionModel,
        protected Question $questionModel,
        protected QuestionType $questionType,
    ) {
        $this->questionTypeId =
            $this->questionType->newQuery()
                ->where('code', 'ARQ')
                ->first()?->id ?? 0;
    }

    public function index(Request $request)
    {
        $key = $request->input('key');
        $path = Storage::disk('local')->path("arq_bucket/$key.csv");
        $fileHandle = fopen($path, 'r');
        while ($row = fgetcsv($fileHandle)) {
            $question = trim($row[0]);
            $isTrue = strtolower(trim($row[1])) === 'true';

            $isNew = ! $this->questionModel->newQuery()
                ->where('description', $question)
                ->exists();

            if ($isNew) {
                $question = $this->questionModel->newQuery()->create([
                    'description' => $question,
                    'question_type_id' => $this->questionTypeId,
                    'tags' => [$key],
                    'is_true' => $isTrue,
                    'is_published' => 1,
                ]);
            }
        }
        fclose($fileHandle);
    }

    public function dataFeed()
    {
        $files = Storage::disk('local')->files('arq_data_feed');
        dump($files);
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
                if (! $isNew) {
                    continue;
                }
                $newQuestionData = [
                    'description' => $questionDescription,
                    'question_type_id' => $this->questionTypeId,
                    'tags' => [$tag],
                    'is_published' => 1,
                    'is_true' => $question['answer'] === true,
                ];

                $this->questionModel->newQuery()->create($newQuestionData);
            }
        }
    }
}
