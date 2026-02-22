<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Throwable;

class GeneralNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public string $title,
        public string $body,
        public string $url,
        public string $type, // 'task_assigned', 'task_mention', 'status_changed', 'task_updated', 'task_comment'
        public array $metadata = []
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        $channels = ['database', 'broadcast'];

        if ($this->isMailConfigured()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Check if mail is configured and usable.
     * The 'array' and 'log' mailers always work. SMTP requires a host.
     */
    private function isMailConfigured(): bool
    {
        $mailer = config('mail.default');

        if (in_array($mailer, ['array', 'log'])) {
            return true;
        }

        return ! empty(config("mail.mailers.{$mailer}.host"));
    }

    /**
     * Handle a failed notification job — log instead of surfacing the error.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('Notification delivery failed', [
            'type' => $this->type,
            'title' => $this->title,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        $message = (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject($this->title)
            ->line($this->body);

        if ($this->url) {
            $message->action('View Details', config('app.url').$this->url);
        }

        return $message;
    }

    /**
     * Get the array representation of the notification for database storage.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'url' => $this->url,
            'type' => $this->type,
            'metadata' => $this->metadata,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id, // Notification UUID
            'title' => $this->title,
            'body' => $this->body,
            'url' => $this->url,
            'type' => $this->type,
            'metadata' => $this->metadata,
            'created_at' => now()->toDateTimeString(),
        ]);
    }
}
