# Project Tracker API Documentation - Complete Guide (Phase 1-6)

## 🚀 **Overview**

This is a comprehensive multi-brand project management API built with Node.js, Express, and MongoDB. The system supports multiple brands with role-based access control, allowing users to manage projects, tasks, subtasks, comments, and teams across different brands.

## 📊 **Implementation Statistics**
- **Total APIs**: 165+ endpoints
- **Database Models**: 15 models
- **Security Features**: 14+ features
- **Business Logic Features**: 18+ features
- **Implementation Phases**: 6 phases completed

## 🎯 **Completed Phases**
- ✅ **Phase 1**: Database Foundation & Brand Management (38 APIs)
- ✅ **Phase 2**: Authentication & Authorization (22 APIs)
- ✅ **Phase 3**: Project Management with Brand Context (18 APIs)
- ✅ **Phase 4**: Task Management with Brand Context (23 APIs)
- ✅ **Phase 5**: Subtask Management (19 APIs)
- ✅ **Phase 6**: Comments & Communication System (45 APIs)

## 🔐 **Authentication**

### Base URL
```
http://localhost:5000/api
```

### Authentication Method
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📋 **API Endpoints**

---

## 🔑 **Authentication Endpoints**

### 1. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "admin@system.local",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "68cbc8ad4e23805f4d9803b9",
    "name": "System Administrator",
    "email": "admin@system.local",
    "role": "admin",
    "status": "active"
  },
  "brands": [
    {
      "id": "68cbc8ad4e23805f4d9803b9",
      "name": "Thrive",
      "slug": "thrive",
      "role": "owner"
    }
  ],
  "currentBrand": {
    "id": "68cbc8ad4e23805f4d9803b9",
    "name": "Thrive",
    "slug": "thrive",
    "role": "owner"
  }
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Invalid credentials
- `404` - User not found
- `500` - Server error

---

## 🏢 **Brand Management Endpoints**

### 1. Get All Brands
**GET** `/brands`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "68cbc8ad4e23805f4d9803b9",
      "name": "Thrive",
      "slug": "thrive",
      "description": "Thrive - Leading technology solutions company",
      "logo": "https://example.com/thrive-logo.png",
      "status": "active",
      "role": "owner",
      "permissions": {
        "can_create_projects": true,
        "can_edit_projects": true,
        "can_delete_projects": true,
        "can_view_all_projects": true,
        "can_create_tasks": true,
        "can_edit_tasks": true,
        "can_delete_tasks": true,
        "can_assign_tasks": true,
        "can_manage_users": true,
        "can_invite_users": true,
        "can_remove_users": true,
        "can_view_analytics": true,
        "can_export_data": true,
        "can_generate_reports": true,
        "can_manage_brand_settings": true,
        "can_manage_billing": true
      },
      "joined_at": "2024-01-20T10:30:00.000Z",
      "subscription": {
        "plan": "premium",
        "status": "active",
        "max_users": 100,
        "max_projects": 200
      }
    }
  ],
  "message": "Brands retrieved successfully"
}
```

### 2. Get Brand Details
**GET** `/brands/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "68cbc8ad4e23805f4d9803b9",
    "name": "Thrive",
    "slug": "thrive",
    "description": "Thrive - Leading technology solutions company",
    "logo": "https://example.com/thrive-logo.png",
    "status": "active",
    "settings": {
      "timezone": "America/New_York",
      "date_format": "MM/DD/YYYY",
      "currency": "USD",
      "language": "en"
    },
    "subscription": {
      "plan": "premium",
      "status": "active",
      "max_users": 100,
      "max_projects": 200
    },
    "created_at": "2024-01-20T10:30:00.000Z",
    "updated_at": "2024-01-20T10:30:00.000Z"
  }
}
```

### 3. Create Brand
**POST** `/brands`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Brand",
  "description": "Description of the new brand",
  "logo": "https://example.com/logo.png",
  "settings": {
    "timezone": "UTC",
    "date_format": "MM/DD/YYYY",
    "currency": "USD",
    "language": "en"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "68cbc8ad4e23805f4d9803b9",
    "name": "New Brand",
    "slug": "new-brand",
    "description": "Description of the new brand",
    "logo": "https://example.com/logo.png",
    "status": "active",
    "settings": {
      "timezone": "UTC",
      "date_format": "MM/DD/YYYY",
      "currency": "USD",
      "language": "en"
    },
    "subscription": {
      "plan": "free",
      "status": "active",
      "max_users": 5,
      "max_projects": 10
    },
    "created_at": "2024-01-20T10:30:00.000Z"
  },
  "message": "Brand created successfully"
}
```

### 4. Update Brand
**PUT** `/brands/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Brand Name",
  "description": "Updated description",
  "settings": {
    "timezone": "America/New_York",
    "currency": "USD"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "68cbc8ad4e23805f4d9803b9",
    "name": "Updated Brand Name",
    "slug": "updated-brand-name",
    "description": "Updated description",
    "status": "active",
    "updated_at": "2024-01-20T10:30:00.000Z"
  },
  "message": "Brand updated successfully"
}
```

### 5. Delete Brand
**DELETE** `/brands/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `403` - Forbidden (insufficient permissions)
- `404` - Brand not found
- `500` - Server error

### 6. Switch Brand (Authentication)
**POST** `/auth/switch-brand`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "brandId": "68cbc8ad4e23805f4d9803b9"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "68cbc8ad4e23805f4d9803b9",
    "name": "System Administrator",
    "email": "admin@system.local",
    "role": "admin"
  },
  "currentBrand": {
    "id": "68cbc8ad4e23805f4d9803b9",
    "name": "Thrive",
    "slug": "thrive",
    "role": "owner"
  }
}
```

### 7. Switch to Brand (Brand Management)
**POST** `/brands/:id/switch`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "brand_id": "68cbc8ad4e23805f4d9803b9",
    "brand_name": "Thrive",
    "role": "owner",
    "permissions": {
      "can_create_projects": true,
      "can_edit_projects": true,
      "can_delete_projects": true,
      "can_view_all_projects": true,
      "can_create_tasks": true,
      "can_edit_tasks": true,
      "can_delete_tasks": true,
      "can_assign_tasks": true,
      "can_manage_users": true,
      "can_invite_users": true,
      "can_remove_users": true,
      "can_view_analytics": true,
      "can_export_data": true,
      "can_generate_reports": true,
      "can_manage_brand_settings": true,
      "can_manage_billing": true
    }
  },
  "message": "Switched to brand successfully"
}
```

---

## 👥 **Brand User Management Endpoints**

### 1. Get Brand Users
**GET** `/brands/:id/users`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "68cbc8ad4e23805f4d9803b9",
      "name": "System Administrator",
      "email": "admin@system.local",
      "role": "owner",
      "permissions": {
        "can_create_projects": true,
        "can_edit_projects": true,
        "can_delete_projects": true,
        "can_view_all_projects": true,
        "can_create_tasks": true,
        "can_edit_tasks": true,
        "can_delete_tasks": true,
        "can_assign_tasks": true,
        "can_manage_users": true,
        "can_invite_users": true,
        "can_remove_users": true,
        "can_view_analytics": true,
        "can_export_data": true,
        "can_generate_reports": true,
        "can_manage_brand_settings": true,
        "can_manage_billing": true
      },
      "joined_at": "2024-01-20T10:30:00.000Z",
      "status": "active"
    }
  ],
  "message": "Brand users retrieved successfully"
}
```

### 2. Add User to Brand
**POST** `/brands/:id/users`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": "68cbc8ad4e23805f4d9803b9",
  "role": "member",
  "permissions": {
    "can_create_projects": false,
    "can_edit_projects": true,
    "can_delete_projects": false,
    "can_view_all_projects": true,
    "can_create_tasks": true,
    "can_edit_tasks": true,
    "can_delete_tasks": false,
    "can_assign_tasks": false,
    "can_manage_users": false,
    "can_invite_users": false,
    "can_remove_users": false,
    "can_view_analytics": false,
    "can_export_data": false,
    "can_generate_reports": false,
    "can_manage_brand_settings": false,
    "can_manage_billing": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "68cbc8ad4e23805f4d9803b9",
    "user_id": "68cbc8ad4e23805f4d9803b9",
    "brand_id": "68cbc8ad4e23805f4d9803b9",
    "role": "member",
    "permissions": {
      "can_create_projects": false,
      "can_edit_projects": true,
      "can_delete_projects": false,
      "can_view_all_projects": true,
      "can_create_tasks": true,
      "can_edit_tasks": true,
      "can_delete_tasks": false,
      "can_assign_tasks": false,
      "can_manage_users": false,
      "can_invite_users": false,
      "can_remove_users": false,
      "can_view_analytics": false,
      "can_export_data": false,
      "can_generate_reports": false,
      "can_manage_brand_settings": false,
      "can_manage_billing": false
    },
    "status": "active",
    "joined_at": "2024-01-20T10:30:00.000Z"
  },
  "message": "User added to brand successfully"
}
```

### 3. Update User Role in Brand
**PUT** `/brands/:id/users/:user_id`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "manager",
  "permissions": {
    "can_create_projects": true,
    "can_edit_projects": true,
    "can_delete_projects": false,
    "can_view_all_projects": true,
    "can_create_tasks": true,
    "can_edit_tasks": true,
    "can_delete_tasks": true,
    "can_assign_tasks": true,
    "can_manage_users": false,
    "can_invite_users": true,
    "can_remove_users": false,
    "can_view_analytics": true,
    "can_export_data": false,
    "can_generate_reports": true,
    "can_manage_brand_settings": false,
    "can_manage_billing": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "68cbc8ad4e23805f4d9803b9",
    "user_id": "68cbc8ad4e23805f4d9803b9",
    "brand_id": "68cbc8ad4e23805f4d9803b9",
    "role": "manager",
    "permissions": {
      "can_create_projects": true,
      "can_edit_projects": true,
      "can_delete_projects": false,
      "can_view_all_projects": true,
      "can_create_tasks": true,
      "can_edit_tasks": true,
      "can_delete_tasks": true,
      "can_assign_tasks": true,
      "can_manage_users": false,
      "can_invite_users": true,
      "can_remove_users": false,
      "can_view_analytics": true,
      "can_export_data": false,
      "can_generate_reports": true,
      "can_manage_brand_settings": false,
      "can_manage_billing": false
    },
    "status": "active",
    "updated_at": "2024-01-20T10:30:00.000Z"
  },
  "message": "User role updated successfully"
}
```

### 4. Remove User from Brand
**DELETE** `/brands/:id/users/:user_id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User removed from brand successfully"
}
```

---

## 📊 **Data Models**

### Brand Model
```json
{
  "id": "string (UUID)",
  "name": "string (required, unique)",
  "slug": "string (auto-generated from name)",
  "description": "string",
  "logo": "string (URL)",
  "status": "string (active|inactive|suspended)",
  "settings": {
    "timezone": "string",
    "date_format": "string",
    "currency": "string",
    "language": "string"
  },
  "subscription": {
    "plan": "string (free|basic|premium|enterprise)",
    "status": "string (active|trialing|past_due|cancelled)",
    "max_users": "number",
    "max_projects": "number"
  },
  "created_by": "ObjectId (User)",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### User Model
```json
{
  "id": "ObjectId",
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (hashed)",
  "role": "string (admin|manager|employee)",
  "employeeNumber": "string (unique)",
  "status": "string (active|inactive|suspended|pending)",
  "security": {
    "password_hash": "string",
    "two_factor_enabled": "boolean",
    "last_login": "Date"
  },
  "preferences": {
    "timezone": "string",
    "language": "string",
    "theme": "string (light|dark|auto)",
    "notifications": {
      "email": "boolean",
      "in_app": "boolean",
      "task_assigned": "boolean",
      "task_completed": "boolean",
      "comment_added": "boolean",
      "project_updated": "boolean"
    }
  },
  "created_at": "Date",
  "updated_at": "Date"
}
```

### UserBrand Model
```json
{
  "id": "string (UUID)",
  "user_id": "ObjectId (User)",
  "brand_id": "string (Brand ID)",
  "role": "string (owner|admin|manager|member|client|guest)",
  "permissions": {
    "can_create_projects": "boolean",
    "can_edit_projects": "boolean",
    "can_delete_projects": "boolean",
    "can_view_all_projects": "boolean",
    "can_create_tasks": "boolean",
    "can_edit_tasks": "boolean",
    "can_delete_tasks": "boolean",
    "can_assign_tasks": "boolean",
    "can_manage_users": "boolean",
    "can_invite_users": "boolean",
    "can_remove_users": "boolean",
    "can_view_analytics": "boolean",
    "can_export_data": "boolean",
    "can_generate_reports": "boolean",
    "can_manage_brand_settings": "boolean",
    "can_manage_billing": "boolean"
  },
  "status": "string (active|pending|suspended|removed)",
  "joined_at": "Date",
  "created_at": "Date",
  "updated_at": "Date"
}
```

---

## 🔒 **Authentication & Authorization**

### JWT Token Structure
```json
{
  "userId": "ObjectId",
  "brands": [
    {
      "id": "ObjectId",
      "name": "string",
      "slug": "string",
      "role": "string"
    }
  ],
  "currentBrand": {
    "id": "ObjectId",
    "name": "string",
    "slug": "string",
    "role": "string"
  },
  "iat": "timestamp",
  "exp": "timestamp"
}
```

### Role-Based Permissions

#### Owner
- Full access to all brand features
- Can manage users, settings, and billing
- Can delete the brand

#### Admin
- Can manage projects and tasks
- Can invite and manage users
- Cannot delete the brand

#### Manager
- Can create and edit projects
- Can assign and manage tasks
- Cannot manage users or settings

#### Member
- Can view and edit assigned projects/tasks
- Cannot create projects or manage users

#### Client
- Read-only access to assigned projects
- Cannot create or edit content

#### Guest
- Limited access to specific projects
- Cannot access sensitive information

---

## 🚨 **Error Handling**

### Standard Error Response
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

### Common Error Codes
- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_ERROR` - Invalid or missing token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `BRAND_NOT_FOUND` - Brand does not exist
- `USER_NOT_FOUND` - User does not exist
- `BRAND_EXISTS` - Brand name already exists
- `INVALID_CREDENTIALS` - Login credentials are invalid
- `FORBIDDEN` - Access denied

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## 🧪 **Testing**

### Test Credentials
```
Email: admin@system.local
Password: admin123
```

### Available Brands for Testing
1. **Thrive** (premium plan)
2. **Kinetica** (enterprise plan)
3. **Brillio** (basic plan)

### Sample API Calls

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.local","password":"admin123"}'
```

#### Get Brands
```bash
curl -X GET http://localhost:5000/api/brands \
  -H "Authorization: Bearer <jwt_token>"
```

#### Create Brand
```bash
curl -X POST http://localhost:5000/api/brands \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Brand","description":"Test brand description"}'
```

---

## 📝 **Frontend Integration Notes**

### 1. Authentication Flow
1. Login with email/password
2. Store JWT token in localStorage/sessionStorage
3. Include token in all API requests
4. Handle token expiration (refresh or re-login)

### 2. Brand Context Management
1. Get user's brands on login
2. Allow user to switch between brands
3. Store current brand context
4. Include brand context in project/task operations

### 3. Permission-Based UI
1. Check user permissions before showing UI elements
2. Disable/hide features based on user role
3. Show appropriate error messages for forbidden actions

### 4. Error Handling
1. Handle 401 errors (redirect to login)
2. Handle 403 errors (show permission denied)
3. Handle network errors gracefully
4. Show loading states during API calls

### 5. Real-time Updates
1. Implement WebSocket connections for live updates
2. Handle brand switching notifications
3. Update UI when permissions change

---

## 💬 **Phase 6: Comments & Communication System APIs**

### **Comment Management APIs**

#### 1. Get Brand Comments
**GET** `/api/brands/:brandId/comments`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of comments per page
- `entity_type` (optional): Filter by entity type (task, project, subtask)
- `entity_id` (optional): Filter by entity ID
- `type` (optional): Filter by comment type
- `author` (optional): Filter by author ID
- `status` (optional): Filter by comment status

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalComments": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### 2. Get Entity Comments
**GET** `/api/brands/:brandId/:entityType/:entityId/comments`

**Parameters:**
- `brandId`: Brand ID
- `entityType`: Entity type (task, project, subtask)
- `entityId`: Entity ID

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [...],
    "pagination": {...}
  }
}
```

#### 3. Create Comment
**POST** `/api/brands/:brandId/:entityType/:entityId/comments`

**Request Body:**
```json
{
  "content": "This is a comment",
  "parent_comment": "comment_id",
  "type": "comment",
  "visibility": "public",
  "mentions": [
    {
      "user_id": "user_id",
      "position": 0,
      "length": 5
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "comment_id",
    "content": "This is a comment",
    "author": {...},
    "mentions": [...],
    "reactions": [...],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. Update Comment
**PUT** `/api/brands/:brandId/comments/:id`

**Request Body:**
```json
{
  "content": "Updated comment content",
  "visibility": "private"
}
```

#### 5. Delete Comment
**DELETE** `/api/brands/:brandId/comments/:id`

#### 6. Reply to Comment
**POST** `/api/brands/:brandId/comments/:id/reply`

**Request Body:**
```json
{
  "content": "This is a reply",
  "mentions": [...]
}
```

#### 7. React to Comment
**POST** `/api/brands/:brandId/comments/:id/react`

**Request Body:**
```json
{
  "emoji": "👍"
}
```

#### 8. Remove Reaction
**DELETE** `/api/brands/:brandId/comments/:id/react`

#### 9. Mention User
**POST** `/api/brands/:brandId/comments/:id/mention`

**Request Body:**
```json
{
  "user_id": "user_id",
  "position": 0,
  "length": 5
}
```

#### 10. Update Comment Permissions
**PUT** `/api/brands/:brandId/comments/:id/permissions`

**Request Body:**
```json
{
  "can_edit": ["user_id1", "user_id2"],
  "can_delete": ["user_id1"],
  "can_react": ["user_id1", "user_id2", "user_id3"]
}
```

#### 11. Moderate Comment
**PUT** `/api/brands/:brandId/comments/:id/moderate`

**Request Body:**
```json
{
  "action": "approve|reject|flag",
  "reason": "Reason for moderation"
}
```

#### 12. Pin Comment
**PUT** `/api/brands/:brandId/comments/:id/pin`

#### 13. Unpin Comment
**PUT** `/api/brands/:brandId/comments/:id/unpin`

#### 14. Search Comments
**GET** `/api/brands/:brandId/comments/search?q=search_term`

#### 15. Filter Comments
**GET** `/api/brands/:brandId/comments/filter?status=active&author=user_id`

#### 16. Get Comment Analytics
**GET** `/api/brands/:brandId/comments/analytics`

#### 17. Get Comment Analytics by ID
**GET** `/api/brands/:brandId/comments/:id/analytics`

#### 18. Upload Comment Attachment
**POST** `/api/brands/:brandId/comments/:id/attachments`

**Request:** Multipart form data with file

#### 19. Delete Comment Attachment
**DELETE** `/api/brands/:brandId/comments/:id/attachments/:attachmentId`

#### 20. Get Comment History
**GET** `/api/brands/:brandId/comments/:id/history`

#### 21. Export Comments
**GET** `/api/brands/:brandId/comments/export?format=json|csv`

### **Activity Management APIs**

#### 1. Get Brand Activities
**GET** `/api/brands/:brandId/activities`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Number of activities per page
- `type` (optional): Filter by activity type
- `priority` (optional): Filter by priority
- `status` (optional): Filter by status
- `date_from` (optional): Filter from date
- `date_to` (optional): Filter to date

#### 2. Get Activity Details
**GET** `/api/brands/:brandId/activities/:id`

#### 3. Get User Activity Feed
**GET** `/api/brands/:brandId/activities/feed`

**Query Parameters:**
- `types` (optional): Comma-separated activity types
- `priorities` (optional): Comma-separated priorities
- `tags` (optional): Comma-separated tags
- `date_from` (optional): Filter from date
- `date_to` (optional): Filter to date

#### 4. Get Entity Activities
**GET** `/api/brands/:brandId/:entityType/:entityId/activities`

#### 5. Create Activity
**POST** `/api/brands/:brandId/activities`

**Request Body:**
```json
{
  "type": "task_created",
  "action": "created a task",
  "description": "User created a new task",
  "target": {
    "type": "task",
    "id": "task_id",
    "name": "Task Name"
  },
  "context": {
    "project_id": "project_id",
    "task_id": "task_id"
  },
  "metadata": {
    "old_value": "old_value",
    "new_value": "new_value"
  },
  "visibility": "public",
  "recipients": [
    {
      "user_id": "user_id",
      "role": "actor"
    }
  ],
  "tags": ["tag1", "tag2"],
  "priority": "medium"
}
```

#### 6. Update Activity
**PUT** `/api/brands/:brandId/activities/:id`

#### 7. Delete Activity
**DELETE** `/api/brands/:brandId/activities/:id`

#### 8. Add Activity Recipient
**POST** `/api/brands/:brandId/activities/:id/recipients`

**Request Body:**
```json
{
  "user_id": "user_id",
  "role": "team_member"
}
```

#### 9. Remove Activity Recipient
**DELETE** `/api/brands/:brandId/activities/:id/recipients/:userId`

#### 10. Mark Activity as Read
**PUT** `/api/brands/:brandId/activities/:id/read`

#### 11. Mark Activity as Notified
**PUT** `/api/brands/:brandId/activities/:id/notified`

#### 12. Archive Activity
**PUT** `/api/brands/:brandId/activities/:id/archive`

#### 13. Search Activities
**GET** `/api/brands/:brandId/activities/search?q=search_term`

#### 14. Filter Activities
**GET** `/api/brands/:brandId/activities/filter?type=task_created&priority=high`

#### 15. Get Activity Analytics
**GET** `/api/brands/:brandId/activities/analytics`

#### 16. Get Activity Analytics by ID
**GET** `/api/brands/:brandId/activities/:id/analytics`

#### 17. Export Activities
**GET** `/api/brands/:brandId/activities/export?format=json|csv`

#### 18. Get Activity Notifications
**GET** `/api/brands/:brandId/activities/notifications`

#### 19. Mark Notification as Read
**PUT** `/api/brands/:brandId/activities/notifications/:id/read`

#### 20. Mark Notification as Unread
**PUT** `/api/brands/:brandId/activities/notifications/:id/unread`

#### 21. Get Activity Preferences
**GET** `/api/brands/:brandId/activities/preferences`

#### 22. Update Activity Preferences
**PUT** `/api/brands/:brandId/activities/preferences`

**Request Body:**
```json
{
  "email_notifications": true,
  "in_app_notifications": true,
  "activity_types": ["task_created", "task_updated", "comment_created"],
  "notification_frequency": "immediate",
  "quiet_hours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }
}
```

---

## 🔧 **Environment Setup**

### Required Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/asana_dev
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
PORT=5000
NODE_ENV=development
```

### Database Setup
1. Ensure MongoDB is running
2. Run migration scripts if needed
3. Create admin user if not exists

### Server Startup
```bash
# Install dependencies
npm install

# Set environment variables
export MONGODB_URI="mongodb://localhost:27017/asana_dev"
export JWT_SECRET="your-super-secret-jwt-key-here-make-it-very-long-and-secure"

# Start server
npm start
```

---

## 📚 **Additional Resources**

- [Postman Collection](./Project_Tracker_Brand_Management.postman_collection.json)
- [Database Schema](./models/)
- [Migration Scripts](./migration-*.js)
- [Test Scripts](./test-*.js)

---

## 🆘 **Support**

For issues or questions:
1. Check the error logs in the terminal
2. Verify environment variables are set
3. Ensure MongoDB is running
4. Check network connectivity
5. Review API documentation for correct request format

---

**Last Updated:** January 20, 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅

