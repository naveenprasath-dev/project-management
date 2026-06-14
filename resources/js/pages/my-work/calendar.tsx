import { Head } from '@inertiajs/react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
} from 'date-fns';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import TaskModal from '@/components/tasks/task-modal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, Space, Task } from '@/types';

interface PageProps {
    tasks: Task[];
    spaces: Space[];
}

export default function CalendarPage({ tasks, spaces }: PageProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Work', href: '/my-tasks' },
        { title: 'Calendar', href: '/calendar' },
    ];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    const getTasksForDay = (day: Date) => {
        return tasks.filter(
            (task) => task.due_date && isSameDay(new Date(task.due_date), day),
        );
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleAddTask = (day: Date) => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        setSelectedTask({ due_date: formattedDate });
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />

            <div className="flex h-full flex-col overflow-hidden bg-background text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="z-10 flex items-center justify-between border-b bg-background p-4 px-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <CalendarIcon className="h-5 w-5" />
                        </div>
                        <h1 className="min-w-[200px] text-xl font-bold">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h1>
                        <div className="flex items-center overflow-hidden rounded-md border bg-muted/20">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none border-r"
                                onClick={prevMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-none border-r px-3 text-[10px] font-bold tracking-wider uppercase"
                                onClick={goToToday}
                            >
                                Today
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={nextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="mr-4 flex items-center gap-1.5 text-[10px] leading-none font-bold tracking-widest text-muted-foreground uppercase">
                            <span className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-red-500" />{' '}
                                Urgent
                            </span>
                            <span className="ml-2 flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-orange-500" />{' '}
                                High
                            </span>
                            <span className="ml-2 flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />{' '}
                                Med
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="default"
                            className="shadow-sm"
                            onClick={() => handleAddTask(new Date())}
                        >
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex min-h-0 flex-1 flex-col">
                    {/* Days of Week */}
                    <div className="grid grid-cols-7 border-b bg-muted/30 py-2 text-center text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                            (day) => (
                                <div key={day}>{day}</div>
                            ),
                        )}
                    </div>

                    {/* Days Grid */}
                    <div className="grid flex-1 auto-rows-fr grid-cols-7 overflow-y-auto">
                        {calendarDays.map((day, idx) => {
                            const dayTasks = getTasksForDay(day);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isTodayDay = isToday(day);

                            return (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        'group relative flex min-h-[120px] cursor-pointer flex-col border-r border-b p-2 transition-colors hover:bg-muted/10',
                                        !isCurrentMonth && 'bg-muted/5',
                                        idx % 7 === 6 && 'border-r-0',
                                    )}
                                    onClick={() => handleAddTask(day)}
                                >
                                    <div className="mb-1 flex items-center justify-between">
                                        <span
                                            className={cn(
                                                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all',
                                                isTodayDay
                                                    ? 'bg-primary text-primary-foreground shadow-md'
                                                    : isCurrentMonth
                                                      ? 'text-foreground'
                                                      : 'text-muted-foreground opacity-40',
                                            )}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                        {dayTasks.length > 0 && (
                                            <span className="text-[10px] font-bold text-muted-foreground/50">
                                                {dayTasks.length}{' '}
                                                {dayTasks.length === 1
                                                    ? 'Task'
                                                    : 'Tasks'}
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        className="flex-1 space-y-1 overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {dayTasks.map((task) => (
                                            <button
                                                key={task.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTaskClick(task);
                                                }}
                                                className={cn(
                                                    'w-full truncate rounded border px-1.5 py-1 text-left text-[10px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-transform active:scale-[0.98]',
                                                    task.priority === 'urgent'
                                                        ? 'border-red-100 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400'
                                                        : task.priority ===
                                                            'high'
                                                          ? 'border-orange-100 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400'
                                                          : task.priority ===
                                                              'medium'
                                                            ? 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400'
                                                            : 'bg-background text-foreground dark:border-slate-800 dark:bg-slate-900',
                                                )}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <div
                                                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                task.space
                                                                    ?.color ||
                                                                '#cbd5e1',
                                                        }}
                                                    />
                                                    <span className="truncate">
                                                        {task.title}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddTask(day);
                                        }}
                                        className="absolute right-1 bottom-1 rounded border bg-background p-1 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-primary dark:bg-slate-900"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <TaskModal
                    space={selectedTask?.space || spaces[0]}
                    members={
                        selectedTask?.space?.members || spaces[0]?.members || []
                    }
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                    statuses={
                        selectedTask?.space?.statuses ||
                        spaces[0]?.statuses ||
                        []
                    }
                    sprints={
                        // Aggregate all sprints from all projects in the space
                        (selectedTask?.space || spaces[0])?.projects?.flatMap(
                            (p) => p.sprints || [],
                        ) || []
                    }
                />
            )}
        </AppLayout>
    );
}
