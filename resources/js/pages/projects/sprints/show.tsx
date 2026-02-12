import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Head, router, Link } from '@inertiajs/react';
import { LayoutGrid, List, MessageCircle, Plus, CheckCircle2, ListTodo, ChevronDown, Calendar, Target, Clock, ArrowLeft, Users, Check } from 'lucide-react';
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
import type { BreadcrumbItem } from '@/types';
import { format } from 'date-fns';

interface PageProps {
    space: any;
    project: any;
    sprint: any;
    filters: any;
    can: {
        manageMembers: boolean;
    };
}

export default function Show({ space, project, sprint, filters, can }: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [view, setView] = useState<'list' | 'board'>('list');
    const [localTasks, setLocalTasks] = useState<any[]>(sprint.tasks);
    const [memberViewEnabled, setMemberViewEnabled] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

    useEffect(() => {
        setLocalTasks(sprint.tasks);
    }, [sprint.tasks]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
        { title: project.name, href: `/spaces/${space.slug}/projects/${project.slug}` },
        { title: 'Sprints', href: `/spaces/${space.slug}/projects/${project.slug}?tab=sprints` },
        { title: sprint.name, href: `/spaces/${space.slug}/projects/${project.slug}/sprints/${sprint.id}` },
    ];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

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
        playMovementSound();

        // API call
        router.patch(`/spaces/${space.slug}/tasks/${taskId}`, {
            status_id: newStatusId
        }, {
            preserveScroll: true,
            onError: () => {
                setLocalTasks(sprint.tasks);
            }
        });
    };

    const filteredTasks = localTasks.filter(t =>
        !selectedMemberId || t.assignees?.some((a: any) => a.id === selectedMemberId)
    );

    const statusGroups = space.statuses.map((status: any) => ({
        ...status,
        tasks: filteredTasks.filter((t: any) => t.status_id === status.id)
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${sprint.name} - ${project.name}`} />

            <div className="flex h-full overflow-hidden bg-background">
                <div className="flex flex-col flex-1 min-w-0 h-full">
                    {/* Header Section */}
                    <div className="flex items-center justify-between p-4 px-6 border-b shrink-0">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild className="mr-2">
                                <Link href={`/spaces/${space.slug}/projects/${project.slug}?tab=sprints`}>
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </Button>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-xl font-bold tracking-tight">{sprint.name}</h1>
                                    <span className={cn(
                                        "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase",
                                        sprint.status === 'active' ? "bg-primary text-primary-foreground" :
                                            sprint.status === 'completed' ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                                    )}>
                                        {sprint.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {sprint.start_date ? format(new Date(sprint.start_date), 'MMM d') : 'No start'}
                                        {' - '}
                                        {sprint.end_date ? format(new Date(sprint.end_date), 'MMM d, yyyy') : 'No end'}
                                    </div>
                                    {sprint.goal && (
                                        <div className="flex items-center gap-1.5">
                                            <Target className="w-3.5 h-3.5" />
                                            {sprint.goal}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={memberViewEnabled ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => {
                                    setMemberViewEnabled(!memberViewEnabled);
                                    if (memberViewEnabled) setSelectedMemberId(null);
                                }}
                                className={cn("gap-2 mr-2", memberViewEnabled && "bg-primary/10 text-primary border-primary/20")}
                            >
                                <Users className="w-4 h-4" />
                                Member View
                            </Button>

                            <div className="flex items-center bg-muted/50 p-1 rounded-lg border shadow-sm mr-2">
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
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="text-xs font-bold">Board</span>
                                </Button>
                            </div>
                            <Button onClick={() => handleCreateTask()} size="sm">
                                <Plus className="w-4 h-4 mr-2" /> New Task
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <TaskFilterBar
                            space={space}
                            members={project.members.map((m: any) => m.user) || []}
                            currentFilters={filters || {}}
                            baseUrl={`/spaces/${space.slug}/projects/${project.slug}/sprints/${sprint.id}`}
                            statuses={space.statuses}
                            hideProjectFilter={true}
                        />

                        <div className="flex-1 flex overflow-hidden gap-6 px-6 py-2">
                            {/* Member Sidebar */}
                            {memberViewEnabled && (
                                <div className="w-64 flex flex-col border rounded-xl bg-card overflow-hidden shrink-0 h-full">
                                    <div className="p-4 border-b bg-muted/30">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sprint Members</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                        <button
                                            onClick={() => setSelectedMemberId(null)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                                                selectedMemberId === null
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px]",
                                                    selectedMemberId === null ? "bg-white/20" : "bg-primary/10 text-primary"
                                                )}>
                                                    ALL
                                                </div>
                                                <span>All Tasks</span>
                                            </div>
                                            {selectedMemberId === null && <Check className="w-4 h-4" />}
                                        </button>

                                        {project.members?.map((member: any) => (
                                            <button
                                                key={member.id}
                                                onClick={() => setSelectedMemberId(member.user.id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                                                    selectedMemberId === member.user.id
                                                        ? "bg-primary text-primary-foreground shadow-md"
                                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px]",
                                                        selectedMemberId === member.user.id ? "bg-white/20" : "bg-primary/10 text-primary"
                                                    )}>
                                                        {getInitials(member.user.name)}
                                                    </div>
                                                    <span className="truncate">{member.user.name}</span>
                                                </div>
                                                {selectedMemberId === member.user.id && <Check className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 flex flex-col min-w-0">
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
                                                {statusGroups.map((group: any) => (
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
                                            </div>
                                        </main>
                                    </DragDropContext>
                                ) : (
                                    <BoardView
                                        tasks={filteredTasks}
                                        statuses={space.statuses}
                                        onEditTask={handleEditTask}
                                        onCreateTask={() => handleCreateTask()}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TaskModal
                space={space}
                members={project.members.map((m: any) => m.user) || []}
                project={project}
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                sprints={project.sprints || []} // Pass projects sprints
            />
        </AppLayout>
    );
}
