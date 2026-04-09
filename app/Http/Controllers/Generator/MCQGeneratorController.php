<?php

namespace App\Http\Controllers\Generator;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionType;
use App\Services\GeminiApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MCQGeneratorController extends Controller
{
    private int $questionTypeId;

    public function __construct(
        protected GeminiApiService $geminiApiService,
        protected Question $question,
        protected QuestionType $questionType,
    ) {
        $this->questionTypeId = $this->questionType->newQuery()->where('code', 'MCQ')->first()?->id ?? 0;
    }

    public function create()
    {
        return Inertia::render('Generator/MCQ/Create', []);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:255',
            'items_count' => 'required|integer|min:1|max:100',
            'complexity_levels' => 'required|array',
            'complexity_levels.*' => 'in:easy,medium,hard',
        ]);

        [
            'success' => $success,
            'data' => $data,
            'error' => $error,
        ] = $this->geminiApiService->generateMCQ(
            topic: request()->input('topic'),
            itemsCount: (int) request()->input('items_count', 5),
            complexityLevels: request()->input('complexity_levels', ['easy', 'medium', 'hard']),
        );

        if (! $success) {
            return redirect()->route('generator.mcq.create')
                ->withErrors(['api_service' => $error]);
        }

        return redirect()->route('generator.mcq.create')
            ->with('mcq_generated_questions', $data);
    }

    public function store(Request $request)
    {
        $questions = $request->input('questions');
        $tags = $request->input('tags', []);

        foreach ($questions as $question) {
            $questionDescription = $question['description'];
            $isNew = ! $this->question->newQuery()
                ->where('description', $questionDescription)
                ->exists();
            if ($isNew) {
                $newQuestionData = [
                    'description' => $questionDescription,
                    'question_type_id' => $this->questionTypeId,
                    'tags' => $tags,
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
                $question = $this->question->newQuery()->create($newQuestionData);
                $question->options()->createMany($newQuestionOptionsData);
            }
        }
    }
}
