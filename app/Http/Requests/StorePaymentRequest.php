<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method_id' => [
                'exists:payment_methods,id',
            ],
            'paid_amount' => [
                'numeric',
                'min:0',
            ],
            'purchase_method_id' => [
                'required',
                'numeric',
                'min:0',
            ],
            'change_amount' => [
                'numeric',
                'min:0',
            ],
            'reason' => [
                'nullable'
            ]
        ];
    }

}