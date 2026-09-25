<?php

namespace App\Services;

use App\Repositories\QuestionRepository;

class QuestionService
{
    public function __construct(
        protected QuestionRepository $questionRepository
    ) {}

    public function getAllTags()
    {
        return $this->questionRepository->getAllTags();
    }
}
