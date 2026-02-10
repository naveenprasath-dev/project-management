import { router } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Search, Filter, X, Star, Bug, TrendingUp, CheckCircle2, Search as SearchIcon, Settings, ShieldCheck } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Filters {
    search?: string;
    status_id?: string;
    priority?: string;
    assigned_to?: string;
    project_id?: string;
    type?: string;
}

export default function TaskFilterBar({
    space,
    members,
    currentFilters,
    baseUrl,
    statuses,
    hideProjectFilter = false
}: {
    space: any;
    members: any[];
    currentFilters: Filters;
    baseUrl?: string;
    statuses?: any[];
    hideProjectFilter?: boolean;
}) {
    const [search, setSearch] = useState(currentFilters.search || '');

    const statusOptions = statuses || space.statuses || [];
    const projectOptions = space.projects || [];

    const updateFilters = useCallback(
        debounce((newFilters: Partial<Filters>) => {
            router.get(
                baseUrl || `/spaces/${space.slug}/tasks`,
                { ...currentFilters, ...newFilters },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300),
        [space.slug, currentFilters, baseUrl]
    );

    const handleSearchChange = (value: string) => {
        setSearch(value);
        updateFilters({ search: value });
    };

    const clearFilters = () => {
        setSearch('');
        router.get(baseUrl || `/spaces/${space.slug}/tasks`, {}, { preserveState: true, replace: true });
    };

    const hasFilters = Object.values(currentFilters).some(v => !!v);

    return (
        <div className="flex flex-col gap-4 p-4 border-b bg-muted/20 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 focus:ring-2 focus:ring-primary/10"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {!hideProjectFilter && projectOptions.length > 0 && (
                    <Select
                        value={currentFilters.project_id || 'all'}
                        onValueChange={(v) => updateFilters({ project_id: v === 'all' ? undefined : v })}
                    >
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Project" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            {projectOptions.map((project: any) => (
                                <SelectItem key={project.id} value={project.id.toString()}>
                                    <span className="truncate max-w-[150px] inline-block">{project.name}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Select
                    value={currentFilters.status_id || 'all'}
                    onValueChange={(v) => updateFilters({ status_id: v === 'all' ? undefined : v })}
                >
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statusOptions.map((status: any) => (
                            <SelectItem key={status.id} value={status.id.toString()}>
                                {status.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={currentFilters.priority || 'all'}
                    onValueChange={(v) => updateFilters({ priority: v === 'all' ? undefined : v })}
                >
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={currentFilters.assigned_to || 'all'}
                    onValueChange={(v) => updateFilters({ assigned_to: v === 'all' ? undefined : v })}
                >
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Anyone</SelectItem>
                        {members.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                                {member.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={currentFilters.type || 'all'}
                    onValueChange={(v) => updateFilters({ type: v === 'all' ? undefined : v })}
                >
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="feature">
                            <div className="flex items-center gap-2">
                                <Star className="w-3.5 h-3.5 text-emerald-500" /> Feature
                            </div>
                        </SelectItem>
                        <SelectItem value="bug">
                            <div className="flex items-center gap-2">
                                <Bug className="w-3.5 h-3.5 text-rose-500" /> Bug
                            </div>
                        </SelectItem>
                        <SelectItem value="improvement">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Improvement
                            </div>
                        </SelectItem>
                        <SelectItem value="task">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Task
                            </div>
                        </SelectItem>
                        <SelectItem value="research">
                            <div className="flex items-center gap-2">
                                <SearchIcon className="w-3.5 h-3.5 text-purple-500" /> Research
                            </div>
                        </SelectItem>
                        <SelectItem value="maintenance">
                            <div className="flex items-center gap-2">
                                <Settings className="w-3.5 h-3.5 text-amber-500" /> Maintenance
                            </div>
                        </SelectItem>
                        <SelectItem value="security">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-red-700" /> Security
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                        <X className="w-4 h-4 mr-2" /> Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
