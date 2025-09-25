# 🚀 FRONTEND QUICK REFERENCE
## Project Tracker Backend - API Quick Reference

## 🔐 **AUTHENTICATION**

### **Login**
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### **Register**
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "user@example.com", 
  "password": "password123",
  "role": "employee"
}
```

### **Switch Brand**
```javascript
POST /api/auth/switch-brand
{
  "brandId": "brand_id"
}
```

---

## 🏢 **BRAND MANAGEMENT**

### **Get User's Brands**
```javascript
GET /api/brands
```

### **Create Brand**
```javascript
POST /api/brands
{
  "name": "My Company",
  "description": "Company description"
}
```

### **Get Brand Details**
```javascript
GET /api/brands/:brandId
```

---

## 📋 **PROJECT MANAGEMENT**

### **Get Brand Projects**
```javascript
GET /api/brands/:brandId/projects
```

### **Create Project**
```javascript
POST /api/brands/:brandId/projects
{
  "title": "Project Title",
  "description": "Project description",
  "status": "Active",
  "teamMembers": ["user_id1", "user_id2"]
}
```

### **Get Project Details**
```javascript
GET /api/brands/:brandId/projects/:projectId
```

### **Update Project**
```javascript
PUT /api/brands/:brandId/projects/:projectId
{
  "title": "Updated Title",
  "status": "Completed"
}
```

---

## ✅ **TASK MANAGEMENT**

### **Get Brand Tasks**
```javascript
GET /api/brands/:brandId/tasks
```

### **Create Task**
```javascript
POST /api/brands/:brandId/tasks
{
  "task": "Task Title",
  "description": "Task description",
  "projectId": "project_id",
  "assignedTo": "user_id",
  "reporter": "user_id",
  "eta": "2024-01-01",
  "priority": "High",
  "status": "To Do"
}
```

### **Assign Task**
```javascript
POST /api/brands/:brandId/tasks/:taskId/assign
{
  "userId": "user_id"
}
```

### **Update Task Status**
```javascript
PUT /api/brands/:brandId/tasks/:taskId/status
{
  "status": "In Progress"
}
```

---

## 📝 **SUBTASK MANAGEMENT**

### **Get Task Subtasks**
```javascript
GET /api/brands/:brandId/tasks/:taskId/subtasks
```

### **Create Subtask**
```javascript
POST /api/brands/:brandId/subtasks
{
  "taskId": "task_id",
  "title": "Subtask Title",
  "description": "Subtask description",
  "assignedTo": "user_id",
  "priority": "Medium",
  "status": "Yet to Start"
}
```

### **Complete Subtask**
```javascript
PUT /api/brands/:brandId/subtasks/:subtaskId/complete
```

---

## 💬 **COMMENTS & COMMUNICATION**

### **Get Entity Comments**
```javascript
GET /api/brands/:brandId/:entityType/:entityId/comments
// entityType: task, project, subtask
// entityId: the ID of the entity
```

### **Create Comment**
```javascript
POST /api/brands/:brandId/:entityType/:entityId/comments
{
  "content": "Comment content",
  "mentions": [{"user_id": "user_id", "position": 0, "length": 5}]
}
```

### **React to Comment**
```javascript
POST /api/brands/:brandId/comments/:commentId/react
{
  "emoji": "👍"
}
```

### **Get Activity Feed**
```javascript
GET /api/brands/:brandId/activities/feed
```

---

## 🔍 **SEARCH & FILTERING**

### **Search Tasks**
```javascript
GET /api/brands/:brandId/tasks/search?q=search_term
```

### **Filter Tasks**
```javascript
GET /api/brands/:brandId/tasks/filter?status=In Progress&priority=High
```

### **Search Comments**
```javascript
GET /api/brands/:brandId/comments/search?q=search_term
```

---

## 📊 **ANALYTICS**

### **Get Project Analytics**
```javascript
GET /api/brands/:brandId/projects/:projectId/analytics
```

### **Get Task Analytics**
```javascript
GET /api/brands/:brandId/tasks/analytics
```

### **Get Comment Analytics**
```javascript
GET /api/brands/:brandId/comments/analytics
```

---

## 🔒 **AUTHORIZATION HEADERS**

### **Required Headers**
```javascript
{
  "Authorization": "Bearer your_jwt_token",
  "Content-Type": "application/json"
}
```

### **Brand Context**
All brand-specific APIs require the brandId in the URL path:
- `/api/brands/:brandId/projects`
- `/api/brands/:brandId/tasks`
- `/api/brands/:brandId/comments`

---

## 📱 **FRONTEND IMPLEMENTATION TIPS**

### **1. Store JWT Token**
```javascript
localStorage.setItem('token', response.data.token);
```

### **2. Get Current Brand ID**
```javascript
const currentBrand = JSON.parse(localStorage.getItem('currentBrand'));
const brandId = currentBrand.brandId;
```

### **3. Handle API Errors**
```javascript
try {
  const response = await apiCall('/api/endpoint');
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized access
    logout();
    redirectToLogin();
  }
  throw error;
}
```

### **4. Real-time Updates**
```javascript
// Listen for real-time updates
socket.on('task_updated', (data) => {
  updateTaskInState(data.task);
});

socket.on('comment_added', (data) => {
  addCommentToState(data.comment);
});
```

---

## 🚀 **QUICK START**

1. **Login** → Get JWT token
2. **Get Brands** → List user's brands
3. **Switch Brand** → Set current brand context
4. **Get Projects** → List brand projects
5. **Create Task** → Add tasks to projects
6. **Add Comments** → Enable collaboration
7. **Track Activities** → Monitor progress

---

## 📞 **SUPPORT**

- **API Documentation**: `API_DOCUMENTATION_COMPLETE.md`
- **Postman Collections**: Available for testing
- **Backend Team**: Contact for clarification

**🎉 Ready for frontend development! 🚀**
