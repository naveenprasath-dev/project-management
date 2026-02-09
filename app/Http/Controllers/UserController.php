<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Search for users by name or email.
     */
    public function search(Request $request)
    {
        $query = $request->get('q');
        $excludeSpaceId = $request->get('exclude_space_id');

        if (empty($query) || strlen($query) < 2) {
            return response()->json([]);
        }

        $users = User::query()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->when($excludeSpaceId, function ($q) use ($excludeSpaceId) {
                $q->whereDoesntHave('spaces', function ($sq) use ($excludeSpaceId) {
                    $sq->where('space_id', $excludeSpaceId);
                });
            })
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json($users);
    }
}
