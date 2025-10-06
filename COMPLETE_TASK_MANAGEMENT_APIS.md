# 🚀 COMPLETE TASK MANAGEMENT APIs
## Frontend Integration Guide - Post Category System Implementation

---

## 📋 **BASE URL:** `http://localhost:5000/api`

---

## 🎯 **AUTHENTICATION**
All APIs require JWT token in Authorization header:
```javascript
headers: {
  'Authorization': 'Bearer <your_jwt_token>',
  'Content-Type': 'application/json'
}
```

---

## 📂 **TASK MANAGEMENT APIs**

### **1. CREATE TASK**
**Endpoint:** `POST /api/brands/:brandId/tasks`

**Request Body:**
```json
{
  "task": "Task Name",
  "description": "Task description",
  "projectId": "68e289b7a1234567890abcdf",
  "category_id": "68e289b7a1234567890abcde",
  "assignedTo": "68e289b7a1234567890abce1",
  "reporter": "68e289b7a1234567890abce1",
  "eta": "2025-01-15T00:00:00.000Z",
  "priority": "High",
  "status": "Yet to Start",
  "startDate": "2025-01-01T00:00:00.000Z",
  "estimatedHours": 8,
  "labels": ["urgent", "frontend"],
  "remark": "Additional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce4",
    "task": "Task Name",
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

### **2. GET ALL TASKS**
**Endpoint:** `GET /api/brands/:brandId/tasks`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `assignedTo` (optional): Filter by assignee
- `projectId` (optional): Filter by project
- `search` (optional): Search in task name/description

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTasks": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Brand tasks retrieved successfully"
}
```

### **3. GET TASK BY ID**
**Endpoint:** `GET /api/brands/:brandId/tasks/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce4",
    "task": "Task Name",
    "description": "Task description",
    "projectId": "68e289b7a1234567890abcdf",
    "category_id": "68e289b7a1234567890abcde",
    "assignedTo": {
      "_id": "68e289b7a1234567890abce1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "reporter": {
      "_id": "68e289b7a1234567890abce1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "eta": "2025-01-15T00:00:00.000Z",
    "priority": "High",
    "status": "Yet to Start",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Task retrieved successfully"
}
```

### **4. UPDATE TASK**
**Endpoint:** `PUT /api/brands/:brandId/tasks/:id`

**Request Body:**
```json
{
  "task": "Updated Task Name",
  "description": "Updated description",
  "priority": "Medium",
  "status": "In Progress",
  "eta": "2025-01-20T00:00:00.000Z",
  "startDate": "2025-01-02T00:00:00.000Z",
  "estimatedHours": 12,
  "actualHours": 4,
  "remark": "Updated notes",
  "labels": ["updated", "backend"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce4",
    "task": "Updated Task Name",
    "description": "Updated description",
    "priority": "Medium",
    "status": "In Progress",
    "eta": "2025-01-20T00:00:00.000Z",
    "actualHours": 4,
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Task updated successfully"
}
```

### **5. DELETE TASK**
**Endpoint:** `DELETE /api/brands/:brandId/tasks/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted_task": {
      "_id": "68e289b7a1234567890abce4",
      "task": "Updated Task Name"
    }
  },
  "message": "Task deleted successfully"
}
```

### **6. UPDATE TASK STATUS**
**Endpoint:** `PUT /api/brands/:brandId/tasks/:id/status`

**Request Body:**
```json
{
  "status": "In Progress"
}
```

**Valid Statuses:** `"Yet to Start"`, `"In Progress"`, `"Completed"`, `"Blocked"`, `"On Hold"`, `"Cancelled"`, `"Recurring"`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce4",
    "task": "Task Name",
    "status": "In Progress",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Task status updated successfully"
}
```

### **7. UPDATE TASK PRIORITY**
**Endpoint:** `PUT /api/brands/:brandId/tasks/:id/priority`

**Request Body:**
```json
{
  "priority": "Critical"
}
```

**Valid Priorities:** `"Critical"`, `"High"`, `"Medium"`, `"Low"`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce4",
    "task": "Task Name",
    "priority": "Critical",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Task priority updated successfully"
}
```

### **8. ASSIGN TASK**
**Endpoint:** `POST /api/brands/:brandId/tasks/:id/assign`

**Request Body:**
```json
{
  "assignedTo": "68e289b7a1234567890abce1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce4",
    "task": "Task Name",
    "assignedTo": {
      "_id": "68e289b7a1234567890abce1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Task assigned successfully"
}
```

### **9. UNASSIGN TASK**
**Endpoint:** `POST /api/brands/:brandId/tasks/:id/unassign`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce4",
    "task": "Task Name",
    "assignedTo": null,
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Task unassigned successfully"
}
```

### **10. GET PROJECT TASKS**
**Endpoint:** `GET /api/brands/:brandId/projects/:projectId/tasks`

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalTasks": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Project tasks retrieved successfully"
}
```

---

## 📝 **SUBTASK MANAGEMENT APIs**

### **1. CREATE SUBTASK**
**Endpoint:** `POST /api/brands/:brandId/subtasks`

**Request Body:**
```json
{
  "task": "Subtask Name",
  "description": "Subtask description",
  "taskId": "68e289b7a1234567890abce4",
  "assignedTo": "68e289b7a1234567890abce1",
  "reporter": "68e289b7a1234567890abce1",
  "priority": "Medium",
  "status": "To Do",
  "eta": "2025-01-10T00:00:00.000Z",
  "estimatedHours": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce5",
    "task": "Subtask Name",
    "description": "Subtask description",
    "taskId": "68e289b7a1234567890abce4",
    "assignedTo": "68e289b7a1234567890abce1",
    "reporter": "68e289b7a1234567890abce1",
    "priority": "Medium",
    "status": "To Do",
    "eta": "2025-01-10T00:00:00.000Z",
    "brand_id": "68e289b7a1234567890abce0",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Subtask created successfully"
}
```

### **2. GET ALL SUBTASKS**
**Endpoint:** `GET /api/brands/:brandId/subtasks`

**Query Parameters:**
- `page`, `limit`, `status`, `priority`, `assignedTo`, `search` (same as tasks)

**Response:**
```json
{
  "success": true,
  "data": {
    "subtasks": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalSubtasks": 15,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Brand subtasks retrieved successfully"
}
```

### **3. GET SUBTASK BY ID**
**Endpoint:** `GET /api/brands/:brandId/subtasks/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce5",
    "task": "Subtask Name",
    "description": "Subtask description",
    "taskId": "68e289b7a1234567890abce4",
    "assignedTo": {
      "_id": "68e289b7a1234567890abce1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "priority": "Medium",
    "status": "To Do",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Subtask retrieved successfully"
}
```

### **4. UPDATE SUBTASK**
**Endpoint:** `PUT /api/brands/:brandId/subtasks/:id`

**Request Body:**
```json
{
  "task": "Updated Subtask Name",
  "description": "Updated description",
  "priority": "High",
  "status": "In Progress",
  "eta": "2025-01-12T00:00:00.000Z",
  "estimatedHours": 6,
  "actualHours": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce5",
    "task": "Updated Subtask Name",
    "description": "Updated description",
    "priority": "High",
    "status": "In Progress",
    "actualHours": 2,
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Subtask updated successfully"
}
```

### **5. DELETE SUBTASK**
**Endpoint:** `DELETE /api/brands/:brandId/subtasks/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted_subtask": {
      "_id": "68e289b7a1234567890abce5",
      "task": "Updated Subtask Name"
    }
  },
  "message": "Subtask deleted successfully"
}
```

### **6. UPDATE SUBTASK STATUS**
**Endpoint:** `PUT /api/brands/:brandId/subtasks/:id/status`

**Request Body:**
```json
{
  "status": "Completed"
}
```

**Valid Statuses:** `"To Do"`, `"In Progress"`, `"Completed"`, `"Blocked"`, `"On Hold"`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce5",
    "task": "Subtask Name",
    "status": "Completed",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Subtask status updated successfully"
}
```

### **7. UPDATE SUBTASK PRIORITY**
**Endpoint:** `PUT /api/brands/:brandId/subtasks/:id/priority`

**Request Body:**
```json
{
  "priority": "Critical"
}
```

**Valid Priorities:** `"Critical"`, `"High"`, `"Medium"`, `"Low"`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce5",
    "task": "Subtask Name",
    "priority": "Critical",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Subtask priority updated successfully"
}
```

### **8. ASSIGN SUBTASK**
**Endpoint:** `POST /api/brands/:brandId/subtasks/:id/assign`

**Request Body:**
```json
{
  "assignedTo": "68e289b7a1234567890abce1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce5",
    "task": "Subtask Name",
    "assignedTo": {
      "_id": "68e289b7a1234567890abce1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Subtask assigned successfully"
}
```

### **9. UNASSIGN SUBTASK**
**Endpoint:** `POST /api/brands/:brandId/subtasks/:id/unassign`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce5",
    "task": "Subtask Name",
    "assignedTo": null,
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Subtask unassigned successfully"
}
```

### **10. GET TASK SUBTASKS**
**Endpoint:** `GET /api/brands/:brandId/tasks/:taskId/subtasks`

**Response:**
```json
{
  "success": true,
  "data": {
    "subtasks": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalSubtasks": 3,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "message": "Brand task subtasks retrieved successfully"
}
```

### **11. COMPLETE SUBTASK**
**Endpoint:** `PUT /api/brands/:brandId/subtasks/:id/complete`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce5",
    "task": "Subtask Name",
    "status": "Completed",
    "completed_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Subtask completed successfully"
}
```

### **12. UNCOMPLETE SUBTASK**
**Endpoint:** `PUT /api/brands/:brandId/subtasks/:id/uncomplete`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce5",
    "task": "Subtask Name",
    "status": "To Do",
    "completed_at": null,
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Subtask uncompleted successfully"
}
```

---

## 💬 **COMMENT MANAGEMENT APIs**

### **1. GET TASK COMMENTS**
**Endpoint:** `GET /api/brands/:brandId/tasks/:taskId/comments`

**Query Parameters:**
- `limit` (optional): Number of comments (default: 20)
- `offset` (optional): Skip comments (default: 0)
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'desc')
- `thread` (optional): Include replies (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e289b7a1234567890abce6",
      "content": "This is a comment",
      "contentHtml": "<p>This is a comment</p>",
      "author": {
        "_id": "68e289b7a1234567890abce1",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "avatar_url"
      },
      "mentions": [],
      "reactions": [],
      "status": "active",
      "type": "comment",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "replies": []
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "message": "Comments retrieved successfully"
}
```

### **2. CREATE COMMENT**
**Endpoint:** `POST /api/brands/:brandId/tasks/:taskId/comments`

**Request Body:**
```json
{
  "content": "This is a new comment with **markdown** support",
  "mentions": [
    {
      "user_id": "68e289b7a1234567890abce1",
      "position": 15,
      "length": 8
    }
  ],
  "links": [
    {
      "url": "https://example.com",
      "title": "Example Link",
      "type": "external"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce6",
    "content": "This is a new comment with **markdown** support",
    "contentHtml": "<p>This is a new comment with <strong>markdown</strong> support</p>",
    "author": {
      "_id": "68e289b7a1234567890abce1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "avatar_url"
    },
    "mentions": [
      {
        "user_id": {
          "_id": "68e289b7a1234567890abce1",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "position": 15,
        "length": 8
      }
    ],
    "links": [
      {
        "url": "https://example.com",
        "title": "Example Link",
        "type": "external"
      }
    ],
    "status": "active",
    "type": "comment",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Comment created successfully"
}
```

### **3. UPDATE COMMENT**
**Endpoint:** `PUT /api/brands/:brandId/comments/:id`

**Request Body:**
```json
{
  "content": "Updated comment content with **new markdown**"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce6",
    "content": "Updated comment content with **new markdown**",
    "contentHtml": "<p>Updated comment content with <strong>new markdown</strong></p>",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Comment updated successfully"
}
```

### **4. DELETE COMMENT**
**Endpoint:** `DELETE /api/brands/:brandId/comments/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted_comment": {
      "_id": "68e289b7a1234567890abce6",
      "content": "Updated comment content"
    }
  },
  "message": "Comment deleted successfully"
}
```

### **5. REPLY TO COMMENT**
**Endpoint:** `POST /api/brands/:brandId/comments/:id/reply`

**Request Body:**
```json
{
  "content": "This is a reply to the comment",
  "mentions": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce7",
    "content": "This is a reply to the comment",
    "contentHtml": "<p>This is a reply to the comment</p>",
    "author": {
      "_id": "68e289b7a1234567890abce1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "avatar_url"
    },
    "parentCommentId": "68e289b7a1234567890abce6",
    "status": "active",
    "type": "reply",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Reply created successfully"
}
```

### **6. GET COMMENT THREAD**
**Endpoint:** `GET /api/brands/:brandId/comments/:id/thread`

**Response:**
```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "68e289b7a1234567890abce6",
      "content": "Original comment",
      "author": {...},
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    "replies": [
      {
        "_id": "68e289b7a1234567890abce7",
        "content": "Reply 1",
        "author": {...},
        "created_at": "2025-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "Comment thread retrieved successfully"
}
```

### **7. REACT TO COMMENT**
**Endpoint:** `POST /api/brands/:brandId/comments/:id/react`

**Request Body:**
```json
{
  "reaction": "👍"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce6",
    "reactions": [
      {
        "userId": {
          "_id": "68e289b7a1234567890abce1",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "reaction": "👍",
        "created_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Reaction added successfully"
}
```

### **8. REMOVE REACTION**
**Endpoint:** `DELETE /api/brands/:brandId/comments/:id/react`

**Request Body:**
```json
{
  "reaction": "👍"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce6",
    "reactions": [],
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Reaction removed successfully"
}
```

### **9. PIN COMMENT**
**Endpoint:** `PUT /api/brands/:brandId/comments/:id/pin`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce6",
    "isPinned": true,
    "pinned_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Comment pinned successfully"
}
```

### **10. UNPIN COMMENT**
**Endpoint:** `PUT /api/brands/:brandId/comments/:id/unpin`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e289b7a1234567890abce6",
    "isPinned": false,
    "pinned_at": null,
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Comment unpinned successfully"
}
```

---

## 🔍 **SEARCH & FILTER APIs**

### **1. SEARCH TASKS**
**Endpoint:** `GET /api/brands/:brandId/tasks/search`

**Query Parameters:**
- `q`: Search query
- `page`, `limit`: Pagination
- `status`, `priority`, `assignedTo`: Filters

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {...},
    "searchQuery": "search term"
  },
  "message": "Task search completed successfully"
}
```

### **2. FILTER TASKS**
**Endpoint:** `GET /api/brands/:brandId/tasks/filter`

**Query Parameters:**
- `status`: Filter by status
- `priority`: Filter by priority
- `assignedTo`: Filter by assignee
- `projectId`: Filter by project
- `category_id`: Filter by category
- `dateRange`: Filter by date range

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {...},
    "filters": {
      "status": "In Progress",
      "priority": "High"
    }
  },
  "message": "Task filtering completed successfully"
}
```

### **3. SEARCH SUBTASKS**
**Endpoint:** `GET /api/brands/:brandId/subtasks/search`

**Response:**
```json
{
  "success": true,
  "data": {
    "subtasks": [...],
    "pagination": {...},
    "searchQuery": "search term"
  },
  "message": "Subtask search completed successfully"
}
```

### **4. FILTER SUBTASKS**
**Endpoint:** `GET /api/brands/:brandId/subtasks/filter`

**Response:**
```json
{
  "success": true,
  "data": {
    "subtasks": [...],
    "pagination": {...},
    "filters": {
      "status": "To Do",
      "priority": "Medium"
    }
  },
  "message": "Subtask filtering completed successfully"
}
```

---

## 📊 **ANALYTICS APIs**

### **1. GET TASK ANALYTICS**
**Endpoint:** `GET /api/brands/:brandId/tasks/analytics`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 150,
    "completedTasks": 75,
    "inProgressTasks": 45,
    "overdueTasks": 10,
    "tasksByStatus": {
      "Yet to Start": 20,
      "In Progress": 45,
      "Completed": 75,
      "Blocked": 5,
      "On Hold": 5
    },
    "tasksByPriority": {
      "Critical": 15,
      "High": 40,
      "Medium": 70,
      "Low": 25
    },
    "averageCompletionTime": "3.5 days",
    "productivityScore": 85
  },
  "message": "Task analytics retrieved successfully"
}
```

### **2. GET SUBTASK ANALYTICS**
**Endpoint:** `GET /api/brands/:brandId/subtasks/analytics`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubtasks": 300,
    "completedSubtasks": 180,
    "inProgressSubtasks": 80,
    "overdueSubtasks": 15,
    "subtasksByStatus": {
      "To Do": 25,
      "In Progress": 80,
      "Completed": 180,
      "Blocked": 10,
      "On Hold": 5
    },
    "averageCompletionTime": "1.2 days",
    "completionRate": 60
  },
  "message": "Subtask analytics retrieved successfully"
}
```

---

## ⚠️ **ERROR RESPONSES**

### **Common Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

### **Common Error Codes:**
- `VALIDATION_ERROR`: Invalid request data
- `TASK_NOT_FOUND`: Task doesn't exist
- `SUBTASK_NOT_FOUND`: Subtask doesn't exist
- `COMMENT_NOT_FOUND`: Comment doesn't exist
- `ACCESS_DENIED`: Insufficient permissions
- `INVALID_JSON`: Malformed JSON in request
- `INVALID_BRAND_ID`: Invalid brand ID format
- `INVALID_PROJECT_ID`: Invalid project ID format
- `INVALID_CATEGORY_ID`: Invalid category ID format

---

## 🎯 **REQUIRED FIELDS SUMMARY**

### **Task Creation:**
- `task` (string) - Task name
- `projectId` (string) - Project ID
- `category_id` (string) - Category ID (REQUIRED)
- `assignedTo` (string) - User ID
- `reporter` (string) - User ID
- `eta` (string) - Due date in ISO format

### **Subtask Creation:**
- `task` (string) - Subtask name
- `taskId` (string) - Parent task ID
- `assignedTo` (string) - User ID
- `reporter` (string) - User ID

### **Comment Creation:**
- `content` (string) - Comment text (supports markdown)

---

## 🚀 **FRONTEND INTEGRATION EXAMPLES**

### **JavaScript API Service:**
```javascript
class TaskApiService {
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

  // Task APIs
  async createTask(brandId, taskData) {
    return this.request('POST', `/brands/${brandId}/tasks`, taskData);
  }

  async getTasks(brandId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/brands/${brandId}/tasks?${queryString}`);
  }

  async updateTask(brandId, taskId, taskData) {
    return this.request('PUT', `/brands/${brandId}/tasks/${taskId}`, taskData);
  }

  async updateTaskStatus(brandId, taskId, status) {
    return this.request('PUT', `/brands/${brandId}/tasks/${taskId}/status`, { status });
  }

  async assignTask(brandId, taskId, userId) {
    return this.request('POST', `/brands/${brandId}/tasks/${taskId}/assign`, { assignedTo: userId });
  }

  // Subtask APIs
  async createSubtask(brandId, subtaskData) {
    return this.request('POST', `/brands/${brandId}/subtasks`, subtaskData);
  }

  async getSubtasks(brandId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/brands/${brandId}/subtasks?${queryString}`);
  }

  async updateSubtask(brandId, subtaskId, subtaskData) {
    return this.request('PUT', `/brands/${brandId}/subtasks/${subtaskId}`, subtaskData);
  }

  // Comment APIs
  async getTaskComments(brandId, taskId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/brands/${brandId}/tasks/${taskId}/comments?${queryString}`);
  }

  async createComment(brandId, taskId, commentData) {
    return this.request('POST', `/brands/${brandId}/tasks/${taskId}/comments`, commentData);
  }

  async updateComment(brandId, commentId, commentData) {
    return this.request('PUT', `/brands/${brandId}/comments/${commentId}`, commentData);
  }

  async deleteComment(brandId, commentId) {
    return this.request('DELETE', `/brands/${brandId}/comments/${commentId}`);
  }
}

// Usage
const taskApi = new TaskApiService();

// Create task
const task = await taskApi.createTask(brandId, {
  task: "New Task",
  projectId: projectId,
  category_id: categoryId,
  assignedTo: userId,
  reporter: userId,
  eta: "2025-01-15T00:00:00.000Z"
});

// Update task status
await taskApi.updateTaskStatus(brandId, taskId, "In Progress");

// Create comment
await taskApi.createComment(brandId, taskId, {
  content: "This is a comment with **markdown** support"
});
```

---

*This comprehensive API documentation covers all task, subtask, and comment management operations after the category system implementation. All endpoints are production-ready and include proper error handling.*
