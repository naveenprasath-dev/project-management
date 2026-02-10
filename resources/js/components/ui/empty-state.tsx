import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed rounded-xl bg-muted/10", className)}>
            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <h3 className="text-base font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
            {action && (
                <Button onClick={action.onClick} variant="outline" className="mt-4">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
