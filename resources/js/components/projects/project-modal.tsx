import { useEffect } from 'react';
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
import { Loader2, FolderPlus, Save } from 'lucide-react';

interface ProjectModalProps {
    space: any;
    isOpen: boolean;
    onClose: () => void;
    project?: any;
}

export default function ProjectModal({ space, isOpen, onClose, project }: ProjectModalProps) {
    const { data, setData, post, patch, processing, reset, errors } = useForm({
        name: '',
        description: '',
        color: '#3b82f6',
    });

    useEffect(() => {
        if (project) {
            setData({
                name: project.name,
                description: project.description || '',
                color: project.color || '#3b82f6',
            });
        } else {
            reset();
        }
    }, [project]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = project
            ? `/spaces/${space.slug}/projects/${project.id}`
            : `/spaces/${space.slug}/projects`;

        const method = project ? patch : post;

        method(url, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {project ? <Save className="w-5 h-5 text-primary" /> : <FolderPlus className="w-5 h-5 text-primary" />}
                            {project ? 'Edit Project' : 'Create New Project'}
                        </DialogTitle>
                        <DialogDescription>
                            Projects help organize tasks within your space.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter project name"
                                className={errors.name ? 'border-destructive' : ''}
                                autoFocus
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Add project description..."
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="color">Color</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="color"
                                    type="color"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="w-20 h-10 cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground">{data.color}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {project ? 'Save Changes' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
