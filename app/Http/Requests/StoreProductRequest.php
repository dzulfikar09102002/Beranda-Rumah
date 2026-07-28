<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim($this->name),
        ]);
    }
    public function rules(): array
    {
        return [
            'category_id'    => 'required|exists:categories,id',
            'name'           => 'required|string|max:255',
            'brand'          => 'required|string|max:255',
            'purchase_price' => 'required|numeric|min:0|max:9999999999999.99',
            'selling_price'  => 'required|numeric|min:0|max:9999999999999.99',
            'minimum_stock'  => 'nullable|integer|min:0',
            'expired_date'   => 'nullable|date|after:today',
        ];
    }
}