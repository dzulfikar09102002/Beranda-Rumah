<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
   public function rules(): array
{
    return [
        'date' => ['required'],

        'total_sales' => ['required', 'numeric'],

        'total_transactions' => ['required', 'numeric'],

        'details' => ['required', 'array'],

        'details.*' => ['required', 'array'],

        'details.*.payment_method_id' => ['required'],

        'details.*.total_amount' => ['required'],

        'details.*.total_transactions' => ['required'],
    ];
}
}
