<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'duration_in_seconds' => $this->duration_in_seconds,
            'remaining_time_in_seconds' => $this->remaining_time_in_seconds,
            'max_attempts_on_blur' => $this->max_attempts_on_blur,
            'attempts_on_blur' => $this->attempts_on_blur,
            'questionnaire' => QuestionnaireResource::make($this->whenLoaded('questionnaire')),
            'answers' => $this->answers,
        ];
    }
}
