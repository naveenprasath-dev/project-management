import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Head, router, Link } from '@inertiajs/react';
import {
    Plus,
    LayoutGrid,
    ChevronDown,
    List,
    MessageCircle,
    CheckCircle2,
    ListTodo,
    FolderPlus,
    Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ChatWindow from '@/components/chat/chat-window';
import BoardView from '@/components/tasks/board-view';
import TaskFilterBar from '@/components/tasks/task-filter-bar';
import TaskModal from '@/components/tasks/task-modal';
import TaskTableRow from '@/components/tasks/task-table-row';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { playMovementSound } from '@/lib/play-movement-sound';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, Task, TaskStatus, SpaceMember } from '@/types';

type StatusSummary = { status_id: number; count: number; status?: { id: number; name: string; color: string } };
type SpaceProject = { id: number; name: string; slug: string; color: string; tasks_count: number; members_count: number; completed_tasks_count: number; status_summary: StatusSummary[]; sprints?: { id: number; name: string }[] };
type SpaceAnalytics = { total_tasks: number; completed_tasks: number; completion_rate: number; total_members: number; total_projects: number };

interface PageSpace {
    id: number;
    name: string;
    slug: string;
    statuses: TaskStatus[];
    projects?: SpaceProject[];
    analytics?: SpaceAnalytics;
}

interface PageProps {
    space: PageSpace;
    tasks: {
        data: Task[];
        links: Record<string, unknown>[];
    };
    filters: Record<string, string | undefined>;
    members: SpaceMember[];
}

interface StatusGroup {
    id: number;
    name: string;
    color: string;
    tasks: Task[];
}

export default function Index({ space, tasks, filters, members }: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [view, setView] = useState<'overview' | 'list' | 'board'>('overview');
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks.data);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalTasks(tasks.data);
    }, [tasks.data]);

    useEffect(() => {
        if (selectedTask) {
            const updatedTask = localTasks.find(
                (t) => t.id === selectedTask.id,
            );
            if (updatedTask) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedTask(updatedTask);
            }
        }
    }, [localTasks]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
        { title: 'Tasks', href: `/spaces/${space.slug}/tasks` },
    ];

    const handleCreateTask = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const taskId = parseInt(draggableId);
        const newStatusId = parseInt(destination.droppableId);
        const task = localTasks.find((t) => t.id === taskId);

        if (!task || task.status_id === newStatusId) return;

        // Optimistic update
        const updatedTasks = localTasks.map((t) =>
            t.id === taskId ? { ...t, status_id: newStatusId } : t,
        );
        setLocalTasks(updatedTasks);
        playMovementSound();

        // API call
        router.patch(
            `/spaces/${space.slug}/tasks/${taskId}`,
            {
                status_id: newStatusId,
            },
            {
                preserveScroll: true,
                onError: () => {
                    setLocalTasks(tasks.data);
                },
            },
        );
    };

    const statusGroups: StatusGroup[] = space.statuses.map((status) => ({
        ...status,
        tasks: localTasks.filter((t) => t.status_id === status.id),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${space.name} - Tasks`} />

            <div className="flex h-full overflow-hidden bg-background">
                <div className="flex h-full min-w-0 flex-1 flex-col">
                    {/* Header Section */}
                    <div className="flex items-center justify-between border-b p-4 px-6">
                        <div className="flex items-center gap-x-4">
                            <div className="flex items-center rounded-lg border bg-muted/50 p-1 shadow-sm">
                                <Button
                                    variant={
                                        view === 'overview'
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    className={cn(
                                        'h-7 gap-2 px-3',
                                        view === 'overview' &&
                                            'bg-background shadow-sm',
                                    )}
                                    onClick={() => setView('overview')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="text-xs font-bold">
                                        Overview
                                    </span>
                                </Button>
                                <Button
                                    variant={
                                        view === 'list' ? 'secondary' : 'ghost'
                                    }
                                    size="sm"
                                    className={cn(
                                        'h-7 gap-2 px-3',
                                        view === 'list' &&
                                            'bg-background shadow-sm',
                                    )}
                                    onClick={() => setView('list')}
                                >
                                    <List className="h-4 w-4" />
                                    <span className="text-xs font-bold">
                                        List
                                    </span>
                                </Button>
                                <Button
                                    variant={
                                        view === 'board' ? 'secondary' : 'ghost'
                                    }
                                    size="sm"
                                    className={cn(
                                        'h-7 gap-2 px-3',
                                        view === 'board' &&
                                            'bg-background shadow-sm',
                                    )}
                                    onClick={() => setView('board')}
                                >
                                    <List className="h-4 w-4 rotate-90" />
                                    <span className="text-xs font-bold">
                                        Board
                                    </span>
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isChatOpen ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setIsChatOpen(!isChatOpen)}
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Chat
                            </Button>
                            <Button
                                onClick={() => handleCreateTask()}
                                size="sm"
                            >
                                <Plus className="mr-2 h-4 w-4" /> New Task
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        {view === 'overview' ? (
                            <main className="flex-1 space-y-10 overflow-y-auto p-6">
                                {/* Analytics Hero Section */}
                                {space.analytics && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                        <div className="flex h-32 flex-col justify-between rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
                                            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
                                                <CheckCircle2 className="h-4 w-4" />{' '}
                                                Space Progress
                                            </div>
                                            <div className="mt-auto flex items-end justify-between">
                                                <span className="text-3xl font-black">
                                                    {
                                                        space.analytics
                                                            .completion_rate
                                                    }
                                                    %
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
                                        <div className="flex h-32 flex-col justify-between rounded-2xl border bg-card p-6 text-card-foreground">
                                            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                <ListTodo className="h-4 w-4" />{' '}
                                                Total Tasks
                                            </div>
                                            <div className="mt-auto text-3xl font-black">
                                                {space.analytics.total_tasks}
                                            </div>
                                        </div>
                                        <div className="flex h-32 flex-col justify-between rounded-2xl border bg-card p-6 text-card-foreground">
                                            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                <FolderPlus className="h-4 w-4" />{' '}
                                                Projects
                                            </div>
                                            <div className="mt-auto text-3xl font-black">
                                                {space.analytics.total_projects}
                                            </div>
                                        </div>
                                        <div className="flex h-32 flex-col justify-between rounded-2xl border bg-card p-6 text-card-foreground">
                                            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                <Users className="h-4 w-4" />{' '}
                                                Team Members
                                            </div>
                                            <div className="mt-auto text-3xl font-black">
                                                {space.analytics.total_members}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {space.projects &&
                                    space.projects.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="flex items-center gap-4 text-lg font-black">
                                                    <span className="h-6 w-1 rounded-full bg-primary" />
                                                    Projects Analytics
                                                </h2>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setView('list')
                                                    }
                                                    className="border-primary font-bold text-primary hover:bg-primary/5"
                                                >
                                                    View Overall Tasks{' '}
                                                    <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg]" />
                                                </Button>
                                            </div>
                                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                {space.projects.map(
                                                    (project) => {
                                                        const completionPercentage =
                                                            project.tasks_count >
                                                            0
                                                                ? Math.round(
                                                                      (project.completed_tasks_count /
                                                                          project.tasks_count) *
                                                                          100,
                                                                  )
                                                                : 0;

                                                        return (
                                                            <div
                                                                key={project.id}
                                                                className="group relative flex h-64 flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-xl"
                                                            >
                                                                <div className="mb-6 flex items-start justify-between">
                                                                    <div className="flex items-center gap-4">
                                                                        <div
                                                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-lg"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    project.color,
                                                                            }}
                                                                        >
                                                                            <FolderPlus className="h-6 w-6" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <h3 className="truncate text-lg leading-tight font-bold">
                                                                                {
                                                                                    project.name
                                                                                }
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

                                                                <div className="mt-auto space-y-4 border-t border-muted pt-4">
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
                                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                                            <div
                                                                                className="h-full bg-primary transition-all duration-700"
                                                                                style={{
                                                                                    width: `${completionPercentage}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {project.status_summary &&
                                                                        project
                                                                            .status_summary
                                                                            .length >
                                                                            0 && (
                                                                            <div className="flex h-1.5 gap-1 overflow-hidden rounded-full bg-muted/30">
                                                                                {project.status_summary.map(
                                                                                    (
                                                                                        summary,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                summary.status_id
                                                                                            }
                                                                                            className="h-full"
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
                                                                                        />
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="mt-2 h-8 w-full text-xs font-bold"
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={`/spaces/${space.slug}/projects/${project.slug}`}
                                                                        >
                                                                            Open
                                                                            Project{' '}
                                                                            <ChevronDown className="ml-1 h-3 w-3 rotate-[-90deg]" />
                                                                        </Link>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </main>
                        ) : (
                            <div className="flex min-h-0 flex-1 flex-col">
                                {/* Filters Section - Only visible in List/Board */}
                                <TaskFilterBar
                                    space={space}
                                    members={members}
                                    currentFilters={filters}
                                />

                                {view === 'list' ? (
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <main className="flex-1 overflow-y-auto">
                                            <div className="min-w-[800px] pb-20">
                                                {/* Table Header */}
                                                <div className="flex items-center border-b bg-muted/20 px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                    <div className="mr-4 min-w-0 flex-1 pl-6">
                                                        Title
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-x-6">
                                                        <div className="w-20 text-center">
                                                            Priority
                                                        </div>
                                                        <div className="w-28 pl-4">
                                                            Due Date
                                                        </div>
                                                        <div className="w-32 pl-4">
                                                            Assignee
                                                        </div>
                                                        <div className="h-8 w-8" />
                                                    </div>
                                                </div>

                                                {/* Status Groups */}
                                                {statusGroups.map(
                                                    (group: StatusGroup) => (
                                                        <div
                                                            key={group.id}
                                                            className="mb-2"
                                                        >
                                                            <div className="group/status flex cursor-pointer items-center p-2 px-4 transition-colors hover:bg-muted/30">
                                                                <ChevronDown className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                <div
                                                                    className="mr-3 rounded px-2 py-0.5 text-[11px] font-bold text-white uppercase"
                                                                    style={{
                                                                        backgroundColor:
                                                                            group.color,
                                                                    }}
                                                                >
                                                                    {group.name}
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {
                                                                        group
                                                                            .tasks
                                                                            .length
                                                                    }
                                                                </span>
                                                            </div>

                                                            <Droppable
                                                                droppableId={group.id.toString()}
                                                            >
                                                                {(
                                                                    provided,
                                                                    snapshot,
                                                                ) => (
                                                                    <div
                                                                        {...provided.droppableProps}
                                                                        ref={
                                                                            provided.innerRef
                                                                        }
                                                                        className={cn(
                                                                            'flex min-h-[10px] flex-col transition-colors',
                                                                            snapshot.isDraggingOver
                                                                                ? 'bg-primary/5'
                                                                                : '',
                                                                        )}
                                                                    >
                                                                        {group.tasks.map(
                                                                            (
                                                                                task,
                                                                                index: number,
                                                                            ) => (
                                                                                <Draggable
                                                                                    key={
                                                                                        task.id
                                                                                    }
                                                                                    draggableId={task.id.toString()}
                                                                                    index={
                                                                                        index
                                                                                    }
                                                                                >
                                                                                    {(
                                                                                        provided,
                                                                                        snapshot,
                                                                                    ) => (
                                                                                        <div
                                                                                            ref={
                                                                                                provided.innerRef
                                                                                            }
                                                                                            {...provided.draggableProps}
                                                                                            {...provided.dragHandleProps}
                                                                                            className={cn(
                                                                                                snapshot.isDragging
                                                                                                    ? 'z-50 rounded-lg bg-background opacity-50 shadow-xl ring-2 ring-primary'
                                                                                                    : '',
                                                                                            )}
                                                                                        >
                                                                                            <TaskTableRow
                                                                                                task={
                                                                                                    task
                                                                                                }
                                                                                                space={
                                                                                                    space
                                                                                                }
                                                                                                onEdit={
                                                                                                    handleEditTask
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </Draggable>
                                                                            ),
                                                                        )}
                                                                        {
                                                                            provided.placeholder
                                                                        }

                                                                        <button
                                                                            onClick={() =>
                                                                                handleCreateTask()
                                                                            }
                                                                            className="flex items-center px-4 py-2 pl-12 text-left text-xs text-muted-foreground transition-all hover:bg-muted/20 hover:text-primary"
                                                                        >
                                                                            <Plus className="mr-2 h-3 w-3" />{' '}
                                                                            Add
                                                                            Task
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </Droppable>
                                                        </div>
                                                    ),
                                                )}

                                                {tasks.data.length === 0 && (
                                                    <div className="mx-6 mt-6 rounded-xl border-2 border-dashed py-20 text-center opacity-50">
                                                        <List className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
                                                        <h3 className="text-lg font-medium">
                                                            No tasks match your
                                                            filters
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Adjust your search
                                                            or create a new task
                                                            to get started.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </main>
                                    </DragDropContext>
                                ) : (
                                    <BoardView
                                        tasks={tasks.data}
                                        statuses={space.statuses}
                                        onEditTask={handleEditTask}
                                        onCreateTask={() =>
                                            handleCreateTask()
                                        }
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Section */}
                {isChatOpen && (
                    <ChatWindow spaceId={space.id} members={members} />
                )}
            </div>

            <TaskModal
                space={space}
                members={members}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                onTaskSelect={(task) => setSelectedTask(task)}
                sprints={
                    // Aggregate sprints from the space projects
                    space.projects?.flatMap((p) => p.sprints || []) || []
                }
            />
        </AppLayout>
    );
}
