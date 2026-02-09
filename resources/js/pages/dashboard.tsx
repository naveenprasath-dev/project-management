import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home - My Work" />

            <div className="flex flex-col h-full bg-background overflow-y-auto">
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">

                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">Good evening, Hero</h1>
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
                        <Card className="bg-primary/5 border-primary/10 shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">To Do</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{counts.to_do}</div>
                                <p className="text-xs text-muted-foreground mt-1">Pending tasks</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-yellow-500/5 border-yellow-500/10 shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{counts.in_progress}</div>
                                <p className="text-xs text-muted-foreground mt-1">Currently working on</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-500/5 border-green-500/10 shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Done</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{counts.done}</div>
                                <p className="text-xs text-muted-foreground mt-1">Completed this week</p>
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
                                    <div className="p-12 text-center border-2 border-dashed rounded-xl opacity-50 bg-muted/20">
                                        <p className="text-sm text-muted-foreground">Your lineup is empty. Add tasks to stay focused.</p>
                                    </div>
                                ) : (
                                    lineup.map((task) => (
                                        <div
                                            key={task.id}
                                            className="group flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-md transition-all cursor-pointer"
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
                                        <Card className="shadow-none border-dashed bg-muted/10">
                                            <CardContent className="py-20 text-center">
                                                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                                                <h3 className="text-lg font-medium">No activity yet</h3>
                                                <p className="text-sm text-muted-foreground">Recent changes in your spaces will appear here.</p>
                                            </CardContent>
                                        </Card>
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
                                        className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: space.color }}>
                                                {space.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{space.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{space.tasks_count} tasks</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
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
