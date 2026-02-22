<?php

namespace App\Http\Controllers;

use App\Http\Requests\Spaces\UpdateSpaceMemberRequest;
use App\Mail\SpaceInvitationMail;
use App\Models\Space;
use App\Models\SpaceInvitation;
use App\Models\User;
use App\Services\SpaceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SpaceMemberController extends Controller
{
    public function __construct(
        protected SpaceService $spaceService
    ) {}

    /**
     * Invite a member by email. Adds directly if user exists, otherwise sends an invite email.
     */
    public function store(UpdateSpaceMemberRequest $request, Space $space)
    {
        if (! $request->user()->canManageSpace($space)) {
            abort(403);
        }

        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser) {
            $this->spaceService->addMember($space, $existingUser, $request->role);

            Cache::forget("user_{$existingUser->id}_space_access_{$space->id}");

            if ($existingUser->id !== $request->user()->id) {
                Mail::to($existingUser->email)->queue(
                    new SpaceInvitationMail($space, $request->user(), $request->role, userExists: true)
                );
            }

            return back()->with('success', "{$existingUser->name} has been added to the space.");
        }

        // User not in the system — create invitation and send email
        $invitation = SpaceInvitation::create([
            'space_id' => $space->id,
            'invited_by' => $request->user()->id,
            'email' => $request->email,
            'role' => $request->role,
            'token' => Str::random(64),
            'expires_at' => now()->addDays(7),
        ]);

        Mail::to($request->email)->queue(
            new SpaceInvitationMail($space, $request->user(), $request->role, userExists: false, invitation: $invitation)
        );

        return back()->with('success', "Invitation sent to {$request->email}.");
    }

    /**
     * Remove a member from the space.
     */
    public function destroy(Request $request, Space $space, User $user)
    {
        if (! $request->user()->canManageSpace($space)) {
            abort(403);
        }

        if ($space->created_by === $user->id) {
            return back()->with('error', 'Cannot remove the space creator.');
        }

        $this->spaceService->removeMember($space, $user->id);

        Cache::forget("user_{$user->id}_space_access_{$space->id}");

        return back()->with('success', 'Member removed successfully.');
    }
}
