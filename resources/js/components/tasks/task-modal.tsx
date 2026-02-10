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
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden flex flex-col max-h-[90vh] bg-background">
                <DialogHeader className="p-8 pb-6 border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                                {task ? (
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Save className="w-5 h-5 text-primary" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <PlusCircle className="w-5 h-5 text-primary" />
                                    </div>
                                )}
                                {task ? 'Task Details' : 'Create New Task'}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground ml-13">
                                {task ? `Objective #${task.id}` : 'Fill in the details for your new task objective.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {task && (
                    <div className="flex px-8 border-b bg-muted/5">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn(
                                "py-4 px-6 text-sm font-semibold transition-all relative",
                                activeTab === 'details' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <ListTodo className="w-4 h-4" />
                                Details
                            </span>
                            {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={cn(
                                "py-4 px-6 text-sm font-semibold transition-all relative",
                                activeTab === 'activity' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Activity History
                            </span>
                            {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-hidden flex">
                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 border-r custom-scrollbar">
                        {activeTab === 'details' || !task ? (
                            <form id="task-form" onSubmit={submit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter task title..."
                                            className={cn("h-12 text-lg font-semibold rounded-xl border-2 transition-all", errors.title ? 'border-destructive' : 'focus:border-primary')}
                                            autoFocus
                                        />
                                        {errors.title && <p className="text-xs text-destructive font-semibold">{errors.title}</p>}
                                    </div>

                                    <div className="grid gap-3">
                                        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Add more context, requirements, or instructions (Markdown supported)..."
                                            rows={12}
                                            className="resize-none rounded-xl border-2 focus:border-primary p-4 leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                {isLoadingActivities ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
                                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                                        <p className="text-sm font-medium">Fetching history...</p>
                                    </div>
                                ) : activities.length === 0 ? (
                                    <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-muted/5">
                                        <History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                                        <p className="text-base font-semibold text-muted-foreground">No activities recorded yet</p>
                                    </div>
                                ) : (
                                    <div className="relative pl-8 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="relative group">
                                                <div className="absolute -left-[37px] top-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110">
                                                    {activity.type === 'created' ? (
                                                        <PlusCircle className="w-2.5 h-2.5 text-primary" />
                                                    ) : activity.type === 'updated' && activity.field === 'status_id' ? (
                                                        <Clock className="w-2.5 h-2.5 text-primary" />
                                                    ) : (
                                                        <History className="w-2.5 h-2.5 text-primary" />
                                                    )}
                                                </div>
                                                <div className="bg-muted/30 rounded-xl p-5 border shadow-sm group-hover:shadow-md transition-all">
                                                    <p className="text-sm font-medium leading-relaxed">
                                                        {getActivityDescription(activity)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <UserIcon className="w-3 h-3 text-primary" />
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

                    {/* Sidebar Area */}
                    <div className="w-80 bg-muted/10 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        <div className="space-y-6">
                            <div className="grid gap-3">
                                <Label htmlFor="status_id" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                                <Select
                                    value={data.status_id ? data.status_id.toString() : ''}
                                    onValueChange={(value) => setData('status_id', value)}
                                >
                                    <SelectTrigger id="status_id" className="w-full h-11 rounded-xl border-2 bg-background">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
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
                                                    <SelectItem key={status.id} value={status.id.toString()} className="rounded-lg">
                                                        <div className="flex items-center gap-2 font-medium">
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

                            <div className="grid gap-3">
                                <Label htmlFor="priority" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Priority</Label>
                                <Select
                                    value={data.priority}
                                    onValueChange={(value) => setData('priority', value)}
                                >
                                    <SelectTrigger className="h-11 rounded-xl border-2 bg-background">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
                                        {['low', 'medium', 'high', 'urgent'].map(p => (
                                            <SelectItem key={p} value={p} className="rounded-lg">
                                                <span className={cn(
                                                    "text-xs font-bold uppercase px-2 py-1 rounded-md",
                                                    p === 'urgent' ? "text-red-700 bg-red-100/50" :
                                                        p === 'high' ? "text-orange-700 bg-orange-100/50" :
                                                            p === 'medium' ? "text-blue-700 bg-blue-100/50" : "text-green-700 bg-green-100/50"
                                                )}>
                                                    {p}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="project_id" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Project</Label>
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
                                    <SelectTrigger id="project_id" className="w-full h-11 rounded-xl border-2 bg-background">
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
                                        <SelectItem value="none">
                                            <span className="text-muted-foreground italic">No Project</span>
                                        </SelectItem>
                                        {space?.projects?.filter((p: any) => !p.is_archived).map((project: any) => (
                                            <SelectItem key={project.id} value={project.id.toString()} className="rounded-lg">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                                                    {project.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assignees</Label>
                                <div className="space-y-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between h-11 rounded-xl border-2 bg-background font-medium hover:bg-muted/50 transition-colors">
                                                <span className="flex items-center gap-2">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                    {data.assignee_ids.length > 0
                                                        ? `${data.assignee_ids.length} Selected`
                                                        : "Select Members"}
                                                </span>
                                                <ChevronDown className="w-4 h-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-64 max-h-[300px] overflow-y-auto rounded-xl shadow-xl">
                                            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-3">Space Members</DropdownMenuLabel>
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
                                                    className="py-3 px-4"
                                                >
                                                    {member.name}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="flex flex-wrap gap-2">
                                        {data.assignee_ids.map(id => {
                                            const member = members.find(m => m.id.toString() === id);
                                            return (
                                                <Badge key={id} variant="secondary" className="pl-1 pr-1.5 py-1 gap-1.5 border-primary/20 bg-primary/5 text-primary rounded-lg text-[10px] font-bold">
                                                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[8px] font-black uppercase">
                                                        {member?.name?.charAt(0) || '?'}
                                                    </div>
                                                    {member?.name || 'Unknown'}
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('assignee_ids', data.assignee_ids.filter(i => i !== id))}
                                                        className="hover:text-destructive transition-colors ml-0.5"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="due_date" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="due_date"
                                        type="date"
                                        className="h-11 pl-12 rounded-xl border-2 bg-background font-medium focus:border-primary transition-all"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                    />
                                </div>
                                {errors.due_date && <p className="text-xs text-destructive font-semibold">{errors.due_date}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 border-t bg-muted/20 backdrop-blur-sm sm:justify-end">
                    <div className="flex gap-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-8 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-muted">Cancel</Button>
                        <Button
                            type="submit"
                            form="task-form"
                            disabled={processing || activeTab === 'activity'}
                            className="h-12 px-10 font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                        >
                            {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {task ? 'Save Changes' : 'Create Task'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
