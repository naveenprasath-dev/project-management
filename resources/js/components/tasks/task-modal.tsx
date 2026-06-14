import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import {
    Pencil,
    Loader2,
    PlusCircle,
    X,
    User as UserIcon,
    ChevronDown,
    Clock,
    History,
    MessageSquare,
    ListTodo,
    Calendar,
    Star,
    Bug,
    TrendingUp,
    Search,
    Settings,
    ShieldCheck,
    CheckCircle2,
    ChevronRight,
    ArrowLeft,
    Archive,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { TaskTypeIcon } from '@/types';

interface TaskMember {
    id: number;
    name: string;
    avatar?: string;
}

interface TaskStatus {
    id: number;
    name: string;
    color: string;
}

interface TaskSprint {
    id: number;
    name: string;
}

interface TaskProject {
    id: number;
    slug: string;
    tasks?: { id: number; title: string; children?: unknown[] }[];
}

interface TaskSpace {
    id: number;
    slug: string;
    statuses?: TaskStatus[];
}

interface TaskRecord {
    id?: number;
    title?: string;
    description?: string;
    type?: string;
    priority?: string;
    due_date?: string;
    status_id?: number;
    sprint_id?: number;
    assignees?: TaskMember[];
    parent?: { id: number; title: string; children?: unknown[] } | null;
    children?: TaskRecord[];
    archived_at?: string | null;
    [key: string]: unknown;
}

interface TaskModalProps {
    space: TaskSpace;
    members: TaskMember[];
    isOpen: boolean;
    onClose: () => void;
    task?: TaskRecord;
    project?: TaskProject;
    statuses?: TaskStatus[];
    sprints?: TaskSprint[];
    onTaskSelect?: (task: TaskRecord) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800',
    medium: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
    high: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800',
    urgent: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
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

export default function TaskModal({
    space,
    members,
    isOpen,
    onClose,
    task,
    project,
    statuses,
    sprints,
    onTaskSelect,
}: TaskModalProps) {
    const defaultStatus =
        (statuses || space?.statuses)?.[0]?.id?.toString() || '';
    const [activeTab, setActiveTab] = useState<'details' | 'activity'>(
        'details',
    );
    const [activities, setActivities] = useState<Record<string, unknown>[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);
    const [comments, setComments] = useState<Record<string, unknown>[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [subTaskTitle, setSubTaskTitle] = useState('');
    const [subTaskPriority, setSubTaskPriority] = useState('medium');
    const [subTaskDueDate, setSubTaskDueDate] = useState('');
    const [subTaskStatusId, setSubTaskStatusId] = useState<string>('');
    const [subTaskAssigneeIds, setSubTaskAssigneeIds] = useState<string[]>([]);
    const [isSubmittingSubTask, setIsSubmittingSubTask] = useState(false);
    const [localSubTasks, setLocalSubTasks] = useState<TaskRecord[]>([]);

    const mentionData = useMemo(
        () => members.map((m) => ({ id: m.id.toString(), display: m.name })),
        [members],
    );

    // Helper function to get the complete parent task object from project.tasks
    const getCompleteParentTask = () => {
        if (!task?.parent || !project?.tasks) return task?.parent;
        // Find the complete parent task from project.tasks to ensure children are loaded
        return (
            project.tasks.find((t) => t.id === task.parent?.id) ||
            task.parent
        );
    };

    const mentionStyles = {
        control: {
            backgroundColor: 'transparent',
            fontSize: 14,
            fontWeight: 'normal',
        },
        '&multiLine': {
            control: {
                fontFamily: 'inherit',
                minHeight: 100,
            },
            highlighter: {
                padding: 12,
                border: '1px solid transparent',
                lineHeight: 1.6,
                fontSize: 14,
                fontFamily: 'inherit',
            },
            input: {
                padding: 12,
                outline: 'none',
                border: 'none',
                lineHeight: 1.6,
                fontSize: 14,
                fontFamily: 'inherit',
            },
        },
        suggestions: {
            list: {
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                fontSize: 14,
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow:
                    '0 4px 24px -4px rgb(0 0 0 / 0.12), 0 2px 8px -2px rgb(0 0 0 / 0.08)',
                zIndex: 1000,
                minWidth: 220,
            },
            item: {
                padding: '6px 8px',
                transition: 'background-color 0.15s ease',
                '&focused': {
                    backgroundColor: 'var(--accent)',
                },
            },
        },
    };

    const renderMentionSuggestion = (
        suggestion: { id: string; display: string },
        _search: string,
        _highlightedDisplay: React.ReactNode,
        _index: number,
        focused: boolean,
    ) => (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '2px 4px',
            }}
        >
            <div
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: focused
                        ? 'var(--primary)'
                        : 'color-mix(in oklch, var(--primary) 10%, transparent)',
                    color: focused
                        ? 'var(--primary-foreground)'
                        : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                }}
            >
                {suggestion.display.charAt(0)}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
                {suggestion.display}
            </span>
        </div>
    );

    const renderFormattedContent = (content: string) => {
        if (!content) return null;

        const parts = content.split(/(@\[[^\]]+\]\([^)]+\))/g);

        return parts.map((part, index) => {
            const match = part.match(/@\[([^\]]+)\]\(([^)]+)\)/);
            if (match) {
                const display = match[1];
                return (
                    <span
                        key={index}
                        className="inline-block rounded-md bg-primary/10 px-1 font-bold text-primary"
                    >
                        @{display}
                    </span>
                );
            }
            return part;
        });
    };

    const TASK_TYPES = [
        {
            id: 'feature',
            name: 'Feature',
            icon: Star,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-50',
        },
        {
            id: 'bug',
            name: 'Bug',
            icon: Bug,
            color: 'text-rose-500',
            bgColor: 'bg-rose-50',
        },
        {
            id: 'improvement',
            name: 'Improvement',
            icon: TrendingUp,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
        },
        {
            id: 'task',
            name: 'Task',
            icon: CheckCircle2,
            color: 'text-slate-500',
            bgColor: 'bg-slate-50',
        },
        {
            id: 'research',
            name: 'Research',
            icon: Search,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
        },
        {
            id: 'maintenance',
            name: 'Maintenance',
            icon: Settings,
            color: 'text-amber-500',
            bgColor: 'bg-amber-50',
        },
        {
            id: 'security',
            name: 'Security',
            icon: ShieldCheck,
            color: 'text-red-700',
            bgColor: 'bg-red-50',
        },
    ];

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        title: '',
        description: '',
        type: 'task',
        status_id: defaultStatus,
        priority: 'medium',
        due_date: '',
        project_id: '',
        assignee_ids: [] as string[],
        sprint_id: '' as string | number,
        space_id: space.id,
    });

    useEffect(() => {
        if (task && task.id) {
            setData({
                title: task.title,
                description: task.description || '',
                type: task.type || 'task',
                status_id: task.status_id.toString(),
                priority: task.priority,
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
                project_id: task.project_id?.toString() || '',
                assignee_ids:
                    task.assignees?.map((u) => u.id.toString()) || [],
                sprint_id: task.sprint_id?.toString() || '',
                space_id: space.id,
            });

            fetchComments();

            // Load sub-tasks: If editing a sub-task, show siblings; otherwise show children
            if (task.parent_id && project?.tasks) {
                // For sub-tasks, find the parent and show its children (siblings of current task)
                const parentTask = project.tasks.find(
                    (t) => t.id === (task.parent_id as number),
                );
                setLocalSubTasks(parentTask?.children || []);
            } else if (project?.tasks) {
                // For main tasks, find the complete task object from project.tasks to ensure children are loaded
                const completeTask = project.tasks.find(
                    (t) => t.id === task.id,
                );
                setLocalSubTasks(completeTask?.children || task.children || []);
            } else {
                // Fallback to task.children if project.tasks is not available
                setLocalSubTasks(task.children || []);
            }
            setSubTaskStatusId(
                (statuses || space?.statuses)?.[0]?.id?.toString() || '',
            );
            setSubTaskAssigneeIds([]);
            setSubTaskTitle('');
        } else if (task) {
            // Pre-filled creation (e.g. from calendar)
            reset();
            setData((prev) => ({
                ...prev,
                ...task,
                space_id: space.id,
                status_id:
                    (statuses || space?.statuses)?.[0]?.id?.toString() || '',
                sprint_id: task.sprint_id?.toString() || '',
            }));
            setActiveTab('details');
        } else {
            // Re-initialize for creation
            reset();
            setActiveTab('details');
            const initialStatuses = statuses || space?.statuses;
            if (initialStatuses?.length > 0) {
                setData((prev) => ({
                    ...prev,
                    status_id: initialStatuses[0].id.toString(),
                    space_id: space.id,
                }));
            } else {
                setData('space_id', space.id);
            }
        }
    }, [task, space.id, space.statuses, statuses, project]);

    const fetchActivities = async () => {
        if (!task) return;
        setIsLoadingActivities(true);
        try {
            const response = await axios.get(
                `/spaces/${space.slug}/tasks/${task.id}/activities`,
            );
            setActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch activities', error);
        } finally {
            setIsLoadingActivities(false);
        }
    };

    const fetchComments = async () => {
        if (!task) return;
        setIsLoadingComments(true);
        try {
            const response = await axios.get(
                `/spaces/${space.slug}/tasks/${task.id}/comments`,
            );
            setComments(response.data);
        } catch (error) {
            console.error('Failed to fetch comments', error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleAddSubTask = async () => {
        if (!subTaskTitle.trim() || isSubmittingSubTask || !task) return;

        setIsSubmittingSubTask(true);
        try {
            const statusId =
                subTaskStatusId ||
                (statuses || space.statuses || [])[0]?.id?.toString() ||
                task.status_id;

            const response = await axios.post(`/spaces/${space.slug}/tasks`, {
                title: subTaskTitle,
                parent_id: task.id,
                space_id: space.id,
                project_id: task.project_id,
                status_id: statusId,
                priority: subTaskPriority,
                due_date: subTaskDueDate || null,
                assignee_ids: subTaskAssigneeIds,
                type: 'task',
            });
            setSubTaskTitle('');
            setSubTaskDueDate('');
            setSubTaskPriority('medium');
            setSubTaskAssigneeIds([]);
            setSubTaskStatusId(
                (statuses || space.statuses || [])[0]?.id?.toString() || '',
            );

            // Add the new sub-task to the local state immediately
            if (response.data) {
                setLocalSubTasks((prev) => [...prev, response.data]);
            }

            // In Inertia v2, reload preserves state/scroll by default
            router.reload({ only: ['tasks'] });
        } catch (error) {
            const err = error as { response?: { data: unknown }; message?: string };
            console.error(
                'Failed to add sub-task',
                err.response?.data || err.message,
            );
        } finally {
            setIsSubmittingSubTask(false);
        }
    };

    const handleAddComment = async () => {
        if (!commentContent.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        try {
            const response = await axios.post(
                `/spaces/${space.slug}/tasks/${task.id}/comments`,
                {
                    content: commentContent,
                },
            );
            setComments((prev) => [response.data, ...prev]);
            setCommentContent('');
        } catch (error) {
            console.error('Failed to add comment', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = task?.id
            ? `/spaces/${space.slug}/tasks/${task.id}`
            : `/spaces/${space.slug}/tasks`;

        const method = task?.id ? patch : post;

        method(url, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleArchive = () => {
        if (
            !task ||
            !confirm(
                'Archive this task? it will be moved to the archive section.',
            )
        )
            return;

        router.post(
            `/spaces/${space.slug}/tasks/${task.id}/archive`,
            {},
            {
                onSuccess: () => {
                    onClose();
                },
            },
        );
    };

    const getActivityDescription = (activity: Record<string, unknown>) => {
        const actUser = (activity.user as { name?: string } | undefined)?.name || 'Someone';

        switch (activity.type) {
            case 'created':
                return `${actUser} created the task`;
            case 'deleted':
                return `${actUser} deleted the task`;
            case 'updated':
                if (activity.field === 'status_id') {
                    const meta = activity.metadata as { old_status?: string; new_status?: string } | undefined;
                    return `${actUser} changed status from "${meta?.old_status || 'Unknown'}" to "${meta?.new_status || 'Unknown'}"`;
                }
                return `${actUser} updated the ${activity.field as string}`;
            default:
                return `${actUser} performed an action`;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden bg-background p-0 shadow-2xl sm:max-w-7xl">
                <DialogHeader
                    className={cn(
                        'border-b bg-gradient-to-b to-transparent p-5 pb-3',
                        task?.parent
                            ? 'border-amber-200/50 from-amber-50/50 dark:border-amber-800/30 dark:from-amber-950/20'
                            : 'from-muted/30',
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                                {task ? (
                                    (() => {
                                        const type =
                                            TASK_TYPES.find(
                                                (t) => t.id === data.type,
                                            ) || TASK_TYPES[3];
                                        return (
                                            <div
                                                className={cn(
                                                    'flex h-8 w-8 items-center justify-center rounded-lg',
                                                    type.bgColor,
                                                )}
                                            >
                                                <type.icon
                                                    className={cn(
                                                        'h-4 w-4',
                                                        type.color,
                                                    )}
                                                />
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <PlusCircle className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                                {task ? (
                                    <div className="flex items-center gap-2">
                                        {task.parent && (
                                            <button
                                                onClick={() =>
                                                    onTaskSelect?.(
                                                        getCompleteParentTask(),
                                                    )
                                                }
                                                className="group mr-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-primary transition-all hover:bg-primary/20"
                                                title="Back to parent task"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                <span className="text-xs font-black tracking-wider uppercase">
                                                    Back
                                                </span>
                                            </button>
                                        )}
                                        <span>
                                            {task.parent
                                                ? 'Sub-Task Details'
                                                : 'Task Details'}
                                        </span>
                                        {task.parent && (
                                            <Badge className="ml-2 border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-700 uppercase">
                                                Sub-Task
                                            </Badge>
                                        )}
                                    </div>
                                ) : (
                                    'Create New Task'
                                )}
                            </DialogTitle>
                            <DialogDescription className="ml-13 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                {task ? (
                                    <>
                                        {task.parent && (
                                            <>
                                                <span className="mr-1 text-xs font-bold text-muted-foreground/70 uppercase">
                                                    Sub-task of:
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        onTaskSelect?.(
                                                            getCompleteParentTask(),
                                                        )
                                                    }
                                                    className="rounded border border-primary/10 bg-primary/5 px-2 py-0.5 font-bold text-primary transition-all hover:bg-primary/10 hover:underline"
                                                >
                                                    {task.parent.title}
                                                </button>
                                                <ChevronRight className="mx-1 h-3.5 w-3.5 text-muted-foreground/50" />
                                            </>
                                        )}
                                        <span className="rounded border border-primary/10 bg-primary/5 px-2 py-0.5 text-primary">
                                            {task.parent
                                                ? 'Sub-task'
                                                : 'Objective'}{' '}
                                            #{task.id}
                                        </span>
                                    </>
                                ) : (
                                    'Fill in the details for your new task objective.'
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {task && (
                    <div className="flex border-b bg-muted/5 px-8">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn(
                                'relative px-5 py-2.5 text-sm font-semibold transition-all',
                                activeTab === 'details'
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <ListTodo className="h-4 w-4" />
                                Details
                            </span>
                            {activeTab === 'details' && (
                                <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full bg-primary" />
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('activity');
                                fetchActivities();
                            }}
                            className={cn(
                                'relative px-5 py-2.5 text-sm font-semibold transition-all',
                                activeTab === 'activity'
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Activity History
                            </span>
                            {activeTab === 'activity' && (
                                <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full bg-primary" />
                            )}
                        </button>
                    </div>
                )}

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Content Area */}
                    <div className="custom-scrollbar flex-1 overflow-y-auto border-r p-6">
                        {activeTab === 'details' || !task ? (
                            <form
                                id="task-form"
                                onSubmit={submit}
                                className="space-y-8"
                            >
                                <div className="space-y-6">
                                    <div className="grid gap-3">
                                        <Label
                                            htmlFor="title"
                                            className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            Title
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            placeholder="Enter task title..."
                                            className={cn(
                                                'h-10 rounded-lg border-2 text-base font-semibold transition-all',
                                                errors.title
                                                    ? 'border-destructive'
                                                    : 'focus:border-primary',
                                            )}
                                            autoFocus
                                        />
                                        {errors.title && (
                                            <p className="text-xs font-semibold text-destructive">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-3">
                                        <Label
                                            htmlFor="description"
                                            className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            Description
                                        </Label>
                                        <div className="relative rounded-xl border-2 bg-background transition-all focus-within:border-primary">
                                            <MentionsInput
                                                id="description"
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        [
                                                            'ArrowUp',
                                                            'ArrowDown',
                                                            'Enter',
                                                            'Tab',
                                                            'Escape',
                                                        ].includes(e.key)
                                                    ) {
                                                        e.stopPropagation();
                                                    }
                                                }}
                                                placeholder="Add more context, requirements, or instructions (Markdown supported)..."
                                                style={mentionStyles}
                                                className="description-mentions"
                                            >
                                                <Mention
                                                    trigger="@"
                                                    markup="@[__display__](__id__)"
                                                    data={mentionData}
                                                    className="bg-primary/20 text-primary"
                                                    displayTransform={(
                                                        id,
                                                        display,
                                                    ) => `@${display}`}
                                                    renderSuggestion={
                                                        renderMentionSuggestion
                                                    }
                                                />
                                            </MentionsInput>
                                        </div>
                                    </div>

                                    {task && (
                                        <div className="space-y-6 border-t pt-8">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5 text-primary" />
                                                <h3 className="text-sm font-bold tracking-wider uppercase">
                                                    Comments
                                                </h3>
                                            </div>

                                            <div className="flex items-start gap-4">
                                                <div className="relative min-h-[100px] flex-1 rounded-xl border-2 bg-background transition-all focus-within:border-primary">
                                                    <MentionsInput
                                                        value={commentContent}
                                                        onChange={(e) =>
                                                            setCommentContent(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                [
                                                                    'ArrowUp',
                                                                    'ArrowDown',
                                                                    'Enter',
                                                                    'Tab',
                                                                    'Escape',
                                                                ].includes(
                                                                    e.key,
                                                                )
                                                            ) {
                                                                e.stopPropagation();
                                                            }
                                                        }}
                                                        placeholder="Write a comment... use @ to tag someone"
                                                        style={mentionStyles}
                                                        className="comment-mentions"
                                                    >
                                                        <Mention
                                                            trigger="@"
                                                            markup="@[__display__](__id__)"
                                                            data={mentionData}
                                                            className="bg-primary/20 text-primary"
                                                            displayTransform={(
                                                                id,
                                                                display,
                                                            ) => `@${display}`}
                                                            renderSuggestion={
                                                                renderMentionSuggestion
                                                            }
                                                        />
                                                    </MentionsInput>
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={handleAddComment}
                                                    disabled={
                                                        isSubmittingComment ||
                                                        !commentContent.trim()
                                                    }
                                                    className="h-12 rounded-xl px-6 shadow-lg"
                                                >
                                                    {isSubmittingComment ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Post'
                                                    )}
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                {isLoadingComments ? (
                                                    <div className="flex justify-center py-8">
                                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                    </div>
                                                ) : comments.length === 0 ? (
                                                    <div className="rounded-xl border border-dashed bg-muted/5 py-10 text-center">
                                                        <p className="text-sm text-muted-foreground">
                                                            No comments yet.
                                                            Start the
                                                            conversation!
                                                        </p>
                                                    </div>
                                                ) : (
                                                    comments.map((comment) => (
                                                        <div
                                                            key={comment.id}
                                                            className="space-y-2 rounded-xl border bg-muted/20 p-4"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                                                                        <UserIcon className="h-3.5 w-3.5 text-primary" />
                                                                    </div>
                                                                    <span className="text-sm font-semibold">
                                                                        {
                                                                            comment
                                                                                .user
                                                                                ?.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-muted-foreground">
                                                                    {formatDistanceToNow(
                                                                        new Date(
                                                                            comment.created_at,
                                                                        ),
                                                                        {
                                                                            addSuffix: true,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                {renderFormattedContent(
                                                                    comment.content,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                {isLoadingActivities ? (
                                    <div className="flex animate-pulse flex-col items-center justify-center py-20 text-muted-foreground">
                                        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
                                        <p className="text-sm font-medium">
                                            Fetching history...
                                        </p>
                                    </div>
                                ) : activities.length === 0 ? (
                                    <div className="rounded-2xl border-2 border-dashed bg-muted/5 py-24 text-center">
                                        <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                                        <p className="text-base font-semibold text-muted-foreground">
                                            No activities recorded yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative space-y-8 pl-8 before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[2px] before:bg-muted">
                                        {activities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="group relative"
                                            >
                                                <div className="absolute top-1 -left-[37px] z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background shadow-sm transition-transform group-hover:scale-110">
                                                    {activity.type ===
                                                    'created' ? (
                                                        <PlusCircle className="h-2.5 w-2.5 text-primary" />
                                                    ) : activity.type ===
                                                          'updated' &&
                                                      activity.field ===
                                                          'status_id' ? (
                                                        <Clock className="h-2.5 w-2.5 text-primary" />
                                                    ) : (
                                                        <History className="h-2.5 w-2.5 text-primary" />
                                                    )}
                                                </div>
                                                <div className="rounded-xl border bg-muted/30 p-5 shadow-sm transition-all group-hover:shadow-md">
                                                    <p className="text-sm leading-relaxed font-medium">
                                                        {getActivityDescription(
                                                            activity,
                                                        )}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                                                            <UserIcon className="h-3 w-3 text-primary" />
                                                        </div>
                                                        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    activity.created_at,
                                                                ),
                                                                {
                                                                    addSuffix: true,
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="custom-scrollbar w-80 space-y-6 overflow-y-auto border-l border-border/60 bg-muted/10 p-5">
                        <div className="space-y-6">
                            <div className="grid gap-3">
                                <Label
                                    htmlFor="type"
                                    className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    Task Type
                                </Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) =>
                                        setData('type', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="type"
                                        className="h-11 w-full rounded-xl border-2 bg-background"
                                    >
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
                                        {TASK_TYPES.map((type) => (
                                            <SelectItem
                                                key={type.id}
                                                value={type.id}
                                                className="rounded-lg"
                                            >
                                                <div className="flex items-center gap-2 font-medium">
                                                    <type.icon
                                                        className={cn(
                                                            'h-4 w-4',
                                                            type.color,
                                                        )}
                                                    />
                                                    {type.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label
                                    htmlFor="status_id"
                                    className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    Status
                                </Label>
                                <Select
                                    value={
                                        data.status_id
                                            ? data.status_id.toString()
                                            : ''
                                    }
                                    onValueChange={(value) =>
                                        setData('status_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="status_id"
                                        className="h-11 w-full rounded-xl border-2 bg-background"
                                    >
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
                                        {(() => {
                                            let availableStatuses: TaskStatus[] = [];

                                            if (
                                                data.project_id &&
                                                project?.id?.toString() ===
                                                    data.project_id &&
                                                statuses
                                            ) {
                                                availableStatuses = statuses;
                                            } else {
                                                const pid = data.project_id;
                                                const pStatuses =
                                                    space?.statuses?.filter(
                                                        (s) =>
                                                            (s as TaskStatus & { project_id?: string }).project_id?.toString() ===
                                                            pid,
                                                    );
                                                const gStatuses =
                                                    space?.statuses?.filter(
                                                        (s) =>
                                                            !(s as TaskStatus & { project_id?: string }).project_id,
                                                    );
                                                availableStatuses =
                                                    (pStatuses?.length ?? 0) > 0
                                                        ? (pStatuses ?? [])
                                                        : (gStatuses ?? []);
                                            }

                                            return availableStatuses?.length >
                                                0 ? (
                                                availableStatuses.map(
                                                    (status) => (
                                                        <SelectItem
                                                            key={status.id}
                                                            value={status.id.toString()}
                                                            className="rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-2 font-medium">
                                                                <div
                                                                    className="h-2 w-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            status.color,
                                                                    }}
                                                                />
                                                                {status.name}
                                                            </div>
                                                        </SelectItem>
                                                    ),
                                                )
                                            ) : (
                                                <div className="p-2 text-center text-xs text-muted-foreground italic">
                                                    No statuses defined
                                                </div>
                                            );
                                        })()}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label
                                    htmlFor="priority"
                                    className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    Priority
                                </Label>
                                <Select
                                    value={data.priority}
                                    onValueChange={(value) =>
                                        setData('priority', value)
                                    }
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-2 bg-background">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
                                        {[
                                            'low',
                                            'medium',
                                            'high',
                                            'urgent',
                                        ].map((p) => (
                                            <SelectItem
                                                key={p}
                                                value={p}
                                                className="rounded-lg"
                                            >
                                                <span
                                                    className={cn(
                                                        'rounded-md px-2 py-1 text-xs font-bold uppercase',
                                                        p === 'urgent'
                                                            ? 'bg-red-100/50 text-red-700'
                                                            : p === 'high'
                                                              ? 'bg-orange-100/50 text-orange-700'
                                                              : p === 'medium'
                                                                ? 'bg-blue-100/50 text-blue-700'
                                                                : 'bg-green-100/50 text-green-700',
                                                    )}
                                                >
                                                    {p}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label
                                    htmlFor="project_id"
                                    className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    Project
                                </Label>
                                <Select
                                    value={data.project_id || 'none'}
                                    onValueChange={(value) => {
                                        const projectId =
                                            value === 'none' ? '' : value;
                                        const projectStatuses =
                                            space?.statuses?.filter(
                                                (s) =>
                                                    (s as TaskStatus & { project_id?: string }).project_id?.toString() ===
                                                    projectId,
                                            );
                                        const globalStatuses =
                                            space?.statuses?.filter(
                                                (s) => !(s as TaskStatus & { project_id?: string }).project_id,
                                            );
                                        const availableStatuses =
                                            projectStatuses?.length > 0
                                                ? projectStatuses
                                                : globalStatuses;

                                        setData((prev) => ({
                                            ...prev,
                                            project_id: projectId,
                                            status_id:
                                                availableStatuses?.[0]?.id.toString() ||
                                                prev.status_id,
                                            sprint_id: '', // Clear sprint when project changes
                                        }));
                                    }}
                                >
                                    <SelectTrigger
                                        id="project_id"
                                        className="h-11 w-full rounded-xl border-2 bg-background"
                                    >
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
                                        <SelectItem value="none">
                                            <span className="text-muted-foreground italic">
                                                No Project
                                            </span>
                                        </SelectItem>
                                        {space?.projects
                                            ?.filter((p) => !(p as { is_archived?: boolean }).is_archived)
                                            .map((project) => (
                                                <SelectItem
                                                    key={project.id}
                                                    value={project.id.toString()}
                                                    className="rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <div
                                                            className="h-2 w-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    project.color,
                                                            }}
                                                        />
                                                        {project.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sprint Selection */}
                            {sprints && sprints.length > 0 && (
                                <div className="grid gap-3">
                                    <Label
                                        htmlFor="sprint_id"
                                        className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                                    >
                                        Sprint
                                    </Label>
                                    <Select
                                        value={
                                            data.sprint_id?.toString() || 'none'
                                        }
                                        onValueChange={(value) =>
                                            setData(
                                                'sprint_id',
                                                value === 'none' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="sprint_id"
                                            className="h-11 w-full rounded-xl border-2 bg-background"
                                        >
                                            <SelectValue placeholder="Select sprint" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-xl">
                                            <SelectItem value="none">
                                                <span className="text-muted-foreground italic">
                                                    No Sprint (Backlog)
                                                </span>
                                            </SelectItem>
                                            {sprints
                                                .filter(
                                                    (s) =>
                                                        s.status !==
                                                        'completed',
                                                )
                                                .map((sprint) => (
                                                    <SelectItem
                                                        key={sprint.id}
                                                        value={sprint.id.toString()}
                                                        className="rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <div
                                                                className={cn(
                                                                    'h-2 w-2 rounded-full',
                                                                    sprint.status ===
                                                                        'active'
                                                                        ? 'bg-primary'
                                                                        : 'bg-muted-foreground',
                                                                )}
                                                            />
                                                            {sprint.name}
                                                            {sprint.status ===
                                                                'active' && (
                                                                <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid gap-3">
                                <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                    Assignees
                                </Label>
                                <div className="space-y-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="h-11 w-full justify-between rounded-xl border-2 bg-background font-medium transition-colors hover:bg-muted/50"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                    {data.assignee_ids.length >
                                                    0
                                                        ? `${data.assignee_ids.length} Selected`
                                                        : 'Select Members'}
                                                </span>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="max-h-[300px] w-64 overflow-y-auto rounded-xl shadow-xl">
                                            <DropdownMenuLabel className="px-4 py-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                                Space Members
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {members.map((member) => (
                                                <DropdownMenuCheckboxItem
                                                    key={member.id}
                                                    checked={data.assignee_ids.includes(
                                                        member.id.toString(),
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        const id =
                                                            member.id.toString();
                                                        if (checked) {
                                                            setData(
                                                                'assignee_ids',
                                                                [
                                                                    ...data.assignee_ids,
                                                                    id,
                                                                ],
                                                            );
                                                        } else {
                                                            setData(
                                                                'assignee_ids',
                                                                data.assignee_ids.filter(
                                                                    (i) =>
                                                                        i !==
                                                                        id,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                    onSelect={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    className="px-4 py-3"
                                                >
                                                    {member.name}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="flex flex-wrap gap-2">
                                        {data.assignee_ids.map((id) => {
                                            const member = members.find(
                                                (m) => m.id.toString() === id,
                                            );
                                            return (
                                                <Badge
                                                    key={id}
                                                    variant="secondary"
                                                    className="gap-1.5 rounded-lg border-primary/20 bg-primary/5 py-1 pr-1.5 pl-1 text-[10px] font-bold text-primary"
                                                >
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[8px] font-black uppercase">
                                                        {member?.name?.charAt(
                                                            0,
                                                        ) || '?'}
                                                    </div>
                                                    {member?.name || 'Unknown'}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'assignee_ids',
                                                                data.assignee_ids.filter(
                                                                    (i) =>
                                                                        i !==
                                                                        id,
                                                                ),
                                                            )
                                                        }
                                                        className="ml-0.5 transition-colors hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label
                                    htmlFor="due_date"
                                    className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    Due Date
                                </Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    className="h-11 rounded-xl border-2 bg-background font-medium transition-all focus:border-primary"
                                    value={data.due_date}
                                    onChange={(e) =>
                                        setData('due_date', e.target.value)
                                    }
                                />
                                {errors.due_date && (
                                    <p className="text-xs font-semibold text-destructive">
                                        {errors.due_date}
                                    </p>
                                )}
                            </div>

                            {/* Sub-tasks Section */}
                            {task && (
                                <div className="space-y-4 border-t pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ListTodo className="h-4 w-4 text-primary" />
                                            <h3 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                                Sub-tasks
                                            </h3>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="h-5 text-[10px] font-bold"
                                        >
                                            {localSubTasks.length}
                                        </Badge>
                                    </div>

                                    <div className="custom-scrollbar max-h-[400px] space-y-2 overflow-y-auto pr-1">
                                        {localSubTasks.map((subtask) => (
                                            <div
                                                key={subtask.id}
                                                onClick={() =>
                                                    onTaskSelect?.(subtask)
                                                }
                                                className="group cursor-pointer space-y-2 rounded-lg border bg-background p-2.5 transition-all hover:border-primary/50 hover:bg-muted/50"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex min-w-0 flex-1 items-start gap-2">
                                                        <div className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-sm bg-muted/20">
                                                            <div
                                                                className="h-1.5 w-1.5 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        subtask
                                                                            .status
                                                                            ?.color,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="line-clamp-2 text-xs leading-tight font-medium">
                                                            {subtask.title}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onTaskSelect?.(
                                                                subtask,
                                                            );
                                                        }}
                                                        className="shrink-0 rounded p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-primary/10"
                                                    >
                                                        <Pencil className="h-3 w-3 text-primary" />
                                                    </button>
                                                </div>
                                                <div className="ml-5 flex flex-wrap items-center gap-2">
                                                    {(() => {
                                                        const typeInfo =
                                                            TASK_TYPE_ICONS[
                                                                subtask.type
                                                            ] ||
                                                            TASK_TYPE_ICONS.task;
                                                        const Icon =
                                                            typeInfo.icon;
                                                        return (
                                                            <Icon
                                                                className={cn(
                                                                    'h-2.5 w-2.5',
                                                                    typeInfo.color,
                                                                )}
                                                            />
                                                        );
                                                    })()}
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'h-3.5 rounded border px-1 py-0 text-[8px] font-bold capitalize',
                                                            PRIORITY_COLORS[
                                                                subtask.priority ||
                                                                    'medium'
                                                            ],
                                                        )}
                                                    >
                                                        {subtask.priority ||
                                                            'medium'}
                                                    </Badge>
                                                    {(subtask.due_date ||
                                                        subtask.due_date_at) && (
                                                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-muted-foreground uppercase">
                                                            <Calendar className="h-2 w-2" />
                                                            {new Date(
                                                                subtask.due_date ||
                                                                    subtask.due_date_at,
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                },
                                                            )}
                                                        </span>
                                                    )}
                                                    {subtask.assignees?.length >
                                                        0 && (
                                                        <div className="flex -space-x-1">
                                                            {subtask.assignees
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        a: TaskMember,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                a.id
                                                                            }
                                                                            title={
                                                                                a.name
                                                                            }
                                                                            className="flex h-4 w-4 items-center justify-center rounded border border-background bg-primary/10 text-[7px] font-black uppercase"
                                                                        >
                                                                            {a.name.charAt(
                                                                                0,
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                )}
                                                            {subtask.assignees
                                                                .length > 2 && (
                                                                <div className="flex h-4 w-4 items-center justify-center rounded border border-background bg-muted text-[7px] font-black">
                                                                    +
                                                                    {subtask
                                                                        .assignees
                                                                        .length -
                                                                        2}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Sub-task Form */}
                                        <div className="space-y-2.5 rounded-lg border border-dashed bg-muted/20 p-2.5 transition-all hover:border-primary/50">
                                            <Input
                                                value={subTaskTitle}
                                                onChange={(e) =>
                                                    setSubTaskTitle(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddSubTask();
                                                    }
                                                }}
                                                placeholder="Add a new sub-task..."
                                                className="h-8 rounded-lg border-none bg-background text-xs shadow-none focus-visible:ring-1 focus-visible:ring-primary/30"
                                            />

                                            <div className="space-y-2">
                                                <Select
                                                    value={subTaskStatusId}
                                                    onValueChange={
                                                        setSubTaskStatusId
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 rounded-lg border-muted bg-background text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <div
                                                                className="h-1.5 w-1.5 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        (
                                                                            statuses ||
                                                                            space?.statuses ||
                                                                            []
                                                                        ).find(
                                                                            (s) =>
                                                                                s.id.toString() ===
                                                                                subTaskStatusId,
                                                                        )
                                                                            ?.color,
                                                                }}
                                                            />
                                                            <SelectValue placeholder="Status" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(
                                                            statuses ||
                                                            space?.statuses ||
                                                            []
                                                        ).map((s) => (
                                                            <SelectItem
                                                                key={s.id}
                                                                value={s.id.toString()}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="h-1.5 w-1.5 rounded-full"
                                                                        style={{
                                                                            backgroundColor:
                                                                                s.color,
                                                                        }}
                                                                    />
                                                                    <span className="text-xs font-medium">
                                                                        {s.name}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={subTaskPriority}
                                                    onValueChange={
                                                        setSubTaskPriority
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 rounded-lg border-muted bg-background text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <div
                                                                className={cn(
                                                                    'h-1.5 w-1.5 rounded-full',
                                                                    subTaskPriority ===
                                                                        'low'
                                                                        ? 'bg-slate-400'
                                                                        : subTaskPriority ===
                                                                            'medium'
                                                                          ? 'bg-blue-400'
                                                                          : subTaskPriority ===
                                                                              'high'
                                                                            ? 'bg-orange-400'
                                                                            : 'bg-red-500',
                                                                )}
                                                            />
                                                            <SelectValue placeholder="Priority" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[
                                                            'low',
                                                            'medium',
                                                            'high',
                                                            'urgent',
                                                        ].map((p) => (
                                                            <SelectItem
                                                                key={p}
                                                                value={p}
                                                            >
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <div
                                                                        className={cn(
                                                                            'h-1.5 w-1.5 rounded-full',
                                                                            p ===
                                                                                'low'
                                                                                ? 'bg-slate-400'
                                                                                : p ===
                                                                                    'medium'
                                                                                  ? 'bg-blue-400'
                                                                                  : p ===
                                                                                      'high'
                                                                                    ? 'bg-orange-400'
                                                                                    : 'bg-red-500',
                                                                        )}
                                                                    />
                                                                    <span className="font-medium capitalize">
                                                                        {p}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <input
                                                    type="date"
                                                    value={subTaskDueDate}
                                                    onChange={(e) =>
                                                        setSubTaskDueDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 w-full rounded-lg border border-muted bg-background px-2 text-xs font-medium transition-all outline-none hover:border-primary/30 focus:border-primary"
                                                />

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <button
                                                            type="button"
                                                            className="flex h-8 w-full items-center justify-between rounded-lg border border-dashed border-muted px-2.5 text-[10px] font-bold text-muted-foreground uppercase transition-all hover:border-primary/50 hover:text-foreground"
                                                        >
                                                            <span className="flex items-center gap-1.5">
                                                                <UserIcon className="h-3 w-3" />
                                                                Assignees
                                                            </span>
                                                            {subTaskAssigneeIds.length >
                                                                0 && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="h-4 px-1 text-[8px]"
                                                                >
                                                                    {
                                                                        subTaskAssigneeIds.length
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48"
                                                    >
                                                        <DropdownMenuLabel className="text-[9px] font-bold tracking-wider uppercase">
                                                            Members
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {members.map(
                                                                (member) => (
                                                                    <DropdownMenuCheckboxItem
                                                                        key={
                                                                            member.id
                                                                        }
                                                                        checked={subTaskAssigneeIds.includes(
                                                                            member.id.toString(),
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) => {
                                                                            if (
                                                                                checked
                                                                            ) {
                                                                                setSubTaskAssigneeIds(
                                                                                    (
                                                                                        prev,
                                                                                    ) => [
                                                                                        ...prev,
                                                                                        member.id.toString(),
                                                                                    ],
                                                                                );
                                                                            } else {
                                                                                setSubTaskAssigneeIds(
                                                                                    (
                                                                                        prev,
                                                                                    ) =>
                                                                                        prev.filter(
                                                                                            (
                                                                                                id,
                                                                                            ) =>
                                                                                                id !==
                                                                                                member.id.toString(),
                                                                                        ),
                                                                                );
                                                                            }
                                                                        }}
                                                                        onSelect={(
                                                                            e,
                                                                        ) =>
                                                                            e.preventDefault()
                                                                        }
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[8px] font-black uppercase">
                                                                                {member.name.charAt(
                                                                                    0,
                                                                                )}
                                                                            </div>
                                                                            <span className="text-xs font-medium">
                                                                                {
                                                                                    member.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </DropdownMenuCheckboxItem>
                                                                ),
                                                            )}
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() =>
                                                    handleAddSubTask()
                                                }
                                                disabled={
                                                    isSubmittingSubTask ||
                                                    !subTaskTitle.trim()
                                                }
                                                className="h-8 w-full rounded-lg text-xs shadow-sm"
                                            >
                                                {isSubmittingSubTask ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                                                        Add Sub-task
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-[between] border-t bg-muted/20 p-8 backdrop-blur-sm">
                    <div className="flex-1">
                        {task && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleArchive}
                                className="h-10 px-4 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive Task
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-10 rounded-lg px-8 font-medium hover:bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="task-form"
                            disabled={processing || activeTab === 'activity'}
                            className="h-10 rounded-lg px-8 font-medium shadow-md shadow-primary/15 transition-all hover:shadow-primary/25 active:scale-95"
                        >
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {task ? 'Save Changes' : 'Create Task'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
