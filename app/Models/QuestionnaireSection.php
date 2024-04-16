<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionnaireSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'order',
    ];

    public function questions()
    {
        return $this->belongsToMany(Question::class);
    }
}
