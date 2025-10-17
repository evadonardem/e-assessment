<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiApiService
{
    private const DEFAULT_COMPLEXITY_LEVELS = ['easy', 'medium', 'hard'];

    private const DEFAULT_ITEMS_COUNT = 5;

    private const GEMINI_API_URL =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function generateMCQ(
        string $topic,
        int $itemsCount = self::DEFAULT_ITEMS_COUNT,
        array $complexityLevels = self::DEFAULT_COMPLEXITY_LEVELS,
        string $extraInstructions = ''
    ): string {
        $levels = implode(', ', $complexityLevels);
        $prompts =
        <<<PROMPTS
        Create $itemsCount multiple choice questions on the topic of $topic.
        Distribute the questions evenly across the following complexity levels: $levels.
        Each question should have 4 unique options and indicate the correct answer by its index (0-3).
        $extraInstructions
        Format the response as a JSON array where each element contains:
        - "description": The question description HTML safe renderable
        - "options": An array of 4 unique option texts HTML safe renderable
        - "answer": The index (0-3) of the correct option
        Return only the JSON array without any additional text.
        PROMPTS;

        $response = Http::withHeaders([
            'x-goog-api-key' => env('GEMINI_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post(self::GEMINI_API_URL, [
            'system_instruction' => [
                'parts' => [
                    'text' => <<<'SYSTEM_INSTRUCTION'
                    Avoid options like "All of the above" or "None of the above".
                    Ensure that all options are plausible to avoid making the correct answer obvious.
                    Ensure that the questions and options are clear and unambiguous.
                    Ensure only one correct answer per question.
                    Verify all answers are correct and correspond to the questions.
                    Use proper grammar and spelling.
                    Format the response strictly as a JSON array as specified in the prompt.
                    Do not include any additional text or explanations outside the JSON array.
                    SYSTEM_INSTRUCTION
                ],
            ],
            'contents' => [
                'parts' => [
                    'text' => $prompts,
                ],
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'thinkingConfig' => [
                    'thinkingBudget' => 0,
                ],
            ],
        ]);

        if ($response->failed()) {
            return $response->json('error');
        }

        return $response->json('candidates.0.content.parts.0.text');
    }
}
