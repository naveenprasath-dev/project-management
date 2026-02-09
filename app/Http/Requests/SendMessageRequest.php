<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:5000'],
            'space_id' => ['nullable', 'exists:spaces,id'],
            'task_id' => ['nullable', 'exists:tasks,id'],
        ];
    }
}
