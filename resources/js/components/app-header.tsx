import { Link, usePage } from '@inertiajs/react';
import { Search, Plus, Bell, Settings, HelpCircle, Menu } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
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
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, SharedData } from '@/types';
import NotificationBell from './notifications/notification-bell';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth, space } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 flex items-center justify-between px-6 shrink-0 z-20">
            {/* Left: Sidebar Trigger & Breadcrumbs */}
            <div className="flex items-center gap-4 min-w-0">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <div className="hidden md:block">
                        {breadcrumbs.length > 0 && (
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        )}
                    </div>
                </div>
            </div>

            {/* Center: Search (ClickUp Style) */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search tasks, spaces, or documents..."
                        className="w-full h-9 pl-10 pr-4 bg-muted/50 border-transparent rounded-lg text-sm transition-all focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 focus:shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border bg-background text-[10px] font-mono text-muted-foreground pointer-events-none uppercase">
                        ⌘K
                    </div>
                </div>
            </div>

            {/* Right: Actions & User Panel */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" asChild>
                        <Link href="/help">
                            <HelpCircle className="w-5 h-5" />
                        </Link>
                    </Button>

                    <NotificationBell />

                    {(!space || auth.can_manage) && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" asChild>
                            <Link href={space ? `/spaces/${(space as any).slug}/settings` : '/settings'}>
                                <Settings className="w-5 h-5" />
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="h-6 w-[1px] bg-border mx-2 hidden sm:block" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 rounded-full ring-offset-background hover:ring-2 hover:ring-primary/20 transition-all"
                        >
                            <Avatar className="h-9 w-9 overflow-hidden">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
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
