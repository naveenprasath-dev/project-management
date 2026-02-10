import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Plus,
    Home,
    Star,
    CheckCircle2,
    Calendar,
    Settings,
    Layers,
    Menu,
    ChevronRight,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
    SidebarGroupAction,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { dashboard } from '@/routes';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as any;
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
        <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
            <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="p-2 space-y-4">
                {/* My Work Section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                        My Work
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {myWorkItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title} isActive={url === item.href || url.startsWith(item.href + '/')}>
                                    <Link href={item.href}>
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {/* Spaces Section */}
                <SidebarGroup>
                    <div className="flex items-center justify-between px-2 mb-2">
                        <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                            Spaces
                        </SidebarGroupLabel>
                        <Link href="/spaces/create" className="text-muted-foreground hover:text-primary transition-colors">
                            <Plus className="w-4 h-4" />
                        </Link>
                    </div>
                    <SidebarMenu>
                        {auth.spaces?.map((space: any) => (
                            <Collapsible key={space.id} asChild defaultOpen={url.startsWith(`/spaces/${space.slug}`)} className="group/collapsible">
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip={space.name}>
                                        <Link href={`/spaces/${space.slug}/tasks`}>
                                            <div
                                                className="w-2.5 h-2.5 rounded-md shrink-0 shadow-sm ring-1 ring-black/5 transition-transform hover:scale-110"
                                                style={{ backgroundColor: space.color || '#cbd5e1' }}
                                            />
                                            <span className="font-medium">{space.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                                            <ChevronRight />
                                            <span className="sr-only">Toggle</span>
                                        </SidebarMenuAction>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {space.projects?.map((project: any) => (
                                                <SidebarMenuSubItem key={project.id}>
                                                    <SidebarMenuSubButton asChild>
                                                        <Link href={`/spaces/${space.slug}/projects/${project.slug}`}>
                                                            <span className="truncate">{project.name}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href={`/spaces/${space.slug}/settings?tab=projects`} className="text-muted-foreground">
                                                        <Plus className="w-3 h-3 mr-1" /> Add Project
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
                                <p className="text-[10px] text-muted-foreground">No spaces yet.</p>
                            </div>
                        )}
                    </SidebarMenu>
                </SidebarGroup>

                {/* Configuration / Settings (Optional) */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                        Settings
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Settings">
                                <Link href="/settings/profile">
                                    <Settings className="w-5 h-5" />
                                    <span className="font-medium">Settings</span>
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
