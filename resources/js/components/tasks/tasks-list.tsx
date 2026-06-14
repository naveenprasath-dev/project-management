import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';
import { List, Plus, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import TaskTableRow from '@/components/tasks/task-table-row';
import { EmptyState } from '@/components/ui/empty-state';
import { playMovementSound } from '@/lib/play-movement-sound';
import { cn } from '@/lib/utils';

interface Task {
    id: number;
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    status_id: number;
    assignees?: { id: number; name: string; avatar?: string }[];
    parent?: { id: number; title: string };
    [key: string]: unknown;
}

interface Status {
    id: number;
    name: string;
    color: string;
}

interface TasksListProps {
    tasks: Task[];
    statuses: Status[];
    space: { slug: string };
    onEditTask: (task: Task) => void;
    onCreateTask: () => void;
}

interface StatusGroup extends Status {
    tasks: Task[];
}

export default function TasksList({
    tasks,
    statuses,
    space,
    onEditTask,
    onCreateTask,
}: TasksListProps) {
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

        // API call
        router.patch(
            `/spaces/${space.slug}/tasks/${taskId}`,
            {
                status_id: newStatusId,
            },
            {
                preserveScroll: true,
                onError: () => {
                    setLocalTasks(tasks);
                },
            },
        );
    };

    // Group tasks by status
    const statusGroups: StatusGroup[] = statuses.map((status) => ({
        ...status,
        tasks: localTasks.filter((t) => t.status_id === status.id),
    }));

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="min-w-[800px] pb-20">
                {/* Table Header */}
                <div className="flex items-center border-b bg-muted/20 px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    <div className="mr-4 min-w-0 flex-1 pl-6">Title</div>
                    <div className="flex shrink-0 items-center gap-x-6">
                        <div className="w-20 text-center">Priority</div>
                        <div className="w-28">Due Date</div>
                        <div className="w-32">Assignee</div>
                        <div className="h-8 w-8" />
                    </div>
                </div>

                {/* Status Groups */}
                {statusGroups.map((group) => (
                    <div key={group.id} className="mb-2">
                        <div
                            className="group/status flex cursor-pointer items-center border-l-3 p-2 px-4 transition-colors hover:bg-muted/30"
                            style={{ borderLeftColor: group.color }}
                        >
                            <ChevronDown className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div
                                className="mr-3 rounded px-2 py-0.5 text-[11px] font-bold text-white uppercase"
                                style={{ backgroundColor: group.color }}
                            >
                                {group.name}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {group.tasks.length}
                            </span>
                        </div>

                        <Droppable droppableId={group.id.toString()}>
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
                                    {group.tasks.map((task, index) => (
                                        <Draggable
                                            key={task.id}
                                            draggableId={task.id.toString()}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={cn(
                                                        snapshot.isDragging
                                                            ? 'z-50 rounded-lg bg-background opacity-50 shadow-xl ring-2 ring-primary'
                                                            : '',
                                                    )}
                                                >
                                                    <TaskTableRow
                                                        task={task}
                                                        space={space}
                                                        onEdit={onEditTask}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    <button
                                        onClick={() => onCreateTask()}
                                        className="flex items-center px-4 py-2 pl-12 text-left text-xs text-muted-foreground transition-all hover:bg-muted/20 hover:text-primary"
                                    >
                                        <Plus className="mr-2 h-3 w-3" /> Add
                                        Task
                                    </button>
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="mx-6 mt-6">
                        <EmptyState
                            icon={List}
                            title="No tasks in this list"
                            description="Get started by creating your first task."
                            action={{
                                label: 'Create a task',
                                onClick: () => onCreateTask(),
                            }}
                        />
                    </div>
                )}
            </div>
        </DragDropContext>
    );
}
