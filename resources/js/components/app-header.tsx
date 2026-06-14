import { Link, usePage } from '@inertiajs/react';
import { Settings, HelpCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import GlobalSearch from '@/components/global-search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem, SharedData } from '@/types';
import NotificationBell from './notifications/notification-bell';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth, space } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-sm">
            {/* Left: Sidebar Trigger & Breadcrumbs */}
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <div className="hidden md:block">
                        {breadcrumbs.length > 0 && (
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        )}
                    </div>
                </div>
            </div>

            {/* Center: Search */}
            <div className="mx-8 hidden max-w-md flex-1 items-center lg:flex">
                <GlobalSearch />
            </div>

            {/* Right: Actions & User Panel */}
            <div className="flex items-center gap-2">
                <div className="mr-2 flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        asChild
                    >
                        <Link href="/help">
                            <HelpCircle className="h-5 w-5" />
                        </Link>
                    </Button>

                    <NotificationBell />

                    {(!space || auth.can_manage) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            asChild
                        >
                            <Link
                                href={
                                    space
                                        ? `/spaces/${(space as { slug: string }).slug}/settings`
                                        : '/settings'
                                }
                            >
                                <Settings className="h-5 w-5" />
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="mx-2 hidden h-6 w-[1px] bg-border sm:block" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-10 w-10 rounded-full p-0 ring-offset-background transition-all hover:ring-2 hover:ring-primary/20"
                        >
                            <Avatar className="h-9 w-9 overflow-hidden">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
