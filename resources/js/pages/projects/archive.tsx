import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Archive,
    ArrowLeft,
    Calendar,
    MoreHorizontal,
    RefreshCcw,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import TaskModal from '@/components/tasks/task-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project, Space, Sprint, Task } from '@/types';

interface Props {
    space: Space;
    project: Project;
    archivedSprints: Sprint[];
    archivedTasks: Task[];
}

export default function ArchivePage({
    space,
    project,
    archivedSprints,
    archivedTasks,
}: Props) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
        {
            title: project.name,
            href: `/spaces/${space.slug}/projects/${project.slug}`,
        },
        { title: 'Archive', href: '#' },
    ];

    const handleUnarchiveSprint = (sprintId: number) => {
        if (
            confirm(
                'Unarchive this sprint? it will return to the active sprints list.',
            )
        ) {
            router.post(
                `/spaces/${space.slug}/projects/${project.slug}/sprints/${sprintId}/unarchive`,
            );
        }
    };

    const handleUnarchiveTask = (taskId: number) => {
        if (
            confirm(
                'Unarchive this task? it will return to the active tasks list.',
            )
        ) {
            router.post(`/spaces/${space.slug}/tasks/${taskId}/unarchive`);
        }
    };

    const handleDeleteSprint = (sprintId: number) => {
        if (
            confirm('Are you sure you want to permanently delete this sprint?')
        ) {
            router.delete(
                `/spaces/${space.slug}/projects/${project.slug}/sprints/${sprintId}`,
            );
        }
    };

    const openTaskModal = (task: Task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Archive - ${project.name}`} />

            <div className="flex h-full flex-col overflow-hidden">
                <header className="flex items-center justify-between border-b bg-background/50 p-4 px-6 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link
                                href={`/spaces/${space.slug}/projects/${project.slug}`}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                <span>{space.name}</span>
                                <span>/</span>
                                <span>{project.name}</span>
                            </div>
                            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                                <Archive className="h-5 w-5 text-primary" />
                                Project Archive
                            </h2>
                        </div>
                    </div>
                </header>

                <div className="flex-1 space-y-12 overflow-y-auto p-6">
                    {/* Archived Sprints */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold">
                                    Archived Sprints
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Historical sprints that have been moved out
                                    of the main view.
                                </p>
                            </div>
                            <Badge variant="outline" className="px-3 py-1">
                                {archivedSprints.length} Sprints
                            </Badge>
                        </div>

                        {archivedSprints.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {archivedSprints.map((sprint) => (
                                    <div
                                        key={sprint.id}
                                        className="group rounded-xl border border-dashed bg-card/50 p-5 shadow-sm transition-all hover:shadow-md"
                                    >
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h4 className="text-base font-bold">
                                                    {sprint.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(
                                                        new Date(
                                                            sprint.start_date,
                                                        ),
                                                        'MMM d',
                                                    )}{' '}
                                                    -{' '}
                                                    {format(
                                                        new Date(
                                                            sprint.end_date,
                                                        ),
                                                        'MMM d, yyyy',
                                                    )}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
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
                                                        onClick={() =>
                                                            handleUnarchiveSprint(
                                                                sprint.id,
                                                            )
                                                        }
                                                    >
                                                        <RefreshCcw className="mr-2 h-4 w-4" />{' '}
                                                        Unarchive
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            handleDeleteSprint(
                                                                sprint.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />{' '}
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                                            <Badge
                                                variant="secondary"
                                                className="bg-muted text-[10px] font-bold text-muted-foreground capitalize"
                                            >
                                                {sprint.status}
                                            </Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs font-bold"
                                                onClick={() =>
                                                    handleUnarchiveSprint(
                                                        sprint.id,
                                                    )
                                                }
                                            >
                                                <RefreshCcw className="mr-1.5 h-3 w-3" />{' '}
                                                Restore
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/5 py-12">
                                <Archive className="mb-3 h-12 w-12 text-muted-foreground/20" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No archived sprints found.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Archived Tasks */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold">
                                    Archived Tasks
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Completed or abandoned tasks preserved for
                                    reference.
                                </p>
                            </div>
                            <Badge variant="outline" className="px-3 py-1">
                                {archivedTasks.length} Tasks
                            </Badge>
                        </div>

                        {archivedTasks.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                <div className="divide-y">
                                    {archivedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="group flex items-center px-4 py-3 transition-colors hover:bg-muted/30"
                                        >
                                            <div className="mr-4 min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="cursor-pointer text-sm font-bold transition-colors hover:text-primary"
                                                        onClick={() =>
                                                            openTaskModal(task)
                                                        }
                                                    >
                                                        {task.title}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="px-1.5 py-0 text-[10px]"
                                                    >
                                                        #{task.id}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 flex items-center gap-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                    <span className="flex items-center gap-1">
                                                        <div
                                                            className="h-1.5 w-1.5 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    task.status
                                                                        ?.color,
                                                            }}
                                                        />
                                                        {task.status?.name}
                                                    </span>
                                                    <span>
                                                        {task.priority} Priority
                                                    </span>
                                                    {task.due_date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-2.5 w-2.5" />
                                                            {format(
                                                                new Date(
                                                                    task.due_date,
                                                                ),
                                                                'MMM d, yyyy',
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs font-bold text-primary hover:bg-primary/5 hover:text-primary"
                                                    onClick={() =>
                                                        handleUnarchiveTask(
                                                            task.id,
                                                        )
                                                    }
                                                >
                                                    <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />{' '}
                                                    Restore
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openTaskModal(
                                                                    task,
                                                                )
                                                            }
                                                        >
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleUnarchiveTask(
                                                                    task.id,
                                                                )
                                                            }
                                                        >
                                                            <RefreshCcw className="mr-2 h-4 w-4" />{' '}
                                                            Unarchive Task
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/5 py-12">
                                <Archive className="mb-3 h-12 w-12 text-muted-foreground/20" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No archived tasks found.
                                </p>
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
