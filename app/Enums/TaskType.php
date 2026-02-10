<?php

namespace App\Enums;

enum TaskType: string
{
    case Feature = 'feature';
    case Bug = 'bug';
    case Improvement = 'improvement';
    case Task = 'task';
    case Research = 'research';
    case Maintenance = 'maintenance';
    case Security = 'security';

    public function label(): string
    {
        return match ($this) {
            self::Feature => 'Feature',
            self::Bug => 'Bug',
            self::Improvement => 'Improvement',
            self::Task => 'Task',
            self::Research => 'Research',
            self::Maintenance => 'Maintenance',
            self::Security => 'Security',
        };
    }
}
