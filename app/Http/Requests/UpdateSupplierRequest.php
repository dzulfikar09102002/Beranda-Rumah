<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $supplierId = $this->route('supplier')->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^\S.*$/',
                Rule::unique('suppliers', 'name')->ignore($supplierId),
            ],
            'contact' => [
                'nullable',
                'string',
                'max:16',
            ],
            'address' => [
                'nullable',
                'string',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim($this->name ?? ''),
            'contact' => trim($this->contact ?? ''),
            'address' => trim($this->address ?? ''),
        ]);
    }
}