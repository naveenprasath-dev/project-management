import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotificationData {
    id: string;
    data: {
        title: string;
        body: string;
        url: string;
        type: string;
    };
    read_at: string | null;
    created_at: string;
}

export default function NotificationBell() {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const res = await axios.get('/notifications');
        setNotifications(res.data.data);
    };

    const fetchUnreadCount = async () => {
        const res = await axios.get('/notifications/unread-count');
        setUnreadCount(res.data.count);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotifications();
         
        fetchUnreadCount();

        if (!window.Echo) return;

        window.Echo.private(`App.Models.User.${auth.user.id}`).notification(
            (notification: NotificationData) => {
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            },
        );

        return () => {
            window.Echo.leave(`App.Models.User.${auth.user.id}`);
        };
    }, []);

    const markAsRead = async (id: string) => {
        await axios.patch(`/notifications/${id}/read`);
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
            ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await axios.post('/notifications/read-all');
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
        );
        setUnreadCount(0);
    };

    const dismiss = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const target = notifications.find((n) => n.id === id);
        await axios.delete(`/notifications/${id}`);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (target && !target.read_at) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const clearAll = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await axios.delete('/notifications');
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <>
                            <span className="absolute -top-1 -right-1 h-5 w-5 animate-ping rounded-full bg-destructive opacity-40" />
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b p-4">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAllAsRead();
                                }}
                                className="h-8 px-2 text-xs"
                            >
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="mx-auto mb-2 h-8 w-8 opacity-20" />
                            <p className="text-xs">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`group relative border-b p-4 transition-colors last:border-0 hover:bg-muted/50 ${!n.read_at ? 'bg-primary/5 shadow-sm' : ''}`}
                                >
                                    <div className="mb-1 flex justify-between gap-2">
                                        <p className="text-xs font-bold">
                                            {n.data.title}
                                        </p>
                                        <p className="text-[10px] whitespace-nowrap text-muted-foreground">
                                            {formatDistanceToNow(
                                                new Date(n.created_at),
                                                { addSuffix: true },
                                            )}
                                        </p>
                                    </div>
                                    <p className="line-clamp-2 pr-6 text-xs text-muted-foreground">
                                        {n.data.body}
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <Link
                                            href={n.data.url}
                                            className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            View details{' '}
                                            <ExternalLink className="h-2 w-2" />
                                        </Link>
                                    </div>

                                    <div className="absolute right-2 bottom-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        {!n.read_at && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                title="Mark as read"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(n.id);
                                                }}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:text-destructive"
                                            title="Dismiss"
                                            onClick={(e) => dismiss(n.id, e)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="border-t p-2 text-center">
                    <Button
                        variant="ghost"
                        className="h-8 w-full text-xs"
                        asChild
                    >
                        <Link href="/notifications">View All Activity</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
