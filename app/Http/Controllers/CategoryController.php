<?php

namespace App\Http\Controllers; 

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $service
    ) {}

    public function index()
    {
        $pagination = $this->service->getCategories();
        return Inertia::render('categories/index', compact('pagination'));
    }

    public function deleted()
    {
        $onlyTrashed = true;
        $pagination = $this->service->getDeletedCategories();
        return Inertia::render('categories/index', compact('pagination', 'onlyTrashed'));
    }

    public function store(StoreCategoryRequest $request)
    {
        $this->service->store($request->validated());
        return to_route('categories.index')->with('success', 'Kategori berhasil dibuat');
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $this->service->update($category, $request->validated());
        return to_route('categories.index')->with('success', 'Kategori berhasil diperbarui');
    }

    public function destroy(Category $category)
    {
        $this->service->delete($category);
        return to_route('categories.index')->with('success', 'Kategori berhasil dihapus');
    }

    public function restore(int $id)
    {
        $this->service->restore($id);
        return to_route('categories.index')->with('success', 'Kategori berhasil dipulihkan');
    }

    public function options()
    {
        return $this->service->getCategoryOptions();
    }
}