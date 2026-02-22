import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { UserPlus, Clock, CheckCircle, XCircle, LogIn, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

export default function InvitationShow({ invitation }: { invitation: Invitation }) {
    const { auth } = usePage().props as any;
    const { post, processing } = useForm({});

    const acceptInvitation = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/invitations/${invitation.token}/accept`);
    };

    return (
        <>
            <Head title={`Invitation to join ${invitation.space_name}`} />

            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div
                            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                            style={{ backgroundColor: invitation.space_color || '#6366f1' }}
                        >
                            {invitation.space_name.charAt(0)}
                        </div>
                        <h1 className="text-2xl font-bold">{invitation.space_name}</h1>
                        <p className="text-muted-foreground mt-1">Workspace Invitation</p>
                    </div>

                    {/* Card */}
                    <div className="border rounded-2xl bg-card shadow-sm p-6 space-y-6">
                        {invitation.is_expired ? (
                            <div className="text-center space-y-3">
                                <XCircle className="w-12 h-12 text-destructive mx-auto" />
                                <h2 className="text-lg font-semibold">Invitation Expired</h2>
                                <p className="text-sm text-muted-foreground">
                                    This invitation expired on {invitation.expires_at}. Ask {invitation.inviter_name} to send a new invite.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                                        <UserPlus className="w-4 h-4 text-primary shrink-0" />
                                        <p className="text-sm">
                                            <span className="font-semibold">{invitation.inviter_name}</span> invited you to join{' '}
                                            <span className="font-semibold">{invitation.space_name}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Your role</span>
                                        <Badge variant="secondary" className="capitalize">{invitation.role}</Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 w-3" /> Expires
                                        </span>
                                        <span className="font-medium">{invitation.expires_at}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    {auth?.user ? (
                                        // Logged-in user: show accept button
                                        <form onSubmit={acceptInvitation}>
                                            <Button
                                                type="submit"
                                                className="w-full h-11"
                                                disabled={processing}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Accept & Join {invitation.space_name}
                                            </Button>
                                        </form>
                                    ) : (
                                        // Guest: show register/login options
                                        <>
                                            <Button asChild className="w-full h-11">
                                                <Link href={`/register?invitation=${invitation.token}`}>
                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                    Create Account & Join
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="w-full h-11">
                                                <Link href={`/login?redirect=/invitations/${invitation.token}`}>
                                                    <LogIn className="w-4 h-4 mr-2" />
                                                    Sign In to Accept
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Powered by {import.meta.env.VITE_APP_NAME}
                    </p>
                </div>
            </div>
        </>
    );
}
