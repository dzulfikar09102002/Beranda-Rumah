<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesSummaryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'actual_cash' => ['required', 'numeric', 'min:0'],
            'starting_cash' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    /**
     * Custom message validation (Opsional)
     */
    public function messages(): array
    {
        return [
            'actual_cash.required' => 'Nominal uang fisik kas wajib diisi.',
            'actual_cash.numeric' => 'Nominal uang fisik kas harus berupa angka.',
            'actual_cash.min' => 'Nominal uang fisik kas tidak boleh minus.',
        ];
    }
}