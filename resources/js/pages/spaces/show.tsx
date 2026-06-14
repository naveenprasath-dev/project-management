import { Head, Link } from '@inertiajs/react';
import {
    Settings,
    Plus,
    LayoutGrid,
    Users,
    FolderPlus,
    CheckCircle2,
    ListTodo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Task {
    id: number;
    title: string;
    description: string;
    status_id: number;
    status?: {
        id: number;
        name: string;
        color: string;
    };
    assignees?: {
        id: number;
        name: string;
        email: string;
    }[];
    project_id?: number | null;
    created_at: string;
}

interface Space {
    id: number;
    name: string;
    slug: string;
    description: string;
    color: string;
    members: { id: number; name: string; email: string }[];
    statuses: { id: number; name: string; color: string }[];
    tasks: Task[];
    analytics?: {
        total_tasks: number;
        completed_tasks: number;
        completion_rate: number;
        total_members: number;
        total_projects: number;
    };
    projects?: {
        id: number;
        name: string;
        slug: string;
        color: string;
        tasks_count: number;
        members_count: number;
        completed_tasks_count: number;
        status_summary: {
            project_id: number;
            status_id: number;
            count: number;
            status: {
                id: number;
                name: string;
                color: string;
            };
        }[];
    }[];
}

export default function Show({ space }: { space: Space }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
    ];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Filter tasks that ARE NOT associated with any project
    const unassociatedTasksCount =
        space.tasks?.filter((t) => !t.project_id).length || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={space.name} />

            <div className="flex h-full flex-col overflow-hidden">
                <header className="relative flex items-center justify-between overflow-hidden border-b bg-background/50 p-4 px-6 backdrop-blur">
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundColor: space.color || '#cbd5e1' }}
                    />
                    <div className="relative flex items-center gap-x-4">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{
                                backgroundColor: space.color || '#cbd5e1',
                            }}
                        >
                            <LayoutGrid className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl leading-tight font-bold">
                                {space.name}
                            </h1>
                            <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                    <Users className="mr-1 h-3 w-3" />{' '}
                                    {space.members?.length || 0} Members
                                </span>
                                <span>•</span>
                                <span>{space.tasks?.length || 0} Tasks</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex items-center gap-x-2">
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/spaces/${space.slug}/settings`}>
                                <Settings className="mr-2 h-4 w-4" /> Settings
                            </Link>
                        </Button>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </div>
                </header>

                <main className="flex-1 space-y-10 overflow-y-auto p-6">
                    {/* Analytics Hero Section */}
                    {space.analytics && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="flex h-32 flex-col justify-between rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
                                    <CheckCircle2 className="h-4 w-4" /> Space
                                    Progress
                                </div>
                                <div className="mt-auto flex items-end justify-between">
                                    <span className="text-3xl font-black">
                                        {space.analytics.completion_rate}%
                                    </span>
                                    <div className="mb-2 ml-4 h-1 w-16 w-full max-w-[100px] overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-primary"
                                            style={{
                                                width: `${space.analytics.completion_rate}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex h-32 flex-col justify-between rounded-2xl border bg-card p-6">
                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    <ListTodo className="h-4 w-4" /> Total Tasks
                                </div>
                                <div className="mt-auto text-3xl font-black">
                                    {space.analytics.total_tasks}
                                </div>
                            </div>
                            <div className="flex h-32 flex-col justify-between rounded-2xl border bg-card p-6">
                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    <FolderPlus className="h-4 w-4" /> Projects
                                </div>
                                <div className="mt-auto text-3xl font-black">
                                    {space.analytics.total_projects}
                                </div>
                            </div>
                            <div className="flex h-32 flex-col justify-between rounded-2xl border bg-card p-6">
                                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    <Users className="h-4 w-4" /> Team Members
                                </div>
                                <div className="mt-auto text-3xl font-black">
                                    {space.analytics.total_members}
                                </div>
                            </div>
                        </div>
                    )}
                    {space.projects && space.projects.length > 0 && (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-4 text-lg font-black">
                                    <span className="h-6 w-1 rounded-full bg-primary" />
                                    Projects Dashboard
                                </h2>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link
                                        href={`/spaces/${space.slug}/settings?tab=projects`}
                                        className="text-xs font-bold text-primary hover:bg-primary/5"
                                    >
                                        Manage Projects
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {space.projects.map((project) => {
                                    const completionPercentage =
                                        project.tasks_count > 0
                                            ? Math.round(
                                                  (project.completed_tasks_count /
                                                      project.tasks_count) *
                                                      100,
                                              )
                                            : 0;

                                    return (
                                        <Link
                                            key={project.id}
                                            href={`/spaces/${space.slug}/projects/${project.slug}`}
                                            className="block"
                                        >
                                            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-xl">
                                                <div className="mb-6 flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-105"
                                                            style={{
                                                                backgroundColor:
                                                                    project.color,
                                                            }}
                                                        >
                                                            <FolderPlus className="h-6 w-6" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="truncate text-lg leading-tight font-bold transition-colors group-hover:text-primary">
                                                                {project.name}
                                                            </h3>
                                                            <div className="mt-1.5 flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                                                <span className="flex items-center">
                                                                    <Users className="mr-1 h-3.5 w-3.5 text-primary/60" />
                                                                    {
                                                                        project.members_count
                                                                    }
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-primary/60" />
                                                                    {
                                                                        project.tasks_count
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto space-y-4">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between text-xs font-bold">
                                                            <span className="tracking-wider text-muted-foreground uppercase">
                                                                Progress
                                                            </span>
                                                            <span className="text-primary">
                                                                {
                                                                    completionPercentage
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-700 ease-in-out"
                                                                style={{
                                                                    width: `${completionPercentage}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {project.status_summary &&
                                                        project.status_summary
                                                            .length > 0 && (
                                                            <div className="flex h-1.5 gap-1.5 overflow-hidden rounded-full bg-muted/30">
                                                                {project.status_summary.map(
                                                                    (
                                                                        summary,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                summary.status_id
                                                                            }
                                                                            className="h-full transition-all"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    summary
                                                                                        .status
                                                                                        ?.color ||
                                                                                    '#ccc',
                                                                                width: `${(summary.count / project.tasks_count) * 100}%`,
                                                                                minWidth:
                                                                                    '4px',
                                                                            }}
                                                                            title={`${summary.status?.name}: ${summary.count}`}
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Status Overview / Task Boards */}
                    <div className="pt-4">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="flex items-center gap-4 text-lg font-black">
                                <span className="h-6 w-1 rounded-full bg-primary" />
                                Workspace Boards
                            </h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {space.statuses?.map((status) => (
                                <div
                                    key={status.id}
                                    className="flex flex-col gap-y-4"
                                >
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-x-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                                                style={{
                                                    backgroundColor:
                                                        status.color,
                                                }}
                                            />
                                            <h3 className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                                                {status.name}
                                            </h3>
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground/70">
                                                {space.tasks?.filter(
                                                    (t) =>
                                                        t.status_id ===
                                                        status.id,
                                                ).length || 0}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 opacity-50 transition-opacity group-hover:opacity-100"
                                        >
                                            <Plus className="h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-y-3">
                                        {space.tasks
                                            ?.filter(
                                                (t) =>
                                                    t.status_id === status.id,
                                            )
                                            .map((task) => (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        'group relative cursor-pointer overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg',
                                                        !task.project_id &&
                                                            'border-l-4 border-l-orange-400/50',
                                                    )}
                                                >
                                                    {!task.project_id && (
                                                        <div className="absolute top-0 right-0 p-2">
                                                            <div className="rounded border border-orange-200 bg-orange-100 px-1.5 py-0.5 text-[8px] font-black tracking-tighter text-orange-600 uppercase shadow-sm">
                                                                Unassigned
                                                            </div>
                                                        </div>
                                                    )}
                                                    <h4 className="mb-4 pr-12 text-sm leading-snug font-bold transition-colors group-hover:text-primary">
                                                        {task.title}
                                                    </h4>
                                                    <div className="mt-auto flex items-center justify-between">
                                                        <div className="flex -space-x-2">
                                                            {task.assignees &&
                                                            task.assignees
                                                                .length > 0 ? (
                                                                task.assignees
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (
                                                                            user,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    user.id
                                                                                }
                                                                                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-[10px] font-extrabold text-primary shadow-sm ring-1 ring-black/5"
                                                                                title={
                                                                                    user.name
                                                                                }
                                                                            >
                                                                                {getInitials(
                                                                                    user.name,
                                                                                )}
                                                                            </div>
                                                                        ),
                                                                    )
                                                            ) : (
                                                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted/50 ring-1 ring-black/5">
                                                                    <Users className="h-3.5 w-3.5 text-muted-foreground/30" />
                                                                </div>
                                                            )}
                                                            {task.assignees &&
                                                                task.assignees
                                                                    .length >
                                                                    3 && (
                                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground">
                                                                        +
                                                                        {task
                                                                            .assignees
                                                                            .length -
                                                                            3}
                                                                    </div>
                                                                )}
                                                        </div>
                                                        <span className="rounded-lg bg-muted/30 px-2 py-1 text-[10px] font-black text-muted-foreground">
                                                            {new Date(
                                                                task.created_at,
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                        {space.tasks?.filter(
                                            (t) => t.status_id === status.id,
                                        ).length === 0 && (
                                            <div className="rounded-2xl border-2 border-dashed bg-muted/5 py-12 text-center opacity-30">
                                                <p className="px-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                                    No activities
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer note for unassociated tasks */}
                    {unassociatedTasksCount > 0 && (
                        <div className="mb-6 border-t pt-10 font-bold">
                            <div className="flex items-center gap-3 rounded-xl border border-orange-100/50 bg-orange-50/30 p-4 text-muted-foreground">
                                <div className="h-2.5 w-2.5 rounded-full bg-orange-400/50 shadow-[0_0_5px_rgba(251,146,60,0.5)]" />
                                <span className="text-[10px] tracking-wider uppercase">
                                    Note: Tasks with an orange border are
                                    space-level tasks not yet assigned to any
                                    specific project.
                                </span>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </AppLayout>
    );
}
