<?php

use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuestionOptionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::resource('questions', QuestionController::class)
    ->except(['create', 'edit']);

Route::resource('questions/{question}/options', QuestionOptionController::class)
    ->except(['create', 'edit']);
