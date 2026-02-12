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
    isToday
} from 'date-fns';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    MoreHorizontal
} from 'lucide-react';
import { useState } from 'react';
import TaskModal from '@/components/tasks/task-modal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface PageProps {
    tasks: any[];
    spaces: any[];
}

export default function CalendarPage({ tasks, spaces }: PageProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState<any>(null);
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
        return tasks.filter(task => task.due_date && isSameDay(new Date(task.due_date), day));
    };

    const handleTaskClick = (task: any) => {
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

            <div className="flex flex-col h-full bg-background overflow-hidden text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between p-4 px-6 border-b bg-background z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold min-w-[200px]">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h1>
                        <div className="flex items-center border rounded-md overflow-hidden bg-muted/20">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r" onClick={prevMonth}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-none text-[10px] font-bold uppercase tracking-wider border-r" onClick={goToToday}>
                                Today
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={nextMonth}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 mr-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500" /> Urgent
                            </span>
                            <span className="flex items-center gap-1 ml-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500" /> High
                            </span>
                            <span className="flex items-center gap-1 ml-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" /> Med
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="default"
                            className="shadow-sm"
                            onClick={() => handleAddTask(new Date())}
                        >
                            <Plus className="w-4 h-4 mr-2" /> New Task
                        </Button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Days of Week */}
                    <div className="grid grid-cols-7 border-b bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center py-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="flex-1 overflow-y-auto grid grid-cols-7 auto-rows-fr">
                        {calendarDays.map((day, idx) => {
                            const dayTasks = getTasksForDay(day);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isTodayDay = isToday(day);

                            return (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        "min-h-[120px] p-2 border-r border-b group hover:bg-muted/10 transition-colors relative flex flex-col cursor-pointer",
                                        !isCurrentMonth && "bg-muted/5",
                                        idx % 7 === 6 && "border-r-0"
                                    )}
                                    onClick={() => handleAddTask(day)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn(
                                            "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-all",
                                            isTodayDay ? "bg-primary text-primary-foreground shadow-md" : (isCurrentMonth ? "text-foreground" : "text-muted-foreground opacity-40"),
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayTasks.length > 0 && (
                                            <span className="text-[10px] font-bold text-muted-foreground/50">
                                                {dayTasks.length} {dayTasks.length === 1 ? 'Task' : 'Tasks'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                        {dayTasks.map(task => (
                                            <button
                                                key={task.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTaskClick(task);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-1.5 py-1 rounded text-[10px] font-medium truncate border shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-transform active:scale-[0.98]",
                                                    task.priority === 'urgent' ? "bg-red-50 border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400" :
                                                        task.priority === 'high' ? "bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-400" :
                                                            task.priority === 'medium' ? "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400" :
                                                                "bg-background text-foreground dark:bg-slate-900 dark:border-slate-800"
                                                )}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <div
                                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: task.space?.color || '#cbd5e1' }}
                                                    />
                                                    <span className="truncate">{task.title}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddTask(day);
                                        }}
                                        className="absolute bottom-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary bg-background dark:bg-slate-900 rounded border shadow-sm"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
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
                    members={selectedTask?.space?.members || spaces[0]?.members || []}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                    statuses={selectedTask?.space?.statuses || spaces[0]?.statuses || []}
                    sprints={
                        // Aggregate all sprints from all projects in the space
                        (selectedTask?.space || spaces[0])?.projects?.flatMap((p: any) => p.sprints || []) || []
                    }
                />
            )}
        </AppLayout>
    );
}
