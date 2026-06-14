import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Head, router } from '@inertiajs/react';
import {
    LayoutGrid,
    List as ListIcon,
    CheckCircle2,
    Search,
    ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import BoardView from '@/components/tasks/board-view';
import TaskModal from '@/components/tasks/task-modal';
import TaskTableRow from '@/components/tasks/task-table-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, Space, Task, TaskStatus } from '@/types';

interface PageProps {
    tasks: {
        data: Task[];
        links: Record<string, unknown>[];
        meta: Record<string, unknown>;
    };
    statuses: TaskStatus[];
    spaces: Space[];
    filters: Record<string, string | undefined>;
}

export default function MyTasks({
    tasks,
    statuses,
    spaces,
    filters,
}: PageProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState<'list' | 'board'>('list');
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks.data);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalTasks(tasks.data);
    }, [tasks.data]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Work', href: '/my-tasks' },
        { title: 'My Tasks', href: '/my-tasks' },
    ];

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setSelectedSpace(task.space || spaces[0] || null);
        setIsModalOpen(true);
    };

    const handleCreateTask = (statusId?: number) => {
        const space = statusId
            ? (spaces.find((s) =>
                  s.statuses?.some((st) => st.id === statusId),
              ) ?? spaces[0])
            : spaces[0];
        if (!space) return;
        setSelectedTask(null);
        setSelectedSpace(space);
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

        // API call
        router.patch(
            `/spaces/${task.space.slug}/tasks/${taskId}`,
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

    const statusGroups = statuses.map((status) => ({
        ...status,
        tasks: localTasks.filter((t) => t.status_id === status.id),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Tasks" />

            <div className="flex h-full flex-col bg-background">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b bg-card p-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary p-2 text-white shadow-lg shadow-primary/20">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                My Tasks
                            </h1>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                    Global Overview
                                </p>
                                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                                    {localTasks.length} Tasks
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center rounded-lg border bg-muted/50 p-1 shadow-sm">
                        <Button
                            variant={view === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn(
                                'h-7 gap-2 px-3',
                                view === 'list' && 'bg-background shadow-sm',
                            )}
                            onClick={() => setView('list')}
                        >
                            <ListIcon className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold tracking-wider uppercase">
                                List
                            </span>
                        </Button>
                        <Button
                            variant={view === 'board' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn(
                                'h-7 gap-2 px-3',
                                view === 'board' && 'bg-background shadow-sm',
                            )}
                            onClick={() => setView('board')}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold tracking-wider uppercase">
                                Board
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Filters/Search Bar */}
                <div className="flex shrink-0 items-center gap-4 border-b bg-muted/30 p-3 px-6">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search in my tasks..."
                            className="h-9 border-muted-foreground/20 bg-background pl-9 transition-all focus:border-primary"
                            defaultValue={filters.search || ''}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    router.get(
                                        '/my-tasks',
                                        {
                                            search: e.currentTarget.value,
                                            status_id: filters.status_id,
                                            assigned_to: filters.assigned_to,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    );
                                }
                            }}
                        />
                    </div>

                    <Select
                        value={filters.status_id?.toString() || 'all'}
                        onValueChange={(value) => {
                            router.get(
                                '/my-tasks',
                                {
                                    search: filters.search,
                                    status_id:
                                        value === 'all' ? undefined : value,
                                    assigned_to: filters.assigned_to,
                                },
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
                    >
                        <SelectTrigger className="h-9 w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem
                                    key={status.id}
                                    value={status.id.toString()}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-2 w-2 rounded-full"
                                            style={{
                                                backgroundColor: status.color,
                                            }}
                                        />
                                        {status.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {filters.search ||
                    filters.status_id ||
                    filters.assigned_to ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9"
                            onClick={() => {
                                router.get(
                                    '/my-tasks',
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            Clear Filters
                        </Button>
                    ) : null}
                </div>

                {/* Task Content Section */}
                <div className="flex-1 overflow-hidden">
                    {view === 'list' ? (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <main className="h-full overflow-y-auto">
                                <div className="min-w-[800px] pb-20">
                                    {/* Table Header */}
                                    <div className="flex items-center border-b bg-muted/20 px-4 py-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                        <div className="mr-4 min-w-0 flex-1 pl-6">
                                            Title & Space
                                        </div>
                                        <div className="mr-2 flex shrink-0 items-center gap-x-6">
                                            <div className="w-20 text-center">
                                                Priority
                                            </div>
                                            <div className="w-28 pl-4">
                                                Due Date
                                            </div>
                                            <div className="w-32 pl-4">
                                                Status
                                            </div>
                                            <div className="w-8" />
                                        </div>
                                    </div>

                                    {statusGroups.map((group) => (
                                        <div key={group.id} className="mb-2">
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
                                                    {group.tasks.length}
                                                </span>
                                            </div>

                                            <Droppable
                                                droppableId={group.id.toString()}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className={cn(
                                                            'flex min-h-[10px] flex-col transition-colors',
                                                            snapshot.isDraggingOver
                                                                ? 'bg-primary/5'
                                                                : '',
                                                        )}
                                                    >
                                                        {group.tasks.map(
                                                            (
                                                                task: Task,
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
                                                                                    task.space
                                                                                }
                                                                                onEdit={
                                                                                    handleEditTask
                                                                                }
                                                                                showSpace={
                                                                                    true
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ),
                                                        )}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    ))}

                                    {localTasks.length === 0 && (
                                        <div className="py-24 text-center">
                                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/20">
                                                <CheckCircle2 className="h-10 w-10 text-muted-foreground/20" />
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold text-foreground">
                                                You're all caught up!
                                            </h3>
                                            <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                                                No tasks are currently assigned
                                                to you. Enjoy your productivity!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </main>
                        </DragDropContext>
                    ) : (
                        <div className="h-full flex-1 overflow-hidden">
                            <BoardView
                                tasks={localTasks}
                                statuses={statuses}
                                onEditTask={handleEditTask}
                                onCreateTask={handleCreateTask}
                            />
                        </div>
                    )}
                </div>
            </div>

            {selectedSpace && (
                <TaskModal
                    key={selectedTask?.id ?? 'create'}
                    space={selectedSpace}
                    members={selectedSpace.members || []}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTask(null);
                        setSelectedSpace(null);
                    }}
                    task={selectedTask}
                    statuses={selectedSpace.statuses || statuses}
                    sprints={
                        selectedSpace.projects?.flatMap(
                            (p) => p.sprints || [],
                        ) || []
                    }
                />
            )}
        </AppLayout>
    );
}
