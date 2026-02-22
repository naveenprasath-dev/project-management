<?php

namespace App\Http\Controllers;

use App\Models\SpaceInvitation;
use App\Notifications\GeneralNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpaceInvitationController extends Controller
{
    /**
     * Show the invitation acceptance page.
     */
    public function show(string $token): Response|RedirectResponse
    {
        $invitation = SpaceInvitation::where('token', $token)
            ->with(['space', 'inviter'])
            ->firstOrFail();

        if ($invitation->isAccepted()) {
            return redirect()
                ->to("/spaces/{$invitation->space->slug}")
                ->with('info', "You've already joined {$invitation->space->name}.");
        }

        return Inertia::render('invitations/show', [
            'invitation' => [
                'token' => $token,
                'space_name' => $invitation->space->name,
                'space_slug' => $invitation->space->slug,
                'space_color' => $invitation->space->color,
                'role' => $invitation->role,
                'inviter_name' => $invitation->inviter->name,
                'is_expired' => $invitation->isExpired(),
                'expires_at' => $invitation->expires_at->format('M d, Y'),
            ],
        ]);
    }

    /**
     * Accept the invitation (requires auth).
     */
    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = SpaceInvitation::where('token', $token)
            ->with(['space', 'inviter'])
            ->firstOrFail();

        if ($invitation->isExpired()) {
            return back()->with('error', 'This invitation has expired.');
        }

        if ($invitation->isAccepted()) {
            return redirect()
                ->to("/spaces/{$invitation->space->slug}")
                ->with('info', "You're already a member of {$invitation->space->name}.");
        }

        $user = $request->user();

        $invitation->space->members()->syncWithoutDetaching([
            $user->id => ['role' => $invitation->role],
        ]);

        $invitation->update(['accepted_at' => now()]);

        // Notify the inviter
        if ($invitation->invited_by !== $user->id) {
            $invitation->inviter->notify(new GeneralNotification(
                'Invitation Accepted',
                "{$user->name} accepted your invitation to join {$invitation->space->name}.",
                "/spaces/{$invitation->space->slug}/settings",
                'space_invite',
                ['space_id' => $invitation->space_id]
            ));
        }

        return redirect()
            ->to("/spaces/{$invitation->space->slug}")
            ->with('success', "Welcome to {$invitation->space->name}!");
    }
}
