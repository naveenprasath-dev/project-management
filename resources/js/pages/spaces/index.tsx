import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    LayoutGrid,
    Settings,
    MoreHorizontal,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

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
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.is_admin;

    const handleDelete = (space: Space) => {
        if (
            confirm(
                `Delete "${space.name}"? This action cannot be undone and will remove all associated data.`,
            )
        ) {
            router.delete(`/spaces/${space.slug}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Spaces" />

            <div className="flex items-center justify-between border-b p-4 px-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Spaces
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your organization's workspaces
                    </p>
                </div>
                <Button asChild>
                    <Link href="/spaces/create">
                        <Plus className="mr-2 h-4 w-4" /> New Space
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {spaces.map((space) => (
                    <div
                        key={space.id}
                        className="group overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
                    >
                        <div
                            className="h-1.5 w-full"
                            style={{
                                backgroundColor: space.color || '#cbd5e1',
                            }}
                        />
                        <div className="p-5">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="rounded-lg bg-muted p-2">
                                    <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={`/spaces/${space.slug}/settings`}
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        {isAdmin && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(space)
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Space
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <h3 className="mb-1 text-lg font-bold">
                                <Link
                                    href={`/spaces/${space.slug}`}
                                    className="leading-none transition-colors hover:text-primary"
                                >
                                    {space.name}
                                </Link>
                            </h3>
                            <p className="line-clamp-2 min-h-[40px] text-sm text-muted-foreground">
                                {space.description ||
                                    'No description provided.'}
                            </p>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {/* Temporary placeholder for member avatars */}
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                                        +1
                                    </div>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${space.is_private ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}
                                >
                                    {space.is_private ? 'Private' : 'Public'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {spaces.length === 0 && (
                    <div className="col-span-full rounded-xl border-2 border-dashed py-20 text-center">
                        <LayoutGrid className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-20" />
                        <h3 className="text-lg font-medium">No spaces yet</h3>
                        <p className="mb-6 text-muted-foreground">
                            Get started by creating your first team workspace.
                        </p>
                        <Button asChild>
                            <Link href="/spaces/create">
                                <Plus className="mr-2 h-4 w-4" /> Create Space
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
