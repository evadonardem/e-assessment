<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuestionType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $questions = tap(Question::with(['type', 'options'])
            ->withCount([
                'answers',
                'answers as correct_answers_count' => function (Builder $query) {
                    $query->where(function (Builder $query) {
                        $query->whereHas('question.type', function (Builder $query) {
                            $query->where('code', 'mcq');
                        });
                        $query->whereHas('option', function (Builder $query) {
                            $query->where('is_correct', 1);
                        });
                    })->orWhere(function (Builder $query) {
                        $refTable = $query->getModel()->getTable();
                        $query->whereHas('question.type', function (Builder $query) {
                            $query->where('code', 'arq');
                        });
                        $query
                            ->join('questions', "$refTable.question_id", 'questions.id')
                            ->whereRaw("questions.is_true = $refTable.is_true");
                    });
                },
            ])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage))->map(function ($question) {
                $question->description_preview =
                    Str::limit(strip_tags($question->description), 50);
                if ($question->is_random_options) {
                    $question->setRelation('options', $question->options->shuffle());
                }
            });

        return Inertia::render('Question/List', [
            'questions' => $questions,
        ]);
    }

    public function create()
    {
        $questionTypes = tap(QuestionType::all())
            ->transform(fn ($questionType) => $questionType->only([
                'id',
                'code',
                'description',
            ]));

        return Inertia::render('Question/Create', [
            'question_types' => $questionTypes,
        ]);
    }

    public function store(Request $request)
    {
        $questionDescription = $request->input('description');
        $questionTypeId = $request->input('question_type_id');
        $isMcq = $questionTypeId === QuestionType::where('code', 'mcq')->first()->id;
        $isArq = $questionTypeId === QuestionType::where('code', 'arq')->first()->id;
        $isRandomOptions = $isMcq ? $request->input('is_random_options', false) : false;
        $isPublished = $request->input('is_published', false);

        $question = Question::create([
            'question_type_id' => $questionTypeId,
            'description' => $questionDescription,
            'is_random_options' => $isRandomOptions,
            'is_true' => $isArq ? $request->input('is_true', null) : null,
            'is_published' => $isPublished,
        ]);

        if ($isMcq) {
            $questionOptions = $request->input('options');
            $question->options()->createMany($questionOptions);
        }

        return to_route('questions.list');
    }

    public function update(Request $request, Question $question)
    {
        $question->update($request->all());
    }

    public function show()
    {
        return Inertia::render('Question/Show', [
            'question' => [],
        ]);
    }

    public function destroy(Question $question)
    {
        if ($question->is_published) {
            abort(400);
        }
        $question->delete();
    }
}
