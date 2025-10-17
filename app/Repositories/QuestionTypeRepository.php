<?php

namespace App\Repositories;

use App\Models\QuestionType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class QuestionTypeRepository extends BaseRepository
{
    public function __construct(
        protected QuestionType $questionType,
    ) {}

    public function get(
        ?int $perPage = null,
        array $filters = [],
        array $orderBy = []
    ): Collection|LengthAwarePaginator {
        $query = $this->questionType->newQuery();

        if ($perPage) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }
}
