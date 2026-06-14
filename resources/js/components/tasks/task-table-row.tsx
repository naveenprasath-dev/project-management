import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar,
    User,
    MoreHorizontal,
    ChevronRight,
    MessageSquare,
    GripVertical,
    Star,
    Bug,
    TrendingUp,
    Search,
    Settings,
    ShieldCheck,
    CheckCircle2,
    Archive,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TaskTypeIcon } from '@/types';

interface TaskRow {
    id: number;
    title: string;
    description: string;
    priority: string;
    due_date: string;
    type?: string;
    status?: { id: number; name: string; color: string };
    assignees?: { id: number; name: string; avatar?: string }[];
}

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/50 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300',
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

export default function TaskTableRow({
    task,
    space,
    onEdit,
    showSpace = false,
}: {
    task: TaskRow;
    space?: { slug: string; name?: string; color?: string };
    onEdit: (task: TaskRow) => void;
    showSpace?: boolean;
}) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/spaces/${space.slug}/tasks/${task.id}`);
        }
    };

    const handleArchive = () => {
        if (
            confirm(
                'Archive this task? it will be moved to the archive section.',
            )
        ) {
            router.post(`/spaces/${space.slug}/tasks/${task.id}/archive`);
        }
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
        <div className="group flex items-center border-b border-l-2 border-l-transparent px-4 py-3 transition-all hover:border-l-primary hover:bg-muted/30">
            <div className="mr-2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <div className="mr-4 flex min-w-0 flex-1 items-center pl-1">
                <ChevronRight className="mr-2 h-4 w-4 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-primary" />
                <div className="flex min-w-0 flex-col">
                    {showSpace && space && (
                        <div className="group/space mb-1 flex items-center gap-1.5">
                            <div
                                className="h-1.5 w-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.1)]"
                                style={{
                                    backgroundColor: space.color || '#cbd5e1',
                                }}
                            />
                            <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                                {space.name}
                            </span>
                        </div>
                    )}
                    <div className="flex min-w-0 items-center gap-2">
                        {(() => {
                            const typeInfo =
                                TASK_TYPE_ICONS[task.type] ||
                                TASK_TYPE_ICONS.task;
                            const Icon = typeInfo.icon;
                            return (
                                <Icon
                                    className={`h-3.5 w-3.5 ${typeInfo.color} shrink-0`}
                                />
                            );
                        })()}
                        <span className="truncate text-sm leading-tight font-bold transition-colors group-hover:text-primary">
                            {task.title}
                        </span>
                        {task.description && (
                            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-x-6">
                {/* Priority */}
                <Badge
                    variant="secondary"
                    className={`w-20 justify-center capitalize ${PRIORITY_COLORS[task.priority]}`}
                >
                    {task.priority}
                </Badge>

                {/* Due Date */}
                <div
                    className={`flex w-28 items-center text-xs ${task.due_date && new Date(task.due_date) < new Date() ? 'font-medium text-destructive' : 'text-muted-foreground'}`}
                >
                    <Calendar className="mr-1.5 h-3 w-3" />
                    {task.due_date
                        ? format(new Date(task.due_date), 'MMM d, yyyy')
                        : 'No date'}
                </div>

                {/* Assignees */}
                <div className="flex w-32 min-w-0 items-center">
                    <div className="mr-2 flex -space-x-2">
                        {task.assignees && task.assignees.length > 0 ? (
                            task.assignees.slice(0, 3).map((assignee) => (
                                <div
                                    key={assignee.id}
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-[8px] font-bold text-primary"
                                    title={assignee.name}
                                >
                                    {getInitials(assignee.name)}
                                </div>
                            ))
                        ) : (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted">
                                <User className="h-3 w-3 text-muted-foreground/40" />
                            </div>
                        )}
                        {task.assignees && task.assignees.length > 3 && (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] font-medium">
                                +{task.assignees.length - 3}
                            </div>
                        )}
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                        {task.assignees && task.assignees.length > 0
                            ? task.assignees.length === 1
                                ? task.assignees[0].name
                                : `${task.assignees.length} people`
                            : 'Unassigned'}
                    </span>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                            Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleArchive}>
                            <Archive className="mr-2 h-4 w-4" /> Archive Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={handleDelete}
                        >
                            Delete Task
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
