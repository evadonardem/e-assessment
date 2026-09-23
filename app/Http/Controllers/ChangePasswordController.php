<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ChangePasswordController extends Controller
{
    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'currPassword' => 'required|current_password',
            'newPassword' => 'required|different:currPassword|min:8|same:confNewPassword',
            'confNewPassword' => 'required',
        ], [], [
            'currPassword' => 'current password',
            'confNewPassword' => 'confirm new password',
        ]);

        $newPassword = $validatedData['newPassword'];

        $request->user()->update([
            'password' => Hash::make($newPassword),
        ]);
    }
}
