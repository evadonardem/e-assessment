<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictToSafeExamBrowser
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Basic Check: Ensure User-Agent contains 'SEB'
        if (! str_contains($request->header('User-Agent'), 'SEB')) {
            abort(403, 'Access Denied: This assessment can only be opened inside Safe Exam Browser.');
        }

        // 2. Cryptographic Check: Verify the SEB Request Hash
        $secretKey = config('services.seb.key');

        if (! $secretKey) {
            // Fallback safety if the key is missing from .env during development
            return $next($request);
        }

        // SEB hashes the exact URL string. Laravel's fullUrl() provides this.
        $currentUrl = $request->fullUrl();

        // Generate the expected hash using SHA256 (URL + Secret Key)
        $expectedHash = hash('sha256', $currentUrl.$secretKey);
        $receivedHash = $request->header('X-SafeExamBrowser-ConfigKeyHash');

        if ($receivedHash !== $expectedHash) {
            abort(403, 'Access Denied: Invalid Safe Exam Browser configuration or key mismatch.');
        }

        return $next($request);
    }
}
