# 🚀 Project Tracker Backend API

A robust, scalable, and feature-rich RESTful API for comprehensive project and task management. Built with Node.js, Express.js, and MongoDB, this API provides enterprise-grade project tracking capabilities with advanced team management, real-time analytics, and seamless integration capabilities.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express.js](https://img.shields.io/badge/Express.js-4.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![REST API](https://img.shields.io/badge/REST-API-red)

## ✨ Features

### 🎯 Core Project Management
- **Complete Project Lifecycle**: Create, read, update, and delete projects with full CRUD operations
- **Advanced Team Management**: Add, remove, and manage team members with role-based permissions
- **Project Status Tracking**: Monitor project progress with status updates and priority management
- **File Attachments**: Support for project-related file uploads and management
- **Real-time Notifications**: Automated notifications for project updates and team changes

### 📋 Task Management System
- **Smart Task Creation**: Auto-generated sequential task IDs (TASK-0001, TASK-0002, etc.)
- **Advanced Task Assignment**: Assign tasks to team members with reporter tracking
- **Task Status Workflow**: Comprehensive status management (Yet to Start, In Progress, Completed, Blocked, On Hold, Cancelled)
- **Priority Management**: High, Medium, Low priority levels with visual indicators
- **Due Date Tracking**: ETA management with overdue task detection
- **Task Filtering**: Get tasks by project, status, priority, or assignee

### 👥 User Management & Authentication
- **Secure Authentication**: JWT-based authentication with role-based access control
- **User Registration & Login**: Complete user lifecycle management
- **Role-Based Permissions**: Admin, user, and project-specific permissions
- **Profile Management**: User profile updates and management
- **Password Security**: Bcrypt hashing for secure password storage

### 📊 Advanced Analytics & Dashboard
- **Comprehensive Dashboard**: Single endpoint for all dashboard metrics
- **Real-time Statistics**: Active projects, total tasks, team member counts
- **Progress Tracking**: Task completion rates and project progress monitoring
- **Performance Metrics**: Overdue tasks, pending tasks, and completion trends
- **Recent Activity**: Latest project updates and recent task activities

### 🔧 Team Collaboration Features
- **Team Member Management**: Add, remove, and update team member roles
- **Bulk Operations**: Add multiple team members simultaneously
- **Role Management**: Developer, tester, lead, and custom role assignments
- **Permission Control**: Project creator and admin-only management capabilities
- **Team Notifications**: Automated notifications for team changes

### 🛡️ Security & Data Integrity
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Standardized error responses with proper HTTP status codes
- **Data Consistency**: Automatic data migration and format standardization
- **Duplicate Prevention**: Smart handling of duplicate entries and conflicts
- **Audit Trail**: Complete tracking of all operations and changes

## 🏗️ Architecture & Technology Stack

### Backend Technologies
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Bcryptjs**: Password hashing and security
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

### Database Design
- **User Collection**: User profiles, authentication, and role management
- **Project Collection**: Project details, team members, and file attachments
- **Task Collection**: Task management with auto-generated IDs and user references
- **Notification Collection**: Real-time notifications and alerts
- **UserTask Collection**: User-task relationships and assignments

### API Architecture
- **RESTful Design**: Standard HTTP methods and status codes
- **Middleware Architecture**: Authentication, validation, and error handling
- **Modular Structure**: Separated routes, controllers, and models
- **Scalable Design**: Easy to extend and maintain

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-tracker-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Configure your environment variables
   MONGODB_URI=mongodb://localhost:27017/project-tracker
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Run migrations (if needed)**
   ```bash
   npm run migrate:all
   ```

### API Base URL
```
http://localhost:5000/api
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user profile

### Dashboard & Analytics
- `GET /dashboard/summary` - Comprehensive dashboard data
- `GET /dashboard` - Basic dashboard statistics
- `GET /dashboard/projects-summary` - Project analytics
- `GET /dashboard/tasks-summary` - Task analytics

### Project Management
- `GET /projects` - Get all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project by ID
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/tasks` - Get project tasks

### Team Member Management
- `POST /projects/:id/team-members` - Add team member
- `DELETE /projects/:id/team-members/:userId` - Remove team member
- `PUT /projects/:id/team-members/:userId` - Update team member role
- `POST /projects/:id/team-members/bulk` - Bulk add team members

### Task Management
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get task by ID
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### User Management
- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 🔧 Key Features in Detail

### Auto-Generated Task IDs
The system automatically generates sequential task IDs (TASK-0001, TASK-0002, etc.) with intelligent duplicate handling and retry mechanisms.

### Smart User References
All user references (assignedTo, reporter) are stored as ObjectIds with automatic population of user details (name, email) in responses.

### Comprehensive Error Handling
Standardized error responses with proper HTTP status codes and detailed error messages for better debugging and user experience.

### Performance Optimizations
- Single dashboard endpoint reduces multiple API calls
- Optimized database queries with proper indexing
- Efficient data aggregation for analytics
- Smart caching strategies

### Data Migration & Consistency
- Automatic migration scripts for data format standardization
- Backward compatibility for existing data
- Consistent data structures across all collections

## 📊 API Response Examples

### Dashboard Summary Response
```json
{
  "activeProjectsCount": 2,
  "totalTasksCount": 6,
  "inProgressTasksCount": 2,
  "completedTasksCount": 3,
  "totalTeamMembersCount": 5,
  "recentProjects": [...],
  "taskProgress": {
    "completed": 3,
    "inProgress": 2,
    "total": 6
  }
}
```

### Task Creation Response
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "id": "TASK-0007",
  "projectId": "507f1f77bcf86cd799439031",
  "task": "Implement user authentication",
  "assignedTo": {
    "_id": "507f1f77bcf86cd799439031",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "status": "In Progress",
  "priority": "High"
}
```

## 🛠️ Development & Testing

### Available Scripts
```bash
npm start          # Start the server
npm run dev        # Start in development mode
npm test           # Run tests
npm run migrate:all # Run all migrations
```

### Testing with Postman
Import the provided Postman collection (`Project_Tracker_API_Simplified.postman_collection.json`) for comprehensive API testing.

### Database Migrations
- `migration-fix-task-users.js` - Fix user references in tasks
- `migration-standardize-project-ids.js` - Standardize project ID formats
- `reset-task-counter.js` - Reset task ID counter

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for password security
- **Input Validation**: Comprehensive request validation
- **Role-Based Access**: Granular permission control
- **CORS Protection**: Cross-origin request handling
- **Error Sanitization**: Safe error message handling

## 📈 Performance & Scalability

- **Optimized Queries**: Efficient database operations
- **Aggregation Pipelines**: Fast data processing
- **Indexing Strategy**: Proper database indexing
- **Modular Architecture**: Easy to scale and maintain
- **Caching Ready**: Prepared for Redis integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the migration guides

## 🎯 Roadmap

- [ ] Real-time WebSocket integration
- [ ] Advanced reporting and analytics
- [ ] Mobile app API optimization
- [ ] Third-party integrations
- [ ] Advanced search and filtering
- [ ] Bulk operations for tasks and projects

---

**Built with ❤️ using Node.js, Express.js, and MongoDB**

*This API provides a solid foundation for building powerful project management applications with enterprise-grade features and scalability.*
