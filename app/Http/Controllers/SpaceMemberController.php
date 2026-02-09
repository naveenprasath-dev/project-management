<?php

namespace App\Http\Controllers;

use App\Http\Requests\Spaces\UpdateSpaceMemberRequest;
use App\Models\Space;
use App\Models\User;
use App\Services\SpaceService;
use App\Notifications\GeneralNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class SpaceMemberController extends Controller
{
    public function __construct(
        protected SpaceService $spaceService
    ) {}

    /**
     * Add or Update a member in the space.
     */
    public function store(UpdateSpaceMemberRequest $request, Space $space)
    {
        if (!$request->user()->canManageSpace($space)) {
            abort(403);
        }

        $user = User::findOrFail($request->user_id);
        
        $this->spaceService->addMember($space, $user, $request->role);

        // Invalidate access cache for this specific space
        \Illuminate\Support\Facades\Cache::forget("user_{$user->id}_space_access_{$space->id}");

        // Notify user of space invite/addition
        if ($user->id !== $request->user()->id) {
            $user->notify(new GeneralNotification(
                "Added to Space",
                "You have been added to the space: {$space->name}",
                "/spaces/{$space->slug}",
                'space_invite',
                ['space_id' => $space->id]
            ));
        }

        return back()->with('success', 'Member updated successfully.');
    }

    /**
     * Remove a member from the space.
     */
    public function destroy(Request $request, Space $space, User $user)
    {
        if (!$request->user()->canManageSpace($space)) {
            abort(403);
        }

        if ($space->created_by === $user->id) {
            return back()->with('error', 'Cannot remove the space creator.');
        }

        $this->spaceService->removeMember($space, $user->id);

        // Invalidate access cache for this specific space
        \Illuminate\Support\Facades\Cache::forget("user_{$user->id}_space_access_{$space->id}");

        return back()->with('success', 'Member removed successfully.');
    }
}
