import { Head, Link, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    LayoutGrid,
    CheckCircle2,
    Clock,
    Plus,
    ArrowRight,
    Calendar,
    ChevronRight,
    Search,
    List
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, SharedData } from '@/types';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

interface PageProps {
    lineup: any[];
    counts: {
        to_do: number;
        in_progress: number;
        done: number;
    };
    recentActivity: any[];
    spaces: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: dashboard().url,
    },
];

export default function Dashboard({ lineup, counts, spaces, recentActivity }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user.name.split(' ')[0];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home - My Work" />

            <div className="flex flex-col h-full bg-background overflow-y-auto">
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">

                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {firstName}</h1>
                            <p className="text-muted-foreground">Here's what's happening in your projects today.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                Today
                            </Button>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Task
                            </Button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-50/30 dark:from-blue-950/30 dark:to-blue-950/10 border-blue-200/50 dark:border-blue-800/30 shadow-none relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-blue-100/50 dark:bg-blue-900/20" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">To Do</CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{counts.to_do}</div>
                                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Pending tasks</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-50 to-amber-50/30 dark:from-amber-950/30 dark:to-amber-950/10 border-amber-200/50 dark:border-amber-800/30 shadow-none relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-amber-100/50 dark:bg-amber-900/20" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">In Progress</CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{counts.in_progress}</div>
                                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Currently working on</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-50/30 dark:from-emerald-950/30 dark:to-emerald-950/10 border-emerald-200/50 dark:border-emerald-800/30 shadow-none relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Done</CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{counts.done}</div>
                                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Completed this week</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lineup Section (Left/Center) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <List className="w-5 h-5 text-primary" />
                                    Lineup
                                </h2>
                                <Button variant="link" size="sm" className="text-xs">View all</Button>
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
                                            className="group flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: task.status.color }} />
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-sm truncate">{task.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                                                            {task.space.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Due {task.due_date || 'No date'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Recent Activity Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">Recent Activity</h2>
                                <div className="space-y-4">
                                    {recentActivity.length === 0 ? (
                                        <EmptyState
                                            icon={Search}
                                            title="No activity yet"
                                            description="Recent changes in your spaces will appear here."
                                        />
                                    ) : (
                                        recentActivity.map((log) => (
                                            <div key={log.id} className="flex gap-4 p-3 hover:bg-muted/30 rounded-lg transition-colors group">
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary uppercase">
                                                        {log.user.name.substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm leading-relaxed">
                                                        <span className="font-bold">{log.user.name}</span>{" "}
                                                        <span className="text-muted-foreground">{log.description}</span>
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                                        {log.space && (
                                                            <>
                                                                <span className="mx-1">•</span>
                                                                <span className="font-medium text-primary/70">{log.space.name}</span>
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
                                        className="group flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/20 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold transition-transform duration-200 group-hover:scale-105" style={{ backgroundColor: space.color }}>
                                                {space.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{space.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{space.tasks_count} tasks</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </Link>
                                ))}
                                <Link href="/spaces/create">
                                    <Button variant="outline" className="w-full border-dashed" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create New Space
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}
