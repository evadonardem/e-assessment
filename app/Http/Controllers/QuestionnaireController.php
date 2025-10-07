<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuestionnaireRequest;
use App\Http\Requests\UpdateQuestionnaireRequest;
use App\Http\Resources\AvailableQuestionResource;
use App\Models\Question;
use App\Models\Questionnaire;
use App\Models\QuestionType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuestionnaireController extends Controller
{
    public function __construct(
        protected Question $question
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        $questionnaires = Questionnaire::orderBy('created_at', 'desc')
            ->with([
                'sections' => function (HasMany $query) {
                    $query->withCount('questions');
                },
                'assessments' => function (HasMany $query) {
                    $query->withCount([
                        'answers as mcq_correct_answers_count' => function (Builder $query) {
                            $query->whereHas('assessment', function (Builder $query) {
                                $query->whereNotNull('submitted_at');
                            });
                            $query->whereHas('question.type', function (Builder $query) {
                                $query->where('code', 'MCQ');
                            });
                            $query->whereHas('option', function (Builder $query) {
                                $query->where('is_correct', 1);
                            });
                        },
                        'answers as arq_correct_answers_count' => function (Builder $query) {
                            $refTable = $query->getModel()->getTable();
                            $query->whereHas('assessment', function (Builder $query) {
                                $query->whereNotNull('submitted_at');
                            });
                            $query->whereHas('question.type', function (Builder $query) {
                                $query->where('code', 'ARQ');
                            });
                            $query->whereNotNull("$refTable.is_true");
                            $query->join(
                                $this->question->getTable().' as q',
                                function (JoinClause $join) use ($refTable) {
                                    $join->on(
                                        "$refTable.question_id",
                                        'q.id'
                                    );
                                    $join->on(
                                        "$refTable.is_true",
                                        'q.is_true'
                                    );
                                }
                            );
                        },
                    ]);
                },
            ])
            ->paginate($perPage);

        $questionnaires->map(function ($questionnaire) {
            $questionnaire->total_points = $questionnaire->sections->reduce(function ($carry, $section) {
                return $carry + $section->questions_count;
            }, 0);
            $questionnaire->assessments->map(function ($assessment) {
                $totalScore = null;
                foreach (['mcq', 'arq'] as $type) {
                    if (! ($assessment->{$type.'_correct_answers_count'} ?? false)) {
                        continue;
                    }
                    if (is_null($totalScore)) {
                        $totalScore = $assessment->{$type.'_correct_answers_count'};
                    } else {
                        $totalScore += $assessment->{$type.'_correct_answers_count'};
                    }
                    unset($assessment->{$type.'_correct_answers_count'});
                }
                if (! is_null($assessment->submitted_at)) {
                    $assessment->total_score = $totalScore ?? 0;
                }
            });
            unset($questionnaire->sections);
        });

        return Inertia::render('Questionnaire/List', [
            'questionnaires' => $questionnaires,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionnaireRequest $request)
    {
        $questionnaire = Questionnaire::create([
            'title' => $request->input('title'),
        ]);

        return to_route('questionnaires.show', [
            'questionnaire' => $questionnaire,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Questionnaire $questionnaire)
    {
        $questionTypes = QuestionType::all()->transform(function ($questionType) {
            return $questionType->only('code', 'description');
        });

        $questionnaire->loadMissing('sections.questions.options');
        $questionnaire->loadMissing('sections.questions.type');
        $filters = $request->input('filters', []);

        $questionnaire->sections->map(function ($section) {
            $section->setRelation('questions', $section->questions->shuffle());
            $section->questions->map(function ($question) {
                if (strcasecmp($question->type->code, 'mcq') === 0 && $question->is_random_options) {
                    $question->setRelation('options', $question->options->shuffle());
                }
            });
        });

        $availableQuestions = collect();
        if (
            $filters['section_id'] ?? false &&
            $questionnaire->sections->pluck('id')->contains($filters['section_id'])
        ) {
            $questionIds = $questionnaire
                ->sections->where('id', $filters['section_id'])
                ->first()?->questions->pluck('id')->toArray() ?? [];
            $availableQuestionsQuery = $this->question->newQuery()
                ->where('is_published', 1)
                ->whereNotIn('id', $questionIds);

            if ($filters['question_type_code'] ?? false) {
                $questionTypeCode = $filters['question_type_code'];
                $availableQuestionsQuery->whereHas('type', function (Builder $query) use ($questionTypeCode) {
                    $query->where('code', $questionTypeCode);
                });
            }

            if ($filters['tags'] ?? false) {
                $tags = $filters['tags'];
                $availableQuestionsQuery->where(function (Builder $query) use ($tags) {
                    foreach ($tags as $tag) {
                        $query->orWhereJsonContains('tags', $tag);
                    }
                });
            }

            $availableQuestionsQuery->withCount(['answers']);
            $availableQuestionsQuery->orderBy('updated_at', 'desc');

            $availableQuestions = $availableQuestionsQuery->with(['type', 'options'])->paginate(15);
        }

        $stats = null;
        if ($questionnaire->is_published && $questionnaire->assessments->isNotEmpty()) {
            $questionnaire->loadMissing('assessments.answers.question.type');

            $stats = $questionnaire->sections->mapWithKeys(function ($section) {
                $questions = $section->questions->mapWithKeys(function ($question) {
                    if (strcasecmp($question->type->code, 'mcq') === 0) {
                        $data = $question->options->mapWithKeys(function ($option, $i) {
                            return ['option-'.$option->id => collect([
                                'id' => $option->id,
                                'is_correct' => $option->is_correct,
                                'responses' => 0,
                                'label' => chr(65 + $i),
                            ])];
                        })->toArray();
                    }

                    if (strcasecmp($question->type->code, 'arq') === 0) {
                        $data = [
                            'true' => [
                                'is_correct' => $question->is_true,
                                'responses' => 0,
                                'label' => 'True',
                            ],
                            'false' => [
                                'is_correct' => ! $question->is_true,
                                'responses' => 0,
                                'label' => 'False',
                            ],
                        ];
                    }

                    return ['question-'.$question->id => [
                        'id' => $question->id,
                        'barChart' => [
                            'dataset' => [],
                            'xAxis' => [
                                [
                                    'scaleType' => 'band',
                                    'dataKey' => 'label',
                                ],
                            ],
                            'yAxis' => [
                                [
                                    'label' => 'Count',
                                ],
                            ],
                            'series' => [
                                [
                                    'dataKey' => 'responses',
                                    'label' => 'Responses',
                                ],
                            ],
                        ],
                        'gauge' => 0,
                        'data' => $data,
                    ]];
                });

                return ['section-'.$section->id => $questions];
            })->toArray();

            $answers = $questionnaire->assessments->pluck('answers')->flatten();
            $answers->filter(fn ($answer) => strcasecmp($answer->question->type->code, 'mcq') === 0)->each(function ($answer) use (&$stats) {
                if (array_key_exists(
                    'option-'.$answer->option_id,
                    $stats['section-'.$answer->questionnaire_section_id]['question-'.$answer->question_id]['data']
                )) {
                    $optionRef = &$stats['section-'.$answer->questionnaire_section_id]['question-'.$answer->question_id]['data']['option-'.$answer->option_id];
                    $optionRef['responses'] += 1;
                }
            });
            $answers->filter(fn ($answer) => strcasecmp($answer->question->type->code, 'arq') === 0)->each(function ($answer) use (&$stats) {
                if (! is_null($answer->is_true)) {
                    $optionRef = &$stats['section-'.$answer->questionnaire_section_id]['question-'.$answer->question_id]['data'][$answer->is_true ? 'true' : 'false'];
                    $optionRef['responses'] += 1;
                }
            });

            foreach ($stats as &$section) {
                foreach ($section as &$question) {
                    $tally = array_values($question['data']);
                    $correctResponses = array_filter($tally, function ($answer) {
                        return $answer['is_correct'];
                    });
                    $allCorrectResponsesCount = array_sum(array_column($correctResponses, 'responses'));
                    $allResponsesCount = array_sum(array_column($tally, 'responses'));
                    $question['barChart']['dataset'] = $tally;
                    $question['gauge'] = $allResponsesCount ? round($allCorrectResponsesCount / $allResponsesCount * 100) : 0;
                }
            }
        }

        unset($questionnaire->assessments);

        return Inertia::render('Questionnaire/Show', [
            'filters' => [
                'section_id' => $filters['section_id'] ?? null,
                'question_type_code' => $filters['question_type_code'] ?? null,
                'tags' => $filters['tags'] ?? null,
            ],
            'questionnaire' => $questionnaire,
            'questions' => AvailableQuestionResource::collection($availableQuestions),
            'questionTypes' => $questionTypes,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Questionnaire $questionnaire)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuestionnaireRequest $request, Questionnaire $questionnaire)
    {
        $questionnaire->update($request->all());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Questionnaire $questionnaire)
    {
        $questionnaire->delete();
    }
}
