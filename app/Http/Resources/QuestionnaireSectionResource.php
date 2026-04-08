<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionnaireSectionResource extends JsonResource
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
            'order' => $this->order,
            'description' => $this->description,
            'questions_count' => $this->when(isset($this->questions_count), $this->questions_count),
            'questions' => QuestionnaireSectionQuestionResource::collection($this->whenLoaded('questions')),
        ];
    }
}
