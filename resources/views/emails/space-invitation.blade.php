<x-mail::message>
@if ($userExists)
# You've been added to {{ $spaceName }}

**{{ $inviterName }}** has added you to the **{{ $spaceName }}** workspace as a **{{ $role }}**.

Click below to access your workspace:

<x-mail::button :url="$spaceUrl">
Go to {{ $spaceName }}
</x-mail::button>
@else
# You've been invited to join {{ $spaceName }}

**{{ $inviterName }}** has invited you to join the **{{ $spaceName }}** workspace as a **{{ $role }}**.

Create your account to get started:

<x-mail::button :url="$registerUrl">
Create Account & Join
</x-mail::button>

Already have an account? [Sign in to accept]({{ $acceptUrl }}).

This invitation expires on **{{ $expiresAt }}**.
@endif

If you weren't expecting this, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
