import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Spaces', href: '/spaces' },
    { title: 'Create', href: '/spaces/create' },
];

const COLORS = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#475569',
    '#111827',
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

            <div className="mx-auto max-w-2xl px-6 py-8">
                <div className="mb-8 flex items-center gap-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <LayoutGrid className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Create a new Space
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Spaces help you organize your team and workflows.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Space Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g. Engineering, Marketing..."
                                className={
                                    errors.name ? 'border-destructive' : ''
                                }
                                autoFocus
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="What's this space for?"
                                rows={3}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4">
                            <Label>Space Color</Label>
                            <div className="flex flex-wrap gap-3">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setData('color', color)}
                                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                                            data.color === color
                                                ? 'scale-110 border-primary shadow-sm'
                                                : 'border-transparent hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start gap-x-3 rounded-lg border bg-muted/30 p-4">
                            <Checkbox
                                id="is_private"
                                checked={data.is_private}
                                onCheckedChange={(checked) =>
                                    setData('is_private', !!checked)
                                }
                            />
                            <div className="grid gap-1 leading-none">
                                <Label
                                    htmlFor="is_private"
                                    className="cursor-pointer"
                                >
                                    Private Space
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Only invited members can view this space and
                                    its tasks.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-x-3 border-t pt-6">
                        <Button variant="ghost" asChild>
                            <Link href="/spaces">
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Space'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
