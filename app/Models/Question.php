<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'question_type_id',
        'is_random_options',
        'is_published',
    ];

    public function options(): HasMany
    {
        return $this->hasMany(Option::class);
    }
}
