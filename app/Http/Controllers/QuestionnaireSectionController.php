<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuestionnaireSectionRequest;
use App\Http\Requests\UpdateQuestionnaireSectionRequest;
use App\Models\Questionnaire;
use App\Models\QuestionnaireSection;

class QuestionnaireSectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionnaireSectionRequest $request, Questionnaire $questionnaire)
    {
        $questionnaire->sections()->create([
            'description' => $request->input('description'),
            'order' => $questionnaire->sections->count(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(QuestionnaireSection $questionnaireSection)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(QuestionnaireSection $questionnaireSection)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuestionnaireSectionRequest $request, Questionnaire $questionnaire, QuestionnaireSection $questionnaireSection)
    {
        $questionnaireSection->update([
            'description' => $request->input('description'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Questionnaire $questionnaire, QuestionnaireSection $questionnaireSection)
    {
        if (! $questionnaire->sections->pluck('id')->contains($questionnaireSection->id)) {
            abort(400);
        }

        $questionnaireSection->delete();
    }
}
