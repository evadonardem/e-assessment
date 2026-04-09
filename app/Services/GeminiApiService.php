<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiApiService
{
    private const DEFAULT_COMPLEXITY_LEVELS = ['easy', 'medium', 'hard'];

    private const DEFAULT_ITEMS_COUNT = 5;

    private const DEFAULT_REQUEST_TIMEOUT = 60;

    private const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent';

    private const GEMINI_MODELS = [
        'gemini-pro-latest',
        'gemini-3.1-pro',
        'gemini-2.5-pro',

        'gemini-flash-latest',
        'gemini-3.1-flash',
        'gemini-2.5-flash',

        'gemini-flash-lite-latest',
        'gemini-3.1-flash-lite',
        'gemini-2.5-flash-lite',
    ];

    private const MAX_RETRY_ATTEMPTS = 3;

    public function generateMCQ(
        string $topic,
        int $itemsCount = self::DEFAULT_ITEMS_COUNT,
        array $complexityLevels = self::DEFAULT_COMPLEXITY_LEVELS,
        string $extraInstructions = '',
        int $modelIndex = 0
    ): array {
        $levels = implode(', ', $complexityLevels);

        $prompts =
            <<<PROMPTS
            Generate exactly $itemsCount multiple-choice questions on the topic:
            "$topic"

            Requirements:
            - Distribute questions evenly across the following complexity levels: $levels.
            - Each question must have exactly 4 unique, plausible options (no "All of the above" or "None of the above").
            - Vary the correct answer index (0-3) across questions — do not cluster correct answers at the same index.
            - $extraInstructions

            Output format:
            Return only a valid JSON array. Each element must follow this exact schema:
            [
                {
                    "description": "Question text (HTML-safe, concise, unambiguous)",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": <integer index 0-3 of correct option>
                }
            ]

            Do not include any text outside of the JSON array.
            PROMPTS;

        $systemInstruction =
            <<<'SYSTEM_INSTRUCTION'
            You are a master of question generator. Follow these rules strictly:

            CONTENT RULES:
            - All options must be plausible, comparable in length and difficulty.
            - The correct answer must be factually accurate and unambiguous.
            - No repeated questions or options within the same output.
            - Use neutral, grammatically correct phrasing throughout.
            - Questions must be self-contained — no references to "the passage", "the image", etc.
            - Do not use options like "All of the above" or "None of the above".
            - Provide exactly one correct answer per question.

            DIFFICULTY RULES:
            - Easy: recall-based, straightforward facts.
            - Medium: requires understanding or application of concepts.
            - Hard: requires analysis, comparison, or deeper reasoning.

            OUTPUT RULES:
            - Return ONLY a raw JSON array. No markdown, no backticks, no explanation.
            - Do not wrap in ```json``` or add any text before or after the array.
            SYSTEM_INSTRUCTION;

        $model = self::GEMINI_MODELS[$modelIndex];
        $geminiApiUrl = str_replace('{model}', $model, self::GEMINI_API_URL);
        $requestTimeout = self::DEFAULT_REQUEST_TIMEOUT;
        $attempts = 0;

        while ($attempts < self::MAX_RETRY_ATTEMPTS) {
            try {
                $response = Http::withHeaders([
                    'x-goog-api-key' => env('GEMINI_API_KEY'),
                    'Content-Type' => 'application/json',
                ])
                    ->timeout($requestTimeout)
                    ->post($geminiApiUrl, [
                        'system_instruction' => [
                            'parts' => [
                                'text' => $systemInstruction,
                            ],
                        ],
                        'contents' => [
                            'parts' => [
                                'text' => $prompts,
                            ],
                        ],
                        'generationConfig' => [
                            'responseMimeType' => 'application/json',
                            'responseSchema' => [
                                'type' => 'array',
                                'items' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'description' => ['type' => 'string'],
                                        'options' => [
                                            'type' => 'array',
                                            'items' => ['type' => 'string'],
                                            'minItems' => 4,
                                            'maxItems' => 4,
                                        ],
                                        'answer' => [
                                            'type' => 'integer',
                                            'minimum' => 0,
                                            'maximum' => 3,
                                        ],
                                    ],
                                    'required' => ['description', 'options', 'answer'],
                                ],
                            ],
                            'thinkingConfig' => [
                                'thinkingBudget' => 512,
                            ],
                        ],
                    ]);
            } catch (Exception $e) {
                $requestTimeout += self::DEFAULT_REQUEST_TIMEOUT;
                $attempts++;
                if ($attempts >= self::MAX_RETRY_ATTEMPTS) {
                    Log::error('Gemini API request exception', [
                        'message' => $e->getMessage(),
                    ]);

                    return [
                        'success' => false,
                        'data' => null,
                        'error' => $e->getMessage()." (Retries: $attempts)",
                    ];
                }

                continue;
            }
            break;
        }

        if ($response->failed()) {
            $nextModelIndex = $modelIndex + 1;
            $validNextModel = isset(self::GEMINI_MODELS[$nextModelIndex]);

            if ($validNextModel) {
                return $this->generateMCQ(
                    topic: $topic,
                    itemsCount: $itemsCount,
                    complexityLevels: $complexityLevels,
                    extraInstructions: $extraInstructions,
                    modelIndex: $nextModelIndex
                );
            }

            return [
                'success' => false,
                'data' => null,
                'error' => $response->json('error.message') ?? 'Unknown error',
            ];
        }

        return [
            'success' => true,
            'data' => json_decode($response->json('candidates.0.content.parts.0.text'), true),
            'error' => null,
        ];
    }
}
