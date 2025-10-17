<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseRepository
{
    abstract public function get(
        ?int $perPage = null,
        array $filters = [],
        array $orderBy = []
    ): Collection|LengthAwarePaginator;
}
