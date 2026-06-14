import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    UserPlus,
    Clock,
    CheckCircle,
    XCircle,
    LogIn,
    UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Invitation {
    token: string;
    space_name: string;
    space_slug: string;
    space_color: string;
    role: string;
    inviter_name: string;
    is_expired: boolean;
    expires_at: string;
}

export default function InvitationShow({
    invitation,
}: {
    invitation: Invitation;
}) {
    const { auth } = usePage<{ auth: { user?: unknown } }>().props;
    const { post, processing } = useForm({});

    const acceptInvitation = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/invitations/${invitation.token}/accept`);
    };

    return (
        <>
            <Head title={`Invitation to join ${invitation.space_name}`} />

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
                            style={{
                                backgroundColor:
                                    invitation.space_color || '#6366f1',
                            }}
                        >
                            {invitation.space_name.charAt(0)}
                        </div>
                        <h1 className="text-2xl font-bold">
                            {invitation.space_name}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Workspace Invitation
                        </p>
                    </div>

                    {/* Card */}
                    <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
                        {invitation.is_expired ? (
                            <div className="space-y-3 text-center">
                                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                                <h2 className="text-lg font-semibold">
                                    Invitation Expired
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    This invitation expired on{' '}
                                    {invitation.expires_at}. Ask{' '}
                                    {invitation.inviter_name} to send a new
                                    invite.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                                        <UserPlus className="h-4 w-4 shrink-0 text-primary" />
                                        <p className="text-sm">
                                            <span className="font-semibold">
                                                {invitation.inviter_name}
                                            </span>{' '}
                                            invited you to join{' '}
                                            <span className="font-semibold">
                                                {invitation.space_name}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Your role
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="capitalize"
                                        >
                                            {invitation.role}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="w-3" /> Expires
                                        </span>
                                        <span className="font-medium">
                                            {invitation.expires_at}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    {auth?.user ? (
                                        // Logged-in user: show accept button
                                        <form onSubmit={acceptInvitation}>
                                            <Button
                                                type="submit"
                                                className="h-11 w-full"
                                                disabled={processing}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Accept & Join{' '}
                                                {invitation.space_name}
                                            </Button>
                                        </form>
                                    ) : (
                                        // Guest: show register/login options
                                        <>
                                            <Button
                                                asChild
                                                className="h-11 w-full"
                                            >
                                                <Link
                                                    href={`/register?invitation=${invitation.token}`}
                                                >
                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                    Create Account & Join
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-11 w-full"
                                            >
                                                <Link
                                                    href={`/login?redirect=/invitations/${invitation.token}`}
                                                >
                                                    <LogIn className="mr-2 h-4 w-4" />
                                                    Sign In to Accept
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Powered by {import.meta.env.VITE_APP_NAME}
                    </p>
                </div>
            </div>
        </>
    );
}
