import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Head, router, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    LayoutGrid,
    List,
    Plus,
    ChevronDown,
    Calendar,
    Target,
    ArrowLeft,
    Users,
    Check,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import BoardView from '@/components/tasks/board-view';
import TaskFilterBar from '@/components/tasks/task-filter-bar';
import TaskModal from '@/components/tasks/task-modal';
import TaskTableRow from '@/components/tasks/task-table-row';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { playMovementSound } from '@/lib/play-movement-sound';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, Task, TaskStatus } from '@/types';

interface SprintMember {
    id: number;
    user: { id: number; name: string; email: string };
    role: string;
}

interface SprintData {
    id: number;
    name: string;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    goal?: string | null;
    tasks: Task[];
}

interface SprintSpace {
    id: number;
    name: string;
    slug: string;
    statuses: TaskStatus[];
}

interface SprintProject {
    id: number;
    name: string;
    slug: string;
    members: SprintMember[];
    sprints?: { id: number; name: string }[];
}

interface PageProps {
    space: SprintSpace;
    project: SprintProject;
    sprint: SprintData;
    filters: Record<string, string | undefined>;
    can: {
        manageMembers: boolean;
    };
}

export default function Show({
    space,
    project,
    sprint,
    filters,
}: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [view, setView] = useState<'list' | 'board'>('list');
    const [localTasks, setLocalTasks] = useState<Task[]>(sprint.tasks);
    const [memberViewEnabled, setMemberViewEnabled] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(
        null,
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalTasks(sprint.tasks);
    }, [sprint.tasks]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spaces', href: '/spaces' },
        { title: space.name, href: `/spaces/${space.slug}` },
        {
            title: project.name,
            href: `/spaces/${space.slug}/projects/${project.slug}`,
        },
        {
            title: 'Sprints',
            href: `/spaces/${space.slug}/projects/${project.slug}?tab=sprints`,
        },
        {
            title: sprint.name,
            href: `/spaces/${space.slug}/projects/${project.slug}/sprints/${sprint.id}`,
        },
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
                    setLocalTasks(sprint.tasks);
                },
            },
        );
    };

    const filteredTasks = localTasks.filter(
        (t) =>
            !selectedMemberId ||
            t.assignees?.some((a) => a.id === selectedMemberId),
    );

    const statusGroups = space.statuses.map((status) => ({
        ...status,
        tasks: filteredTasks.filter((t) => t.status_id === status.id),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${sprint.name} - ${project.name}`} />

            <div className="flex h-full overflow-hidden bg-background">
                <div className="flex h-full min-w-0 flex-1 flex-col">
                    {/* Header Section */}
                    <div className="flex shrink-0 items-center justify-between border-b p-4 px-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="mr-2"
                            >
                                <Link
                                    href={`/spaces/${space.slug}/projects/${project.slug}?tab=sprints`}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <div className="mb-1 flex items-center gap-3">
                                    <h1 className="text-xl font-bold tracking-tight">
                                        {sprint.name}
                                    </h1>
                                    <span
                                        className={cn(
                                            'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                                            sprint.status === 'active'
                                                ? 'bg-primary text-primary-foreground'
                                                : sprint.status === 'completed'
                                                  ? 'bg-green-500/10 text-green-600'
                                                  : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {sprint.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {sprint.start_date
                                            ? format(
                                                  new Date(sprint.start_date),
                                                  'MMM d',
                                              )
                                            : 'No start'}
                                        {' - '}
                                        {sprint.end_date
                                            ? format(
                                                  new Date(sprint.end_date),
                                                  'MMM d, yyyy',
                                              )
                                            : 'No end'}
                                    </div>
                                    {sprint.goal && (
                                        <div className="flex items-center gap-1.5">
                                            <Target className="h-3.5 w-3.5" />
                                            {sprint.goal}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={
                                    memberViewEnabled ? 'secondary' : 'ghost'
                                }
                                size="sm"
                                onClick={() => {
                                    setMemberViewEnabled(!memberViewEnabled);
                                    if (memberViewEnabled)
                                        setSelectedMemberId(null);
                                }}
                                className={cn(
                                    'mr-2 gap-2',
                                    memberViewEnabled &&
                                        'border-primary/20 bg-primary/10 text-primary',
                                )}
                            >
                                <Users className="h-4 w-4" />
                                Member View
                            </Button>

                            <div className="mr-2 flex items-center rounded-lg border bg-muted/50 p-1 shadow-sm">
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
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="text-xs font-bold">
                                        Board
                                    </span>
                                </Button>
                            </div>
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
                        <TaskFilterBar
                            space={space}
                            members={
                                project.members.map((m) => m.user) || []
                            }
                            currentFilters={filters || {}}
                            baseUrl={`/spaces/${space.slug}/projects/${project.slug}/sprints/${sprint.id}`}
                            statuses={space.statuses}
                            hideProjectFilter={true}
                        />

                        <div className="flex flex-1 gap-6 overflow-hidden px-6 py-2">
                            {/* Member Sidebar */}
                            {memberViewEnabled && (
                                <div className="flex h-full w-64 shrink-0 flex-col overflow-hidden rounded-xl border bg-card">
                                    <div className="border-b bg-muted/30 p-4">
                                        <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                            Sprint Members
                                        </h3>
                                    </div>
                                    <div className="flex-1 space-y-1 overflow-y-auto p-2">
                                        <button
                                            onClick={() =>
                                                setSelectedMemberId(null)
                                            }
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-all',
                                                selectedMemberId === null
                                                    ? 'bg-primary text-primary-foreground shadow-md'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        'flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold',
                                                        selectedMemberId ===
                                                            null
                                                            ? 'bg-white/20'
                                                            : 'bg-primary/10 text-primary',
                                                    )}
                                                >
                                                    ALL
                                                </div>
                                                <span>All Tasks</span>
                                            </div>
                                            {selectedMemberId === null && (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </button>

                                        {project.members?.map((member) => (
                                            <button
                                                key={member.id}
                                                onClick={() =>
                                                    setSelectedMemberId(
                                                        member.user.id,
                                                    )
                                                }
                                                className={cn(
                                                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-all',
                                                    selectedMemberId ===
                                                        member.user.id
                                                        ? 'bg-primary text-primary-foreground shadow-md'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            'flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold',
                                                            selectedMemberId ===
                                                                member.user.id
                                                                ? 'bg-white/20'
                                                                : 'bg-primary/10 text-primary',
                                                        )}
                                                    >
                                                        {getInitials(
                                                            member.user.name,
                                                        )}
                                                    </div>
                                                    <span className="truncate">
                                                        {member.user.name}
                                                    </span>
                                                </div>
                                                {selectedMemberId ===
                                                    member.user.id && (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex min-w-0 flex-1 flex-col">
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
                                                    (group) => (
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
                                                                                index,
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
                members={project.members.map((m) => m.user) || []}
                project={project}
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                sprints={project.sprints || []} // Pass projects sprints
            />
        </AppLayout>
    );
}
