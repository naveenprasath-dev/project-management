import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Settings, Plus, LayoutGrid, Users, FolderPlus, CheckCircle2, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    members: any[];
    statuses: any[];
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
            }
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
    const unassociatedTasksCount = space.tasks?.filter(t => !t.project_id).length || 0;
    const hasProjects = space.projects && space.projects.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={space.name} />

            <div className="flex flex-col h-full overflow-hidden">
                <header className="flex items-center justify-between p-4 px-6 border-b bg-background/50 backdrop-blur relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundColor: space.color || '#cbd5e1' }} />
                    <div className="flex items-center gap-x-4 relative">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-lg"
                            style={{ backgroundColor: space.color || '#cbd5e1' }}
                        >
                            <LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold leading-tight">{space.name}</h1>
                            <div className="flex items-center text-xs text-muted-foreground gap-x-2">
                                <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {space.members?.length || 0} Members</span>
                                <span>•</span>
                                <span>{space.tasks?.length || 0} Tasks</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-2 relative">
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/spaces/${space.slug}/settings`}>
                                <Settings className="w-4 h-4 mr-2" /> Settings
                            </Link>
                        </Button>
                        <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" /> New Task
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto space-y-10">
                    {/* Analytics Hero Section */}
                    {space.analytics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-6 rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent flex flex-col justify-between h-32 border-primary/20">
                                <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Space Progress
                                </div>
                                <div className="flex items-end justify-between mt-auto">
                                    <span className="text-3xl font-black">{space.analytics.completion_rate}%</span>
                                    <div className="w-16 h-1 w-full max-w-[100px] bg-muted rounded-full overflow-hidden ml-4 mb-2">
                                        <div className="h-full bg-primary" style={{ width: `${space.analytics.completion_rate}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl border bg-card flex flex-col justify-between h-32">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <ListTodo className="w-4 h-4" /> Total Tasks
                                </div>
                                <div className="text-3xl font-black mt-auto">{space.analytics.total_tasks}</div>
                            </div>
                            <div className="p-6 rounded-2xl border bg-card flex flex-col justify-between h-32">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <FolderPlus className="w-4 h-4" /> Projects
                                </div>
                                <div className="text-3xl font-black mt-auto">{space.analytics.total_projects}</div>
                            </div>
                            <div className="p-6 rounded-2xl border bg-card flex flex-col justify-between h-32">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Team Members
                                </div>
                                <div className="text-3xl font-black mt-auto">{space.analytics.total_members}</div>
                            </div>
                        </div>
                    )}
                    {space.projects && space.projects.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black flex items-center gap-4">
                                    <span className="w-1 h-6 bg-primary rounded-full" />
                                    Projects Dashboard
                                </h2>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/spaces/${space.slug}/settings?tab=projects`} className="text-xs font-bold text-primary hover:bg-primary/5">
                                        Manage Projects
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {space.projects.map(project => {
                                    const completionPercentage = project.tasks_count > 0
                                        ? Math.round((project.completed_tasks_count / project.tasks_count) * 100)
                                        : 0;

                                    return (
                                        <Link key={project.id} href={`/spaces/${space.slug}/projects/${project.slug}`} className="block">
                                            <div className="p-6 rounded-2xl border bg-card hover:border-primary/50 transition-all hover:shadow-xl flex flex-col h-full group relative overflow-hidden">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shrink-0 transition-transform group-hover:scale-105"
                                                            style={{ backgroundColor: project.color }}
                                                        >
                                                            <FolderPlus className="w-6 h-6" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors leading-tight">{project.name}</h3>
                                                            <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1.5 font-medium">
                                                                <span className="flex items-center">
                                                                    <Users className="w-3.5 h-3.5 mr-1 text-primary/60" />
                                                                    {project.members_count}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-primary/60" />
                                                                    {project.tasks_count}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto space-y-4">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between text-xs font-bold">
                                                            <span className="text-muted-foreground uppercase tracking-wider">Progress</span>
                                                            <span className="text-primary">{completionPercentage}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-700 ease-in-out"
                                                                style={{ width: `${completionPercentage}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {project.status_summary && project.status_summary.length > 0 && (
                                                        <div className="flex gap-1.5 h-1.5 rounded-full overflow-hidden bg-muted/30">
                                                            {project.status_summary.map((summary) => (
                                                                <div
                                                                    key={summary.status_id}
                                                                    className="h-full transition-all"
                                                                    style={{
                                                                        backgroundColor: summary.status?.color || '#ccc',
                                                                        width: `${(summary.count / project.tasks_count) * 100}%`,
                                                                        minWidth: '4px'
                                                                    }}
                                                                    title={`${summary.status?.name}: ${summary.count}`}
                                                                />
                                                            ))}
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
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black flex items-center gap-4">
                                <span className="w-1 h-6 bg-primary rounded-full" />
                                Workspace Boards
                            </h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {space.statuses?.map((status) => (
                                <div key={status.id} className="flex flex-col gap-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-x-2">
                                            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: status.color }} />
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{status.name}</h3>
                                            <span className="text-[10px] font-black bg-muted px-2 py-0.5 rounded-full text-muted-foreground/70">
                                                {space.tasks?.filter(t => t.status_id === status.id).length || 0}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <Plus className="h-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-y-3">
                                        {space.tasks?.filter(t => t.status_id === status.id).map(task => (
                                            <div
                                                key={task.id}
                                                className={cn(
                                                    "p-4 border rounded-2xl bg-card shadow-sm hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group relative overflow-hidden",
                                                    !task.project_id && "border-l-4 border-l-orange-400/50"
                                                )}
                                            >
                                                {!task.project_id && (
                                                    <div className="absolute top-0 right-0 p-2">
                                                        <div className="px-1.5 py-0.5 rounded text-[8px] font-black bg-orange-100 text-orange-600 uppercase tracking-tighter shadow-sm border border-orange-200">
                                                            Unassigned
                                                        </div>
                                                    </div>
                                                )}
                                                <h4 className="text-sm font-bold mb-4 group-hover:text-primary transition-colors leading-snug pr-12">
                                                    {task.title}
                                                </h4>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex -space-x-2">
                                                        {task.assignees && task.assignees.length > 0 ? (
                                                            task.assignees.slice(0, 3).map((user) => (
                                                                <div
                                                                    key={user.id}
                                                                    className="w-7 h-7 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-extrabold text-primary shadow-sm ring-1 ring-black/5"
                                                                    title={user.name}
                                                                >
                                                                    {getInitials(user.name)}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-muted/50 border-2 border-background flex items-center justify-center ring-1 ring-black/5">
                                                                <Users className="w-3.5 h-3.5 text-muted-foreground/30" />
                                                            </div>
                                                        )}
                                                        {task.assignees && task.assignees.length > 3 && (
                                                            <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                                +{task.assignees.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-black bg-muted/30 px-2 py-1 rounded-lg">
                                                        {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {space.tasks?.filter(t => t.status_id === status.id).length === 0 && (
                                            <div className="py-12 text-center border-2 border-dashed rounded-2xl opacity-30 bg-muted/5">
                                                <p className="text-[10px] text-muted-foreground px-4 font-black uppercase tracking-widest">No activities</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer note for unassociated tasks */}
                    {unassociatedTasksCount > 0 && (
                        <div className="pt-10 mb-6 border-t font-bold">
                            <div className="flex items-center gap-3 text-muted-foreground p-4 rounded-xl bg-orange-50/30 border border-orange-100/50">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-400/50 shadow-[0_0_5px_rgba(251,146,60,0.5)]" />
                                <span className="text-[10px] uppercase tracking-wider">Note: Tasks with an orange border are space-level tasks not yet assigned to any specific project.</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </AppLayout>
    );
}
