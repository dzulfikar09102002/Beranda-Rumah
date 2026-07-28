<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'quantity' => ['required', 'integer', 'min:1'],
            'year' => ['required', 'integer', 'digits:4'],

            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],

            'purchase_date' => ['required', 'date'],

            'expired_date' => [
                'nullable',
                'date',
                'after:purchase_date',
            ],

            'supplier_id' => [
                'nullable',
                'integer',
                'exists:suppliers,id',
            ],

            'source' => [
                'required',
                'string',
                Rule::in([
                    'purchase',
                    'consignment',
                    'sale',
                    'adjustment',
                    'return',
                    'transfer',
                    'other',
                    'damage',
                    'expired',
                ]),
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $purchase = $this->route('purchase');

            if (!$purchase) {
                return;
            }

            $product = $purchase->product;

            if ($product?->has_expired && empty($this->expired_date)) {
                $validator->errors()->add(
                    'expired_date',
                    'Tanggal expired wajib diisi untuk produk ini.'
                );
            }

            if ($this->source === 'consignment' && empty($this->supplier_id)) {
                $validator->errors()->add(
                    'supplier_id',
                    'Supplier wajib diisi untuk barang titipan.'
                );
            }
        });
    }
}
