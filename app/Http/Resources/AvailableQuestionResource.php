<?php

namespace App\Http\Resources;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AvailableQuestionResource extends JsonResource
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
            'is_published' => $this->is_published,
            'answers_count' => $this->when(isset($this->answers_count), $this->answers_count),
            'options' => $this->when(
                strcasecmp($this->type->code, 'mcq') === 0,
                QuestionOptionResource::collection($this->options->shuffle())
            ),
        ];
    }
}
