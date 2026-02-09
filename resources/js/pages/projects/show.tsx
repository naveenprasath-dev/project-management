import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Settings,
    Users,
    ListTodo,
    UserPlus,
    MoreHorizontal,
    Trash2,
    CheckCircle2,
    LayoutGrid,
    List,
    FolderPlus,
    User,
    Check
} from 'lucide-react';
import { useState } from 'react';
import ProjectMemberModal from '@/components/projects/project-member-modal';
import TaskModal from '@/components/tasks/task-modal';
import TasksList from '@/components/tasks/tasks-list';
import BoardView from '@/components/tasks/board-view';
import TaskFilterBar from '@/components/tasks/task-filter-bar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface Task {
    id: number;
    title: string;
    description?: string;
    status?: any;
    status_id: number;
    assignees?: any[];
    due_date?: string;
    priority?: string;
    [key: string]: any;
}

interface Project {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color: string;
    is_active: boolean;
    members: ProjectMember[];
    tasks: Task[];
    tasks_count?: number;
    statuses?: any[];
}

interface Space {
    id: number;
    name: string;
    slug: string;
    statuses: any[];
    members: any[];
}

interface ShowProps {
    space: Space;
    project: Project;
    filters: any;
    can: {
        manageMembers: boolean;
    };
}

export default function Show({ space, project, filters, can }: ShowProps) {
    const [activeTab, setActiveTab] = useState<'tasks' | 'members' | 'settings'>('tasks');
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [memberViewEnabled, setMemberViewEnabled] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

    // Determine effective statuses (project override vs space default)
    const globalStatuses = space.statuses ? space.statuses.filter((s: any) => !s.project_id) : [];
    const projectStatuses = project.statuses || [];
    const effectiveStatuses = projectStatuses.length > 0 ? projectStatuses : globalStatuses;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
        { title: 'Projects', href: `/spaces/${space.slug}/settings?tab=projects` },
        { title: project.name, href: `/spaces/${space.slug}/projects/${project.slug}` },
    ];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const { data, setData, patch, processing, errors } = useForm({
        name: project.name,
        description: project.description || '',
        color: project.color,
    });

    const submitSettings = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/spaces/${space.slug}/projects/${project.slug}`, {
            preserveScroll: true,
        });
    };

    const tabs = [
        { id: 'tasks', label: 'Tasks', icon: ListTodo, count: project.tasks?.length || 0 },
        { id: 'members', label: 'Members', icon: Users, count: project.members?.length || 0 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const completedTasks = project.tasks?.filter(t => t.status?.name?.toLowerCase().includes('done') || t.status?.name?.toLowerCase().includes('complete')).length || 0;
    const totalTasks = project.tasks?.length || 0;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - ${space.name}`} />

            <div className="flex flex-col h-full overflow-hidden">
                <header className="flex items-center justify-between p-4 px-6 border-b bg-background/50 backdrop-blur">
                    <div className="flex items-center gap-x-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/spaces/${space.slug}/settings?tab=projects`}>
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div
                            className="flex items-center justify-center w-12 h-12 rounded-lg shadow-sm"
                            style={{ backgroundColor: project.color || '#3b82f6' }}
                        >
                            <FolderPlus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold leading-tight">{project.name}</h1>
                            <div className="flex items-center text-xs text-muted-foreground gap-x-2">
                                <span className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" /> {project.members?.length || 0} Members
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <ListTodo className="w-3 h-3 mr-1" /> {totalTasks} Tasks
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> {completionPercentage}% Complete
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <nav className="flex items-center mr-2 bg-muted/50 p-1 rounded-lg border">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center gap-x-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                        activeTab === tab.id
                                            ? "bg-background text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className={cn(
                                            "ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full",
                                            activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>

                        {activeTab === 'tasks' && (
                            <div className="flex items-center gap-x-2">
                                <Button
                                    variant={memberViewEnabled ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => {
                                        setMemberViewEnabled(!memberViewEnabled);
                                        if (memberViewEnabled) setSelectedMemberId(null);
                                    }}
                                    className={cn("gap-2", memberViewEnabled && "bg-primary/10 text-primary border-primary/20")}
                                >
                                    <Users className="w-4 h-4" />
                                    Member View
                                </Button>
                                <Button size="sm" onClick={() => { setSelectedTask(null); setIsTaskModalOpen(true); }}>
                                    <ListTodo className="w-4 h-4 mr-2" /> New Task
                                </Button>
                            </div>
                        )}
                        {activeTab === 'members' && can.manageMembers && (
                            <Button size="sm" onClick={() => setIsMemberModalOpen(true)}>
                                <UserPlus className="w-4 h-4 mr-2" /> Add Member
                            </Button>
                        )}
                    </div>
                </header>

                {totalTasks > 0 && (
                    <div className="px-6 py-3 border-b bg-muted/30">
                        <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                            <span>Project Progress</span>
                            <span>{completedTasks} of {totalTasks} tasks completed</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                )}


                <div className="flex-1 overflow-auto px-6 py-2">
                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-2 h-full flex flex-col">

                            <TaskFilterBar
                                space={space}
                                members={space.members || []}
                                currentFilters={filters || {}}
                                baseUrl={`/spaces/${space.slug}/projects/${project.slug}`}
                                statuses={effectiveStatuses}
                                hideProjectFilter={true}
                            />

                            <div className="flex-1 flex overflow-hidden gap-6">
                                {/* Member Sidebar */}
                                {memberViewEnabled && (
                                    <div className="w-64 flex flex-col border rounded-xl bg-card overflow-hidden shrink-0">
                                        <div className="p-4 border-b bg-muted/30">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Members</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                            <button
                                                onClick={() => setSelectedMemberId(null)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                                                    selectedMemberId === null
                                                        ? "bg-primary text-primary-foreground shadow-md"
                                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px]",
                                                        selectedMemberId === null ? "bg-white/20" : "bg-primary/10 text-primary"
                                                    )}>
                                                        ALL
                                                    </div>
                                                    <span>All Tasks</span>
                                                </div>
                                                {selectedMemberId === null && <Check className="w-4 h-4" />}
                                            </button>

                                            {project.members?.map((member) => (
                                                <button
                                                    key={member.id}
                                                    onClick={() => setSelectedMemberId(member.user.id)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                                                        selectedMemberId === member.user.id
                                                            ? "bg-primary text-primary-foreground shadow-md"
                                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px]",
                                                            selectedMemberId === member.user.id ? "bg-white/20" : "bg-primary/10 text-primary"
                                                        )}>
                                                            {getInitials(member.user.name)}
                                                        </div>
                                                        <span className="truncate">{member.user.name}</span>
                                                    </div>
                                                    {selectedMemberId === member.user.id && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tasks Main Area */}
                                <div className="flex-1 flex flex-col min-w-0 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center bg-muted/50 p-1 rounded-lg border shadow-sm">
                                            <Button
                                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                className={cn("h-7 px-3 gap-2", viewMode === 'list' && "bg-background shadow-sm")}
                                                onClick={() => setViewMode('list')}
                                            >
                                                <List className="w-4 h-4" />
                                                <span className="text-xs font-bold">List</span>
                                            </Button>
                                            <Button
                                                variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                className={cn("h-7 px-3 gap-2", viewMode === 'board' && "bg-background shadow-sm")}
                                                onClick={() => setViewMode('board')}
                                            >
                                                <LayoutGrid className="w-4 h-4" />
                                                <span className="text-xs font-bold">Board</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        {viewMode === 'list' ? (
                                            <TasksList
                                                tasks={(project.tasks || []).filter(t => !selectedMemberId || t.assignees?.some((a: any) => a.id === selectedMemberId))}
                                                statuses={effectiveStatuses}
                                                space={space}
                                                onEditTask={(task) => { setSelectedTask(task); setIsTaskModalOpen(true); }}
                                                onCreateTask={() => { setSelectedTask(null); setIsTaskModalOpen(true); }}
                                            />
                                        ) : (
                                            <BoardView
                                                tasks={(project.tasks || []).filter(t => !selectedMemberId || t.assignees?.some((a: any) => a.id === selectedMemberId))}
                                                statuses={effectiveStatuses}
                                                space={space}
                                                onEditTask={(task) => { setSelectedTask(task); setIsTaskModalOpen(true); }}
                                                onCreateTask={() => {
                                                    setSelectedTask(null);
                                                    setIsTaskModalOpen(true);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div className="max-w-3xl">
                            <div className="space-y-3">
                                {project.members && project.members.length > 0 ? (
                                    project.members.map((member) => (
                                        <div key={member.id} className="p-4 rounded-lg border bg-card flex items-center justify-between">
                                            <div className="flex items-center gap-x-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                                    {getInitials(member.user.name)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{member.user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-2">
                                                <span className={cn(
                                                    "px-2 py-1 text-xs rounded-full",
                                                    member.role === 'admin' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {member.role}
                                                </span>
                                                {can.manageMembers && (
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
                                                                    if (confirm('Remove this member from the project?')) {
                                                                        router.delete(`/spaces/${space.slug}/projects/${project.slug}/members/${member.user.id}`, { preserveScroll: true });
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" /> Remove
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground mb-4">No members in this project yet</p>
                                        {can.manageMembers && (
                                            <Button onClick={() => setIsMemberModalOpen(true)}>
                                                Add your first member
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl space-y-6">

                            {/* Project Statuses */}
                            <section className="p-6 border rounded-xl bg-card shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Task Statuses</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Define custom statuses for this project. If no custom statuses are defined, space statuses are used.
                                </p>
                                <ProjectStatusList space={space} project={project} />
                            </section>

                            <section className="p-6 border rounded-xl bg-card shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Project Settings</h2>
                                <form onSubmit={submitSettings} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Project Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter project name"
                                        />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe this project"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Color</Label>
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
                                    Delete this project. Tasks will not be deleted but will become unassigned.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (confirm('Are you sure? This action cannot be undone.')) {
                                            router.delete(`/spaces/${space.slug}/projects/${project.slug}`, {
                                                onSuccess: () => {
                                                    router.visit(`/spaces/${space.slug}/settings?tab=projects`);
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Project
                                </Button>
                            </section>
                        </div>
                    )}
                </div>
            </div>

            <ProjectMemberModal
                space={space}
                project={project}
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
            />
            <TaskModal
                space={space}
                members={space.members || []}
                project={project}
                task={selectedTask}
                statuses={effectiveStatuses}
                isOpen={isTaskModalOpen}
                onClose={() => { setIsTaskModalOpen(false); setSelectedTask(null); }}
            />
        </AppLayout>
    );
}

function ProjectStatusList({ space, project }: { space: any, project: Project }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        color: '#6366f1',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/spaces/${space.slug}/projects/${project.slug}/statuses`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 border rounded-xl overflow-hidden bg-background">
                {(!project.statuses || project.statuses.length === 0) && (
                    <div className="p-8 text-center text-muted-foreground italic text-sm">
                        No custom statuses defined. Using space defaults.
                    </div>
                )}
                {project.statuses?.map((status: any) => (
                    <div key={status.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-x-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                            <span className="font-medium">{status.name}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (confirm('Delete this status? Tasks will not be deleted.')) {
                                    router.delete(`/spaces/${space.slug}/projects/${project.slug}/statuses/${status.id}`, { preserveScroll: true });
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border rounded-xl bg-muted/30">
                <h3 className="font-semibold mb-3 text-sm">Add Custom Status</h3>
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
