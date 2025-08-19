# Project Tracker API Documentation

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

## 1. Authentication

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
    "role": "developer"
  }
}
```

---

## 2. Users Management

### 2.1 Get All Users
**GET** `/api/users`

**Authorization:** Bearer <token>

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
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
]
```

### 2.2 Get User By ID
**GET** `/api/users/{userId}`

**Authorization:** Bearer <token>

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "developer",
  "department": "Engineering",
  "isActive": true,
  "createdAt": "2024-12-01T10:00:00.000Z"
}
```

### 2.3 Create New User
**POST** `/api/users`

**Authorization:** Bearer <token>

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "designer",
  "department": "Design"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "designer",
  "department": "Design",
  "isActive": true,
  "createdAt": "2024-12-01T10:00:00.000Z"
}
```

### 2.4 Update User
**PUT** `/api/users/{userId}`

**Authorization:** Bearer <token>

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "role": "senior-designer",
  "department": "UX Design"
}
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Jane Smith Updated",
  "email": "jane@example.com",
  "role": "senior-designer",
  "department": "UX Design",
  "isActive": true,
  "updatedAt": "2024-12-01T15:00:00.000Z"
}
```

### 2.5 Delete User
**DELETE** `/api/users/{userId}`

**Authorization:** Bearer <token>

**Success Response (200):**
```json
{
  "message": "User deleted successfully",
  "deletedUserId": "507f1f77bcf86cd799439012"
}
```

---

## 3. Dashboard & Analytics

### 3.1 Get Dashboard Summary
**GET** `/api/dashboard/summary`

**Description:** Get comprehensive dashboard data in a single response for optimal performance. Returns aggregated statistics including project counts, task counts, team member counts, recent projects, and task progress summary.

**Authorization:** Bearer <token>

**Success Response (200):**
```json
{
  "activeProjectsCount": 2,
  "totalTasksCount": 6,
  "inProgressTasksCount": 2,
  "completedTasksCount": 3,
  "totalTeamMembersCount": 5,
  "recentProjects": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "title": "E-commerce Website Development",
      "description": "Complete online store with payment integration",
      "status": "Active",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439032",
      "title": "Mobile App Development",
      "description": "Cross-platform mobile application",
      "status": "Active",
      "updatedAt": "2024-12-01T09:00:00.000Z"
    }
  ],
  "taskProgress": {
    "completed": 3,
    "inProgress": 2,
    "total": 6
  },
  "totalProjectsCount": 3,
  "pendingTasksCount": 1,
  "overdueTasksCount": 0
}
```

**Error Response (401):**
```json
{
  "error": "Access denied",
  "message": "No token provided"
}
```

### 3.2 Get Dashboard Stats
**GET** `/api/dashboard`

**Description:** Get basic dashboard statistics including project and task counts.

**Authorization:** Bearer <token>

**Success Response (200):**
```json
{
  "totalProjects": 3,
  "totalTasks": 6,
  "totalUsers": 5,
  "totalUserTasks": 4,
  "activeProjects": 2,
  "completedTasks": 3,
  "pendingTasks": 2,
  "overdueTasks": 1
}
```

### 3.3 Get Projects Summary
**GET** `/api/dashboard/projects-summary`

**Description:** Get project statistics grouped by status and priority.

**Authorization:** Bearer <token>

**Success Response (200):**
```json
{
  "statusSummary": [
    { "_id": "Active", "count": 2 },
    { "_id": "Completed", "count": 1 }
  ],
  "prioritySummary": [
    { "_id": "High", "count": 1 },
    { "_id": "Medium", "count": 2 }
  ]
}
```

### 3.4 Get Tasks Summary
**GET** `/api/dashboard/tasks-summary`

**Description:** Get task statistics grouped by status and priority.

**Authorization:** Bearer <token>

**Success Response (200):**
```json
{
  "statusSummary": [
    { "_id": "Completed", "count": 3 },
    { "_id": "In Progress", "count": 2 },
    { "_id": "Yet to Start", "count": 1 }
  ],
  "prioritySummary": [
    { "_id": "High", "count": 2 },
    { "_id": "Medium", "count": 3 },
    { "_id": "Low", "count": 1 }
  ]
}
```

---

## 4. Projects Management

### 4.1 Get All Projects
**GET** `/api/projects?page=1&limit=10&status=Active&priority=High&search=ecommerce`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `search` (optional): Search in title and description

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
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ],
      "teamMembers": [
        {
          "user": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "Jane Smith",
            "email": "jane@example.com"
          },
          "role": "developer"
        }
      ],
      "startDate": "2024-01-01T00:00:00.000Z",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "progress": 25,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalProjects": 50
}
```

### 4.2 Get Project By ID
**GET** `/api/projects/{projectId}`

**Description:** Returns project details with all associated tasks. Handles mixed projectId formats (ObjectId or string title).

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
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "teamMembers": [
      {
        "user": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "role": "developer"
      }
    ],
    "startDate": "2024-01-01T00:00:00.000Z",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "progress": 25,
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
      "taskType": "Adhoc",
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

### 4.3 Get Project Tasks
**GET** `/api/projects/{projectId}/tasks`

**Description:** Returns all tasks associated with a specific project. Handles mixed projectId formats (ObjectId or string title).

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "id": "TASK-0001",
    "projectId": "507f1f77bcf86cd799439031",
    "task": "Implement User Authentication",
    "description": "Create login and registration functionality with JWT tokens",
      "taskType": "Adhoc",
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

### 4.4 Create Project
**POST** `/api/projects`

**Authorization:** Bearer <token>

**Description:** Create a new project with team members and assigned users.

**Features:**
- Validates all user IDs exist before creating project
- Prevents duplicate team members
- Creates notifications for all team members
- Supports team member roles

**Request Body:**
```json
{
  "title": "E-commerce Platform",
  "description": "Build a modern e-commerce platform with React and Node.js",
  "status": "Active",
  "priority": "High",
  "startDate": "2024-01-01",
  "dueDate": "2024-12-31",
  "assignedTo": ["507f1f77bcf86cd799439011"],
  "teamMembers": [
    {
      "user": "507f1f77bcf86cd799439012",
      "role": "developer"
    },
    {
      "user": "507f1f77bcf86cd799439013",
      "role": "designer"
    }
  ]
}
```

**Required Fields:** title
**Optional Fields:** description, status, priority, startDate, dueDate, assignedTo, teamMembers

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "title": "E-commerce Platform",
  "description": "Build a modern e-commerce platform with React and Node.js",
  "status": "Active",
  "priority": "High",
  "startDate": "2024-01-01T00:00:00.000Z",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "createdBy": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "assignedTo": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "teamMembers": [
    {
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "role": "developer"
    },
    {
      "user": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Bob Wilson",
        "email": "bob@example.com"
      },
      "role": "designer"
    }
  ],
  "progress": 0,
  "createdAt": "2024-12-01T10:00:00.000Z",
  "updatedAt": "2024-12-01T10:00:00.000Z"
}
```

### 4.5 Update Project
**PUT** `/api/projects/{projectId}`

**Authorization:** Bearer <token>

**Description:** Update project details with team member management.

**Features:**
- Validates all user IDs exist before updating
- Prevents duplicate team members
- Creates notifications for all team members
- Only project creator or admin can update

**Request Body:**
```json
{
  "title": "Updated E-commerce Platform",
  "description": "Updated description with new features",
  "status": "Active",
  "priority": "Critical",
  "teamMembers": [
    {
      "user": "507f1f77bcf86cd799439012",
      "role": "lead-developer"
    },
    {
      "user": "507f1f77bcf86cd799439013",
      "role": "senior-designer"
    }
  ]
}
```

**All fields are optional** - only send the fields you want to update

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "title": "Updated E-commerce Platform",
  "description": "Updated description with new features",
  "status": "Active",
  "priority": "Critical",
  "createdBy": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "assignedTo": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "teamMembers": [
    {
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "role": "lead-developer"
    },
    {
      "user": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Bob Wilson",
        "email": "bob@example.com"
      },
      "role": "senior-designer"
    }
  ],
  "updatedAt": "2024-12-01T15:00:00.000Z"
}
```

### 4.6 Delete Project
**DELETE** `/api/projects/{projectId}`

**Authorization:** Bearer <token>

**Description:** Delete a project and all associated tasks.

**Features:**
- Deletes all associated tasks (handles mixed projectId formats)
- Removes project files from storage
- Creates notifications for team members
- Only project creator or admin can delete

**Warning:** This action is irreversible!

**Success Response (200):**
```json
{
  "message": "Project deleted successfully",
  "deletedProject": {
    "_id": "507f1f77bcf86cd799439031",
    "title": "E-commerce Platform",
    "deletedTasks": 5
  }
}
```

### 4.7 Add Team Member
**POST** `/api/projects/{projectId}/team-members`

**Authorization:** Bearer <token>

**Description:** Add a single team member to a project.

**Features:**
- Validates user exists before adding
- Prevents duplicate team members
- Creates notification for added user
- Only project creator or admin can add members

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439014",
  "role": "developer"
}
```

**Required Fields:** userId
**Optional Fields:** role (defaults to 'member')

**Success Response (200):**
```json
{
  "message": "Team member added successfully",
  "addedMember": {
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Alice Johnson",
      "email": "alice@example.com"
    },
    "role": "developer"
  }
}
```

### 4.8 Remove Team Member
**DELETE** `/api/projects/{projectId}/team-members/{userId}`

**Authorization:** Bearer <token>

**Description:** Remove a team member from a project.

**Features:**
- Validates user is a team member before removing
- Creates notification for removed user
- Only project creator or admin can remove members

**Parameters:**
- `{projectId}`: Project ID
- `{userId}`: User ID to remove

**Success Response (200):**
```json
{
  "message": "Team member removed successfully",
  "removedMember": {
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Alice Johnson",
      "email": "alice@example.com"
    },
    "role": "developer"
  }
}
```

### 4.9 Update Team Member Role
**PUT** `/api/projects/{projectId}/team-members/{userId}`

**Authorization:** Bearer <token>

**Description:** Update a team member's role in a project.

**Features:**
- Validates user is a team member before updating
- Creates notification for role change
- Only project creator or admin can update roles

**Parameters:**
- `{projectId}`: Project ID
- `{userId}`: User ID to update

**Request Body:**
```json
{
  "role": "senior-developer"
}
```

**Required Fields:** role

**Success Response (200):**
```json
{
  "message": "Team member role updated successfully",
  "updatedMember": {
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Alice Johnson",
      "email": "alice@example.com"
    },
    "role": "senior-developer"
  }
}
```

### 4.10 Bulk Add Team Members
**POST** `/api/projects/{projectId}/team-members/bulk`

**Authorization:** Bearer <token>

**Description:** Add multiple team members to a project at once.

**Features:**
- Validates all user IDs exist before adding
- Prevents duplicate team members
- Skips users already in the team
- Creates notifications for all added users
- Only project creator or admin can add members

**Request Body:**
```json
{
  "teamMembers": [
    {
      "userId": "507f1f77bcf86cd799439014",
      "role": "developer"
    },
    {
      "userId": "507f1f77bcf86cd799439015",
      "role": "tester"
    },
    {
      "userId": "507f1f77bcf86cd799439016",
      "role": "designer"
    }
  ]
}
```

**Required Fields:** teamMembers (array)
**Each team member object:**
- `userId`: User ID (required)
- `role`: Role (optional, defaults to 'member')

**Success Response (200):**
```json
{
  "message": "Successfully added 3 team member(s)",
  "addedMembers": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "developer"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Charlie Brown",
      "email": "charlie@example.com",
      "role": "tester"
    },
    {
      "_id": "507f1f77bcf86cd799439016",
      "name": "Diana Prince",
      "email": "diana@example.com",
      "role": "designer"
    }
  ],
  "totalTeamMembers": 5
}
```

---

## 5. Tasks Management

### 5.1 Get All Tasks
**GET** `/api/tasks`

**Authorization:** Bearer <token>

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "id": "TASK-0001",
    "projectId": "PROJ-001",
    "task": "Implement User Authentication",
    "description": "Create login and registration functionality with JWT tokens",
    "taskType": "Adhoc",
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

### 5.2 Get Task By ID
**GET** `/api/tasks/{taskId}`

**Authorization:** Bearer <token>

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
  "taskType": "Adhoc",
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

### 5.3 Create Task
**POST** `/api/tasks`

**Authorization:** Bearer <token>

**Description:** Create a new task with user ID references.

**Important Changes:**
- `assignedTo` and `reporter` now accept User IDs (ObjectId strings)
- You can also pass user email or name - the API will convert them to IDs
- Task ID is automatically generated with retry logic for duplicates

**User Reference Examples:**
- **User ID**: `"assignedTo": "507f1f77bcf86cd799439011"`
- **User Email**: `"assignedTo": "john@example.com"`
- **User Name**: `"assignedTo": "John Doe"`

**Request Body:**
```json
{
  "projectId": "PROJ-001",
  "task": "Implement User Authentication",
  "description": "Create login and registration functionality with JWT tokens",
  "taskType": "Adhoc",
  "priority": "High",
  "status": "Yet to Start",
  "assignedTo": "507f1f77bcf86cd799439011",
  "reporter": "507f1f77bcf86cd799439012",
  "eta": "2024-12-31",
  "estimatedHours": 8,
  "labels": ["frontend", "auth", "urgent"],
  "sprint": "Sprint 1"
}
```

**Required Fields:** projectId, task, assignedTo, reporter, eta
**Optional Fields:** description, taskType, priority, status, startDate, estimatedHours, remark, roadBlock, supportNeeded, labels, attachments, relatedTasks, parentTask, sprint

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439021",
  "id": "TASK-0003",
  "projectId": "PROJ-001",
  "task": "Implement User Authentication",
  "description": "Create login and registration functionality with JWT tokens",
  "taskType": "Adhoc",
  "priority": "High",
  "status": "Yet to Start",
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

### 5.4 Update Task
**PUT** `/api/tasks/{taskId}`

**Authorization:** Bearer <token>

**Important:** The `{task_id}` parameter must be the MongoDB ObjectId (`_id` field), not the custom task ID (`id` field).

**Example:**
- ✅ Correct: `PUT /api/tasks/507f1f77bcf86cd799439021` (using `_id`)
- ❌ Wrong: `PUT /api/tasks/TASK-0001` (using custom `id`)

**Description:** Update any task field with flexible updates.

**Common Update Examples:**
- **Start Work**: `{"status": "In Progress", "startDate": "2024-12-01"}`
- **Add Roadblock**: `{"status": "Blocked", "roadBlock": "Need API docs", "supportNeeded": "Backend specs"}`
- **Complete Task**: `{"status": "Completed", "actualHours": 8, "remark": "Successfully completed"}`
- **Reassign Task**: `{"assignedTo": "jane@example.com"}` (supports ID, email, or name)
- **Add Attachments**: `{"attachments": ["docs.pdf", "screenshots.zip"]}`
- **Link Related Tasks**: `{"relatedTasks": ["TASK-0002", "TASK-0003"], "parentTask": "TASK-0001"}`
- **Update Labels**: `{"labels": ["frontend", "auth", "completed"]}`

**Request Body:**
```json
{
  "status": "In Progress",
  "startDate": "2024-12-01",
  "actualHours": 3,
  "remark": "Started working on authentication flow"
}
```

**All fields are optional** - only send the fields you want to update

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439021",
  "id": "TASK-0001",
  "projectId": "PROJ-001",
  "task": "Implement User Authentication",
  "description": "Create login and registration functionality with JWT tokens",
  "taskType": "Adhoc",
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
  "updatedAt": "2024-12-01T15:00:00.000Z"
}
```

### 5.5 Delete Task
**DELETE** `/api/tasks/{taskId}`

**Authorization:** Bearer <token>

**Important:** The `{task_id}` parameter must be the MongoDB ObjectId (`_id` field), not the custom task ID (`id` field).

**Example:**
- ✅ Correct: `DELETE /api/tasks/507f1f77bcf86cd799439021` (using `_id`)
- ❌ Wrong: `DELETE /api/tasks/TASK-0001` (using custom `id`)

**Success Response (200):**
```json
{
  "message": "Task deleted successfully",
  "deletedTaskId": "507f1f77bcf86cd799439021"
}
```

---

## 5. Error Responses

### 5.1 Bad Request Error (400)
```json
{
  "error": "Missing required field",
  "message": "Project title is required"
}
```

### 5.2 Unauthorized Error (401)
```json
{
  "error": "Access denied",
  "message": "No token provided"
}
```

### 5.3 Forbidden Error (403)
```json
{
  "error": "Access denied",
  "message": "Not authorized to update this project"
}
```

### 5.4 Not Found Error (404)
```json
{
  "error": "Project not found",
  "message": "No project found with the provided ID"
}
```

### 5.5 Project Not Found Error (404)
```json
{
  "error": "Project not found",
  "message": "No project found with the provided ID"
}
```

### 5.6 Conflict Error (409)
```json
{
  "error": "Duplicate task ID",
  "message": "A task with this ID already exists. Please try again."
}
```

### 5.7 Internal Server Error (500)
```json
{
  "error": "Failed to fetch project tasks",
  "message": "Database connection error"
}
```

---

## 6. Task Field Reference

### Required Fields
- `projectId`: Project identifier (string or ObjectId)
- `task`: Task title/name (string)
- `assignedTo`: User assigned to the task (User ID, email, or name)
- `reporter`: User reporting the task (User ID, email, or name)
- `eta`: Estimated time of arrival/completion (date string)

### Optional Fields
- `description`: Task description (string)
- `taskType`: Type of task - "Daily", "Weekly", "Monthly", "Adhoc", "All Tasks" (string; passing "All Tasks" or "All" applies no type filter on list APIs)
- `priority`: Priority level - "Low", "Medium", "High", "Critical" (string)
- `status`: Task status - "Yet to Start", "In Progress", "Completed", "Blocked", "On Hold", "Cancelled" (string)
- `startDate`: When work started (date string)
- `estimatedHours`: Estimated hours to complete (number)
- `actualHours`: Actual hours spent (number)
- `remark`: Additional notes (string)
- `roadBlock`: Description of any roadblocks (string)
- `supportNeeded`: Description of support needed (string)
- `labels`: Array of labels/tags (array of strings)
- `attachments`: Array of file attachments (array of strings)
- `relatedTasks`: Array of related task IDs (array of strings)
- `parentTask`: Parent task ID (string)
- `sprint`: Sprint identifier (string)

### Auto-Generated Fields
- `id`: Custom task ID (e.g., "TASK-0001") - **Auto-generated, do not include in requests**
- `_id`: MongoDB ObjectId - **Auto-generated**
- `createdAt`: Creation timestamp - **Auto-generated**
- `updatedAt`: Last update timestamp - **Auto-generated**

---

## 7. Important Notes

### Task ID Generation
- Task IDs are automatically generated in the format "TASK-XXXX" (e.g., "TASK-0001")
- The `id` field should **NOT** be included in task creation requests
- The system handles duplicate ID generation with retry logic
- Use `npm run test:task-creation` to test the ID generation functionality

### User References
- `assignedTo` and `reporter` fields accept User IDs, emails, or names
- The API automatically converts emails/names to User IDs
- All responses include populated user details (name and email)

### Project ID Handling
- Project endpoints handle mixed `projectId` formats (ObjectId or string title)
- Tasks can reference projects by either ID or title
- Use migration scripts to standardize project references

### Team Member Management
- Team members have roles (e.g., "developer", "designer", "tester")
- Only project creators and admins can manage team members
- Notifications are sent for all team member changes
- Bulk operations are available for efficiency

---

## 8. Testing Examples

### Test Task ID Generation
```bash
npm run test:task-creation
```

### Test Project Tasks Endpoint
```bash
curl -X GET "http://localhost:5000/api/projects/507f1f77bcf86cd799439031/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Team Member Management
```bash
# Add team member
curl -X POST "http://localhost:5000/api/projects/507f1f77bcf86cd799439031/team-members" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userId": "507f1f77bcf86cd799439014", "role": "developer"}'

# Update team member role
curl -X PUT "http://localhost:5000/api/projects/507f1f77bcf86cd799439031/team-members/507f1f77bcf86cd799439014" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"role": "senior-developer"}'

# Remove team member
curl -X DELETE "http://localhost:5000/api/projects/507f1f77bcf86cd799439031/team-members/507f1f77bcf86cd799439014" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 9. Frontend Integration Notes

### Task Operations
- Use `task._id` for GET, PUT, and DELETE operations (not `task.id`)
- Task IDs (e.g., "TASK-0001") are for display purposes only
- Always use MongoDB ObjectIds for API operations

### Project Management
- Use the new `/api/projects/{projectId}/tasks` endpoint for project detail pages
- Team member management provides full CRUD operations
- Bulk operations are available for efficient team management

### Error Handling
- All endpoints return consistent error formats
- Check for `error` and `message` fields in error responses
- Handle 400, 401, 403, 404, 409, and 500 status codes appropriately

### Notifications
- Team member changes trigger automatic notifications
- Project updates notify all team members
- Task assignments notify the assigned user
