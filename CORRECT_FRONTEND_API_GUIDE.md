# 🚀 CORRECT FRONTEND API INTEGRATION GUIDE
## Actual Category & Task Management APIs

---

## 📋 **CORRECT API ENDPOINTS**

### **BASE URL:** `http://localhost:5000/api`

---

## 📂 **CATEGORY APIs**

### **1. GET Project Categories**
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
      "taskCount": 5,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "message": "Categories retrieved successfully"
}
```

### **2. GET Single Category**
**Endpoint:** `GET /api/brands/:brandId/projects/:projectId/categories/:categoryId`

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
    "tasks": [],
    "task_count": 0,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Category retrieved successfully"
}
```

### **3. CREATE Category**
**Endpoint:** `POST /api/brands/:brandId/projects/:projectId/categories`

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
**Endpoint:** `PUT /api/brands/:brandId/projects/:projectId/categories/:categoryId`

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "color": "#10B981",
  "description": "Updated description"
}
```

### **5. DELETE Category**
**Endpoint:** `DELETE /api/brands/:brandId/projects/:projectId/categories/:categoryId`

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
**Endpoint:** `PUT /api/brands/:brandId/projects/:projectId/categories-reorder`

**Request Body:**
```json
{
  "category_orders": [
    { "category_id": "68e289b7a1234567890abce3", "order": 0 },
    { "category_id": "68e289b7a1234567890abcde", "order": 1 }
  ]
}
```

### **7. GET Tasks in Category**
**Endpoint:** `GET /api/brands/:brandId/projects/:projectId/categories/:categoryId/tasks`

---

## ✅ **TASK CREATION APIs**

### **CREATE Task in Category**
**Endpoint:** `POST /api/brands/:brandId/tasks`

**Request Body:**
```json
{
  "task": "New Task Name",
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
    "task": "New Task Name",
    "description": "Task description",
    "projectId": "68e289b7a1234567890abcdf",
    "category_id": "68e289b7a1234567890abcde",
    "assignedTo": "68e289b7a1234567890abce1",
    "reporter": "68e289b7a1234567890abce1",
    "eta": "2025-01-15T00:00:00.000Z",
    "priority": "High",
    "status": "Yet to Start",
    "brand_id": "68e289b7a1234567890abce0",
    "createdBy": "68e289b7a1234567890abce1",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Task created successfully"
}
```

### **GET All Tasks in Project**
**Endpoint:** `GET /api/brands/:brandId/tasks?projectId=:projectId`

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "68e289b7a1234567890abce4",
        "task": "New Task Name",
        "description": "Task description",
        "projectId": "68e289b7a1234567890abcdf",
        "category_id": "68e289b7a1234567890abcde",
        "assignedTo": "68e289b7a1234567890abce1",
        "reporter": "68e289b7a1234567890abce1",
        "eta": "2025-01-15T00:00:00.000Z",
        "priority": "High",
        "status": "Yet to Start",
        "brand_id": "68e289b7a1234567890abce0",
        "createdBy": "68e289b7a1234567890abce1",
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalTasks": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "message": "Brand tasks retrieved successfully"
}
```

---

## 🎯 **REQUIRED FIELDS FOR TASK CREATION**

**MANDATORY FIELDS:**
- `task` (string) - Task name (NOT "title")
- `projectId` (string) - Project ID
- `category_id` (string) - Category ID (REQUIRED)
- `assignedTo` (string) - User ID (not username)
- `reporter` (string) - User ID (not username)
- `eta` (string) - Due date in ISO format

**OPTIONAL FIELDS:**
- `description` (string)
- `priority` (string) - "Low", "Medium", "High", "Critical"
- `status` (string) - "Yet to Start", "In Progress", "Completed"

---

## 🎯 **DEFAULT CATEGORIES**

When a project is created, **5 default categories** are automatically created:

1. **Operations** - Blue (#3B82F6)
2. **Ads** - Green (#10B981)
3. **Supply Chain** - Orange (#F59E0B)
4. **Design** - Purple (#8B5CF6)
5. **Misc** - Gray (#6B7280)

---

## ⚠️ **ERROR RESPONSES**

### **Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Task, projectId, category_id, assignedTo, reporter, and eta are required"
  }
}
```

### **Invalid ObjectId:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PROJECT_ID",
    "message": "Invalid project ID provided"
  }
}
```

---

## 💻 **CORRECT FRONTEND INTEGRATION**

### **JavaScript API Service:**

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

  async createCategory(brandId, projectId, categoryData) {
    return this.request('POST', `/brands/${brandId}/projects/${projectId}/categories`, categoryData);
  }

  async reorderCategories(brandId, projectId, categoryOrders) {
    return this.request('PUT', `/brands/${brandId}/projects/${projectId}/categories-reorder`, { category_orders: categoryOrders });
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

// Create task with CORRECT field names
const task = await apiService.createTask(brandId, {
  task: "New Task Name",  // NOT "title"
  projectId: projectId,
  category_id: categoryId,
  assignedTo: userId,
  reporter: userId,
  eta: "2025-01-15T00:00:00.000Z"
});
```

---

## 🧪 **TESTING COMMANDS**

### **Create Task (CORRECT):**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"task":"Test Task","projectId":"PROJECT_ID","category_id":"CATEGORY_ID","assignedTo":"USER_ID","reporter":"USER_ID","eta":"2025-01-15T00:00:00.000Z"}' \
  http://localhost:5000/api/brands/BRAND_ID/tasks
```

### **Get Categories:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/brands/BRAND_ID/projects/PROJECT_ID/categories
```

---

## 🔧 **KEY CORRECTIONS**

1. **Task field is `task` NOT `title`**
2. **Reorder endpoint is `categories-reorder` NOT `categories/reorder`**
3. **All endpoints are under `/api/brands/`**
4. **Task creation requires `task`, `projectId`, `category_id`, `assignedTo`, `reporter`, `eta`**
5. **Response includes `taskCount` for categories**

---

*This is the CORRECT API documentation based on the actual codebase implementation.*
