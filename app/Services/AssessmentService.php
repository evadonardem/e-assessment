<?php

namespace App\Services;

use App\Models\Assessment;

class AssessmentService
{
    public function __construct(
        protected QuestionTypeService $questionTypeService,
    ) {}

    public function calculateScore(Assessment $assessment)
    {
        $totalItems = $assessment->questionnaire->sections->pluck('questions')->flatten()->count();
        $answersByQuestionType = $assessment->answers->groupBy(fn ($item) => $item->question->type->code);

        $totalScore = 0;
        $this->questionTypeService->getAllQuestionTypes()->pluck('code')
            ->each(function (string $code) use ($answersByQuestionType, &$totalScore) {
                $totalScore += $answersByQuestionType->get($code)->reduce(function ($score, $ans) use ($code) {
                    $val = match (strtolower($code)) {
                        'mcq' => $ans->question->options->filter(fn ($option) => $option->is_correct)->contains($ans->option) ? 1 : 0,
                        'arq' => $ans->is_true == $ans->question->is_true ? 1 : 0,
                        default => 0,
                    };

                    return $score + $val;
                }, 0);
            });

        return [
            'totalScore' => $totalScore,
            'totalItems' => $totalItems,
        ];
    }
}
