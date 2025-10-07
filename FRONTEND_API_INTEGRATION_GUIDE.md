# 🚀 FRONTEND API INTEGRATION GUIDE
## Complete Category & Task Management APIs

---

## 📋 **TABLE OF CONTENTS**

1. [Authentication](#authentication)
2. [Category APIs](#category-apis)
3. [Task Creation APIs](#task-creation-apis)
4. [Default Categories](#default-categories)
5. [Error Handling](#error-handling)
6. [Frontend Integration Examples](#frontend-integration-examples)
7. [Testing Commands](#testing-commands)

---

## 🔐 **AUTHENTICATION**

All APIs require authentication via JWT token in the Authorization header:

```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

---

## 📂 **CATEGORY APIs**

### **1. GET Project Categories**
Get all categories for a specific project.

**Endpoint:** `GET /api/brands/:brandId/projects/:projectId/categories`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>'
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e289b7a1234567890abcde",
      "name": "Operations",
      "color": "#3B82F6",
      "order": 0,
      "is_default": true,
      "description": "Operations tasks",
      "project_id": "68e289b7a1234567890abcdf",
      "brand_id": "68e289b7a1234567890abce0",
      "created_by": "68e289b7a1234567890abce1",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "68e289b7a1234567890abce3",
      "name": "Marketing",
      "color": "#FF6B6B",
      "order": 1,
      "is_default": false,
      "description": "Marketing tasks",
      "project_id": "68e289b7a1234567890abcdf",
      "brand_id": "68e289b7a1234567890abce0",
      "created_by": "68e289b7a1234567890abce1",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "message": "Categories retrieved successfully"
}
```

### **2. GET Single Category**
Get a specific category with its tasks.

**Endpoint:** `GET /api/brands/:brandId/projects/:projectId/categories/:categoryId`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>'
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abcde",
    "name": "Operations",
    "color": "#3B82F6",
    "order": 0,
    "is_default": true,
    "description": "Operations tasks",
    "project_id": "68e289b7a1234567890abcdf",
    "brand_id": "68e289b7a1234567890abce0",
    "created_by": "68e289b7a1234567890abce1",
    "tasks": [
      {
        "_id": "68e289b7a1234567890abce2",
        "title": "Task Name",
        "status": "Yet to Start",
        "priority": "High"
      }
    ],
    "task_count": 1,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Category retrieved successfully"
}
```

### **3. CREATE Category**
Create a new custom category.

**Endpoint:** `POST /api/brands/:brandId/projects/:projectId/categories`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Request Body:**
```json
{
  "name": "Marketing",
  "color": "#FF6B6B",
  "description": "Marketing related tasks"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce3",
    "name": "Marketing",
    "color": "#FF6B6B",
    "order": 5,
    "is_default": false,
    "description": "Marketing related tasks",
    "project_id": "68e289b7a1234567890abcdf",
    "brand_id": "68e289b7a1234567890abce0",
    "created_by": "68e289b7a1234567890abce1",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Category created successfully"
}
```

### **4. UPDATE Category**
Update an existing category.

**Endpoint:** `PUT /api/brands/:brandId/projects/:projectId/categories/:categoryId`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "color": "#10B981",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce3",
    "name": "Updated Category Name",
    "color": "#10B981",
    "order": 5,
    "is_default": false,
    "description": "Updated description",
    "project_id": "68e289b7a1234567890abcdf",
    "brand_id": "68e289b7a1234567890abce0",
    "created_by": "68e289b7a1234567890abce1",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Category updated successfully"
}
```

### **5. DELETE Category**
Delete a category and all tasks inside it.

**Endpoint:** `DELETE /api/brands/:brandId/projects/:projectId/categories/:categoryId`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>'
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted_category": {
      "_id": "68e289b7a1234567890abce3",
      "name": "Marketing"
    },
    "deleted_tasks_count": 3
  },
  "message": "Category and associated tasks deleted successfully"
}
```

### **6. REORDER Categories**
Reorder categories (drag & drop functionality).

**Endpoint:** `PUT /api/brands/:brandId/projects/:projectId/categories/reorder`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Request Body:**
```json
{
  "category_orders": [
    { "category_id": "68e289b7a1234567890abce3", "order": 0 },
    { "category_id": "68e289b7a1234567890abcde", "order": 1 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_categories": [
      {
        "_id": "68e289b7a1234567890abce3",
        "name": "Marketing",
        "order": 0
      },
      {
        "_id": "68e289b7a1234567890abcde",
        "name": "Operations",
        "order": 1
      }
    ]
  },
  "message": "Categories reordered successfully"
}
```

### **7. GET Tasks in Category**
Get all tasks within a specific category.

**Endpoint:** `GET /api/brands/:brandId/projects/:projectId/categories/:categoryId/tasks`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>'
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "68e289b7a1234567890abcde",
      "name": "Operations",
      "color": "#3B82F6"
    },
    "tasks": [
      {
        "_id": "68e289b7a1234567890abce2",
        "title": "Task Name",
        "status": "Yet to Start",
        "priority": "High",
        "assignedTo": "68e289b7a1234567890abce1",
        "reporter": "68e289b7a1234567890abce1",
        "eta": "2025-01-15T00:00:00.000Z",
        "category_id": "68e289b7a1234567890abcde",
        "created_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "task_count": 1
  },
  "message": "Category tasks retrieved successfully"
}
```

---

## ✅ **TASK CREATION APIs**

### **CREATE Task in Category**
Create a new task within a specific category.

**Endpoint:** `POST /api/brands/:brandId/tasks`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Request Body:**
```json
{
  "title": "New Task Name",
  "description": "Task description",
  "projectId": "68e289b7a1234567890abcdf",
  "category_id": "68e289b7a1234567890abcde",
  "assignedTo": "68e289b7a1234567890abce1",
  "reporter": "68e289b7a1234567890abce1",
  "eta": "2025-01-15T00:00:00.000Z",
  "priority": "High",
  "status": "Yet to Start"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce4",
    "title": "New Task Name",
    "description": "Task description",
    "projectId": "68e289b7a1234567890abcdf",
    "category_id": "68e289b7a1234567890abcde",
    "assignedTo": "68e289b7a1234567890abce1",
    "reporter": "68e289b7a1234567890abce1",
    "eta": "2025-01-15T00:00:00.000Z",
    "priority": "High",
    "status": "Yet to Start",
    "brand_id": "68e289b7a1234567890abce0",
    "created_by": "68e289b7a1234567890abce1",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Task created successfully"
}
```

### **GET All Tasks in Project**
Get all tasks for a specific project.

**Endpoint:** `GET /api/brands/:brandId/tasks?projectId=:projectId`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>'
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e289b7a1234567890abce4",
      "title": "New Task Name",
      "description": "Task description",
      "projectId": "68e289b7a1234567890abcdf",
      "category_id": "68e289b7a1234567890abcde",
      "assignedTo": "68e289b7a1234567890abce1",
      "reporter": "68e289b7a1234567890abce1",
      "eta": "2025-01-15T00:00:00.000Z",
      "priority": "High",
      "status": "Yet to Start",
      "brand_id": "68e289b7a1234567890abce0",
      "created_by": "68e289b7a1234567890abce1",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "message": "Brand tasks retrieved successfully"
}
```

---

## 🎯 **DEFAULT CATEGORIES**

When a project is created, **5 default categories** are automatically created:

1. **Operations** - Blue (#3B82F6)
2. **Ads** - Green (#10B981)
3. **Supply Chain** - Orange (#F59E0B)
4. **Design** - Purple (#8B5CF6)
5. **Misc** - Gray (#6B7280)

---

## ⚠️ **ERROR HANDLING**

### **Common Error Responses:**

**Invalid JSON:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_JSON",
    "message": "Invalid JSON format in request body"
  }
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Task, projectId, category_id, assignedTo, reporter, and eta are required"
  }
}
```

**Category Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_NOT_FOUND",
    "message": "Category not found"
  }
}
```

**Invalid ObjectId:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CATEGORY_ID",
    "message": "Invalid category_id. Please provide a valid category ID."
  }
}
```

---

## 💻 **FRONTEND INTEGRATION EXAMPLES**

### **React/JavaScript API Service:**

```javascript
class ApiService {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  async request(method, endpoint, data = null) {
    const token = localStorage.getItem('token');
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data && method !== 'GET') {
      config.data = data;
    }
    
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Category APIs
  async getProjectCategories(brandId, projectId) {
    return this.request('GET', `/brands/${brandId}/projects/${projectId}/categories`);
  }

  async getCategoryById(brandId, projectId, categoryId) {
    return this.request('GET', `/brands/${brandId}/projects/${projectId}/categories/${categoryId}`);
  }

  async createCategory(brandId, projectId, categoryData) {
    return this.request('POST', `/brands/${brandId}/projects/${projectId}/categories`, categoryData);
  }

  async updateCategory(brandId, projectId, categoryId, categoryData) {
    return this.request('PUT', `/brands/${brandId}/projects/${projectId}/categories/${categoryId}`, categoryData);
  }

  async deleteCategory(brandId, projectId, categoryId) {
    return this.request('DELETE', `/brands/${brandId}/projects/${projectId}/categories/${categoryId}`);
  }

  async reorderCategories(brandId, projectId, categoryOrders) {
    return this.request('PUT', `/brands/${brandId}/projects/${projectId}/categories/reorder`, { category_orders: categoryOrders });
  }

  async getCategoryTasks(brandId, projectId, categoryId) {
    return this.request('GET', `/brands/${brandId}/projects/${projectId}/categories/${categoryId}/tasks`);
  }

  // Task APIs
  async createTask(brandId, taskData) {
    return this.request('POST', `/brands/${brandId}/tasks`, taskData);
  }

  async getProjectTasks(brandId, projectId) {
    return this.request('GET', `/brands/${brandId}/tasks?projectId=${projectId}`);
  }
}

// Usage example
const apiService = new ApiService();

// Get categories
const categories = await apiService.getProjectCategories(brandId, projectId);

// Create task
const task = await apiService.createTask(brandId, {
  title: "New Task",
  projectId: projectId,
  category_id: categoryId,
  assignedTo: userId,
  reporter: userId,
  eta: "2025-01-15T00:00:00.000Z"
});
```

### **React Hook Example:**

```javascript
import { useState, useEffect } from 'react';

const useCategories = (brandId, projectId) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjectCategories(brandId, projectId);
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const response = await apiService.createCategory(brandId, projectId, categoryData);
      if (response.success) {
        await fetchCategories(); // Refresh categories
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (brandId && projectId) {
      fetchCategories();
    }
  }, [brandId, projectId]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory
  };
};
```

---

## 🧪 **TESTING COMMANDS**

### **Health Check:**
```bash
curl http://localhost:5000/api/health
```

### **Get Categories:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/brands/BRAND_ID/projects/PROJECT_ID/categories
```

### **Create Category:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Marketing","color":"#FF6B6B","description":"Marketing tasks"}' \
  http://localhost:5000/api/brands/BRAND_ID/projects/PROJECT_ID/categories
```

### **Create Task:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","projectId":"PROJECT_ID","category_id":"CATEGORY_ID","assignedTo":"USER_ID","reporter":"USER_ID","eta":"2025-01-15T00:00:00.000Z"}' \
  http://localhost:5000/api/brands/BRAND_ID/tasks
```

---

## 📝 **REQUIRED FIELDS**

### **For Task Creation:**
- `title` (string) - Task name
- `projectId` (string) - Project ID
- `category_id` (string) - Category ID (REQUIRED)
- `assignedTo` (string) - User ID (not username)
- `reporter` (string) - User ID (not username)
- `eta` (string) - Due date in ISO format

### **For Category Creation:**
- `name` (string) - Category name
- `color` (string) - Hex color code (optional)
- `description` (string) - Category description (optional)

---

## 🚀 **QUICK START**

1. **Set up authentication** - Get JWT token from login
2. **Get project categories** - Use GET categories API
3. **Create tasks** - Use POST task API with category_id
4. **Handle errors** - Check for success/error responses
5. **Update UI** - Refresh data after create/update/delete operations

---

## 📞 **SUPPORT**

If you encounter any issues:
1. Check the server logs for detailed error messages
2. Verify all required fields are provided
3. Ensure proper JSON formatting
4. Check authentication token validity

**Server URL:** `http://localhost:5000/api`
**WebSocket:** `ws://localhost:5000/api/ws`

---

*This guide contains all the APIs needed for Category and Task management integration with your frontend application.*
