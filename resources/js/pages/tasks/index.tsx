import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, ChevronDown, List, MessageCircle, X, CheckCircle2, ListTodo, FolderPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskFilterBar from '@/components/tasks/task-filter-bar';
import TaskTableRow from '@/components/tasks/task-table-row';
import TaskModal from '@/components/tasks/task-modal';
import ChatWindow from '@/components/chat/chat-window';
import BoardView from '@/components/tasks/board-view';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface PageProps {
    space: any;
    tasks: {
        data: any[];
        links: any[];
    };
    filters: any;
    members: any[];
}

interface StatusGroup {
    id: number;
    name: string;
    color: string;
    tasks: any[];
}

export default function Index({ space, tasks, filters, members }: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [view, setView] = useState<'overview' | 'list' | 'board'>('overview');
    const [localTasks, setLocalTasks] = useState<any[]>(tasks.data);

    useEffect(() => {
        setLocalTasks(tasks.data);
    }, [tasks.data]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
        { title: 'Tasks', href: `/spaces/${space.slug}/tasks` },
    ];

    const handleCreateTask = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: any) => {
        setSelectedTask(task);
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
        router.patch(`/spaces/${space.slug}/tasks/${taskId}`, {
            status_id: newStatusId
        }, {
            preserveScroll: true,
            onError: () => {
                setLocalTasks(tasks.data);
            }
        });
    };

    // Group tasks by status for the ClickUp look
    const statusGroups: StatusGroup[] = space.statuses.map((status: any) => ({
        ...status,
        tasks: localTasks.filter((t: any) => t.status_id === status.id)
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${space.name} - Tasks`} />

            <div className="flex h-full overflow-hidden bg-background">
                <div className="flex flex-col flex-1 min-w-0 h-full">
                    {/* Header Section */}
                    <div className="flex items-center justify-between p-4 px-6 border-b">
                        <div className="flex items-center gap-x-4">
                            <div className="flex items-center bg-muted/50 p-1 rounded-lg border shadow-sm">
                                <Button
                                    variant={view === 'overview' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn("h-7 px-3 gap-2", view === 'overview' && "bg-background shadow-sm")}
                                    onClick={() => setView('overview')}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="text-xs font-bold">Overview</span>
                                </Button>
                                <Button
                                    variant={view === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn("h-7 px-3 gap-2", view === 'list' && "bg-background shadow-sm")}
                                    onClick={() => setView('list')}
                                >
                                    <List className="w-4 h-4" />
                                    <span className="text-xs font-bold">List</span>
                                </Button>
                                <Button
                                    variant={view === 'board' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn("h-7 px-3 gap-2", view === 'board' && "bg-background shadow-sm")}
                                    onClick={() => setView('board')}
                                >
                                    <List className="w-4 h-4 rotate-90" />
                                    <span className="text-xs font-bold">Board</span>
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isChatOpen ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setIsChatOpen(!isChatOpen)}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Chat
                            </Button>
                            <Button onClick={() => handleCreateTask()} size="sm">
                                <Plus className="w-4 h-4 mr-2" /> New Task
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {view === 'overview' ? (
                            <main className="flex-1 p-6 overflow-y-auto space-y-10">
                                {/* Analytics Hero Section */}
                                {space.analytics && (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="p-6 rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent flex flex-col justify-between h-32 border-primary/20">
                                            <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Space Progress
                                            </div>
                                            <div className="flex items-end justify-between mt-auto">
                                                <span className="text-3xl font-black">{space.analytics.completion_rate}%</span>
                                                <div className="w-16 h-1 w-full max-w-[100px] bg-muted rounded-full overflow-hidden ml-4 mb-2">
                                                    <div className="h-full bg-primary" style={{ width: `${space.analytics.completion_rate}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl border bg-card flex flex-col justify-between h-32 text-card-foreground">
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <ListTodo className="w-4 h-4" /> Total Tasks
                                            </div>
                                            <div className="text-3xl font-black mt-auto">{space.analytics.total_tasks}</div>
                                        </div>
                                        <div className="p-6 rounded-2xl border bg-card flex flex-col justify-between h-32 text-card-foreground">
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <FolderPlus className="w-4 h-4" /> Projects
                                            </div>
                                            <div className="text-3xl font-black mt-auto">{space.analytics.total_projects}</div>
                                        </div>
                                        <div className="p-6 rounded-2xl border bg-card flex flex-col justify-between h-32 text-card-foreground">
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Team Members
                                            </div>
                                            <div className="text-3xl font-black mt-auto">{space.analytics.total_members}</div>
                                        </div>
                                    </div>
                                )}

                                {space.projects && space.projects.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-black flex items-center gap-4">
                                                <span className="w-1 h-6 bg-primary rounded-full" />
                                                Projects Analytics
                                            </h2>
                                            <Button variant="outline" size="sm" onClick={() => setView('list')} className="font-bold border-primary text-primary hover:bg-primary/5">
                                                View Overall Tasks <ChevronDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
                                            </Button>
                                        </div>
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {space.projects.map((project: any) => {
                                                const completionPercentage = project.tasks_count > 0
                                                    ? Math.round((project.completed_tasks_count / project.tasks_count) * 100)
                                                    : 0;

                                                return (
                                                    <div key={project.id} className="p-6 rounded-2xl border bg-card flex flex-col h-64 group relative overflow-hidden transition-all hover:shadow-xl hover:border-primary/50">
                                                        <div className="flex items-start justify-between mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shrink-0"
                                                                    style={{ backgroundColor: project.color }}
                                                                >
                                                                    <FolderPlus className="w-6 h-6" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h3 className="font-bold text-lg truncate leading-tight">{project.name}</h3>
                                                                    <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1.5 font-medium">
                                                                        <span className="flex items-center">
                                                                            <Users className="w-3.5 h-3.5 mr-1 text-primary/60" />
                                                                            {project.members_count}
                                                                        </span>
                                                                        <span className="flex items-center">
                                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-primary/60" />
                                                                            {project.tasks_count}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto space-y-4 pt-4 border-t border-muted">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center justify-between text-xs font-bold">
                                                                    <span className="text-muted-foreground uppercase tracking-wider">Progress</span>
                                                                    <span className="text-primary">{completionPercentage}%</span>
                                                                </div>
                                                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary transition-all duration-700"
                                                                        style={{ width: `${completionPercentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {project.status_summary && project.status_summary.length > 0 && (
                                                                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-muted/30">
                                                                    {project.status_summary.map((summary: any) => (
                                                                        <div
                                                                            key={summary.status_id}
                                                                            className="h-full"
                                                                            style={{
                                                                                backgroundColor: summary.status?.color || '#ccc',
                                                                                width: `${(summary.count / project.tasks_count) * 100}%`,
                                                                                minWidth: '4px'
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <Button variant="ghost" size="sm" className="w-full h-8 text-xs font-bold mt-2" asChild>
                                                                <Link href={`/spaces/${space.slug}/projects/${project.slug}`}>
                                                                    Open Project <ChevronDown className="w-3 h-3 ml-1 rotate-[-90deg]" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </main>
                        ) : (
                            <div className="flex flex-col flex-1 min-h-0">
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
                                                {statusGroups.map((group: StatusGroup) => (
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
                                                                                        space={space}
                                                                                        onEdit={handleEditTask}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {provided.placeholder}

                                                                    <button
                                                                        onClick={() => handleCreateTask()}
                                                                        className="flex items-center px-4 py-2 pl-12 text-xs text-muted-foreground hover:text-primary hover:bg-muted/20 transition-all text-left"
                                                                    >
                                                                        <Plus className="w-3 h-3 mr-2" /> Add Task
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </div>
                                                ))}

                                                {tasks.data.length === 0 && (
                                                    <div className="py-20 text-center border-2 border-dashed mx-6 mt-6 rounded-xl opacity-50">
                                                        <List className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                                                        <h3 className="text-lg font-medium">No tasks match your filters</h3>
                                                        <p className="text-sm text-muted-foreground">Adjust your search or create a new task to get started.</p>
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
                                        onCreateTask={(statusId) => handleCreateTask()}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Section */}
                {isChatOpen && (
                    <ChatWindow
                        spaceId={space.id}
                        members={members}
                    />
                )}
            </div>

            <TaskModal
                space={space}
                members={members}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
            />
        </AppLayout>
    );
}
