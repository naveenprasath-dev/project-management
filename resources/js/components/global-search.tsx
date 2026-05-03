import { router } from '@inertiajs/react';
import axios from 'axios';
import { Search, CheckCircle2, LayoutGrid, FolderOpen, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { cn } from '@/lib/utils';

interface TaskResult {
    id: number;
    title: string;
    priority: string;
    status: { name: string; color: string } | null;
    space: { name: string; slug: string; color: string };
    url: string;
}

interface SpaceResult {
    id: number;
    name: string;
    color: string;
    url: string;
}

interface ProjectResult {
    id: number;
    name: string;
    color: string;
    space_name: string;
    url: string;
}

interface SearchResults {
    tasks: TaskResult[];
    spaces: SpaceResult[];
    projects: ProjectResult[];
}

const PRIORITY_COLORS: Record<string, string> = {
    urgent: 'text-red-600',
    high: 'text-orange-500',
    medium: 'text-blue-500',
    low: 'text-slate-400',
};

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const totalResults = results
        ? results.tasks.length + results.spaces.length + results.projects.length
        : 0;

    const fetchResults = useCallback(
        debounce(async (q: string) => {
            if (q.length < 2) {
                setResults(null);
                setIsLoading(false);
                return;
            }
            try {
                const { data } = await axios.get('/search', { params: { q } });
                setResults(data);
            } catch {
                setResults(null);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length >= 2) {
            setIsLoading(true);
            setIsOpen(true);
        } else {
            setResults(null);
            setIsOpen(false);
        }
        fetchResults(val);
    };

    const handleNavigate = (url: string) => {
        setQuery('');
        setResults(null);
        setIsOpen(false);
        router.visit(url);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ⌘K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const hasResults = results && totalResults > 0;
    const showDropdown = isOpen && query.length >= 2;

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search tasks, spaces, or projects..."
                    className="w-full h-9 pl-10 pr-16 bg-muted/50 border border-transparent rounded-lg text-sm transition-all focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 focus:shadow-sm outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                    ) : (
                        <kbd className="px-1.5 py-0.5 rounded border bg-background text-[10px] font-mono text-muted-foreground pointer-events-none">
                            ⌘K
                        </kbd>
                    )}
                </div>
            </div>

            {showDropdown && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-popover border rounded-xl shadow-xl z-50 overflow-hidden">
                    {isLoading && !results ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching...
                        </div>
                    ) : !hasResults ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No results for <span className="font-semibold text-foreground">"{query}"</span>
                        </div>
                    ) : (
                        <div className="max-h-[420px] overflow-y-auto p-2 space-y-1">
                            {results.tasks.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                                        <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tasks</span>
                                    </div>
                                    {results.tasks.map((task) => (
                                        <button
                                            key={task.id}
                                            onClick={() => handleNavigate(task.url)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-left transition-colors group"
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: task.status?.color ?? '#94a3b8' }}
                                            />
                                            <span className="flex-1 text-sm font-medium truncate group-hover:text-accent-foreground">
                                                {task.title}
                                            </span>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {task.priority && (
                                                    <span className={cn('text-[10px] font-bold uppercase', PRIORITY_COLORS[task.priority])}>
                                                        {task.priority}
                                                    </span>
                                                )}
                                                <span
                                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                                                    style={{ backgroundColor: task.space.color }}
                                                >
                                                    {task.space.name}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {results.spaces.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-1.5 px-2 py-1.5 mt-1">
                                        <LayoutGrid className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Spaces</span>
                                    </div>
                                    {results.spaces.map((space) => (
                                        <button
                                            key={space.id}
                                            onClick={() => handleNavigate(space.url)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-left transition-colors"
                                        >
                                            <div
                                                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                                style={{ backgroundColor: space.color }}
                                            >
                                                {space.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium">{space.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {results.projects.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-1.5 px-2 py-1.5 mt-1">
                                        <FolderOpen className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projects</span>
                                    </div>
                                    {results.projects.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleNavigate(project.url)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-left transition-colors"
                                        >
                                            <div
                                                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                                style={{ backgroundColor: project.color }}
                                            >
                                                {project.name.charAt(0)}
                                            </div>
                                            <span className="flex-1 text-sm font-medium truncate">{project.name}</span>
                                            <span className="text-[10px] text-muted-foreground shrink-0">{project.space_name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
