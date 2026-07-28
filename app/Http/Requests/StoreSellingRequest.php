<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSellingRequest extends FormRequest
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
        'transaction_date' => ['required', 'date'],

        'items' => ['required', 'array', 'min:1'],

        'items.*.purchase_id'   => ['required', 'integer', 'exists:purchases,id'],
        'items.*.product_id'    => ['required', 'integer', 'exists:products,id'],

        'items.*.name'          => ['required', 'string', 'max:255'],

        'items.*.quantity'      => ['required', 'integer', 'min:1'],

        'items.*.purchase_price'=> ['required', 'numeric', 'min:0'],
        'items.*.selling_price' => ['required', 'numeric', 'min:0'],
        'items.*.discount'      => ['required', 'numeric', 'min:0'],

        'items.*.code'          => ['required', 'string', 'max:50'],

        'items.*.source'        => ['required', 'string', 'in:purchase'],
    ];
}
}
