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
            'url_image' => $this->filled('url_image') ? trim($this->url_image) : null,
        ]);
    }
    public function rules(): array
    {
        return [
            'category_id'    => 'required|exists:categories,id',
            'name'           => 'required|string|max:255',
            'purchase_price' => 'required|numeric|min:0|max:9999999999999.99',
            'selling_price'  => 'required|numeric|min:0|max:9999999999999.99',
            'url_image'      => 'nullable|url:http,https|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'url_image.url' => 'URL gambar tidak valid (harus diawali http:// atau https://).',
            'url_image.max' => 'URL gambar maksimal 500 karakter.',
        ];
    }

}