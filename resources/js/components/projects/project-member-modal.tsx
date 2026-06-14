import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface User {
    id: number;
    name: string;
    email: string;
}

interface ProjectMember {
    id: number;
    user: User;
    role: string;
}

interface Space {
    id: number;
    slug: string;
    members: { id: number; name: string; email: string }[];
}

interface Project {
    id: number;
    slug: string;
    members: ProjectMember[];
}

interface Props {
    space: Space;
    project: Project;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProjectMemberModal({
    space,
    project,
    isOpen,
    onClose,
}: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: '',
        role: 'member',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/spaces/${space.slug}/projects/${project.slug}/members`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    // Get space members who are not already project members
    const availableMembers =
        space.members?.filter(
            (spaceMember) =>
                !project.members?.some((pm) => pm.id === spaceMember.id),
        ) || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Member to Project</DialogTitle>
                    <DialogDescription>
                        Add a space member to this project. Only space members
                        can be added.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="user_id">Select Member</Label>
                        <Select
                            value={data.user_id}
                            onValueChange={(value) => setData('user_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a member..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMembers.length === 0 ? (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        All space members are already in this
                                        project
                                    </div>
                                ) : (
                                    availableMembers.map((member) => (
                                        <SelectItem
                                            key={member.id}
                                            value={member.id.toString()}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                    {member.name?.charAt(0) ||
                                                        '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.user_id && (
                            <p className="text-sm text-destructive">
                                {errors.user_id}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={data.role}
                            onValueChange={(value) => setData('role', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">
                                    <div>
                                        <p className="font-medium">Member</p>
                                        <p className="text-xs text-muted-foreground">
                                            Can view and work on tasks
                                        </p>
                                    </div>
                                </SelectItem>
                                <SelectItem value="admin">
                                    <div>
                                        <p className="font-medium">Admin</p>
                                        <p className="text-xs text-muted-foreground">
                                            Can manage project settings and
                                            members
                                        </p>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-sm text-destructive">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.user_id ||
                                availableMembers.length === 0
                            }
                        >
                            Add Member
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
