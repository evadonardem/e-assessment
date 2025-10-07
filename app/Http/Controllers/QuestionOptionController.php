<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOptionRequest;
use App\Http\Requests\UpdateOptionRequest;
use App\Models\Option;
use App\Models\Question;

class QuestionOptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Question $question)
    {
        return $question->options;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOptionRequest $request, Question $question)
    {
        $optionDetails = $request->only([
            'description',
            'is_correct',
        ]);

        $question->options()->create($optionDetails);

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question, Option $option)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOptionRequest $request, Question $question, Option $option)
    {
        $optionDetails = $request->only([
            'description',
            'is_correct',
        ]);

        $query = new Option;
        $query->newQuery()
            ->where([
                'id' => $option->id,
                'question_id' => $question->id,
            ])
            ->update($optionDetails);

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question, Option $option)
    {
        $query = new Option;
        $query->newQuery()
            ->where([
                'id' => $option->id,
                'question_id' => $question->id,
            ])
            ->delete();

        return response()->noContent();
    }
}
