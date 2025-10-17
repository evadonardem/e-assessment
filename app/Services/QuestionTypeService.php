<?php

namespace App\Services;

use App\Repositories\QuestionTypeRepository;
use Illuminate\Database\Eloquent\Collection;

class QuestionTypeService
{
    public function __construct(
        protected QuestionTypeRepository $questionTypeRepository
    ) {}

    public function getAllQuestionTypes(): Collection
    {
        return $this->questionTypeRepository->get();
    }
}
