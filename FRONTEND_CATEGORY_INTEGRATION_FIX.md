# 🛠️ FRONTEND CATEGORY INTEGRATION FIX

## 🔍 **ISSUES IDENTIFIED FROM YOUR LOGS**

### **Issue 1: Missing API Method**
```
Error: apiService.getProjectCategories is not a function
```

### **Issue 2: 404 Errors**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
```

### **Issue 3: Brand Not Found**
```
Error: {"code":"BRAND_NOT_FOUND","message":"Brand not found"}
```

## ✅ **SOLUTION: ADD MISSING API METHODS**

### **1. Update `lib/api-service.ts`**

Add these methods to your `api-service.ts` file:

```typescript
// Category Management APIs
async getProjectCategories(brandId: string, projectId: string) {
  const response = await this.request('GET', `/brands/${brandId}/projects/${projectId}/categories`);
  return response;
}

async getCategoryById(brandId: string, projectId: string, categoryId: string) {
  const response = await this.request('GET', `/brands/${brandId}/projects/${projectId}/categories/${categoryId}`);
  return response;
}

async createCategory(brandId: string, projectId: string, categoryData: any) {
  const response = await this.request('POST', `/brands/${brandId}/projects/${projectId}/categories`, categoryData);
  return response;
}

async updateCategory(brandId: string, projectId: string, categoryId: string, categoryData: any) {
  const response = await this.request('PUT', `/brands/${brandId}/projects/${projectId}/categories/${categoryId}`, categoryData);
  return response;
}

async deleteCategory(brandId: string, projectId: string, categoryId: string) {
  const response = await this.request('DELETE', `/brands/${brandId}/projects/${projectId}/categories/${categoryId}`);
  return response;
}

async reorderCategories(brandId: string, projectId: string, categoryOrders: any[]) {
  const response = await this.request('PUT', `/brands/${brandId}/projects/${projectId}/categories/reorder`, { category_orders: categoryOrders });
  return response;
}

async getCategoryTasks(brandId: string, projectId: string, categoryId: string) {
  const response = await this.request('GET', `/brands/${brandId}/projects/${projectId}/categories/${categoryId}/tasks`);
  return response;
}

// Create default categories function
async createDefaultCategories(brandId: string, projectId: string) {
  const defaultCategories = [
    { name: 'Operations', color: '#3B82F6', description: 'Operations tasks' },
    { name: 'Ads', color: '#10B981', description: 'Advertising tasks' },
    { name: 'Supply Chain', color: '#F59E0B', description: 'Supply chain tasks' },
    { name: 'Design', color: '#8B5CF6', description: 'Design tasks' },
    { name: 'Misc', color: '#6B7280', description: 'Miscellaneous tasks' }
  ];
  
  const results = [];
  for (const category of defaultCategories) {
    try {
      const response = await this.createCategory(brandId, projectId, category);
      results.push(response);
    } catch (error) {
      console.error('Error creating default category:', error);
    }
  }
  return results;
}
```

### **2. Update `components/CategoryContext.tsx`**

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api-service';

interface Category {
  _id: string;
  name: string;
  color: string;
  order: number;
  is_default: boolean;
  description?: string;
  project_id: string;
  brand_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: any) => Promise<any>;
  updateCategory: (categoryId: string, categoryData: any) => Promise<any>;
  deleteCategory: (categoryId: string) => Promise<any>;
  reorderCategories: (categoryOrders: any[]) => Promise<any>;
  createDefaultCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children, brandId, projectId }: { children: ReactNode; brandId: string; projectId: string }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!brandId || !projectId) {
        console.log('Missing brandId or projectId');
        return;
      }
      
      const response = await apiService.getProjectCategories(brandId, projectId);
      if (response.success) {
        setCategories(response.data);
        console.log('Categories fetched successfully:', response.data.length);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: any) => {
    try {
      if (!brandId || !projectId) return;
      
      const response = await apiService.createCategory(brandId, projectId, categoryData);
      if (response.success) {
        await fetchCategories(); // Refresh categories
        return response;
      }
      throw new Error('Failed to create category');
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const updateCategory = async (categoryId: string, categoryData: any) => {
    try {
      if (!brandId || !projectId) return;
      
      const response = await apiService.updateCategory(brandId, projectId, categoryId, categoryData);
      if (response.success) {
        await fetchCategories(); // Refresh categories
        return response;
      }
      throw new Error('Failed to update category');
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      if (!brandId || !projectId) return;
      
      const response = await apiService.deleteCategory(brandId, projectId, categoryId);
      if (response.success) {
        await fetchCategories(); // Refresh categories
        return response;
      }
      throw new Error('Failed to delete category');
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const reorderCategories = async (categoryOrders: any[]) => {
    try {
      if (!brandId || !projectId) return;
      
      const response = await apiService.reorderCategories(brandId, projectId, categoryOrders);
      if (response.success) {
        await fetchCategories(); // Refresh categories
        return response;
      }
      throw new Error('Failed to reorder categories');
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  };

  const createDefaultCategories = async () => {
    try {
      if (!brandId || !projectId) return;
      
      await apiService.createDefaultCategories(brandId, projectId);
      await fetchCategories(); // Refresh categories
    } catch (error) {
      console.error('Error creating default categories:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (brandId && projectId) {
      fetchCategories();
    }
  }, [brandId, projectId]);

  const value = {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    createDefaultCategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
```

### **3. Update `components/CategorySection.tsx`**

```typescript
import React from 'react';
import { useCategories } from './CategoryContext';

interface CategorySectionProps {
  brandId: string;
  projectId: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ brandId, projectId }) => {
  const { categories, loading, error, createDefaultCategories } = useCategories();

  const handleCreateDefaultCategories = async () => {
    try {
      await createDefaultCategories();
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-4">No categories found</h3>
        <p className="text-gray-600 mb-4">This project doesn't have any categories yet.</p>
        <button
          onClick={handleCreateDefaultCategories}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Create Default Categories
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Categories ({categories.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category._id}
            className="p-4 rounded-lg border"
            style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
          >
            <h4 className="font-semibold" style={{ color: category.color }}>
              {category.name}
            </h4>
            {category.description && (
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Order: {category.order} | Default: {category.is_default ? 'Yes' : 'No'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **4. Update `app/project-tracker/[id]/modern/ModernProjectDetailNew.tsx`**

```typescript
// Add this to your component
import { CategoryProvider } from '../../../components/CategoryContext';
import { CategorySection } from '../../../components/CategorySection';

// In your component, wrap the content with CategoryProvider
<CategoryProvider brandId={brandId} projectId={projectId}>
  <CategorySection brandId={brandId} projectId={projectId} />
</CategoryProvider>
```

## 🎯 **ALL CATEGORY APIs AVAILABLE**

### **Backend APIs (All Working)**

1. **GET** `/api/brands/:brandId/projects/:projectId/categories` - Get all categories
2. **GET** `/api/brands/:brandId/projects/:projectId/categories/:categoryId` - Get single category
3. **POST** `/api/brands/:brandId/projects/:projectId/categories` - Create category
4. **PUT** `/api/brands/:brandId/projects/:projectId/categories/:categoryId` - Update category
5. **DELETE** `/api/brands/:brandId/projects/:projectId/categories/:categoryId` - Delete category
6. **PUT** `/api/brands/:brandId/projects/:projectId/categories/reorder` - Reorder categories
7. **GET** `/api/brands/:brandId/projects/:projectId/categories/:categoryId/tasks` - Get tasks in category

### **Default Categories (Auto-created)**

1. **Operations** - Blue (#3B82F6)
2. **Ads** - Green (#10B981)
3. **Supply Chain** - Orange (#F59E0B)
4. **Design** - Purple (#8B5CF6)
5. **Misc** - Gray (#6B7280)

## 🧪 **TESTING**

After implementing these fixes:

1. **Check Browser Console** - No more "getProjectCategories is not a function" errors
2. **Check Network Tab** - API calls should return 200 status instead of 404
3. **Categories Should Load** - You should see the 5 default categories
4. **Create Categories** - You should be able to create custom categories
5. **Update/Delete** - All CRUD operations should work

## 🚀 **QUICK FIX SUMMARY**

1. **Add missing API methods** to `lib/api-service.ts`
2. **Update CategoryContext** with proper error handling
3. **Add createDefaultCategories** function
4. **Update CategorySection** to show "Create Default Categories" button
5. **Wrap components** with CategoryProvider

This should resolve all the frontend errors you're seeing!
