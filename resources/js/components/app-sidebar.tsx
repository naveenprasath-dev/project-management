import { Link, usePage } from '@inertiajs/react';
import {
    Plus,
    Home,
    CheckCircle2,
    Calendar,
    Settings,
    ChevronRight,
} from 'lucide-react';
import { NavUser } from '@/components/nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuAction,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Project, SharedData, Space } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { url } = usePage();

    const myWorkItems = [
        {
            title: 'Home',
            href: dashboard().url,
            icon: Home,
        },
        {
            title: 'My Tasks',
            href: '/my-tasks',
            icon: CheckCircle2,
        },
        {
            title: 'Calendar',
            href: '/calendar',
            icon: Calendar,
        },
    ];

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-sidebar-border/50"
        >
            <SidebarHeader className="flex h-16 items-center border-b border-sidebar-border/50 px-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-transparent"
                        >
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="space-y-4 p-2">
                {/* My Work Section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-bold tracking-wider text-muted-foreground/70 uppercase">
                        My Work
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {myWorkItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    isActive={
                                        url === item.href ||
                                        url.startsWith(item.href + '/')
                                    }
                                >
                                    <Link href={item.href}>
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {/* Spaces Section */}
                <SidebarGroup>
                    <div className="mb-2 flex items-center justify-between px-2">
                        <SidebarGroupLabel className="text-xs font-bold tracking-wider text-muted-foreground/70 uppercase">
                            Spaces
                        </SidebarGroupLabel>
                        <Link
                            href="/spaces/create"
                            className="text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Plus className="h-4 w-4" />
                        </Link>
                    </div>
                    <SidebarMenu>
                        {auth.spaces?.map((space: Space) => (
                            <Collapsible
                                key={space.id}
                                asChild
                                defaultOpen={url.startsWith(
                                    `/spaces/${space.slug}`,
                                )}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={space.name}
                                    >
                                        <Link
                                            href={`/spaces/${space.slug}/tasks`}
                                        >
                                            <div
                                                className="h-2.5 w-2.5 shrink-0 rounded-md shadow-sm ring-1 ring-black/5 transition-transform hover:scale-110"
                                                style={{
                                                    backgroundColor:
                                                        space.color ||
                                                        '#cbd5e1',
                                                }}
                                            />
                                            <span className="font-medium">
                                                {space.name}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                                            <ChevronRight />
                                            <span className="sr-only">
                                                Toggle
                                            </span>
                                        </SidebarMenuAction>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {space.projects?.map(
                                                (project: Project) => (
                                                    <SidebarMenuSubItem
                                                        key={project.id}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/spaces/${space.slug}/projects/${project.slug}`}
                                                            >
                                                                <span className="truncate">
                                                                    {
                                                                        project.name
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ),
                                            )}
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton asChild>
                                                    <Link
                                                        href={`/spaces/${space.slug}/settings?tab=projects`}
                                                        className="text-muted-foreground"
                                                    >
                                                        <Plus className="mr-1 h-3 w-3" />{' '}
                                                        Add Project
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                        {auth.spaces?.length === 0 && (
                            <div className="px-2 py-4 text-center">
                                <p className="text-[10px] text-muted-foreground">
                                    No spaces yet.
                                </p>
                            </div>
                        )}
                    </SidebarMenu>
                </SidebarGroup>

                {/* Configuration / Settings (Optional) */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-bold tracking-wider text-muted-foreground/70 uppercase">
                        Settings
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Settings">
                                <Link href="/settings/profile">
                                    <Settings className="h-5 w-5" />
                                    <span className="font-medium">
                                        Settings
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
