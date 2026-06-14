import { Head, Link, router, useForm } from '@inertiajs/react';
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
    Archive,
    FolderPlus,
    Check,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ProjectMemberModal from '@/components/projects/project-member-modal';
import SprintList from '@/components/sprints/sprint-list';
import BoardView from '@/components/tasks/board-view';
import TaskFilterBar from '@/components/tasks/task-filter-bar';
import TaskModal from '@/components/tasks/task-modal';
import TasksList from '@/components/tasks/tasks-list';
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
import type { BreadcrumbItem, Task as GlobalTask, TaskStatus } from '@/types';

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

type Task = GlobalTask;

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
    statuses?: TaskStatus[];
    sprints?: { id: number; name: string; status?: string }[];
}

interface Space {
    id: number;
    name: string;
    slug: string;
    statuses: (TaskStatus & { project_id?: number })[];
    members: { id: number; name: string; email: string }[];
    projects?: { id: number; slug: string; name: string }[];
}

interface ShowProps {
    space: Space;
    project: Project;
    filters: Record<string, string | undefined>;
    sprints: { id: number; name: string; status?: string }[];
    can: {
        manageMembers: boolean;
    };
}

export default function Show({ space, project, filters, can }: ShowProps) {
    const [activeTab, setActiveTab] = useState<
        'tasks' | 'sprints' | 'members' | 'settings'
    >('tasks');
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [memberViewEnabled, setMemberViewEnabled] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(
        null,
    );

    useEffect(() => {
        if (selectedTask) {
            const updatedTask = project.tasks?.find(
                (t) => t.id === selectedTask.id,
            );
            if (updatedTask) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedTask(updatedTask);
            }
        }
    }, [project.tasks]);

    // Determine effective statuses (project override vs space default)
    const globalStatuses = space.statuses
        ? space.statuses.filter((s) => !s.project_id)
        : [];
    const projectStatuses = project.statuses || [];
    const effectiveStatuses =
        projectStatuses.length > 0 ? projectStatuses : globalStatuses;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
        {
            title: 'Projects',
            href: `/spaces/${space.slug}/settings?tab=projects`,
        },
        {
            title: project.name,
            href: `/spaces/${space.slug}/projects/${project.slug}`,
        },
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
        {
            id: 'tasks',
            label: 'Tasks',
            icon: ListTodo,
            count: project.tasks?.length || 0,
        },
        {
            id: 'sprints',
            label: 'Sprints',
            icon: LayoutGrid,
            count: project.sprints?.length || 0,
        },
        {
            id: 'members',
            label: 'Members',
            icon: Users,
            count: project.members?.length || 0,
        },
        { id: 'settings', label: 'Settings', icon: Settings },
        {
            id: 'archive',
            label: 'Archive',
            icon: Archive,
            href: `/spaces/${space.slug}/projects/${project.slug}/archive`,
        },
    ];

    const completedTasks =
        project.tasks?.filter(
            (t) =>
                t.status?.name?.toLowerCase().includes('done') ||
                t.status?.name?.toLowerCase().includes('complete'),
        ).length || 0;
    const totalTasks = project.tasks?.length || 0;
    const completionPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - ${space.name}`} />

            <div className="flex h-full flex-col overflow-hidden">
                <header className="flex items-center justify-between border-b bg-background/50 p-4 px-6 backdrop-blur">
                    <div className="flex items-center gap-x-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link
                                href={`/spaces/${space.slug}/settings?tab=projects`}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-lg shadow-sm"
                            style={{
                                backgroundColor: project.color || '#3b82f6',
                            }}
                        >
                            <FolderPlus className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl leading-tight font-bold">
                                {project.name}
                            </h1>
                            <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                    <Users className="mr-1 h-3 w-3" />{' '}
                                    {project.members?.length || 0} Members
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <ListTodo className="mr-1 h-3 w-3" />{' '}
                                    {totalTasks} Tasks
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                                    {completionPercentage}% Complete
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-2">
                        {activeTab === 'tasks' && (
                            <>
                                <Button
                                    variant={
                                        memberViewEnabled
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    onClick={() => {
                                        setMemberViewEnabled(
                                            !memberViewEnabled,
                                        );
                                        if (memberViewEnabled)
                                            setSelectedMemberId(null);
                                    }}
                                    className={cn(
                                        'gap-2',
                                        memberViewEnabled &&
                                            'border-primary/20 bg-primary/10 text-primary',
                                    )}
                                >
                                    <Users className="h-4 w-4" />
                                    Member View
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setSelectedTask(null);
                                        setIsTaskModalOpen(true);
                                    }}
                                >
                                    <ListTodo className="mr-2 h-4 w-4" /> New
                                    Task
                                </Button>
                            </>
                        )}
                        {activeTab === 'members' && can.manageMembers && (
                            <Button
                                size="sm"
                                onClick={() => setIsMemberModalOpen(true)}
                            >
                                <UserPlus className="mr-2 h-4 w-4" /> Add Member
                            </Button>
                        )}
                    </div>
                </header>

                {/* Tab bar in its own dedicated row so it never shifts with action buttons */}
                <nav className="flex items-center border-b bg-background px-6">
                    {tabs.map((tab) =>
                        tab.href ? (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className="relative -mb-px flex items-center gap-x-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <tab.icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </Link>
                        ) : (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'tasks' | 'sprints' | 'members' | 'settings')}
                                className={cn(
                                    'relative -mb-px flex items-center gap-x-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                                    activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground',
                                )}
                            >
                                <tab.icon className="h-3.5 w-3.5" />
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span
                                        className={cn(
                                            'ml-1 min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums',
                                            activeTab === tab.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ),
                    )}
                </nav>

                {totalTasks > 0 && (
                    <div className="border-b bg-muted/30 px-6 py-3">
                        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Project Progress</span>
                            <span>
                                {completedTasks} of {totalTasks} tasks completed
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-auto px-6 py-2">
                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                        <div className="flex h-full flex-col space-y-2">
                            <TaskFilterBar
                                space={space}
                                members={space.members || []}
                                currentFilters={filters || {}}
                                baseUrl={`/spaces/${space.slug}/projects/${project.slug}`}
                                statuses={effectiveStatuses}
                                hideProjectFilter={true}
                            />

                            <div className="flex flex-1 gap-6 overflow-hidden">
                                {/* Member Sidebar */}
                                {memberViewEnabled && (
                                    <div className="flex w-64 shrink-0 flex-col overflow-hidden rounded-xl border bg-card">
                                        <div className="border-b bg-muted/30 p-4">
                                            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Project Members
                                            </h3>
                                        </div>
                                        <div className="flex-1 space-y-1 overflow-y-auto p-2">
                                            <button
                                                onClick={() =>
                                                    setSelectedMemberId(null)
                                                }
                                                className={cn(
                                                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-all',
                                                    selectedMemberId === null
                                                        ? 'bg-primary text-primary-foreground shadow-md'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            'flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold',
                                                            selectedMemberId ===
                                                                null
                                                                ? 'bg-white/20'
                                                                : 'bg-primary/10 text-primary',
                                                        )}
                                                    >
                                                        ALL
                                                    </div>
                                                    <span>All Tasks</span>
                                                </div>
                                                {selectedMemberId === null && (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </button>

                                            {project.members?.map((member) => (
                                                <button
                                                    key={member.id}
                                                    onClick={() =>
                                                        setSelectedMemberId(
                                                            member.user.id,
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-all',
                                                        selectedMemberId ===
                                                            member.user.id
                                                            ? 'bg-primary text-primary-foreground shadow-md'
                                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                'flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold',
                                                                selectedMemberId ===
                                                                    member.user
                                                                        .id
                                                                    ? 'bg-white/20'
                                                                    : 'bg-primary/10 text-primary',
                                                            )}
                                                        >
                                                            {getInitials(
                                                                member.user
                                                                    .name,
                                                            )}
                                                        </div>
                                                        <span className="truncate">
                                                            {member.user.name}
                                                        </span>
                                                    </div>
                                                    {selectedMemberId ===
                                                        member.user.id && (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tasks Main Area */}
                                <div className="flex min-w-0 flex-1 flex-col space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center rounded-lg border bg-muted/50 p-1 shadow-sm">
                                            <Button
                                                variant={
                                                    viewMode === 'list'
                                                        ? 'secondary'
                                                        : 'ghost'
                                                }
                                                size="sm"
                                                className={cn(
                                                    'h-7 gap-2 px-3',
                                                    viewMode === 'list' &&
                                                        'bg-background shadow-sm',
                                                )}
                                                onClick={() =>
                                                    setViewMode('list')
                                                }
                                            >
                                                <List className="h-4 w-4" />
                                                <span className="text-xs font-bold">
                                                    List
                                                </span>
                                            </Button>
                                            <Button
                                                variant={
                                                    viewMode === 'board'
                                                        ? 'secondary'
                                                        : 'ghost'
                                                }
                                                size="sm"
                                                className={cn(
                                                    'h-7 gap-2 px-3',
                                                    viewMode === 'board' &&
                                                        'bg-background shadow-sm',
                                                )}
                                                onClick={() =>
                                                    setViewMode('board')
                                                }
                                            >
                                                <LayoutGrid className="h-4 w-4" />
                                                <span className="text-xs font-bold">
                                                    Board
                                                </span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        {viewMode === 'list' ? (
                                            <TasksList
                                                tasks={(
                                                    project.tasks || []
                                                ).filter(
                                                    (t) =>
                                                        !selectedMemberId ||
                                                        t.assignees?.some(
                                                            (a) =>
                                                                a.id ===
                                                                selectedMemberId,
                                                        ),
                                                )}
                                                statuses={effectiveStatuses}
                                                space={space}
                                                onEditTask={(task) => {
                                                    setSelectedTask(task);
                                                    setIsTaskModalOpen(true);
                                                }}
                                                onCreateTask={() => {
                                                    setSelectedTask(null);
                                                    setIsTaskModalOpen(true);
                                                }}
                                            />
                                        ) : (
                                            <BoardView
                                                tasks={(
                                                    project.tasks || []
                                                ).filter(
                                                    (t) =>
                                                        !selectedMemberId ||
                                                        t.assignees?.some(
                                                            (a) =>
                                                                a.id ===
                                                                selectedMemberId,
                                                        ),
                                                )}
                                                statuses={effectiveStatuses}
                                                space={space}
                                                onEditTask={(task) => {
                                                    setSelectedTask(task);
                                                    setIsTaskModalOpen(true);
                                                }}
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

                    {/* Sprints Tab */}
                    {activeTab === 'sprints' && (
                        <SprintList
                            space={space}
                            project={project}
                            sprints={project.sprints || []}
                        />
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div className="max-w-3xl">
                            <div className="space-y-3">
                                {project.members &&
                                project.members.length > 0 ? (
                                    project.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between rounded-lg border bg-card p-4"
                                        >
                                            <div className="flex items-center gap-x-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                                                    {getInitials(
                                                        member.user.name,
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {member.user.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {member.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-2">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-1 text-xs',
                                                        member.role === 'admin'
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {member.role}
                                                </span>
                                                {can.manageMembers && (
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
                                                                            'Remove this member from the project?',
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            `/spaces/${space.slug}/projects/${project.slug}/members/${member.user.id}`,
                                                                            {
                                                                                preserveScroll: true,
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />{' '}
                                                                Remove
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-lg border-2 border-dashed py-12 text-center">
                                        <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                                        <p className="mb-4 text-muted-foreground">
                                            No members in this project yet
                                        </p>
                                        {can.manageMembers && (
                                            <Button
                                                onClick={() =>
                                                    setIsMemberModalOpen(true)
                                                }
                                            >
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
                            <section className="rounded-xl border bg-card p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Task Statuses
                                </h2>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Define custom statuses for this project. If
                                    no custom statuses are defined, space
                                    statuses are used.
                                </p>
                                <ProjectStatusList
                                    space={space}
                                    project={project}
                                />
                            </section>

                            <section className="rounded-xl border bg-card p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold">
                                    Project Settings
                                </h2>
                                <form
                                    onSubmit={submitSettings}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            Project Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="Enter project name"
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

                            <section className="rounded-xl border border-destructive/50 bg-card p-6 shadow-sm">
                                <h2 className="mb-2 text-lg font-semibold text-destructive">
                                    Danger Zone
                                </h2>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Delete this project. Tasks will not be
                                    deleted but will become unassigned.
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
                                                `/spaces/${space.slug}/projects/${project.slug}`,
                                                {
                                                    onSuccess: () => {
                                                        router.visit(
                                                            `/spaces/${space.slug}/settings?tab=projects`,
                                                        );
                                                    },
                                                },
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    Project
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
                sprints={project.sprints || []}
                isOpen={isTaskModalOpen}
                onClose={() => {
                    setIsTaskModalOpen(false);
                    setSelectedTask(null);
                }}
                onTaskSelect={(task) => setSelectedTask(task)}
            />
        </AppLayout>
    );
}

function ProjectStatusList({
    space,
    project,
}: {
    space: Space;
    project: Project;
}) {
    const { data, setData, post, processing, reset } = useForm({
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
            <div className="space-y-2 overflow-hidden rounded-xl border bg-background">
                {(!project.statuses || project.statuses.length === 0) && (
                    <div className="p-8 text-center text-sm text-muted-foreground italic">
                        No custom statuses defined. Using space defaults.
                    </div>
                )}
                {project.statuses?.map((status) => (
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
                                if (
                                    confirm(
                                        'Delete this status? Tasks will not be deleted.',
                                    )
                                ) {
                                    router.delete(
                                        `/spaces/${space.slug}/projects/${project.slug}/statuses/${status.id}`,
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
                <h3 className="mb-3 text-sm font-semibold">
                    Add Custom Status
                </h3>
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
