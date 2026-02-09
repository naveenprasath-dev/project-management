import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ArrowLeft, Settings as SettingsIcon, ListTodo, Users as UsersIcon, UserPlus, Trash2, FolderPlus, MoreHorizontal, Pencil } from 'lucide-react';
import { useState } from 'react';
import MemberInviteModal from '@/components/spaces/member-invite-modal';
import ProjectModal from '@/components/projects/project-modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Space {
    id: number;
    name: string;
    slug: string;
    description: string;
    color: string;
    is_private: boolean;
    members: any[];
    statuses: any[];
    projects?: any[];
}

export default function SettingsPage({ space }: { space: Space }) {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'workflow' | 'members' | 'general' | 'projects'>('workflow');

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

            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-x-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/spaces/${space.slug}`}>
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold">Space Configuration</h1>
                    </div>
                </div>

                <div className="flex flex-col gap-8 md:flex-row">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 shrink-0">
                        <nav className="flex flex-row md:flex-col gap-1 p-1 bg-muted/30 rounded-lg md:bg-transparent">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center gap-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                                        activeTab === tab.id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <section className="p-6 border rounded-xl bg-card shadow-sm">
                                    <div className="flex items-center mb-6 gap-x-2">
                                        <SettingsIcon className="w-5 h-5 text-primary" />
                                        <h2 className="text-lg font-semibold">General Information</h2>
                                    </div>

                                    <form onSubmit={submitSettings} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Space Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter space name"
                                            />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Describe this space"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="color">Theme Color</Label>
                                            <div className="flex items-center gap-x-3">
                                                <Input
                                                    id="color"
                                                    type="color"
                                                    value={data.color}
                                                    onChange={(e) => setData('color', e.target.value)}
                                                    className="w-20 h-10 cursor-pointer"
                                                />
                                                <span className="text-sm text-muted-foreground">{data.color}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_private">Private Space</Label>
                                                <p className="text-sm text-muted-foreground">Only invited members can access</p>
                                            </div>
                                            <input
                                                id="is_private"
                                                type="checkbox"
                                                checked={data.is_private}
                                                onChange={(e) => setData('is_private', e.target.checked)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={processing}>
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </section>

                                <section className="p-6 border rounded-xl bg-card shadow-sm border-destructive/50">
                                    <h2 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h2>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Permanently delete this space and all its data
                                    </p>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            if (confirm('Are you sure? This action cannot be undone.')) {
                                                router.delete(`/spaces/${space.slug}`);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Space
                                    </Button>
                                </section>
                            </div>
                        )}

                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <section className="p-6 border rounded-xl bg-card shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-x-2">
                                            <UsersIcon className="w-5 h-5 text-primary" />
                                            <h2 className="text-lg font-semibold">Team Members</h2>
                                        </div>
                                        <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
                                            <UserPlus className="w-4 h-4 mr-2" /> Invite
                                        </Button>
                                    </div>

                                    <div className="divide-y">
                                        {space.members?.map((member) => (
                                            <div key={member.id} className="py-3 flex items-center justify-between">
                                                <div className="flex items-center gap-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                                        {member.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{member.name}</p>
                                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => {
                                                                if (confirm('Remove this member from the space?')) {
                                                                    router.delete(`/spaces/${space.slug}/members/${member.id}`);
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
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <section className="p-6 border rounded-xl bg-card shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-x-2">
                                            <FolderPlus className="w-5 h-5 text-primary" />
                                            <h2 className="text-lg font-semibold">Projects</h2>
                                        </div>
                                        <Button size="sm" onClick={() => { setSelectedProject(null); setIsProjectModalOpen(true); }}>
                                            <FolderPlus className="w-4 h-4 mr-2" /> New Project
                                        </Button>
                                    </div>

                                    <div className="grid gap-3">
                                        {space.projects && space.projects.length > 0 ? (
                                            space.projects.map((project: any) => (
                                                <Link
                                                    key={project.id}
                                                    href={`/spaces/${space.slug}/projects/${project.slug}`}
                                                    className="block p-4 rounded-lg border bg-background hover:shadow-md transition-all group"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: project.color || '#3b82f6' }} />
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold group-hover:text-primary transition-colors">{project.name}</h3>
                                                                {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
                                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                                    <span>{project.tasks_count || 0} tasks</span>
                                                                    {project.members_count > 0 && <span>{project.members_count} members</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={(e) => { e.preventDefault(); setSelectedProject(project); setIsProjectModalOpen(true); }}>
                                                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (confirm('Delete this project? Tasks will not be deleted.')) {
                                                                        router.delete(`/spaces/${space.slug}/projects/${project.id}`, { preserveScroll: true });
                                                                    }
                                                                }}>
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                                <FolderPlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                                                <p className="text-muted-foreground">No projects yet</p>
                                                <Button variant="outline" className="mt-4" onClick={() => { setSelectedProject(null); setIsProjectModalOpen(true); }}>
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
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <section className="p-6 border rounded-xl bg-card shadow-sm">
                                    <div className="mb-6">
                                        <div className="flex items-center gap-x-2 mb-1">
                                            <ListTodo className="w-5 h-5 text-primary" />
                                            <h2 className="text-lg font-semibold">Task Statuses</h2>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Define the workflow stages for tasks within this space.
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
                onClose={() => { setIsProjectModalOpen(false); setSelectedProject(null); }}
                project={selectedProject}
            />
        </AppLayout>
    );
}

function StatusList({ space }: { space: Space }) {
    const { data, setData, post, processing, reset, errors } = useForm({
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
            <div className="space-y-2 border rounded-xl overflow-hidden bg-background">
                {space.statuses?.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground italic text-sm">
                        No statuses defined for this space.
                    </div>
                )}
                {space.statuses?.map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-x-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                            <span className="font-medium">{status.name}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (confirm('Delete this status?')) {
                                    router.delete(`/spaces/${space.slug}/statuses/${status.id}`, { preserveScroll: true });
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border rounded-xl bg-muted/30">
                <h3 className="font-semibold mb-3 text-sm">Add New Status</h3>
                <div className="flex items-end gap-x-3">
                    <div className="flex-1 grid gap-2">
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
                            className="w-20 h-10 cursor-pointer"
                        />
                    </div>
                    <Button type="submit" disabled={processing || !data.name} className="px-6">
                        Add
                    </Button>
                </div>
            </form>
        </div>
    );
}
