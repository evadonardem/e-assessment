<?php

namespace App\Http\Controllers\Generator;

use App\Http\Controllers\Controller;
use App\Services\GeminiApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MCQGeneratorController extends Controller
{
    public function __construct(
        protected GeminiApiService $geminiApiService
    ) {}

    public function create()
    {
        return Inertia::render('Generator/MCQ/Create', []);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:255',
            'items_count' => 'required|integer|min:1|max:50',
            'complexity_levels' => 'required|array',
            'complexity_levels.*' => 'in:easy,medium,hard',
        ]);

        return redirect()->route('generator.mcq.create')
            ->with('mcq_generated_questions', $this->geminiApiService->generateMCQ(
                topic: request()->input('topic'),
                itemsCount: (int) request()->input('items_count', 5),
                complexityLevels: request()->input('complexity_levels', ['easy', 'medium', 'hard']),
            ));
    }

    public function store(Request $request)
    {
        Storage::disk('local')->put(
            '/mcq_data_feed/generated_mcq_'.time().'.json',
            $request->input('questions')
        );
    }
}
