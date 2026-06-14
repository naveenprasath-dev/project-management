import { Head, Link, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    CheckCircle2,
    Clock,
    Plus,
    ArrowRight,
    Calendar,
    ChevronRight,
    Search,
    List,
} from 'lucide-react';
import { useState } from 'react';
import TaskModal from '@/components/tasks/task-modal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, SharedData, Space, Task } from '@/types';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

interface PageProps {
    lineup: Task[];
    counts: {
        to_do: number;
        in_progress: number;
        done: number;
    };
    recentActivity: Record<string, unknown>[];
    spaces: Space[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: dashboard().url,
    },
];

export default function Dashboard({
    lineup,
    counts,
    spaces,
    recentActivity,
}: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user.name.split(' ')[0];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleCreateTask = (space: Space) => {
        setSelectedSpace(space);
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleOpenTask = (task: Task) => {
        const fullSpace = spaces.find((s) => s.id === task.space.id);
        if (fullSpace) {
            setSelectedSpace(fullSpace);
            setSelectedTask(task);
            setIsModalOpen(true);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home - My Work" />

            <div className="flex h-full flex-col overflow-y-auto bg-background">
                <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 p-6 md:p-8">
                    {/* Welcome Section */}
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {getGreeting()}, {firstName}
                            </h1>
                            <p className="text-muted-foreground">
                                Here's what's happening in your projects today.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                                <Calendar className="mr-2 h-4 w-4" />
                                Today
                            </Button>
                            {spaces.length === 1 ? (
                                <Button
                                    size="sm"
                                    onClick={() => handleCreateTask(spaces[0])}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Task
                                </Button>
                            ) : spaces.length > 1 ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Task
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                                            Select a space
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {spaces.map((space) => (
                                            <DropdownMenuItem
                                                key={space.id}
                                                onClick={() =>
                                                    handleCreateTask(space)
                                                }
                                            >
                                                <div
                                                    className="mr-2 h-3 w-3 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            space.color,
                                                    }}
                                                />
                                                {space.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button size="sm" disabled>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Task
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card className="relative overflow-hidden border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-50/30 shadow-none dark:border-blue-800/30 dark:from-blue-950/30 dark:to-blue-950/10">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-blue-100/50 dark:bg-blue-900/20" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    To Do
                                </CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                    {counts.to_do}
                                </div>
                                <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">
                                    Pending tasks
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-50/30 shadow-none dark:border-amber-800/30 dark:from-amber-950/30 dark:to-amber-950/10">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-amber-100/50 dark:bg-amber-900/20" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                    In Progress
                                </CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                                    {counts.in_progress}
                                </div>
                                <p className="mt-1 text-xs text-amber-600/70 dark:text-amber-400/70">
                                    Currently working on
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-50/30 shadow-none dark:border-emerald-800/30 dark:from-emerald-950/30 dark:to-emerald-950/10">
                            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                    Done
                                </CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                                    {counts.done}
                                </div>
                                <p className="mt-1 text-xs text-emerald-600/70 dark:text-emerald-400/70">
                                    Completed this week
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Lineup Section (Left/Center) */}
                        <div className="space-y-6 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-xl font-bold">
                                    <List className="h-5 w-5 text-primary" />
                                    Lineup
                                </h2>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-xs"
                                >
                                    View all
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {lineup.length === 0 ? (
                                    <EmptyState
                                        icon={List}
                                        title="Your lineup is empty"
                                        description="Add tasks to stay focused on what matters most."
                                    />
                                ) : (
                                    lineup.map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={() => handleOpenTask(task)}
                                            className="group flex cursor-pointer items-center justify-between rounded-xl border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                <div
                                                    className="h-10 w-2 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            task.status.color,
                                                    }}
                                                />
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-semibold">
                                                        {task.title}
                                                    </h4>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                                                            {task.space.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Due{' '}
                                                            {task.due_date ||
                                                                'No date'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Recent Activity Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">
                                    Recent Activity
                                </h2>
                                <div className="space-y-4">
                                    {recentActivity.length === 0 ? (
                                        <EmptyState
                                            icon={Search}
                                            title="No activity yet"
                                            description="Recent changes in your spaces will appear here."
                                        />
                                    ) : (
                                        recentActivity.map((log) => (
                                            <div
                                                key={log.id}
                                                className="group flex gap-4 rounded-lg p-3 transition-colors hover:bg-muted/30"
                                            >
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarFallback className="bg-primary/10 text-[10px] text-primary uppercase">
                                                        {log.user.name.substring(
                                                            0,
                                                            2,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm leading-relaxed">
                                                        <span className="font-bold">
                                                            {log.user.name}
                                                        </span>{' '}
                                                        <span className="text-muted-foreground">
                                                            {log.description}
                                                        </span>
                                                    </p>
                                                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                log.created_at,
                                                            ),
                                                            { addSuffix: true },
                                                        )}
                                                        {log.space && (
                                                            <>
                                                                <span className="mx-1">
                                                                    •
                                                                </span>
                                                                <span className="font-medium text-primary/70">
                                                                    {
                                                                        log
                                                                            .space
                                                                            .name
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Spaces Overview (Right Sidebar on Dashboard) */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">My Spaces</h2>
                            <div className="grid grid-cols-1 gap-3">
                                {spaces.map((space) => (
                                    <Link
                                        key={space.id}
                                        href={`/spaces/${space.slug}/tasks`}
                                        className="group flex items-center justify-between rounded-xl border bg-card p-3 transition-all duration-200 hover:border-primary/20 hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white transition-transform duration-200 group-hover:scale-105"
                                                style={{
                                                    backgroundColor:
                                                        space.color,
                                                }}
                                            >
                                                {space.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {space.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {space.tasks_count} tasks
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </Link>
                                ))}
                                <Link href="/spaces/create">
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed"
                                        size="sm"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create New Space
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {selectedSpace && (
                <TaskModal
                    key={selectedTask?.id ?? 'create'}
                    space={selectedSpace}
                    members={selectedSpace.members || []}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedSpace(null);
                        setSelectedTask(null);
                    }}
                    task={selectedTask}
                    onTaskSelect={() => {}}
                />
            )}
        </AppLayout>
    );
}
