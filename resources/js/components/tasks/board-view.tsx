import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Plus,
    Calendar,
    Star,
    Bug,
    TrendingUp,
    Search,
    Settings,
    ShieldCheck,
    CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { playMovementSound } from '@/lib/play-movement-sound';
import { cn } from '@/lib/utils';
import type { TaskTypeIcon } from '@/types';

interface Task {
    id: number;
    title: string;
    description?: string;
    type: string;
    priority?: string;
    due_date?: string;
    status_id: number;
    assignees?: { id: number; name: string; avatar?: string }[];
    space?: { slug: string };
    parent?: { id: number; title: string };
}

interface Status {
    id: number;
    name: string;
    color: string;
}

interface BoardViewProps {
    tasks: Task[];
    statuses: Status[];
    space?: { slug: string };
    onEditTask: (task: Task) => void;
    onCreateTask: (statusId?: number) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800',
    medium: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
    high: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800',
    urgent: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
};

const PRIORITY_STRIPE_COLORS: Record<string, string> = {
    low: 'bg-slate-300',
    medium: 'bg-blue-400',
    high: 'bg-orange-400',
    urgent: 'bg-red-500',
};

const TASK_TYPE_ICONS: Record<string, TaskTypeIcon> = {
    feature: { icon: Star, color: 'text-emerald-500' },
    bug: { icon: Bug, color: 'text-rose-500' },
    improvement: { icon: TrendingUp, color: 'text-blue-500' },
    task: { icon: CheckCircle2, color: 'text-slate-500' },
    research: { icon: Search, color: 'text-purple-500' },
    maintenance: { icon: Settings, color: 'text-amber-500' },
    security: { icon: ShieldCheck, color: 'text-red-700' },
};

export default function BoardView({
    tasks,
    statuses,
    space,
    onEditTask,
    onCreateTask,
}: BoardViewProps) {
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

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

        // API call to update status
        router.patch(
            `/spaces/${task.space?.slug || space?.slug}/tasks/${taskId}`,
            {
                status_id: newStatusId,
            },
            {
                preserveScroll: true,
                onError: () => {
                    // Revert on error
                    setLocalTasks(tasks);
                },
            },
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-muted/10">
                <div className="inline-flex h-full min-w-full space-x-6 p-6">
                    {statuses.map((status) => {
                        const statusTasks = localTasks.filter(
                            (t) => t.status_id === status.id,
                        );

                        return (
                            <div
                                key={status.id}
                                className="group/column flex h-full w-[320px] shrink-0 flex-col"
                            >
                                {/* Column Color Strip */}
                                <div
                                    className="mb-3 h-1 rounded-t-full"
                                    style={{ backgroundColor: status.color }}
                                />
                                {/* Column Header */}
                                <div className="mb-4 flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                                            style={{
                                                backgroundColor: status.color,
                                            }}
                                        />
                                        <h3 className="mr-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                            {status.name}
                                        </h3>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground/70">
                                            {statusTasks.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/column:opacity-100">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() =>
                                                onCreateTask(status.id)
                                            }
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Droppable Area */}
                                <Droppable droppableId={status.id.toString()}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={cn(
                                                'scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent flex-1 space-y-3 overflow-y-auto rounded-xl p-1 pb-4 transition-colors',
                                                snapshot.isDraggingOver
                                                    ? 'ring-dashed bg-primary/[0.04] ring-2 ring-primary/20'
                                                    : '',
                                            )}
                                        >
                                            {statusTasks.map((task, index) => (
                                                <Draggable
                                                    key={task.id}
                                                    draggableId={task.id.toString()}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={
                                                                provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() =>
                                                                onEditTask(task)
                                                            }
                                                            className={cn(
                                                                'group/card cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-all active:scale-[0.98]',
                                                                snapshot.isDragging
                                                                    ? 'scale-[1.03] rotate-1 shadow-xl ring-2 ring-primary/40'
                                                                    : 'hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/20',
                                                            )}
                                                            style={{
                                                                ...provided
                                                                    .draggableProps
                                                                    .style,
                                                            }}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    '-mx-4 -mt-4 mb-3 h-0.5 rounded-t-xl',
                                                                    PRIORITY_STRIPE_COLORS[
                                                                        task.priority ||
                                                                            'medium'
                                                                    ],
                                                                )}
                                                            />
                                                            <div className="mb-2 flex items-start justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    {(() => {
                                                                        const typeInfo =
                                                                            TASK_TYPE_ICONS[
                                                                                task
                                                                                    .type
                                                                            ] ||
                                                                            TASK_TYPE_ICONS.task;
                                                                        const Icon =
                                                                            typeInfo.icon;
                                                                        return (
                                                                            <Icon
                                                                                className={cn(
                                                                                    'h-3.5 w-3.5',
                                                                                    typeInfo.color,
                                                                                )}
                                                                            />
                                                                        );
                                                                    })()}
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={cn(
                                                                            'rounded-md border px-2 py-0 text-[10px] font-bold capitalize',
                                                                            PRIORITY_COLORS[
                                                                                task.priority ||
                                                                                    'medium'
                                                                            ],
                                                                        )}
                                                                    >
                                                                        {task.priority ||
                                                                            'medium'}
                                                                    </Badge>
                                                                </div>
                                                                {task.space && (
                                                                    <div className="flex items-center gap-1 text-right">
                                                                        <div
                                                                            className="h-1.5 w-1.5 rounded-full"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    task
                                                                                        .space
                                                                                        .color,
                                                                            }}
                                                                        />
                                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                                                            {
                                                                                task
                                                                                    .space
                                                                                    .name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <h4 className="mb-3 text-sm leading-snug font-bold transition-colors group-hover/card:text-primary">
                                                                {task.title}
                                                            </h4>

                                                            <div className="mt-auto flex items-center justify-between border-t border-muted-foreground/10 pt-3">
                                                                <div className="flex items-center gap-3">
                                                                    {task.due_date && (
                                                                        <div
                                                                            className={cn(
                                                                                'flex items-center gap-1 text-[10px] font-medium',
                                                                                new Date(
                                                                                    task.due_date,
                                                                                ) <
                                                                                    new Date()
                                                                                    ? 'text-destructive'
                                                                                    : 'text-muted-foreground',
                                                                            )}
                                                                        >
                                                                            <Calendar className="h-3 w-3" />
                                                                            {format(
                                                                                new Date(
                                                                                    task.due_date,
                                                                                ),
                                                                                'MMM d',
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex -space-x-1.5 overflow-hidden">
                                                                    {task.assignees
                                                                        ?.slice(
                                                                            0,
                                                                            3,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                assignee,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        assignee.id
                                                                                    }
                                                                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-[8px] font-bold text-primary ring-1 ring-black/5"
                                                                                    title={
                                                                                        assignee.name
                                                                                    }
                                                                                >
                                                                                    {getInitials(
                                                                                        assignee.name,
                                                                                    )}
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    {task.assignees &&
                                                                        task
                                                                            .assignees
                                                                            .length >
                                                                            3 && (
                                                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-card bg-muted text-[8px] font-bold text-muted-foreground ring-1 ring-black/5">
                                                                                +
                                                                                {task
                                                                                    .assignees
                                                                                    .length -
                                                                                    3}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}

                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start rounded-xl border-2 border-dashed border-muted-foreground/10 py-6 text-xs text-muted-foreground hover:bg-muted/50 hover:text-primary"
                                                onClick={() =>
                                                    onCreateTask(status.id)
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" />{' '}
                                                Add Task
                                            </Button>
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DragDropContext>
    );
}
