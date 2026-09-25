<?php

namespace App\Repositories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class QuestionRepository extends BaseRepository
{
    public function __construct(
        protected Question $question,
    ) {}

    public function get(
        ?int $perPage = null,
        array $filters = [],
        array $orderBy = []
    ): Collection|LengthAwarePaginator {
        $query = $this->question->newQuery();

        return $perPage ? $query->paginate($perPage) : $query->get();
    }

    public function getAllTags()
    {
        return $this->question->newQuery()
            ->crossJoin(DB::raw("JSON_TABLE(questions.tags, '$[*]' COLUMNS(tag VARCHAR(255) PATH '$')) as jt"))
            ->whereNotNull('jt.tag')
            ->where('jt.tag', '<>', '')
            ->distinct()
            ->orderBy('jt.tag', 'asc')
            ->pluck('jt.tag')
            ->all();
    }
}
