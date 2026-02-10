import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Plus, LayoutGrid, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Spaces',
        href: '/spaces',
    },
];

interface Space {
    id: number;
    name: string;
    slug: string;
    description: string;
    color: string;
    is_private: boolean;
}

export default function Index({ spaces }: { spaces: Space[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Spaces" />
            
            <div className="flex items-center justify-between p-4 px-6 border-b">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Spaces</h1>
                    <p className="text-sm text-muted-foreground">Manage your organization's workspaces</p>
                </div>
                <Button asChild>
                    <Link href="/spaces/create">
                        <Plus className="w-4 h-4 mr-2" /> New Space
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {spaces.map((space) => (
                    <div
                        key={space.id}
                        className="overflow-hidden border group rounded-xl bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                    >
                        <div
                            className="h-1.5 w-full"
                            style={{ backgroundColor: space.color || '#cbd5e1' }}
                        />
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-muted">
                                    <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/spaces/${space.slug}/settings`}>
                                        <Settings className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                            
                            <h3 className="mb-1 text-lg font-bold">
                                <Link href={`/spaces/${space.slug}`} className="hover:text-primary transition-colors leading-none">
                                    {space.name}
                                </Link>
                            </h3>
                            <p className="text-sm line-clamp-2 text-muted-foreground min-h-[40px]">
                                {space.description || 'No description provided.'}
                            </p>
                            
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex -space-x-2">
                                    {/* Temporary placeholder for member avatars */}
                                    <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium">+1</div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${space.is_private ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {space.is_private ? 'Private' : 'Public'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {spaces.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                        <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <h3 className="text-lg font-medium">No spaces yet</h3>
                        <p className="mb-6 text-muted-foreground">Get started by creating your first team workspace.</p>
                        <Button asChild>
                            <Link href="/spaces/create">
                                <Plus className="w-4 h-4 mr-2" /> Create Space
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
