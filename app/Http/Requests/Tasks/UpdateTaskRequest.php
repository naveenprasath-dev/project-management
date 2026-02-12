<?php

namespace App\Http\Requests\Tasks;

use App\Enums\TaskType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['sometimes', 'nullable', 'exists:projects,id'],
            'status_id' => ['sometimes', 'exists:task_statuses,id'],
            'parent_id' => ['nullable', 'exists:tasks,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', Rule::enum(TaskType::class)],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'due_date' => ['nullable', 'date'],
            'assignee_ids' => ['sometimes', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
            'sprint_id' => ['nullable', 'exists:sprints,id'],
            'order' => ['sometimes', 'integer'],
        ];
    }
}
