<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionnaireSectionQuestionResource extends JsonResource
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
            'description' => $this->description,
            'type' => QuestionTypeResource::make($this->type),
            'is_published' => (bool) $this->is_published,
            'options' => $this->when(
                strcasecmp($this->type->code, 'mcq') === 0,
                QuestionOptionResource::collection($this->whenLoaded('options'))
            ),
        ];
    }
}
