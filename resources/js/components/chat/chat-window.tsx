import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { Send, MessageCircle } from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Custom styles for react-mentions (minimal tailwind-friendly)
const mentionStyles = {
    control: {
        fontSize: '14px',
        lineHeight: '1.4',
    },
    '&multiLine': {
        control: {
            fontFamily: 'inherit',
            minHeight: '40px',
        },
        highlighter: {
            padding: '8px',
            border: '1px solid transparent',
        },
        input: {
            padding: '8px',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.375rem',
            outline: 'none',
        },
    },
    suggestions: {
        list: {
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            fontSize: '14px',
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
        item: {
            padding: '5px 15px',
            borderBottom: '1px solid hsl(var(--border))',
            '&focused': {
                backgroundColor: 'hsl(var(--accent))',
            },
        },
    },
};

interface Message {
    id: number;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

type OnlineUser = { id: number; name: string };

interface ChatWindowProps {
    spaceId?: number;
    taskId?: number;
    members: { id: number; name: string }[];
}

export default function ChatWindow({
    spaceId,
    taskId,
    members,
}: ChatWindowProps) {
    const { auth } = usePage<{ auth: { user: { id: number; name: string } } }>().props;
    const currentUser = auth.user;
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [typingUsers, setTypingUsers] = useState<OnlineUser[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const channelName = taskId ? `task.${taskId}` : `space.${spaceId}`;

    // Fetch initial messages
    useEffect(() => {
        axios
            .get('/chat', { params: { space_id: spaceId, task_id: taskId } })
            .then((res) => {
                setMessages(res.data.data.reverse());
            });
    }, [spaceId, taskId]);

    // Setup Reverb/Echo
    useEffect(() => {
        if (!window.Echo) return;

        window.Echo.join(channelName)
            .here((users: OnlineUser[]) => setOnlineUsers(users))
            .joining((user: OnlineUser) => setOnlineUsers((prev) => [...prev, user]))
            .leaving((user: OnlineUser) =>
                setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id)),
            )
            .listen('.message.sent', (e: { message: Message }) => {
                setMessages((prev) => [...prev, e.message]);
            })
            .listen('.user.typing', (e: { user: OnlineUser }) => {
                if (!typingUsers.find((u) => u.id === e.user.id)) {
                    setTypingUsers((prev) => [...prev, e.user]);
                    setTimeout(() => {
                        setTypingUsers((prev) =>
                            prev.filter((u) => u.id !== e.user.id),
                        );
                    }, 3000);
                }
            });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [channelName]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const broadcastTyping = useMemo(
        () => debounce(() => {
            axios.post('/chat/typing', {
                target_id: taskId || spaceId,
                type: taskId ? 'task' : 'space',
            });
        }, 500),
        [spaceId, taskId],
    );

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const originalContent = content;
        setContent('');

        axios
            .post('/chat', {
                content: originalContent,
                space_id: spaceId,
                task_id: taskId,
            })
            .then((res) => {
                setMessages((prev) => [...prev, res.data]);
            });
    };

    return (
        <div className="flex h-full w-80 shrink-0 flex-col border-l bg-background">
            {/* Header */}
            <header className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold">
                        {taskId ? 'Task Chat' : 'Space Chat'}
                    </h3>
                </div>
                <div className="flex -space-x-1">
                    {onlineUsers.slice(0, 3).map((user) => (
                        <div
                            key={user.id}
                            title={user.name}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary/20 text-[10px] font-bold"
                        >
                            {user.name.charAt(0)}
                        </div>
                    ))}
                    {onlineUsers.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] font-bold">
                            +{onlineUsers.length - 3}
                        </div>
                    )}
                </div>
            </header>

            {/* Message List */}
            <div
                className="flex-1 space-y-4 overflow-y-auto scroll-smooth p-4"
                ref={scrollRef}
            >
                {messages.map((msg) => {
                    const isCurrentUser = msg.user.id === currentUser.id;
                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}
                        >
                            <div
                                className={`flex items-baseline gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <span className="text-xs font-bold">
                                    {isCurrentUser ? 'You' : msg.user.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {format(new Date(msg.created_at), 'HH:mm')}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    'max-w-[90%] rounded-2xl p-3 text-sm break-words',
                                    isCurrentUser
                                        ? 'rounded-tr-none bg-primary text-primary-foreground'
                                        : 'rounded-tl-none bg-muted',
                                )}
                            >
                                {msg.content}
                            </div>
                        </div>
                    );
                })}

                {typingUsers.length > 0 && (
                    <div className="flex animate-pulse items-center gap-1 text-[10px] text-muted-foreground">
                        <div className="flex gap-0.5">
                            <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" />
                            <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                            <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.4s]" />
                        </div>
                        {typingUsers.map((u) => u.name).join(', ')}{' '}
                        {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t bg-muted/20 p-4">
                <form onSubmit={handleSendMessage} className="space-y-2">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <MentionsInput
                                value={content}
                                onChange={(_e, newValue) => {
                                    setContent(newValue);
                                    broadcastTyping();
                                }}
                                style={mentionStyles}
                                placeholder="Press Shift+Enter to send..."
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === 'Enter' && e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            >
                                <Mention
                                    trigger="@"
                                    data={members.map((m) => ({
                                        id: m.id,
                                        display: m.name,
                                    }))}
                                    markup="@[__display__](__id__)"
                                    className="font-bold text-primary"
                                />
                            </MentionsInput>
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            className="h-10 w-10 shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="px-1 text-[10px] text-muted-foreground">
                        Use @ to mention teammates
                    </p>
                </form>
            </div>
        </div>
    );
}
