<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use phpDocumentor\Reflection\PseudoTypes\True_;

class StorePurchaseRequest extends FormRequest
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
        'items' => ['required', 'array', 'min:1'],
        'items.*.supplier_id' => 'nullable|exists:suppliers,id',
        'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
        'items.*.name' => ['required', 'string', 'max:255'],
        'items.*.quantity' => ['required', 'integer', 'min:1'],
        'items.*.purchase_price' => ['required', 'numeric', 'min:0'],
        'items.*.selling_price' => ['required', 'numeric', 'min:0'],
        'items.*.purchase_date' => ['required', 'date'],
        'items.*.source' => ['required', 'string'],
        'items.*.expired_date' => [
            'nullable',
            'date',
            'after:purchase_date',
        ],

        'items.*.year' => ['required', 'integer', 'digits:4'],
        'items.*.code' => ['required', 'string', 'max:50'],
    ];
}
public function withValidator($validator)
{
    $validator->after(function ($validator) {
        foreach ($this->items ?? [] as $index => $item) {
            $product = Product::find($item['product_id']);

            if ($product && $product->has_expired) {
                if (empty($item['expired_date'])) {
                    $validator->errors()->add(
                        "items.$index.expired_date",
                        'Tanggal expired wajib diisi untuk produk ini.'
                    );
                }
            }
        }
    });
}
}

