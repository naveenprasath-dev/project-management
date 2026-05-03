import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Head, router } from '@inertiajs/react';
import { LayoutGrid, List as ListIcon, CheckCircle2, Search, Filter, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import BoardView from '@/components/tasks/board-view';
import TaskModal from '@/components/tasks/task-modal';
import TaskTableRow from '@/components/tasks/task-table-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface PageProps {
    tasks: {
        data: any[];
        links: any[];
        meta: any;
    };
    statuses: any[];
    spaces: any[];
    filters: any;
}

export default function MyTasks({ tasks, statuses, spaces, filters }: PageProps) {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [selectedSpace, setSelectedSpace] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState<'list' | 'board'>('list');
    const [localTasks, setLocalTasks] = useState<any[]>(tasks.data);

    useEffect(() => {
        setLocalTasks(tasks.data);
    }, [tasks.data]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Work', href: '/my-tasks' },
        { title: 'My Tasks', href: '/my-tasks' },
    ];

    const handleEditTask = (task: any) => {
        setSelectedTask(task);
        setSelectedSpace(task.space || spaces[0] || null);
        setIsModalOpen(true);
    };

    const handleCreateTask = (statusId?: number) => {
        const space = statusId
            ? (spaces.find((s) => s.statuses?.some((st: any) => st.id === statusId)) ?? spaces[0])
            : spaces[0];
        if (!space) return;
        setSelectedTask(null);
        setSelectedSpace(space);
        setIsModalOpen(true);
    };

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
        router.patch(`/spaces/${task.space.slug}/tasks/${taskId}`, {
            status_id: newStatusId
        }, {
            preserveScroll: true,
            onError: () => {
                setLocalTasks(tasks.data);
            }
        });
    };

    const statusGroups = statuses.map(status => ({
        ...status,
        tasks: localTasks.filter(t => t.status_id === status.id)
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Tasks" />

            <div className="flex flex-col h-full bg-background">
                {/* Header */}
                <div className="flex items-center justify-between p-4 px-6 border-b shrink-0 bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20 text-white">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">My Tasks</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Overview</p>
                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{localTasks.length} Tasks</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border shadow-sm">
                        <Button
                            variant={view === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn("h-7 px-3 gap-2", view === 'list' && "bg-background shadow-sm")}
                            onClick={() => setView('list')}
                        >
                            <ListIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">List</span>
                        </Button>
                        <Button
                            variant={view === 'board' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn("h-7 px-3 gap-2", view === 'board' && "bg-background shadow-sm")}
                            onClick={() => setView('board')}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Board</span>
                        </Button>
                    </div>
                </div>

                {/* Filters/Search Bar */}
                <div className="flex items-center gap-4 p-3 px-6 border-b bg-muted/30 shrink-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search in my tasks..."
                            className="pl-9 h-9 bg-background border-muted-foreground/20 focus:border-primary transition-all"
                            defaultValue={filters.search || ''}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    router.get('/my-tasks', {
                                        search: e.currentTarget.value,
                                        status_id: filters.status_id,
                                        assigned_to: filters.assigned_to,
                                    }, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    });
                                }
                            }}
                        />
                    </div>

                    <Select
                        value={filters.status_id?.toString() || 'all'}
                        onValueChange={(value) => {
                            router.get('/my-tasks', {
                                search: filters.search,
                                status_id: value === 'all' ? undefined : value,
                                assigned_to: filters.assigned_to,
                            }, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                    >
                        <SelectTrigger className="h-9 w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status.id} value={status.id.toString()}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                                        {status.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {filters.search || filters.status_id || filters.assigned_to ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9"
                            onClick={() => {
                                router.get('/my-tasks', {}, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
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
                                    <div className="flex items-center px-4 py-2 border-b bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <div className="flex-1 min-w-0 mr-4 pl-6">Title & Space</div>
                                        <div className="flex items-center gap-x-6 shrink-0 mr-2">
                                            <div className="w-20 text-center">Priority</div>
                                            <div className="w-28 pl-4">Due Date</div>
                                            <div className="w-32 pl-4">Status</div>
                                            <div className="w-8" />
                                        </div>
                                    </div>

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
                                                        {group.tasks.map((task: any, index: number) => (
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
                                                                            space={task.space}
                                                                            onEdit={handleEditTask}
                                                                            showSpace={true}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    ))}

                                    {localTasks.length === 0 && (
                                        <div className="py-24 text-center">
                                            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle2 className="w-10 h-10 text-muted-foreground/20" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground mb-2">You're all caught up!</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                No tasks are currently assigned to you. Enjoy your productivity!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </main>
                        </DragDropContext>
                    ) : (
                        <div className="flex-1 overflow-hidden h-full">
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
                    sprints={selectedSpace.projects?.flatMap((p: any) => p.sprints || []) || []}
                />
            )}
        </AppLayout>
    );
}
