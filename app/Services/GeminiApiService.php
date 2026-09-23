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
        // 1. Math & Remainder Distribution
        $levelsCount = count($complexityLevels);
        $perLevelCount = max(1, (int) floor($itemsCount / $levelsCount));
        $remainder = $itemsCount % $levelsCount;

        // 2. Format explicit targets dynamically
        $breakdownLines = [];
        foreach ($complexityLevels as $index => $level) {
            $count = $perLevelCount + ($index < $remainder ? 1 : 0);
            $levelName = strtoupper(trim($level));
            $breakdownLines[] = "- Generate {$count} question(s) matching {$levelName} criteria.";
        }
        $breakdownText = implode("\n", $breakdownLines);

        // 3. Clean optional extra instructions
        $extraRequirement = ! empty(trim($extraInstructions))
            ? '- '.trim($extraInstructions)
            : '';

        $prompts =
            <<<PROMPTS
            Generate exactly $itemsCount multiple-choice questions on the topic:
            "$topic"

            EXACT QUANTITY BREAKDOWN:
            $breakdownText

            REQUIREMENTS:
            - Each question must have exactly 4 unique options.
            $extraRequirement

            REQUIRED OUTPUT FORMAT:
            Return ONLY a valid JSON array matching this exact structure:
            [
                {
                    "description": "Question text here",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": 0
                }
            ]

            Do not include any text outside of the JSON array.
            PROMPTS;

        $systemInstruction =
            <<<'SYSTEM_INSTRUCTION'
            You are an expert assessment generator. Follow these rules strictly:

            CONTENT & OPTION RULES:
            - Every option MUST be a distinct, stand-alone concept, definition, or phrase.
            - Every option MUST be self-contained and accurate regardless of position.
            - Prohibit meta-references or references to choices relative to each other (e.g., "all of the above", "both A and B").
            - Distribute the correct answer position (0, 1, 2, 3) uniformly across all questions.

            OPTION LENGTH & DISTRACTOR SYMMETRY RULES (STRICT):
            - NO LENGTH BIAS: All 4 options within a question MUST have roughly the same word count and structural complexity (matching within ±3 words of each other).
            - PARALLEL STRUCTURE: Every option in a question must share the same grammatical form (e.g., all full sentences, all noun phrases, or all verb phrases).
            - NO TELL-TALE QUALIFIERS: Do NOT add extra explanations, qualifiers, or justifications to the correct answer while leaving incorrect options brief or blunt.
            - PLAUSIBLE DISTRACTORS: Incorrect options must use realistic technical terminology and plausible logic. They must represent real-world misconceptions rather than obviously incorrect choices.

            HTML & FORMATTING RULES:
            - RICH TEXT FORMATTING: Use standard, unescaped basic HTML tags (<strong>, <em>, <code>, <br>) for intentional text styling or structure.
            - LITERAL CODE & SPECIAL CHARACTERS: If a question or option refers to code syntax, HTML tags, or math comparisons (e.g., "What does <div> do?" or "if x < y"), you MUST encode the literal angle brackets as HTML entities (&lt;div&gt;, x &lt; y) so they render visually as raw code on screen.
            - Do NOT double-encode rich text formatting tags (e.g., write <strong>, not &lt;strong&gt;).
            - Ensure all double quotes inside text values are properly escaped for valid JSON.

            DIFFICULTY & COGNITIVE TASK RULES:
            - EASY / BEGINNER: Direct recall, standard definitions, single-step factual questions.
            - MEDIUM / INTERMEDIATE: Application of concepts to brief scenarios; asking "why" or "which principle applies."
            - HARD / ADVANCED: Multi-step reasoning, trade-off evaluation, finding flaws, or contrasting two concepts. Distractors must represent common misconceptions.

            OUTPUT RULES:
            - Output raw, valid JSON ONLY.
            - Do NOT include markdown code blocks, backticks, commentary, or text before/after the array.
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
                                ['text' => $systemInstruction],
                            ],
                        ],
                        'contents' => [
                            [
                                'role' => 'user',
                                'parts' => [
                                    ['text' => $prompts],
                                ],
                            ],
                        ],
                        'generationConfig' => [
                            'responseMimeType' => 'application/json',
                            'temperature' => 0.2, // Low temperature ensures consistent rule-following
                            'responseSchema' => [
                                'type' => 'ARRAY',
                                'items' => [
                                    'type' => 'OBJECT',
                                    'properties' => [
                                        'description' => ['type' => 'STRING'],
                                        'options' => [
                                            'type' => 'ARRAY',
                                            'items' => ['type' => 'STRING'],
                                        ],
                                        'answer' => ['type' => 'INTEGER'],
                                    ],
                                    'required' => ['description', 'options', 'answer'],
                                ],
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
