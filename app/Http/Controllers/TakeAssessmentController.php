<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class TakeAssessmentController extends Controller
{
    public function __construct(
        protected Assessment $assessment,
        protected AssessmentAnswer $assessmentAnswer
    ) {

    }

    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required',
        ]);

        $code = $request->input('code');
        $assessment = $this->assessment->newQuery()->where('code', $code)->first();

        $validator->after(function ($validator) use ($assessment, $request) {
            if ($assessment) {
                if ($assessment->submitted_at) {
                    $validator->errors()->add(
                        'code',
                        'The code already mark as submitted.'
                    );
                } elseif (
                    ! is_null($assessment->session_key) &&
                    $assessment->session_key !== $request->session()->get('session_key')
                ) {
                    $validator->errors()->add(
                        'code',
                        'The code already mark as in progress.'
                    );
                }
            }
        });

        if ($validator->fails()) {

            $assessmentScore = null;
            if ($assessment) {
                $questions = $assessment->questionnaire->sections
                    ->pluck('questions')
                    ->flatten();
                $totalPoints = $questions->count();

                $keyAnswer = [];
                $questions
                    ->pluck('options')
                    ->flatten()
                    ->filter(fn ($option) => $option->is_correct)
                    ->groupBy('question_id')
                    ->values()
                    ->each(function ($group) use (&$keyAnswer) {
                        $group->each(function ($option) use (&$keyAnswer) {
                            $keyAnswer[$option->question_id][] = $option->id;
                        });
                    });
                $assessmentScore = $keyAnswer;

                $totalScore = 0;
                $assessment->answers->each(function ($answer) use (&$totalScore, $keyAnswer) {
                    $ref = $keyAnswer[$answer->question_id] ?? null;
                    $totalScore += $ref && in_array($answer->option_id, $ref) ? 1 : 0;
                });

                $assessmentScore = [
                    'description' => $assessment->questionnaire->description,
                    'name' => $assessment->name,
                    'total_score' => $totalScore,
                    'total_points' => $totalPoints,
                ];
            }

            return redirect()
                ->route('take-assessment')
                ->with('assessmentScore', $assessmentScore)
                ->withErrors($validator);
        }

        if ($assessment) {
            if (is_null($assessment->session_key)) {
                $sessionKey = Hash::make($assessment->id.now());
                $request->session()->put('session_key', $sessionKey);
                $assessment->started_at = now();
                $assessment->session_key = $sessionKey;
                $assessment->save();
            }
            $assessment = Cache::rememberForever("assessment-$assessment->id", function () use ($assessment) {
                $assessment->loadMissing('questionnaire.sections.questions.options');
                $assessment->loadMissing('questionnaire.sections.questions.type');
                $assessment->questionnaire->sections->map(function ($section) {
                    $section->setRelation('questions', $section->questions->shuffle());
                    $section->questions->map(function ($question) {
                        if ($question->type->code === 'MCQ' && $question->is_random_options) {
                            $question->setRelation('options', $question->options->shuffle());
                        }
                    });
                });

                return $assessment;
            });
            $assessment->loadMissing('answers');
        }

        return Inertia::render('TakeAssessment/Index', [
            'assessment' => $assessment,
            'answers' => $assessment?->answers ?? [],
        ]);
    }

    public function store(Request $request)
    {
        $code = $request->input('code');
        $sessionKey = $request->session()->get('session_key');
        $assessment = $this->assessment->newQuery()
            ->where([
                'code' => $code,
                'session_key' => $sessionKey,
            ])->first();

        if (! $assessment) {
            return redirect()->route('take-assessment');
        }

        $sectionId = $request->input('questionnaire_section_id');
        $questionId = $request->input('question_id');
        $optionId = $request->input('option_id');
        $isTrue = $request->input('is_true');

        $this->assessmentAnswer->newQuery()
            ->upsert([
                'assessment_id' => $assessment->id,
                'questionnaire_section_id' => $sectionId,
                'question_id' => $questionId,
                'option_id' => $optionId,
                'is_true' => $isTrue,
            ], uniqueBy: [
                'assessment_id',
                'questionnaire_section_id',
                'question_id',
            ], update: [
                'option_id',
                'is_true',
            ]);
    }

    public function update(Request $request)
    {
        $code = $request->input('code');
        $sessionKey = $request->session()->get('session_key');
        $assessment = $this->assessment->newQuery()
            ->where([
                'code' => $code,
                'session_key' => $sessionKey,
            ])->first();

        if (! $assessment) {
            return redirect()->route('take-assessment');
        }

        $assessment->submitted_at = now();
        $assessment->save();

        Cache::forget("assessment-$assessment->id");
        $request->session()->forget('session_key');
    }
}
