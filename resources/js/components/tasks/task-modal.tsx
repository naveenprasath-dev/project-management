import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Loader2, PlusCircle, Save, X, User as UserIcon, ChevronDown, Clock, History, MessageSquare, ListTodo, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

interface TaskModalProps {
    space: any;
    members: any[];
    isOpen: boolean;
    onClose: () => void;
    task?: any;
    project?: any; // Optional project to pre-fill
    statuses?: any[];
}

export default function TaskModal({ space, members, isOpen, onClose, task, project, statuses }: TaskModalProps) {
    const defaultStatus = (statuses || space?.statuses)?.[0]?.id?.toString() || '';
    const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        title: '',
        description: '',
        status_id: defaultStatus,
        priority: 'medium',
        due_date: '',
        project_id: '',
        assignee_ids: [] as string[],
        space_id: space.id,
    });

    useEffect(() => {
        if (task) {
            setData({
                title: task.title,
                description: task.description || '',
                status_id: task.status_id.toString(),
                priority: task.priority,
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
                project_id: task.project_id?.toString() || '',
                assignee_ids: task.assignees?.map((u: any) => u.id.toString()) || [],
                space_id: space.id,
            });

            if (activeTab === 'activity') {
                fetchActivities();
            }
        } else {
            // Re-initialize for creation
            reset();
            setActiveTab('details');
            const initialStatuses = statuses || space?.statuses;
            if (initialStatuses?.length > 0) {
                setData(prev => ({
                    ...prev,
                    status_id: initialStatuses[0].id.toString(),
                    space_id: space.id
                }));
            } else {
                setData('space_id', space.id);
            }
        }
    }, [task, space.id, space.statuses, statuses, activeTab]);

    const fetchActivities = async () => {
        if (!task) return;
        setIsLoadingActivities(true);
        try {
            const response = await axios.get(`/spaces/${space.slug}/tasks/${task.id}/activities`);
            setActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch activities', error);
        } finally {
            setIsLoadingActivities(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = task
            ? `/spaces/${space.slug}/tasks/${task.id}`
            : `/spaces/${space.slug}/tasks`;

        const method = task ? patch : post;

        method(url, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const getActivityDescription = (activity: any) => {
        const user = activity.user?.name || 'Someone';

        switch (activity.type) {
            case 'created':
                return `${user} created the task`;
            case 'deleted':
                return `${user} deleted the task`;
            case 'updated':
                if (activity.field === 'status_id') {
                    return `${user} changed status from "${activity.metadata?.old_status || 'Unknown'}" to "${activity.metadata?.new_status || 'Unknown'}"`;
                }
                return `${user} updated the ${activity.field}`;
            default:
                return `${user} performed an action`;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-2">
                        {task ? <Save className="w-5 h-5 text-primary" /> : <PlusCircle className="w-5 h-5 text-primary" />}
                        {task ? 'Task Details' : 'Create New Task'}
                    </DialogTitle>
                    <DialogDescription>
                        {task ? `Manage task #${task.id}` : 'Provide details for your task. Subtasks can be added later.'}
                    </DialogDescription>
                </DialogHeader>

                {task && (
                    <div className="flex px-6 mt-4 border-b">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn(
                                "pb-2 px-4 text-sm font-medium transition-colors relative",
                                activeTab === 'details' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <ListTodo className="w-4 h-4" />
                                Details
                            </span>
                            {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={cn(
                                "pb-2 px-4 text-sm font-medium transition-colors relative",
                                activeTab === 'activity' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Activity
                            </span>
                            {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted">
                    {activeTab === 'details' || !task ? (
                        <form id="task-form" onSubmit={submit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Task Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter task title"
                                    className={cn("h-10", errors.title ? 'border-destructive' : '')}
                                    autoFocus
                                />
                                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Markdown Supported)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Add more details..."
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="status_id">Status</Label>
                                    <Select
                                        value={data.status_id ? data.status_id.toString() : ''}
                                        onValueChange={(value) => setData('status_id', value)}
                                    >
                                        <SelectTrigger id="status_id" className="w-full">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(() => {
                                                let availableStatuses: any[] = [];

                                                if (data.project_id && project?.id?.toString() === data.project_id && statuses) {
                                                    availableStatuses = statuses;
                                                } else {
                                                    const pid = data.project_id;
                                                    const pStatuses = space?.statuses?.filter((s: any) => s.project_id?.toString() === pid);
                                                    const gStatuses = space?.statuses?.filter((s: any) => !s.project_id);
                                                    availableStatuses = pStatuses?.length > 0 ? pStatuses : gStatuses;
                                                }

                                                return availableStatuses?.length > 0 ? (
                                                    availableStatuses.map((status: any) => (
                                                        <SelectItem key={status.id} value={status.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                                                                {status.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-xs text-center text-muted-foreground italic">
                                                        No statuses defined
                                                    </div>
                                                );
                                            })()}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={data.priority}
                                        onValueChange={(value) => setData('priority', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="project_id">Project</Label>
                                <Select
                                    value={data.project_id || 'none'}
                                    onValueChange={(value) => {
                                        const projectId = value === 'none' ? '' : value;
                                        const projectStatuses = space?.statuses?.filter((s: any) => s.project_id?.toString() === projectId);
                                        const globalStatuses = space?.statuses?.filter((s: any) => !s.project_id);
                                        const availableStatuses = projectStatuses?.length > 0 ? projectStatuses : globalStatuses;

                                        setData(prev => ({
                                            ...prev,
                                            project_id: projectId,
                                            status_id: availableStatuses?.[0]?.id.toString() || prev.status_id
                                        }));
                                    }}
                                >
                                    <SelectTrigger id="project_id" className="w-full">
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            <span className="text-muted-foreground italic">No Project</span>
                                        </SelectItem>
                                        {space?.projects?.filter((p: any) => !p.is_archived).map((project: any) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                                                    {project.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>Assignees</Label>
                                    <div className="flex flex-wrap gap-2 mb-1 min-h-[1.5rem]">
                                        {data.assignee_ids.map(id => {
                                            const member = members.find(m => m.id.toString() === id);
                                            return (
                                                <Badge key={id} variant="secondary" className="pl-1 pr-1.5 py-0.5 gap-1 border-primary/20 bg-primary/5 text-primary">
                                                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <UserIcon className="w-2.5 h-2.5 text-primary" />
                                                    </div>
                                                    {member?.name || 'Unknown'}
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('assignee_ids', data.assignee_ids.filter(i => i !== id))}
                                                        className="hover:text-destructive transition-colors ml-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                        {data.assignee_ids.length === 0 && (
                                            <p className="text-[10px] text-muted-foreground italic">No one assigned</p>
                                        )}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between h-9 font-normal">
                                                <span className="flex items-center gap-2">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                    {data.assignee_ids.length > 0
                                                        ? `${data.assignee_ids.length} selected`
                                                        : "Select members..."}
                                                </span>
                                                <ChevronDown className="w-4 h-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                                            <DropdownMenuLabel>Space Members</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {members.map((member) => (
                                                <DropdownMenuCheckboxItem
                                                    key={member.id}
                                                    checked={data.assignee_ids.includes(member.id.toString())}
                                                    onCheckedChange={(checked) => {
                                                        const id = member.id.toString();
                                                        if (checked) {
                                                            setData('assignee_ids', [...data.assignee_ids, id]);
                                                        } else {
                                                            setData('assignee_ids', data.assignee_ids.filter(i => i !== id));
                                                        }
                                                    }}
                                                    onSelect={(e) => e.preventDefault()}
                                                >
                                                    {member.name}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            id="due_date"
                                            type="date"
                                            className="pl-10"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                        />
                                    </div>
                                    {errors.due_date && <p className="text-xs text-destructive">{errors.due_date}</p>}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {isLoadingActivities ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                    <p className="text-sm">Loading activity history...</p>
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-center py-12 bg-muted/20 border border-dashed rounded-xl">
                                    <History className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                                    <p className="text-sm text-muted-foreground">No activities recorded yet.</p>
                                </div>
                            ) : (
                                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="relative">
                                            <div className="absolute -left-[30px] top-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 shadow-sm">
                                                {activity.type === 'created' ? (
                                                    <PlusCircle className="w-2.5 h-2.5 text-primary" />
                                                ) : activity.type === 'updated' && activity.field === 'status_id' ? (
                                                    <Clock className="w-2.5 h-2.5 text-primary" />
                                                ) : (
                                                    <History className="w-2.5 h-2.5 text-primary" />
                                                )}
                                            </div>
                                            <div className="bg-muted/30 rounded-lg p-3 border">
                                                <p className="text-sm">
                                                    {getActivityDescription(activity)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <UserIcon className="w-2.5 h-2.5 text-primary" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
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

                <DialogFooter className="p-6 pt-2 border-t bg-muted/30">
                    <Button type="button" variant="ghost" onClick={onClose} className="h-10">Cancel</Button>
                    <Button
                        type="submit"
                        form="task-form"
                        disabled={processing || activeTab === 'activity'}
                        className="h-10 px-6 shadow-lg shadow-primary/20"
                    >
                        {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {task ? 'Save Changes' : 'Create Task'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
