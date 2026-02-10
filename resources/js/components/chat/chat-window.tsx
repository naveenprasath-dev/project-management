import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { MentionsInput, Mention } from 'react-mentions';
import axios from 'axios';
import { Send, Hash, User, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { debounce } from 'lodash';
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

interface ChatWindowProps {
    spaceId?: number;
    taskId?: number;
    members: any[];
}

export default function ChatWindow({ spaceId, taskId, members }: ChatWindowProps) {
    const { auth } = usePage<{ auth: any }>().props;
    const currentUser = auth.user;
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [typingUsers, setTypingUsers] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const channelName = taskId ? `task.${taskId}` : `space.${spaceId}`;

    // Fetch initial messages
    useEffect(() => {
        setIsLoading(true);
        axios.get('/chat', { params: { space_id: spaceId, task_id: taskId } })
            .then(res => {
                setMessages(res.data.data.reverse());
                setIsLoading(false);
            });
    }, [spaceId, taskId]);

    // Setup Reverb/Echo
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.join(channelName)
            .here((users: any[]) => setOnlineUsers(users))
            .joining((user: any) => setOnlineUsers(prev => [...prev, user]))
            .leaving((user: any) => setOnlineUsers(prev => prev.filter(u => u.id !== user.id)))
            .listen('.message.sent', (e: any) => {
                setMessages(prev => [...prev, e.message]);
            })
            .listen('.user.typing', (e: any) => {
                if (!typingUsers.find(u => u.id === e.user.id)) {
                    setTypingUsers(prev => [...prev, e.user]);
                    setTimeout(() => {
                        setTypingUsers(prev => prev.filter(u => u.id !== e.user.id));
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

    const broadcastTyping = useCallback(
        debounce(() => {
            axios.post('/chat/typing', {
                target_id: taskId || spaceId,
                type: taskId ? 'task' : 'space'
            });
        }, 500),
        [spaceId, taskId]
    );

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const originalContent = content;
        setContent('');

        axios.post('/chat', {
            content: originalContent,
            space_id: spaceId,
            task_id: taskId
        }).then(res => {
            setMessages(prev => [...prev, res.data]);
        });
    };

    return (
        <div className="flex flex-col h-full bg-background border-l w-80 shrink-0">
            {/* Header */}
            <header className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-sm">
                        {taskId ? 'Task Chat' : 'Space Chat'}
                    </h3>
                </div>
                <div className="flex -space-x-1">
                    {onlineUsers.slice(0, 3).map(user => (
                        <div key={user.id} title={user.name} className="w-6 h-6 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                            {user.name.charAt(0)}
                        </div>
                    ))}
                    {onlineUsers.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold">
                            +{onlineUsers.length - 3}
                        </div>
                    )}
                </div>
            </header>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                {messages.map((msg, i) => {
                    const isCurrentUser = msg.user.id === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-baseline gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                <span className="text-xs font-bold">{isCurrentUser ? 'You' : msg.user.name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                    {format(new Date(msg.created_at), 'HH:mm')}
                                </span>
                            </div>
                            <div className={cn(
                                "text-sm p-3 rounded-2xl max-w-[90%] break-words",
                                isCurrentUser
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}

                {typingUsers.length > 0 && (
                    <div className="text-[10px] text-muted-foreground animate-pulse flex items-center gap-1">
                        <div className="flex gap-0.5">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-muted/20">
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
                                    data={members.map(m => ({ id: m.id, display: m.name }))}
                                    markup="@[__display__](__id__)"
                                    className="text-primary font-bold"
                                />
                            </MentionsInput>
                        </div>
                        <Button type="submit" size="icon" className="shrink-0 h-10 w-10">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground px-1">
                        Use @ to mention teammates
                    </p>
                </form>
            </div>
        </div>
    );
}
