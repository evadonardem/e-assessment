<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssessmentRequest;
use App\Http\Requests\UpdateAssessmentRequest;
use App\Models\Assessment;
use App\Models\Questionnaire;

class AssessmentController extends Controller
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
    public function store(StoreAssessmentRequest $request, Questionnaire $questionnaire)
    {
        $names = $request->input('names', []);
        $names = array_map(function ($name) use ($questionnaire) {
            $code = now('Asia/Manila')->format('ymd-v').'-'.$questionnaire->id.'-'
                .chr(65 + rand(0, 25)).chr(65 + rand(0, 25)).chr(65 + rand(0, 25));

            return [
                'name' => $name,
                'code' => $code,
            ];
        }, $names);

        $questionnaire->assessments()->createMany($names);
    }

    /**
     * Display the specified resource.
     */
    public function show(Assessment $assessment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Assessment $assessment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAssessmentRequest $request, Assessment $assessment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Assessment $assessment)
    {
        //
    }
}
