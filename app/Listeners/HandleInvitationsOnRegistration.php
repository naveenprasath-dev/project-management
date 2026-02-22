<?php

namespace App\Listeners;

use App\Models\SpaceInvitation;
use App\Notifications\GeneralNotification;
use Illuminate\Auth\Events\Registered;

class HandleInvitationsOnRegistration
{
    /**
     * Auto-apply any pending space invitations for the newly registered user's email.
     */
    public function handle(Registered $event): void
    {
        $user = $event->user;

        $pendingInvitations = SpaceInvitation::where('email', $user->email)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->with('space')
            ->get();

        foreach ($pendingInvitations as $invitation) {
            $invitation->space->members()->syncWithoutDetaching([
                $user->id => ['role' => $invitation->role],
            ]);

            $invitation->update(['accepted_at' => now()]);

            $user->notify(new GeneralNotification(
                'Added to Space',
                "You have been added to {$invitation->space->name} as {$invitation->role}.",
                "/spaces/{$invitation->space->slug}",
                'space_invite',
                ['space_id' => $invitation->space_id]
            ));
        }
    }
}
