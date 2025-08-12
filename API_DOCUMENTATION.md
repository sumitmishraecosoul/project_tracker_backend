# Project Tracker API Documentation (Updated)

This documentation covers the updated Project Tracker API with improved task management, user ID references, and consistent response formats.

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "developer",
  "department": "Engineering"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "developer",
  "department": "Engineering",
  "isActive": true,
  "emailVerified": false,
  "createdAt": "2024-12-01T10:00:00.000Z",
  "updatedAt": "2024-12-01T10:00:00.000Z"
}
```

**Error Response (409 - Duplicate Email):**
```json
{
  "error": "Duplicate email",
  "message": "A user with this email already exists"
}
```

### 1.2 Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "developer",
    "department": "Engineering"
  }
}
```

---

## 2. Users Management

### 2.1 Get All Users
**GET** `/api/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "developer",
    "department": "Engineering",
    "isActive": true,
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "manager",
    "department": "Product",
    "isActive": true,
    "createdAt": "2024-12-01T11:00:00.000Z",
    "updatedAt": "2024-12-01T11:00:00.000Z"
  }
]
```

### 2.2 Create New User
**POST** `/api/users`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "developer",
  "department": "Engineering"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "developer",
  "department": "Engineering",
  "isActive": true,
  "emailVerified": false,
  "createdAt": "2024-12-01T11:00:00.000Z",
  "updatedAt": "2024-12-01T11:00:00.000Z"
}
```

---

## 3. Projects Management

### 3.1 Get All Projects
**GET** `/api/projects`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of projects per page (default: 10)
- `status` (optional): Filter by project status
- `priority` (optional): Filter by project priority
- `search` (optional): Search in project title and description

**Success Response (200):**
```json
{
  "projects": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "title": "E-commerce Platform",
      "description": "Build a modern e-commerce platform",
      "status": "Active",
      "priority": "High",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedTo": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      ],
      "startDate": "2024-01-01T00:00:00.000Z",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalProjects": 50
}
```

### 3.2 Get Project By ID
**GET** `/api/projects/{projectId}`

**Description:** Returns a project with all its associated tasks. This endpoint handles mixed data formats in the tasks collection where `projectId` may contain either ObjectId references or project title strings.

**Success Response (200):**
```json
{
  "project": {
    "_id": "507f1f77bcf86cd799439031",
    "title": "E-commerce Platform",
    "description": "Build a modern e-commerce platform",
    "status": "Active",
    "priority": "High",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedTo": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ],
    "startDate": "2024-01-01T00:00:00.000Z",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  },
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "id": "TASK-0001",
      "projectId": "507f1f77bcf86cd799439031",
      "task": "Implement User Authentication",
      "description": "Create login and registration functionality",
      "taskType": "Feature",
      "priority": "High",
      "status": "In Progress",
      "assignedTo": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "reporter": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "eta": "2024-12-31T00:00:00.000Z",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T15:00:00.000Z"
    }
  ]
}
```

**Error Response (404 - Project Not Found):**
```json
{
  "error": "Project not found",
  "message": "No project found with the provided ID"
}
```

### 3.3 Get Project Tasks
**GET** `/api/projects/{projectId}/tasks`

**Description:** Returns all tasks associated with a specific project. This endpoint handles mixed data formats in the tasks collection where `projectId` may contain either ObjectId references or project title strings. The query searches for tasks where `projectId` matches either the project's ID or the project's title.

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "id": "TASK-0001",
    "projectId": "507f1f77bcf86cd799439031",
    "task": "Implement User Authentication",
    "description": "Create login and registration functionality with JWT tokens",
    "taskType": "Feature",
    "priority": "High",
    "status": "In Progress",
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "reporter": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "startDate": "2024-12-01T00:00:00.000Z",
    "eta": "2024-12-31T00:00:00.000Z",
    "estimatedHours": 8,
    "actualHours": 3,
    "remark": "Started working on authentication flow",
    "labels": ["frontend", "auth", "urgent"],
    "sprint": "Sprint 1",
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T15:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439022",
    "id": "TASK-0002",
    "projectId": "E-commerce Platform",
    "task": "Fix Login Bug",
    "description": "Resolve issue with login form validation",
    "taskType": "Bug",
    "priority": "Critical",
    "status": "To Do",
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "reporter": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "eta": "2024-12-15T00:00:00.000Z",
    "estimatedHours": 4,
    "labels": ["bug", "frontend"],
    "createdAt": "2024-12-01T16:00:00.000Z",
    "updatedAt": "2024-12-01T16:00:00.000Z"
  }
]
```

**Error Response (500 - Server Error):**
```json
{
  "error": "Failed to fetch project tasks",
  "message": "Database connection error"
}
```

---

## 4. Tasks Management (Updated)

### 4.1 Get All Tasks
**GET** `/api/tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "id": "TASK-0001",
    "projectId": "PROJ-001",
    "task": "Implement User Authentication",
    "description": "Create login and registration functionality with JWT tokens",
    "taskType": "Feature",
    "priority": "High",
    "status": "In Progress",
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "reporter": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "startDate": "2024-12-01T00:00:00.000Z",
    "eta": "2024-12-31T00:00:00.000Z",
    "estimatedHours": 8,
    "actualHours": 3,
    "remark": "Started working on authentication flow",
    "labels": ["frontend", "auth", "urgent"],
    "sprint": "Sprint 1",
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T15:00:00.000Z"
  }
]
```

### 4.2 Create Task (with User ID)
**POST** `/api/tasks`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "PROJ-001",
  "task": "Implement User Authentication",
  "description": "Create login and registration functionality with JWT tokens",
  "taskType": "Feature",
  "priority": "High",
  "status": "To Do",
  "assignedTo": "507f1f77bcf86cd799439011",
  "reporter": "507f1f77bcf86cd799439012",
  "eta": "2024-12-31",
  "estimatedHours": 8,
  "labels": ["frontend", "auth", "urgent"],
  "sprint": "Sprint 1"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439021",
  "id": "TASK-0003",
  "projectId": "PROJ-001",
  "task": "Implement User Authentication",
  "description": "Create login and registration functionality with JWT tokens",
  "taskType": "Feature",
  "priority": "High",
  "status": "To Do",
  "assignedTo": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "reporter": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "eta": "2024-12-31T00:00:00.000Z",
  "estimatedHours": 8,
  "labels": ["frontend", "auth", "urgent"],
  "sprint": "Sprint 1",
  "createdAt": "2024-12-01T10:00:00.000Z",
  "updatedAt": "2024-12-01T10:00:00.000Z"
}
```

### 4.3 Create Task (with User Email)
**POST** `/api/tasks`

**Request Body:**
```json
{
  "projectId": "PROJ-001",
  "task": "Fix Login Bug",
  "description": "Resolve issue with login form validation",
  "taskType": "Bug",
  "priority": "Critical",
  "status": "To Do",
  "assignedTo": "john@example.com",
  "reporter": "jane@example.com",
  "eta": "2024-12-15",
  "estimatedHours": 4,
  "labels": ["bug", "frontend"]
}
```

### 4.4 Create Task (with User Name)
**POST** `/api/tasks`

**Request Body:**
```json
{
  "projectId": "PROJ-001",
  "task": "Update Documentation",
  "description": "Update API documentation with new endpoints",
  "taskType": "Documentation",
  "priority": "Medium",
  "status": "To Do",
  "assignedTo": "John Doe",
  "reporter": "Jane Smith",
  "eta": "2024-12-20",
  "estimatedHours": 6,
  "labels": ["documentation", "api"]
}
```

### 4.5 Update Task
**PUT** `/api/tasks/{task_id}`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Important:** The `{task_id}` parameter must be the MongoDB ObjectId (`_id` field), not the custom task ID (`id` field).

**Example:**
- ✅ Correct: `PUT /api/tasks/507f1f77bcf86cd799439021` (using `_id`)
- ❌ Wrong: `PUT /api/tasks/TASK-0001` (using custom `id`)

**Request Body:**
```json
{
  "status": "In Progress",
  "actualHours": 3,
  "remark": "Started working on authentication flow",
  "startDate": "2024-12-01"
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439021",
  "id": "TASK-0001",
  "projectId": "PROJ-001",
  "task": "Implement User Authentication",
  "description": "Create login and registration functionality with JWT tokens",
  "taskType": "Feature",
  "priority": "High",
  "status": "In Progress",
  "assignedTo": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "reporter": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "startDate": "2024-12-01T00:00:00.000Z",
  "eta": "2024-12-31T00:00:00.000Z",
  "estimatedHours": 8,
  "actualHours": 3,
  "remark": "Started working on authentication flow",
  "labels": ["frontend", "auth", "urgent"],
  "sprint": "Sprint 1",
  "createdAt": "2024-12-01T10:00:00.000Z",
  "updatedAt": "2024-12-01T15:00:00.000Z"
}
```

### 4.6 Get Task By ID
**GET** `/api/tasks/{task_id}`

**Headers:**
```
Authorization: Bearer <token>
```

**Important:** The `{task_id}` parameter must be the MongoDB ObjectId (`_id` field), not the custom task ID (`id` field).

**Example:**
- ✅ Correct: `GET /api/tasks/507f1f77bcf86cd799439021` (using `_id`)
- ❌ Wrong: `GET /api/tasks/TASK-0001` (using custom `id`)

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439021",
  "id": "TASK-0001",
  "projectId": "PROJ-001",
  "task": "Implement User Authentication",
  "description": "Create login and registration functionality with JWT tokens",
  "taskType": "Feature",
  "priority": "High",
  "status": "In Progress",
  "assignedTo": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "reporter": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "startDate": "2024-12-01T00:00:00.000Z",
  "eta": "2024-12-31T00:00:00.000Z",
  "estimatedHours": 8,
  "actualHours": 3,
  "remark": "Started working on authentication flow",
  "labels": ["frontend", "auth", "urgent"],
  "sprint": "Sprint 1",
  "createdAt": "2024-12-01T10:00:00.000Z",
  "updatedAt": "2024-12-01T15:00:00.000Z"
}
```

**Error Response (404 - Task Not Found):**
```json
{
  "error": "Task not found",
  "message": "No task found with the provided ID"
}
```

### 4.7 Delete Task
**DELETE** `/api/tasks/{task_id}`

**Headers:**
```
Authorization: Bearer <token>
```

**Important:** The `{task_id}` parameter must be the MongoDB ObjectId (`_id` field), not the custom task ID (`id` field).

**Example:**
- ✅ Correct: `DELETE /api/tasks/507f1f77bcf86cd799439021` (using `_id`)
- ❌ Wrong: `DELETE /api/tasks/TASK-0001` (using custom `id`)

**Success Response (200):**
```json
{
  "message": "Task deleted successfully",
  "deletedTaskId": "TASK-0001"
}
```

**Error Response (400 - Invalid ID Format):**
```json
{
  "error": "Invalid task ID format",
  "message": "Task ID must be a valid ObjectId"
}
```

**Error Response (404 - Task Not Found):**
```json
{
  "error": "Task not found",
  "message": "No task found with the provided ID"
}
```

---

## 5. Error Responses

### 5.1 Duplicate Task ID Error (409)
```json
{
  "error": "Duplicate task ID",
  "message": "A task with this ID already exists. Please try again."
}
```

### 5.2 Invalid User Reference Error (400)
```json
{
  "error": "Invalid user reference",
  "message": "User not found with provided email"
}
```

### 5.3 Missing Required Fields Error (400)
```json
{
  "error": "Missing required fields",
  "message": "projectId, task, assignedTo, reporter, and eta are required"
}
```

### 5.4 Task Not Found Error (404)
```json
{
  "error": "Task not found",
  "message": "No task found with the provided ID"
}
```

### 5.5 Project Not Found Error (404)
```json
{
  "error": "Project not found",
  "message": "No project found with the provided ID"
}
```

### 5.6 Duplicate Email Error (409)
```json
{
  "error": "Duplicate email",
  "message": "A user with this email already exists"
}
```

---

## 6. Task Field Reference

### Required Fields for Task Creation:
- `projectId` (string): Project identifier
- `task` (string): Task title/name
- `assignedTo` (string): User ID, email, or name
- `reporter` (string): User ID, email, or name
- `eta` (string): Expected completion date (YYYY-MM-DD format)

### Auto-Generated Fields:
- `id` (string): **Auto-generated** - Task ID in format TASK-XXXX (e.g., TASK-0001, TASK-0002)
  - **Do not include this field in your request** - it will be automatically generated
  - The system finds the highest existing task ID and increments it

### Optional Fields for Task Creation:
- `description` (string): Task description
- `taskType` (string): "Feature", "Bug", "Enhancement", "Documentation", "Research"
- `priority` (string): "Critical", "High", "Medium", "Low"
- `status` (string): "To Do", "In Progress", "Completed", "Blocked", "On Hold"
- `startDate` (string): Start date (YYYY-MM-DD format)
- `estimatedHours` (number): Estimated hours to complete
- `remark` (string): Additional notes
- `roadBlock` (string): Current roadblocks
- `supportNeeded` (string): Support requirements
- `labels` (array): Array of label strings
- `attachments` (array): Array of attachment file names
- `relatedTasks` (array): Array of related task IDs
- `parentTask` (string): Parent task ID
- `sprint` (string): Sprint identifier

### User Reference Formats:
The API accepts three formats for user references in `assignedTo` and `reporter` fields:

1. **User ID**: `"507f1f77bcf86cd799439011"`
2. **User Email**: `"john@example.com"`
3. **User Name**: `"John Doe"` (case insensitive)

---

## 7. Migration Endpoints

### 7.1 Reset Task ID Counter
**GET** `/migration/reset-task-counter`

This endpoint analyzes the current task IDs and reports the next available ID.

### 7.2 Migrate Task Users
**GET** `/migration/fix-task-users`

This endpoint converts existing task user references from names/emails to proper user IDs.

### 7.3 Standardize Project IDs
**GET** `/migration/standardize-project-ids`

This endpoint converts existing task projectId references from project titles to proper ObjectId references.

**Migration Script Usage:**
```bash
# Run the migration script directly
npm run migrate:standardize-project-ids

# Or run all migrations
npm run migrate:all
```

**What it does:**
- Finds tasks with string projectId values (project titles)
- Looks up the corresponding project by title
- Updates the task with the proper ObjectId reference
- Validates existing ObjectId references
- Reports any orphaned or invalid references

---

## 8. Response Format Changes

### Before (Old Format):
```json
{
  "data": [
    {
      "id": "TASK-0001",
      "assignedTo": "John Doe",
      "reporter": "jane@example.com"
    }
  ]
}
```

### After (New Format):
```json
[
  {
    "id": "TASK-0001",
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "reporter": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
]
```

---

## 9. Testing Examples

### Test Task Creation with Different User References:

1. **With User ID:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJ-001",
    "task": "Test Task 1",
    "assignedTo": "507f1f77bcf86cd799439011",
    "reporter": "507f1f77bcf86cd799439012",
    "eta": "2024-12-31"
  }'
```

2. **With User Email:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJ-001",
    "task": "Test Task 2",
    "assignedTo": "john@example.com",
    "reporter": "jane@example.com",
    "eta": "2024-12-31"
  }'
```

3. **With User Name:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJ-001",
    "task": "Test Task 3",
    "assignedTo": "John Doe",
    "reporter": "Jane Smith",
    "eta": "2024-12-31"
  }'
```

### Test Project Tasks Endpoint:
```bash
# Get all tasks for a specific project
curl -X GET http://localhost:5000/api/projects/PROJ-001/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Task ID Generation:
```bash
# Run the test script to verify task ID generation
npm run test:task-creation
```

---

## 10. Frontend Integration Notes

### Key Changes for Frontend:
1. **User References**: Always use user IDs in requests, but the API will accept emails/names and convert them
2. **Response Format**: Arrays are returned directly, not wrapped in data/items objects
3. **User Details**: Tasks include populated user details (name, email) for display
4. **Error Handling**: Specific error messages for different scenarios
5. **Task ID Generation**: **Automatic** - do not send `id` field in requests

### Frontend Data Structure:
```javascript
// Task object structure
{
  id: "TASK-0001", // Auto-generated by backend
  assignedTo: {
    _id: "507f1f77bcf86cd799439011",
    name: "John Doe",
    email: "john@example.com"
  },
  reporter: {
    _id: "507f1f77bcf86cd799439012",
    name: "Jane Smith",
    email: "jane@example.com"
  }
  // ... other fields
}
```

### Important Notes:
- **Do not include `id` field** in task creation requests
- The backend will automatically generate sequential task IDs (TASK-0001, TASK-0002, etc.)
- If you encounter duplicate ID errors, the system will automatically retry with a new ID
- Use `/api/projects/{projectId}/tasks` to get all tasks for a specific project
