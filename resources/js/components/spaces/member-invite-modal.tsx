import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
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
import { Loader2, UserPlus, Search, User, Check, X } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

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
        user_id: '',
        role: 'member',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setResults([]);
            setSelectedUser(null);
            reset();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await axios.get(`/users/search?q=${searchTerm}&exclude_space_id=${space.id}`);
                setResults(response.data);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSelectUser = (user: any) => {
        setSelectedUser(user);
        setData('user_id', user.id.toString());
        setSearchTerm('');
        setResults([]);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/spaces/${space.slug}/members`, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" /> Invite Member
                        </DialogTitle>
                        <DialogDescription>
                            Find and add a team member to this space.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2 relative">
                            <Label>Find User</Label>

                            {selectedUser ? (
                                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                            {selectedUser.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold leading-tight">{selectedUser.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => {
                                            setSelectedUser(null);
                                            setData('user_id', '');
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={cn("pl-9 h-11", results.length > 0 && "rounded-b-none border-b-transparent")}
                                        autoComplete="off"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* Search Results Dropdown */}
                                    {results.length > 0 && (
                                        <div className="absolute top-full left-0 w-full bg-popover border border-t-0 rounded-b-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {results.map((user) => (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    className="w-full text-left px-4 py-3 hover:bg-muted flex items-center justify-between transition-colors group"
                                                    onClick={() => handleSelectUser(user)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold leading-tight">{user.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {searchTerm.length >= 2 && !isSearching && results.length === 0 && (
                                        <div className="absolute top-full left-0 w-full p-4 bg-popover border border-t-0 rounded-b-lg shadow-xl z-50 text-center text-xs text-muted-foreground">
                                            No users found matching "{searchTerm}"
                                        </div>
                                    )}
                                </div>
                            )}

                            {errors.user_id && <p className="text-xs text-destructive mt-1">{errors.user_id}</p>}
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
                                    <SelectItem value="admin">Admin (Manage all)</SelectItem>
                                    <SelectItem value="member">Member (Create/Edit)</SelectItem>
                                    <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                        </div>
                    </div>

                    <DialogFooter className="mt-4 border-t pt-4">
                        <Button type="button" variant="ghost" className="h-11 px-6" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing || !data.user_id} className="h-11 px-8 shadow-lg shadow-primary/20">
                            {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {selectedUser ? 'Send Invitation' : 'Invite'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

