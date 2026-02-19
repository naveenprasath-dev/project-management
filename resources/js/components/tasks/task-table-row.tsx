import { Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, User, MoreHorizontal, ChevronRight, MessageSquare, GripVertical, Star, Bug, TrendingUp, Search, Settings, ShieldCheck, CheckCircle2, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Task {
    id: number;
    title: string;
    description: string;
    priority: string;
    due_date: string;
    status: any;
    assignee: any;
    assignees?: any[];
}

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/50 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300',
};

const TASK_TYPE_ICONS: Record<string, any> = {
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
    showSpace = false
}: {
    task: any;
    space?: any;
    onEdit: (task: any) => void;
    showSpace?: boolean;
}) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/spaces/${space.slug}/tasks/${task.id}`);
        }
    };

    const handleArchive = () => {
        if (confirm('Archive this task? it will be moved to the archive section.')) {
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
        <div className="group flex items-center px-4 py-3 border-b border-l-2 border-l-transparent hover:border-l-primary hover:bg-muted/30 transition-all">
            <div className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4 text-muted-foreground/40" />
            </div>
            <div className="flex items-center flex-1 min-w-0 mr-4 pl-1">
                <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                <div className="flex flex-col min-w-0">
                    {showSpace && space && (
                        <div className="flex items-center gap-1.5 mb-1 group/space">
                            <div
                                className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.1)]"
                                style={{ backgroundColor: space.color || '#cbd5e1' }}
                            />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                {space.name}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 min-w-0">
                        {(() => {
                            const typeInfo = TASK_TYPE_ICONS[task.type] || TASK_TYPE_ICONS.task;
                            const Icon = typeInfo.icon;
                            return <Icon className={`w-3.5 h-3.5 ${typeInfo.color} shrink-0`} />;
                        })()}
                        <span className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors">
                            {task.title}
                        </span>
                        {task.description && <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-x-6 shrink-0">
                {/* Priority */}
                <Badge variant="secondary" className={`capitalize w-20 justify-center ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                </Badge>

                {/* Due Date */}
                <div className={`flex items-center text-xs w-28 ${task.due_date && new Date(task.due_date) < new Date() ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No date'}
                </div>

                {/* Assignees */}
                <div className="flex items-center w-32 min-w-0">
                    <div className="flex -space-x-2 mr-2">
                        {task.assignees && task.assignees.length > 0 ? (
                            task.assignees.slice(0, 3).map((assignee: any) => (
                                <div
                                    key={assignee.id}
                                    className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center shrink-0 text-[8px] font-bold text-primary"
                                    title={assignee.name}
                                >
                                    {getInitials(assignee.name)}
                                </div>
                            ))
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center shrink-0">
                                <User className="w-3 h-3 text-muted-foreground/40" />
                            </div>
                        )}
                        {task.assignees && task.assignees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center shrink-0 text-[8px] font-medium">
                                +{task.assignees.length - 3}
                            </div>
                        )}
                    </div>
                    <span className="text-xs truncate text-muted-foreground">
                        {task.assignees && task.assignees.length > 0
                            ? (task.assignees.length === 1 ? task.assignees[0].name : `${task.assignees.length} people`)
                            : 'Unassigned'}
                    </span>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}>Edit Task</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleArchive}>
                            <Archive className="w-4 h-4 mr-2" /> Archive Task
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>Delete Task</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
