import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { LayoutGrid, Save, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Spaces', href: '/spaces' },
    { title: 'Create', href: '/spaces/create' },
];

const COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#475569', '#111827'
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        color: COLORS[0],
        is_private: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/spaces');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Space" />

            <div className="max-w-2xl px-6 py-8 mx-auto">
                <div className="flex items-center mb-8 gap-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                        <LayoutGrid className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Create a new Space</h1>
                        <p className="text-sm text-muted-foreground">Spaces help you organize your team and workflows.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Space Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Engineering, Marketing..."
                                className={errors.name ? 'border-destructive' : ''}
                                autoFocus
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="What's this space for?"
                                rows={3}
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>

                        <div className="grid gap-4">
                            <Label>Space Color</Label>
                            <div className="flex flex-wrap gap-3">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setData('color', color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${data.color === color ? 'border-primary scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start p-4 border rounded-lg gap-x-3 bg-muted/30">
                            <Checkbox
                                id="is_private"
                                checked={data.is_private}
                                onCheckedChange={(checked) => setData('is_private', !!checked)}
                            />
                            <div className="grid gap-1 leading-none">
                                <Label htmlFor="is_private" className="cursor-pointer">Private Space</Label>
                                <p className="text-xs text-muted-foreground">
                                    Only invited members can view this space and its tasks.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end pt-6 border-t gap-x-3">
                        <Button variant="ghost" asChild>
                            <Link href="/spaces">
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Space'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
