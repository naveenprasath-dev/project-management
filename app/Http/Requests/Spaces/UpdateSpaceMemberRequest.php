<?php

namespace App\Http\Requests\Spaces;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSpaceMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'role' => ['required', Rule::in(['admin', 'member', 'viewer'])],
        ];
    }
}
