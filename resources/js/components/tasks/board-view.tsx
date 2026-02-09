import { useState, useEffect } from 'react';
import { MoreHorizontal, Plus, Calendar, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';

interface Task {
    id: number;
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    status_id: number;
    assignees?: any[];
    space?: any;
}

interface Status {
    id: number;
    name: string;
    color: string;
}

interface BoardViewProps {
    tasks: Task[];
    statuses: Status[];
    space?: any;
    onEditTask: (task: Task) => void;
    onCreateTask: (statusId?: number) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-50 text-slate-600 border-slate-100',
    medium: 'bg-blue-50 text-blue-600 border-blue-100',
    high: 'bg-orange-50 text-orange-600 border-orange-100',
    urgent: 'bg-red-50 text-red-600 border-red-100',
};

export default function BoardView({ tasks, statuses, space, onEditTask, onCreateTask }: BoardViewProps) {
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

        // API call to update status
        router.patch(`/spaces/${task.space?.slug || space?.slug}/tasks/${taskId}`, {
            status_id: newStatusId
        }, {
            preserveScroll: true,
            onError: () => {
                // Revert on error
                setLocalTasks(tasks);
            }
        });
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
                <div className="inline-flex h-full p-6 space-x-6 min-w-full">
                    {statuses.map((status) => {
                        const statusTasks = localTasks.filter(t => t.status_id === status.id);

                        return (
                            <div key={status.id} className="flex flex-col w-[320px] shrink-0 h-full group/column">
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                                            style={{ backgroundColor: status.color }}
                                        />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mr-2">
                                            {status.name}
                                        </h3>
                                        <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground/70">
                                            {statusTasks.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/column:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCreateTask(status.id)}>
                                            <Plus className="w-4 h-4" />
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
                                                "flex-1 overflow-y-auto space-y-3 pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent transition-colors p-1 rounded-xl",
                                                snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/20 ring-inset" : ""
                                            )}
                                        >
                                            {statusTasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => onEditTask(task)}
                                                            className={cn(
                                                                "bg-card p-4 rounded-xl border shadow-sm transition-all cursor-pointer group/card active:scale-[0.98]",
                                                                snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/50 rotate-[2deg] scale-[1.02]" : "hover:ring-2 hover:ring-primary/20"
                                                            )}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                            }}
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <Badge variant="outline" className={cn(
                                                                    "capitalize text-[10px] px-2 py-0 font-bold border rounded-md",
                                                                    PRIORITY_COLORS[task.priority || 'medium']
                                                                )}>
                                                                    {task.priority || 'medium'}
                                                                </Badge>
                                                                {task.space && (
                                                                    <div className="flex items-center gap-1 text-right">
                                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.space.color }} />
                                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{task.space.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <h4 className="text-sm font-bold mb-3 leading-snug group-hover/card:text-primary transition-colors">
                                                                {task.title}
                                                            </h4>

                                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-muted-foreground/10">
                                                                <div className="flex items-center gap-3">
                                                                    {task.due_date && (
                                                                        <div className={cn(
                                                                            "flex items-center gap-1 text-[10px] font-medium",
                                                                            new Date(task.due_date) < new Date() ? "text-destructive" : "text-muted-foreground"
                                                                        )}>
                                                                            <Calendar className="w-3 h-3" />
                                                                            {format(new Date(task.due_date), 'MMM d')}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex -space-x-1.5 overflow-hidden">
                                                                    {task.assignees?.slice(0, 3).map((assignee) => (
                                                                        <div
                                                                            key={assignee.id}
                                                                            className="w-6 h-6 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center shrink-0 ring-1 ring-black/5 text-[8px] font-bold text-primary"
                                                                            title={assignee.name}
                                                                        >
                                                                            {getInitials(assignee.name)}
                                                                        </div>
                                                                    ))}
                                                                    {task.assignees && task.assignees.length > 3 && (
                                                                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center shrink-0 ring-1 ring-black/5 text-[8px] font-bold text-muted-foreground">
                                                                            +{task.assignees.length - 3}
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
                                                className="w-full justify-start text-xs text-muted-foreground hover:text-primary hover:bg-muted/50 py-6 border-2 border-dashed border-muted-foreground/10 rounded-xl"
                                                onClick={() => onCreateTask(status.id)}
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> Add Task
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
