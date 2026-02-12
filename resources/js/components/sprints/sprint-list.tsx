import { router, useForm, Link } from '@inertiajs/react';
import {
    Calendar,
    ChevronRight,
    MoreHorizontal,
    Play,
    CheckCircle2,
    Trash2,
    Plus,
    Clock,
    Target
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Sprint {
    id: number;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    status: 'planned' | 'active' | 'completed';
    goal: string | null;
    tasks_count?: number;
}

interface SprintListProps {
    space: any;
    project: any;
    sprints: Sprint[];
}

export default function SprintList({ space, project, sprints }: SprintListProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

    const activeSprints = sprints.filter(s => s.status === 'active');
    const plannedSprints = sprints.filter(s => s.status === 'planned');
    const completedSprints = sprints.filter(s => s.status === 'completed');

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold">Project Sprints</h2>
                    <p className="text-sm text-muted-foreground">Manage time-boxed iterations for this project.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Create Sprint
                </Button>
            </div>

            {/* Active Sprint Section */}
            {activeSprints.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                        <Play className="w-4 h-4" /> Active Sprint
                    </h3>
                    <div className="grid gap-4">
                        {activeSprints.map(sprint => (
                            <SprintCard
                                key={sprint.id}
                                sprint={sprint}
                                space={space}
                                project={project}
                                onEdit={() => setEditingSprint(sprint)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Planned Sprints Section */}
            <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Planned Sprints
                </h3>
                <div className="grid gap-4">
                    {plannedSprints.length > 0 ? (
                        plannedSprints.map(sprint => (
                            <SprintCard
                                key={sprint.id}
                                sprint={sprint}
                                space={space}
                                project={project}
                                onEdit={() => setEditingSprint(sprint)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 rounded-xl border-2 border-dashed text-muted-foreground bg-muted/20">
                            No planned sprints. Create one to get started.
                        </div>
                    )}
                </div>
            </section>

            {/* Completed Sprints Section */}
            {completedSprints.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Completed Sprints
                    </h3>
                    <div className="grid gap-4 opacity-70 grayscale-[0.5]">
                        {completedSprints.map(sprint => (
                            <SprintCard
                                key={sprint.id}
                                sprint={sprint}
                                space={space}
                                project={project}
                                onEdit={() => setEditingSprint(sprint)}
                            />
                        ))}
                    </div>
                </section>
            )}

            <SprintFormModal
                isOpen={isCreateModalOpen || !!editingSprint}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingSprint(null);
                }}
                space={space}
                project={project}
                sprint={editingSprint}
            />
        </div>
    );
}

function SprintCard({ sprint, space, project, onEdit }: { sprint: Sprint, space: any, project: any, onEdit: () => void }) {
    const handleStart = () => {
        if (confirm('Start this sprint? This will move it to the Active state.')) {
            router.post(`/spaces/${space.slug}/projects/${project.slug}/sprints/${sprint.id}/start`);
        }
    };

    const handleComplete = () => {
        if (confirm('Complete this sprint?')) {
            router.post(`/spaces/${space.slug}/projects/${project.slug}/sprints/${sprint.id}/complete`);
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this sprint?')) {
            router.delete(`/spaces/${space.slug}/projects/${project.slug}/sprints/${sprint.id}`);
        }
    };

    return (
        <div className={cn(
            "p-5 rounded-xl border bg-card transition-all hover:shadow-md group",
            sprint.status === 'active' ? "border-primary/50 ring-1 ring-primary/20" : ""
        )}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/spaces/${space.slug}/projects/${project.slug}/sprints/${sprint.id}`}
                            className="font-bold text-lg hover:underline decoration-primary underline-offset-4"
                        >
                            {sprint.name}
                        </Link>
                        <span className={cn(
                            "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase",
                            sprint.status === 'active' ? "bg-primary text-primary-foreground" :
                                sprint.status === 'completed' ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                        )}>
                            {sprint.status}
                        </span>
                    </div>
                    {sprint.goal && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="w-3.5 h-3.5" />
                            <span>{sprint.goal}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {sprint.start_date ? format(new Date(sprint.start_date), 'MMM d') : 'No start date'}
                            {' - '}
                            {sprint.end_date ? format(new Date(sprint.end_date), 'MMM d, yyyy') : 'No end date'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {sprint.tasks_count || 0} Tasks
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {sprint.status === 'planned' && (
                        <Button size="sm" onClick={handleStart} className="h-8">
                            <Play className="w-3.5 h-3.5 mr-1.5" /> Start
                        </Button>
                    )}
                    {sprint.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={handleComplete} className="h-8 text-green-600 hover:text-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Complete
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Sprint
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {sprint.description && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{sprint.description}</p>
            )}
        </div>
    );
}

function SprintFormModal({ isOpen, onClose, space, project, sprint }: { isOpen: boolean, onClose: () => void, space: any, project: any, sprint?: Sprint | null }) {
    const { data, setData, post, patch, processing, reset, errors } = useForm({
        name: sprint?.name || '',
        description: sprint?.description || '',
        goal: sprint?.goal || '',
        start_date: sprint?.start_date ? sprint.start_date.split('T')[0] : '',
        end_date: sprint?.end_date ? sprint.end_date.split('T')[0] : '',
    });

    const isEditing = !!sprint;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing
            ? `/spaces/${space.slug}/projects/${project.slug}/sprints/${sprint.id}`
            : `/spaces/${space.slug}/projects/${project.slug}/sprints`;

        const method = isEditing ? patch : post;

        method(url, {
            onSuccess: () => {
                onClose();
                reset();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Sprint' : 'Create New Sprint'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Sprint Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="e.g., Sprint 1, Q1 Iteration"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="goal">Sprint Goal</Label>
                        <Input
                            id="goal"
                            value={data.goal}
                            onChange={e => setData('goal', e.target.value)}
                            placeholder="Primary objective for this sprint"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={e => setData('start_date', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={data.end_date}
                                onChange={e => setData('end_date', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Additional context or notes"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'Save Changes' : 'Create Sprint'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
