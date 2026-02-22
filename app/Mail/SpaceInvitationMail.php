<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\SpaceInvitation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SpaceInvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public User $inviter,
        public string $role,
        public bool $userExists,
        public ?SpaceInvitation $invitation = null,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->userExists
            ? "{$this->inviter->name} added you to {$this->space->name}"
            : "{$this->inviter->name} invited you to join {$this->space->name}";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.space-invitation',
            with: [
                'spaceName' => $this->space->name,
                'inviterName' => $this->inviter->name,
                'role' => ucfirst($this->role),
                'userExists' => $this->userExists,
                'spaceUrl' => url("/spaces/{$this->space->slug}"),
                'acceptUrl' => $this->invitation ? url("/invitations/{$this->invitation->token}") : null,
                'registerUrl' => $this->invitation ? url("/register?invitation={$this->invitation->token}") : null,
                'expiresAt' => $this->invitation?->expires_at->format('M d, Y'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }

    /**
     * Handle a failed mail job — log instead of surfacing the error.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('Space invitation email delivery failed', [
            'email' => $this->invitation->email,
            'space' => $this->space->name,
            'error' => $exception->getMessage(),
        ]);
    }
}
