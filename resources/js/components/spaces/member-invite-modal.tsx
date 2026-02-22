import { useForm } from '@inertiajs/react';
import { Loader2, UserPlus, Mail, User, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface MemberInviteModalProps {
    space: {
        id: number;
        slug: string;
    };
    isOpen: boolean;
    onClose: () => void;
}

export default function MemberInviteModal({ space, isOpen, onClose }: MemberInviteModalProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        email: '',
        role: 'member',
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/spaces/${space.slug}/members`, {
            onSuccess: () => handleClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" /> Invite Member
                        </DialogTitle>
                        <DialogDescription>
                            Enter an email address. If the user exists they'll be added immediately, otherwise they'll receive an invite email.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@company.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="pl-9 h-11"
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Space Role</Label>
                            <Select
                                value={data.role}
                                onValueChange={(value) => setData('role', value)}
                            >
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin — Manage all</SelectItem>
                                    <SelectItem value="member">Member — Create & Edit</SelectItem>
                                    <SelectItem value="viewer">Viewer — Read only</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-xs text-destructive">{errors.role}</p>
                            )}
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground">
                            <User className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>
                                If this email isn't registered, we'll send them an invitation link valid for 7 days. They'll be added with the selected role upon joining.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 border-t pt-4">
                        <Button type="button" variant="ghost" className="h-11 px-6" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.email}
                            className="h-11 px-8 shadow-lg shadow-primary/20"
                        >
                            {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Send Invite
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
