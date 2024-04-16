<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuestionQuestionnaireSectionRequest;
use App\Models\Question;
use App\Models\Questionnaire;
use App\Models\QuestionnaireSection;

class QuestionQuestionnaireSectionController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreQuestionQuestionnaireSectionRequest $request,
        Questionnaire $questionnaire,
        QuestionnaireSection $questionnaireSection
    ) {
        if (! $questionnaire->sections->pluck('id')->contains($questionnaireSection->id)) {
            abort(400);
        }
        $question = Question::find($request->input('question_id'));
        $questionnaireSection->questions()->attach($question);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
