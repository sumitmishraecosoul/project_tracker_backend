# Project Tracker Backend API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Core Endpoints

### Authentication
- POST /auth/register - Register user
- POST /auth/login - Login user

### Brands
- GET /brands - Get all brands
- POST /brands - Create brand
- GET /brands/:brandId - Get brand by ID
- PUT /brands/:brandId - Update brand
- POST /brands/:brandId/switch - Switch to brand

### Projects
- GET /brands/:brandId/projects - Get all projects
- POST /brands/:brandId/projects - Create project
- GET /brands/:brandId/projects/:projectId - Get project by ID
- PUT /brands/:brandId/projects/:projectId - Update project
- DELETE /brands/:brandId/projects/:projectId - Delete project

### Tasks
- GET /brands/:brandId/tasks - Get all tasks
- POST /brands/:brandId/tasks - Create task
- GET /brands/:brandId/tasks/:taskId - Get task by ID
- PUT /brands/:brandId/tasks/:taskId - Update task
- DELETE /brands/:brandId/tasks/:taskId - Delete task

### Comments
- GET /brands/:brandId/tasks/:taskId/comments - Get comments
- POST /brands/:brandId/tasks/:taskId/comments - Create comment
- PUT /brands/:brandId/comments/:commentId - Update comment
- DELETE /brands/:brandId/comments/:commentId - Delete comment
- POST /brands/:brandId/comments/:commentId/reactions - Add reaction
- POST /brands/:brandId/comments/:commentId/replies - Add reply

### Notifications
- GET /brands/:brandId/notifications - Get notifications
- GET /brands/:brandId/notifications/preferences - Get preferences
- PUT /brands/:brandId/notifications/preferences - Update preferences

### WebSocket
- WS /api/ws - Real-time connection

## Implementation Status
✅ All phases (1-7) implemented
✅ Advanced comment system
✅ Real-time communication
✅ Analytics and reporting

