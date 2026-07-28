<?php

namespace App\Services;

use App\Models\Category;

class CategoryService
{
    public function getCategories()
    {
        $search = request('search', '');
        $perPage = request('per_page', 10);

        return Category::when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getDeletedCategories()
    {
        $search = request('search', '');
        $perPage = request('per_page', 10);

        return Category::onlyTrashed()
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    public function store(array $input)
    {
        $user = auth()->user();
        return Category::create([
            'name'       => $input['name'],
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    public function update(Category $category, array $input)
    {
        return $category->update([
            'name'       => $input['name'],
            'updated_by' => auth()->user()->id,
        ]);
    }

    // Hapus kategori
    public function delete(Category $category)
    {
        $category->update([
            'deleted_by' => auth()->user()->id,
        ]);

        return $category->delete(); 
    }

    public function restore(int $id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        return $category->restore();
    }

    public function getCategoryOptions()
    {
        return Category::select('id', 'name')->get();
    }
}