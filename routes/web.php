<?php

use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Importer\AlternateResponseQuestionImporter;
use App\Http\Controllers\Importer\MultipleChoiceQuestionImporter;
use App\Http\Controllers\LaunchAssessmentController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuestionnaireController;
use App\Http\Controllers\QuestionnaireSectionController;
use App\Http\Controllers\QuestionQuestionnaireSectionController;
use App\Http\Controllers\TakeAssessmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', [LaunchAssessmentController::class, 'index']);
Route::get('/take-assessment', [TakeAssessmentController::class, 'index'])->name('take-assessment');
Route::post('/answers', [TakeAssessmentController::class, 'store']);
Route::post('/window-switch', [TakeAssessmentController::class, 'windowSwitch']);
Route::post('/submit-assessment', [TakeAssessmentController::class, 'submitAssessment']);

Route::get('/login', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth');

Route::middleware('auth')->group(function () {
    // Questionnaires Module
    Route::group(['prefix' => 'questionnaires'], function () {
        Route::get('/', [QuestionnaireController::class, 'index'])->name('questionnaires.list');
        Route::get('/{questionnaire}', [QuestionnaireController::class, 'show'])->name('questionnaires.show');
        Route::post('/', [QuestionnaireController::class, 'store']);
        Route::patch('/{questionnaire}', [QuestionnaireController::class, 'update']);
        Route::delete('/{questionnaire}', [QuestionnaireController::class, 'destroy']);

        // Questionnaire > Sections
        Route::group(['prefix' => '{questionnaire}/sections'], function () {
            Route::post('/', [QuestionnaireSectionController::class, 'store']);
            Route::post('/{questionnaireSection}', [QuestionnaireSectionController::class, 'update']);
            Route::delete('/{questionnaireSection}', [QuestionnaireSectionController::class, 'destroy']);

            // Questionnaire > Section > Questions
            Route::group(['prefix' => '/{questionnaireSection}/questions'], function () {
                Route::post('/', [QuestionQuestionnaireSectionController::class, 'store']);
            });
        });

        // Questionnaire > Assessments
        Route::group(['prefix' => '/{questionnaire}/assessments'], function () {
            Route::post('/', [AssessmentController::class, 'store']);
        });
    });

    // Questions Module
    Route::group(['prefix' => 'questions'], function () {
        Route::get('/', [QuestionController::class, 'index'])->name('questions.list');
        Route::get('/create', [QuestionController::class, 'create']);
        Route::post('/', [QuestionController::class, 'store']);
        Route::patch('/{question}', [QuestionController::class, 'update']);
        Route::get('/{question}', [QuestionController::class, 'show']);
        Route::delete('/{question}', [QuestionController::class, 'destroy']);
    });

    Route::group(['prefix' => 'importer'], function () {
        Route::get(
            '/mcq',
            [MultipleChoiceQuestionImporter::class, 'index']
        );
        Route::get(
            '/arq',
            [AlternateResponseQuestionImporter::class, 'index']
        );
        Route::get(
            '/mcq-data-feed',
            [MultipleChoiceQuestionImporter::class, 'dataFeed']
        );
    });
});
