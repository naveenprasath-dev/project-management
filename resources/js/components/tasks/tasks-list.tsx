import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { List, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import TaskTableRow from '@/components/tasks/task-table-row';

interface Task {
    id: number;
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    status_id: number;
    assignees?: any[];
    [key: string]: any;
}

interface Status {
    id: number;
    name: string;
    color: string;
}

interface TasksListProps {
    tasks: Task[];
    statuses: Status[];
    space: any;
    onEditTask: (task: Task) => void;
    onCreateTask: () => void;
}

interface StatusGroup extends Status {
    tasks: Task[];
}

export default function TasksList({ tasks, statuses, space, onEditTask, onCreateTask }: TasksListProps) {
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const onDragEnd = (result: any) => {
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
        const task = localTasks.find(t => t.id === taskId);

        if (!task || task.status_id === newStatusId) return;

        // Optimistic update
        const updatedTasks = localTasks.map(t =>
            t.id === taskId ? { ...t, status_id: newStatusId } : t
        );
        setLocalTasks(updatedTasks);

        // API call
        router.patch(`/spaces/${space.slug}/tasks/${taskId}`, {
            status_id: newStatusId
        }, {
            preserveScroll: true,
            onError: () => {
                setLocalTasks(tasks);
            }
        });
    };

    // Group tasks by status
    const statusGroups: StatusGroup[] = statuses.map((status) => ({
        ...status,
        tasks: localTasks.filter(t => t.status_id === status.id)
    }));

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="min-w-[800px] pb-20">
                {/* Table Header */}
                <div className="flex items-center px-4 py-2 border-b bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex-1 min-w-0 mr-4 pl-6">Title</div>
                    <div className="flex items-center gap-x-6 shrink-0">
                        <div className="w-20 text-center">Priority</div>
                        <div className="w-28 pl-4">Due Date</div>
                        <div className="w-32 pl-4">Assignee</div>
                        <div className="w-8 h-8" />
                    </div>
                </div>

                {/* Status Groups */}
                {statusGroups.map((group) => (
                    <div key={group.id} className="mb-2">
                        <div className="flex items-center p-2 px-4 group/status cursor-pointer hover:bg-muted/30 transition-colors">
                            <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" />
                            <div
                                className="text-[11px] font-bold px-2 py-0.5 rounded uppercase mr-3 text-white"
                                style={{ backgroundColor: group.color }}
                            >
                                {group.name}
                            </div>
                            <span className="text-xs text-muted-foreground">{group.tasks.length}</span>
                        </div>

                        <Droppable droppableId={group.id.toString()}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={cn(
                                        "flex flex-col transition-colors min-h-[10px]",
                                        snapshot.isDraggingOver ? "bg-primary/5" : ""
                                    )}
                                >
                                    {group.tasks.map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={cn(
                                                        snapshot.isDragging ? "opacity-50 ring-2 ring-primary bg-background shadow-xl rounded-lg z-50" : ""
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
                                        className="flex items-center px-4 py-2 pl-12 text-xs text-muted-foreground hover:text-primary hover:bg-muted/20 transition-all text-left"
                                    >
                                        <Plus className="w-3 h-3 mr-2" /> Add Task
                                    </button>
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed mx-6 mt-6 rounded-xl opacity-50">
                        <List className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                        <h3 className="text-lg font-medium">No tasks in this list</h3>
                        <Button onClick={() => onCreateTask()} variant="outline" className="mt-4">
                            Create a task
                        </Button>
                    </div>
                )}
            </div>
        </DragDropContext>
    );
}
