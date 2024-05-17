<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use Carbon\Carbon;
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
            } else {
                if ($request->has('code')) {
                    $validator->errors()->add(
                        'code',
                        'Invalid code.'
                    );
                }
            }
        });

        if ($validator->fails()) {
            return redirect()->route('take-assessment')->withErrors($validator);
        }

        $withTimer = false;
        $assessmentDurationInSeconds = null;
        $assessmentRemainingTimeInSeconds = null;

        $withAttempts = false;
        $maxAttemptsOnBlur = null;
        $attemptsOnBlur = null;

        if ($assessment) {
            $withTimer = ! is_null($assessment->duration_in_seconds);
            $withAttempts = ! is_null($assessment->max_attempts_on_blur);

            if ($withTimer) {
                $assessmentDurationInSeconds = $assessment->duration_in_seconds;
                $assessmentSpendTimeInSeconds = round(Carbon::parse($assessment->started_at)->diffInSeconds(now()));
                $assessmentRemainingTimeInSeconds = $assessmentDurationInSeconds - $assessmentSpendTimeInSeconds;
            }

            if ($withAttempts) {
                $maxAttemptsOnBlur = $assessment->max_attempts_on_blur;
                $attemptsOnBlur = $assessment->attempts_on_blur;
            }

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
            'timer' => $withTimer ? [
                'duration_in_seconds' => $assessmentDurationInSeconds,
                'remaining_time_in_seconds' => $assessmentRemainingTimeInSeconds,
            ] : null,
            'attempts' => $withAttempts ? [
                'current' => $attemptsOnBlur,
                'max' => $maxAttemptsOnBlur,
            ] : null,
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

    public function submitAssessment(Request $request)
    {
        $code = $request->input('code');
        $timeExpired = $request->input('timeExpired');
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

        return redirect()->route('take-assessment')->with('submit', [
            'severity' => $timeExpired ? 'warning' : 'success',
            'message' => $timeExpired ? 'Auto-submitted alloted time expired.' : 'Assessment submitted successfully.',
        ]);
    }

    public function windowSwitch(Request $request)
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

        if (! is_null($assessment->max_attempts_on_blur)) {
            $assessment->attempts_on_blur = $assessment->attempts_on_blur + 1;
            $assessment->save();

            if ($assessment->attempts_on_blur >= $assessment->max_attempts_on_blur) {
                $assessment->submitted_at = now();
                $assessment->save();

                Cache::forget("assessment-$assessment->id");
                $request->session()->forget('session_key');

                return redirect()->route('take-assessment')->with('submit', [
                    'severity' => 'warning',
                    'message' => 'Auto-submitted due to continous window switching.',
                ]);
            }
        }
    }
}
