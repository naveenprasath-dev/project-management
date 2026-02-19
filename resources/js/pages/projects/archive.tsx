import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Archive, ArrowLeft, Calendar, User, MoreHorizontal, RefreshCcw, Trash2, LayoutGrid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TaskTableRow from '@/components/tasks/task-table-row';
import { useState } from 'react';
import TaskModal from '@/components/tasks/task-modal';
import { BreadcrumbItem } from '@/types';

interface Props {
    auth: any;
    space: any;
    project: any;
    archivedSprints: any[];
    archivedTasks: any[];
}

export default function ArchivePage({ auth, space, project, archivedSprints, archivedTasks }: Props) {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
        { title: project.name, href: `/spaces/${space.slug}/projects/${project.slug}` },
        { title: 'Archive', href: '#' },
    ];

    const handleUnarchiveSprint = (sprintId: number) => {
        if (confirm('Unarchive this sprint? it will return to the active sprints list.')) {
            router.post(`/spaces/${space.slug}/projects/${project.slug}/sprints/${sprintId}/unarchive`);
        }
    };

    const handleUnarchiveTask = (taskId: number) => {
        if (confirm('Unarchive this task? it will return to the active tasks list.')) {
            router.post(`/spaces/${space.slug}/tasks/${taskId}/unarchive`);
        }
    };

    const handleDeleteSprint = (sprintId: number) => {
        if (confirm('Are you sure you want to permanently delete this sprint?')) {
            router.delete(`/spaces/${space.slug}/projects/${project.slug}/sprints/${sprintId}`);
        }
    };

    const openTaskModal = (task: any) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Archive - ${project.name}`} />

            <div className="flex flex-col h-full overflow-hidden">
                <header className="flex items-center justify-between p-4 px-6 border-b bg-background/50 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/spaces/${space.slug}/projects/${project.slug}`}>
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
                                <span>{space.name}</span>
                                <span>/</span>
                                <span>{project.name}</span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Archive className="w-5 h-5 text-primary" />
                                Project Archive
                            </h2>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-12">
                    {/* Archived Sprints */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold">Archived Sprints</h3>
                                <p className="text-sm text-muted-foreground">Historical sprints that have been moved out of the main view.</p>
                            </div>
                            <Badge variant="outline" className="px-3 py-1">{archivedSprints.length} Sprints</Badge>
                        </div>

                        {archivedSprints.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {archivedSprints.map((sprint) => (
                                    <div key={sprint.id} className="p-5 rounded-xl border bg-card/50 shadow-sm group hover:shadow-md transition-all border-dashed">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-base">{sprint.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {format(new Date(sprint.start_date), 'MMM d')} - {format(new Date(sprint.end_date), 'MMM d, yyyy')}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleUnarchiveSprint(sprint.id)}>
                                                        <RefreshCcw className="w-4 h-4 mr-2" /> Unarchive
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSprint(sprint.id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground capitalize text-[10px] font-bold">
                                                {sprint.status}
                                            </Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs font-bold"
                                                onClick={() => handleUnarchiveSprint(sprint.id)}
                                            >
                                                <RefreshCcw className="w-3 h-3 mr-1.5" /> Restore
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-muted/5 rounded-2xl border-2 border-dashed">
                                <Archive className="w-12 h-12 text-muted-foreground/20 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">No archived sprints found.</p>
                            </div>
                        )}
                    </section>

                    {/* Archived Tasks */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold">Archived Tasks</h3>
                                <p className="text-sm text-muted-foreground">Completed or abandoned tasks preserved for reference.</p>
                            </div>
                            <Badge variant="outline" className="px-3 py-1">{archivedTasks.length} Tasks</Badge>
                        </div>

                        {archivedTasks.length > 0 ? (
                            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                                <div className="divide-y">
                                    {archivedTasks.map((task) => (
                                        <div key={task.id} className="flex items-center px-4 py-3 hover:bg-muted/30 transition-colors group">
                                            <div className="flex-1 min-w-0 mr-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="font-bold text-sm hover:text-primary cursor-pointer transition-colors"
                                                        onClick={() => openTaskModal(task)}
                                                    >
                                                        {task.title}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">#{task.id}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                                    <span className="flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.status?.color }} />
                                                        {task.status?.name}
                                                    </span>
                                                    <span>{task.priority} Priority</span>
                                                    {task.due_date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-2.5 h-2.5" />
                                                            {format(new Date(task.due_date), 'MMM d, yyyy')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs font-bold text-primary hover:text-primary hover:bg-primary/5"
                                                    onClick={() => handleUnarchiveTask(task.id)}
                                                >
                                                    <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Restore
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openTaskModal(task)}>
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUnarchiveTask(task.id)}>
                                                            <RefreshCcw className="w-4 h-4 mr-2" /> Unarchive Task
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-muted/5 rounded-2xl border-2 border-dashed">
                                <Archive className="w-12 h-12 text-muted-foreground/20 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">No archived tasks found.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {selectedTask && (
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => {
                        setIsTaskModalOpen(false);
                        setSelectedTask(null);
                    }}
                    task={selectedTask}
                    space={space}
                    members={space.members}
                    project={project}
                    statuses={space.statuses}
                />
            )}
        </AppLayout>
    );
}
