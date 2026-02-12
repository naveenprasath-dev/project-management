<?php

namespace App\Http\Requests\Tasks;

use App\Enums\TaskType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'space_id' => ['required', 'exists:spaces,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'status_id' => ['required', 'exists:task_statuses,id'],
            'parent_id' => ['nullable', 'exists:tasks,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', Rule::enum(TaskType::class)],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'due_date' => ['nullable', 'date'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
            'sprint_id' => ['nullable', 'exists:sprints,id'],
            'order' => ['integer'],
        ];
    }
}
