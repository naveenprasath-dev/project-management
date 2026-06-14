import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Settings as SettingsIcon,
    ListTodo,
    Users as UsersIcon,
    UserPlus,
    Trash2,
    FolderPlus,
    MoreHorizontal,
    Pencil,
} from 'lucide-react';
import { useState } from 'react';
import ProjectModal from '@/components/projects/project-modal';
import MemberInviteModal from '@/components/spaces/member-invite-modal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, SharedData } from '@/types';

type SpaceProject = { id: number; name: string; slug: string; color?: string; description?: string; tasks_count?: number; members_count?: number };

interface Space {
    id: number;
    name: string;
    slug: string;
    description: string;
    color: string;
    is_private: boolean;
    members: { id: number; name: string; email: string }[];
    statuses: { id: number; name: string; color: string }[];
    projects?: SpaceProject[];
}

export default function SettingsPage({ space }: { space: Space }) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.is_admin;
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<SpaceProject | null>(null);
    const [activeTab, setActiveTab] = useState<
        'workflow' | 'members' | 'general' | 'projects'
    >('workflow');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
        { title: 'Settings', href: `/spaces/${space.slug}/settings` },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        name: space.name,
        description: space.description || '',
        color: space.color,
        is_private: space.is_private,
    });

    const submitSettings = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/spaces/${space.slug}`);
    };

    const tabs = [
        { id: 'workflow', label: 'Workflow', icon: ListTodo },
        { id: 'members', label: 'Team', icon: UsersIcon },
        { id: 'projects', label: 'Projects', icon: FolderPlus },
        { id: 'general', label: 'General', icon: SettingsIcon },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Settings - ${space.name}`} />

            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-x-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/spaces/${space.slug}`}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold">
                            Space Configuration
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col gap-8 md:flex-row">
                    {/* Sidebar Tabs */}
                    <div className="w-full shrink-0 md:w-64">
                        <nav className="flex flex-row gap-1 rounded-lg bg-muted/30 p-1 md:flex-col md:bg-transparent">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'workflow' | 'members' | 'general' | 'projects')}
                                    className={cn(
                                        'flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                                        activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div className="animate-in space-y-8 duration-300 fade-in slide-in-from-bottom-4">
                                <section className="rounded-xl border bg-card p-6 shadow-sm">
                                    <div className="mb-6 flex items-center gap-x-2">
                                        <SettingsIcon className="h-5 w-5 text-primary" />
                                        <h2 className="text-lg font-semibold">
                                            General Information
                                        </h2>
                                    </div>

                                    <form
                                        onSubmit={submitSettings}
                                        className="space-y-4"
                                    >
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">
                                                Space Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter space name"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Describe this space"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="color">
                                                Theme Color
                                            </Label>
                                            <div className="flex items-center gap-x-3">
                                                <Input
                                                    id="color"
                                                    type="color"
                                                    value={data.color}
                                                    onChange={(e) =>
                                                        setData(
                                                            'color',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-10 w-20 cursor-pointer"
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {data.color}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_private">
                                                    Private Space
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Only invited members can
                                                    access
                                                </p>
                                            </div>
                                            <input
                                                id="is_private"
                                                type="checkbox"
                                                checked={data.is_private}
                                                onChange={(e) =>
                                                    setData(
                                                        'is_private',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-4 w-4 cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </section>

                                {isAdmin && (
                                    <section className="rounded-xl border border-destructive/50 bg-card p-6 shadow-sm">
                                        <h2 className="mb-2 text-lg font-semibold text-destructive">
                                            Danger Zone
                                        </h2>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Permanently delete this space and
                                            all its data
                                        </p>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        'Are you sure? This action cannot be undone.',
                                                    )
                                                ) {
                                                    router.delete(
                                                        `/spaces/${space.slug}`,
                                                    );
                                                }
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />{' '}
                                            Delete Space
                                        </Button>
                                    </section>
                                )}
                            </div>
                        )}

                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <div className="animate-in duration-300 fade-in slide-in-from-bottom-4">
                                <section className="rounded-xl border bg-card p-6 shadow-sm">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="flex items-center gap-x-2">
                                            <UsersIcon className="h-5 w-5 text-primary" />
                                            <h2 className="text-lg font-semibold">
                                                Team Members
                                            </h2>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setIsInviteModalOpen(true)
                                            }
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />{' '}
                                            Invite
                                        </Button>
                                    </div>

                                    <div className="divide-y">
                                        {space.members?.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between py-3"
                                            >
                                                <div className="flex items-center gap-x-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                                                        {member.name?.charAt(
                                                            0,
                                                        ) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {member.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        'Remove this member from the space?',
                                                                    )
                                                                ) {
                                                                    router.delete(
                                                                        `/spaces/${space.slug}/members/${member.id}`,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Remove from Space
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Projects Tab */}
                        {activeTab === 'projects' && (
                            <div className="animate-in duration-300 fade-in slide-in-from-bottom-4">
                                <section className="rounded-xl border bg-card p-6 shadow-sm">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="flex items-center gap-x-2">
                                            <FolderPlus className="h-5 w-5 text-primary" />
                                            <h2 className="text-lg font-semibold">
                                                Projects
                                            </h2>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setSelectedProject(null);
                                                setIsProjectModalOpen(true);
                                            }}
                                        >
                                            <FolderPlus className="mr-2 h-4 w-4" />{' '}
                                            New Project
                                        </Button>
                                    </div>

                                    <div className="grid gap-3">
                                        {space.projects &&
                                        space.projects.length > 0 ? (
                                            space.projects.map(
                                                (project) => (
                                                    <Link
                                                        key={project.id}
                                                        href={`/spaces/${space.slug}/projects/${project.slug}`}
                                                        className="group block rounded-lg border bg-background p-4 transition-all hover:shadow-md"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex flex-1 items-start gap-3">
                                                                <div
                                                                    className="mt-1.5 h-3 w-3 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            project.color ||
                                                                            '#3b82f6',
                                                                    }}
                                                                />
                                                                <div className="flex-1">
                                                                    <h3 className="font-semibold transition-colors group-hover:text-primary">
                                                                        {
                                                                            project.name
                                                                        }
                                                                    </h3>
                                                                    {project.description && (
                                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                                            {
                                                                                project.description
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                                                        <span>
                                                                            {project.tasks_count ||
                                                                                0}{' '}
                                                                            tasks
                                                                        </span>
                                                                        {project.members_count >
                                                                            0 && (
                                                                            <span>
                                                                                {
                                                                                    project.members_count
                                                                                }{' '}
                                                                                members
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.preventDefault()
                                                                    }
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.preventDefault();
                                                                            setSelectedProject(
                                                                                project,
                                                                            );
                                                                            setIsProjectModalOpen(
                                                                                true,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Pencil className="mr-2 h-4 w-4" />{' '}
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.preventDefault();
                                                                            if (
                                                                                confirm(
                                                                                    'Delete this project? Tasks will not be deleted.',
                                                                                )
                                                                            ) {
                                                                                router.delete(
                                                                                    `/spaces/${space.slug}/projects/${project.id}`,
                                                                                    {
                                                                                        preserveScroll: true,
                                                                                    },
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />{' '}
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </Link>
                                                ),
                                            )
                                        ) : (
                                            <div className="rounded-lg border-2 border-dashed py-12 text-center">
                                                <FolderPlus className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    No projects yet
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    className="mt-4"
                                                    onClick={() => {
                                                        setSelectedProject(
                                                            null,
                                                        );
                                                        setIsProjectModalOpen(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    Create your first project
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Workflow Tab */}
                        {activeTab === 'workflow' && (
                            <div className="animate-in duration-300 fade-in slide-in-from-bottom-4">
                                <section className="rounded-xl border bg-card p-6 shadow-sm">
                                    <div className="mb-6">
                                        <div className="mb-1 flex items-center gap-x-2">
                                            <ListTodo className="h-5 w-5 text-primary" />
                                            <h2 className="text-lg font-semibold">
                                                Task Statuses
                                            </h2>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Define the workflow stages for tasks
                                            within this space.
                                        </p>
                                    </div>

                                    <StatusList space={space} />
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MemberInviteModal
                space={space}
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
            />
            <ProjectModal
                space={space}
                isOpen={isProjectModalOpen}
                onClose={() => {
                    setIsProjectModalOpen(false);
                    setSelectedProject(null);
                }}
                project={selectedProject}
            />
        </AppLayout>
    );
}

function StatusList({ space }: { space: Space }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        color: '#6366f1',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/spaces/${space.slug}/statuses`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 overflow-hidden rounded-xl border bg-background">
                {space.statuses?.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground italic">
                        No statuses defined for this space.
                    </div>
                )}
                {space.statuses?.map((status) => (
                    <div
                        key={status.id}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                    >
                        <div className="flex items-center gap-x-3">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: status.color }}
                            />
                            <span className="font-medium">{status.name}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (confirm('Delete this status?')) {
                                    router.delete(
                                        `/spaces/${space.slug}/statuses/${status.id}`,
                                        { preserveScroll: true },
                                    );
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border bg-muted/30 p-4"
            >
                <h3 className="mb-3 text-sm font-semibold">Add New Status</h3>
                <div className="flex items-end gap-x-3">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="status_name">Status Name</Label>
                        <Input
                            id="status_name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., In Progress"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status_color">Color</Label>
                        <Input
                            id="status_color"
                            type="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            className="h-10 w-20 cursor-pointer"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={processing || !data.name}
                        className="px-6"
                    >
                        Add
                    </Button>
                </div>
            </form>
        </div>
    );
}
