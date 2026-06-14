export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { LucideIcon } from 'lucide-react';
import type { Auth } from './auth';

export type TaskStatus = {
    id: number;
    name: string;
    color: string;
    category?: string;
};

export type SpaceMember = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
};

export type Sprint = {
    id: number;
    name: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status?: 'planned' | 'active' | 'completed';
    goal?: string | null;
    tasks_count?: number;
    tasks?: Task[];
    archived_at?: string | null;
};

export type Task = {
    id: number;
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    due_date?: string;
    status_id?: number;
    status?: TaskStatus;
    assignees?: SpaceMember[];
    parent?: Task;
    children?: Task[];
    sprint?: Sprint;
    project_id?: number | null;
    archived_at?: string | null;
    [key: string]: unknown;
};

export type Project = {
    id: number;
    name: string;
    slug: string;
    description?: string;
    tasks?: Task[];
    statuses?: TaskStatus[];
    sprints?: Sprint[];
    members?: SpaceMember[];
    archived_at?: string | null;
    [key: string]: unknown;
};

export type Space = {
    id: number;
    name: string;
    slug: string;
    color?: string;
    description?: string;
    projects?: Project[];
    members?: SpaceMember[];
    statuses?: TaskStatus[];
    tasks?: Task[];
    analytics?: {
        total_tasks: number;
        completed_tasks: number;
        completion_rate: number;
        total_members: number;
        total_projects: number;
    };
    [key: string]: unknown;
};

export type TaskTypeIcon = {
    icon: LucideIcon;
    color: string;
};

export type SharedData = {
    name: string;
    auth: Auth & { spaces?: Space[] };
    sidebarOpen: boolean;
    space?: Space;
    [key: string]: unknown;
};
