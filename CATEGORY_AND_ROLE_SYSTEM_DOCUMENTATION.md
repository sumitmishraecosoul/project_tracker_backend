# Category and Role System Documentation

## 📊 Overview
This document describes the new Category system for task organization and the updated Role-based access control system.

---

## 🔐 Role System (3 Roles)

### **Role Hierarchy:**
```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN (Primary Admin)                     │
│  - Super user with full system access                        │
│  - Can see ALL brands (created by anyone)                    │
│  - Can create brands and invite users                        │
│  - Can delete categories (and all tasks inside)              │
│  - Full permissions across all brands                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────────────────┐
                              │                             │
┌─────────────────────────────▼───────┐    ┌───────────────▼──────────────┐
│        BRAND ADMIN                  │    │           USER               │
│  - Can create brands                │    │  - Cannot create brands      │
│  - Can invite users to brands       │    │  - Cannot invite users       │
│  - Can see only:                    │    │  - Can see only:             │
│    • Brands they created            │    │    • Brands they're invited  │
│    • Brands they were invited to    │    │      to                      │
│  - Can delete categories            │    │  - Can work on assigned      │
│  - Can manage their brands          │    │    tasks                     │
└─────────────────────────────────────┘    └──────────────────────────────┘
```

---

## 👥 Role Permissions Matrix

| Permission | Admin (Primary) | Brand Admin | User |
|------------|----------------|-------------|------|
| **Brand Management** |
| Create brands | ✅ | ✅ | ❌ |
| View all brands | ✅ | ❌ | ❌ |
| View own brands | ✅ | ✅ | ❌ |
| View invited brands | ✅ | ✅ | ✅ |
| Delete brands | ✅ | ✅ (own only) | ❌ |
| **User Management** |
| Invite users to brands | ✅ | ✅ | ❌ |
| Assign roles (Brand Admin/User) | ✅ | ✅ | ❌ |
| Remove users from brands | ✅ | ✅ | ❌ |
| **Project Management** |
| Create projects | ✅ | ✅ | ❌ |
| Edit projects | ✅ | ✅ | ❌ |
| Delete projects | ✅ | ✅ | ❌ |
| View projects | ✅ | ✅ | ✅ |
| **Category Management** |
| Create categories | ✅ | ✅ | ❌ |
| Edit categories | ✅ | ✅ | ❌ |
| Delete categories | ✅ | ✅ | ❌ |
| Reorder categories | ✅ | ✅ | ❌ |
| View categories | ✅ | ✅ | ✅ |
| **Task Management** |
| Create tasks | ✅ | ✅ | ✅ |
| Edit tasks | ✅ | ✅ | ✅ (own only) |
| Delete tasks | ✅ | ✅ | ❌ |
| View tasks | ✅ | ✅ | ✅ |
| Assign tasks | ✅ | ✅ | ❌ |
| **Subtask Management** |
| Create subtasks | ✅ | ✅ | ✅ |
| Edit subtasks | ✅ | ✅ | ✅ (own only) |
| Delete subtasks | ✅ | ✅ | ❌ |
| View subtasks | ✅ | ✅ | ✅ |

---

## 📂 Category System

### **New Structure:**
```
Brand: "EcoSoul"
│
└─ Project: "Website Redesign"
   │
   ├─ 📁 Category: "Yet to Start" (default)
   │   ├─ ✅ Task: "Setup development environment"
   │   │   ├─ 📝 Subtask: "Install Node.js"
   │   │   └─ 📝 Subtask: "Configure database"
   │   └─ ✅ Task: "Create project documentation"
   │
   ├─ 📁 Category: "In Progress" (default)
   │   ├─ ✅ Task: "Design homepage"
   │   │   ├─ 📝 Subtask: "Create wireframe"
   │   │   └─ 📝 Subtask: "Design mockup"
   │   └─ ✅ Task: "Build API"
   │
   ├─ 📁 Category: "Completed" (default)
   │   └─ ✅ Task: "Initial planning"
   │       └─ 📝 Subtask: "Stakeholder meeting"
   │
   ├─ 📁 Category: "Design" (custom)
   │   ├─ ✅ Task: "Create logo"
   │   └─ ✅ Task: "Design color scheme"
   │
   ├─ 📁 Category: "Marketing" (custom)
   │   ├─ ✅ Task: "Write blog post"
   │   └─ ✅ Task: "Social media campaign"
   │
   └─ 📁 Category: "Client Communication" (custom)
       └─ ✅ Task: "Weekly status report"
```

### **Category Features:**

#### **1. Default Categories**
When a project is created, 3 default categories are automatically created:
- "Yet to Start"
- "In Progress"
- "Completed"

#### **2. Custom Categories**
- Can add unlimited custom categories
- Category names are fully customizable
- Examples: "Design", "Marketing", "Development", "Testing", "Client", etc.

#### **3. Category Operations**
- ✅ **Create**: Add new categories to organize tasks
- ✅ **Read**: View all categories in a project
- ✅ **Update**: Rename/edit category names
- ✅ **Delete**: Remove categories (deletes all tasks inside)
- ✅ **Reorder**: Drag & drop to reorder categories

#### **4. Category Rules**
- All tasks **MUST** belong to a category
- Categories are **project-specific** (not shared across projects)
- Deleting a category **deletes all tasks and subtasks** inside it
- Only **Admin** and **Brand Admin** can delete categories

---

## 🔄 User Flows

### **1. Admin (Primary Admin) Flow:**
```
1. Admin signs up → Selects "Admin" role
2. Admin logs in → Sees ALL brands in system
3. Admin can:
   - Create new brands
   - Access any brand
   - Invite users to any brand
   - Manage all projects/categories/tasks
   - Delete any data
```

### **2. Brand Admin Flow:**
```
1. Brand Admin signs up → Selects "Brand Admin" role
2. Brand Admin logs in → Sees only:
   - Brands they created
   - Brands they were invited to
3. Brand Admin can:
   - Create new brands
   - Invite users (as Brand Admin or User)
   - Manage projects in their brands
   - Create/edit/delete categories
   - Manage tasks and subtasks
```

### **3. User Flow:**
```
1. User signs up → Selects "User" role
2. User logs in → Sees only brands they were invited to
3. User receives invitation:
   - Brand Admin/Admin sends invitation
   - User accepts invitation
   - User gets access to that brand
4. User can:
   - View projects in invited brands
   - Create/edit tasks assigned to them
   - Create/edit subtasks
   - Cannot delete tasks/categories
   - Cannot invite other users
```

---

## 📋 Category Workflow

### **Creating a Project:**
```
1. Brand Admin creates a project
2. System automatically creates 3 default categories:
   - "Yet to Start"
   - "In Progress"
   - "Completed"
3. Brand Admin can add custom categories:
   - "Design"
   - "Marketing"
   - "Development"
   - etc.
```

### **Creating a Task:**
```
1. User/Brand Admin/Admin creates a task
2. Must select a category (required field)
3. Task is created inside the selected category
4. Tasks can be moved between categories by changing category_id
```

### **Organizing Tasks by Team:**
```
Example: Website Project

Category: "Design Team"
├─ Task: "Create homepage mockup"
├─ Task: "Design logo"
└─ Task: "Color scheme selection"

Category: "Development Team"
├─ Task: "Build homepage"
├─ Task: "API integration"
└─ Task: "Database setup"

Category: "Marketing Team"
├─ Task: "Blog post writing"
├─ Task: "Social media campaign"
└─ Task: "Email newsletter"

→ Design team only checks "Design Team" category
→ Development team only checks "Development Team" category
→ Marketing team only checks "Marketing Team" category
```

---

## 🛠️ Technical Implementation

### **Database Models:**

#### **Category Model:**
```javascript
{
  _id: ObjectId,
  name: String,              // "Yet to Start", "Design", etc.
  project_id: ObjectId,      // Reference to Project
  brand_id: ObjectId,        // Reference to Brand
  order: Number,             // For drag & drop ordering (0, 1, 2, ...)
  is_default: Boolean,       // true for default 3 categories
  created_by: ObjectId,      // Reference to User who created
  created_at: Date,
  updated_at: Date
}
```

#### **Updated Task Model:**
```javascript
{
  // ... existing fields
  category_id: {
    type: ObjectId,
    ref: 'Category',
    required: true           // NEW - Tasks must belong to a category
  }
  // ... rest remains same
}
```

#### **Updated User Model:**
```javascript
{
  // ... existing fields
  role: {
    type: String,
    enum: ['admin', 'brand_admin', 'user'],  // Updated from 3 roles
    default: 'user'
  }
  // ... rest remains same
}
```

### **API Endpoints:**

#### **Category APIs:**
```
POST   /api/brands/:brandId/projects/:projectId/categories
       → Create a new category

GET    /api/brands/:brandId/projects/:projectId/categories
       → Get all categories in a project

GET    /api/brands/:brandId/projects/:projectId/categories/:categoryId
       → Get a specific category with its tasks

PUT    /api/brands/:brandId/projects/:projectId/categories/:categoryId
       → Update category name/order

DELETE /api/brands/:brandId/projects/:projectId/categories/:categoryId
       → Delete category (and all tasks inside)

PUT    /api/brands/:brandId/projects/:projectId/categories/reorder
       → Reorder categories (drag & drop)

GET    /api/brands/:brandId/projects/:projectId/categories/:categoryId/tasks
       → Get all tasks in a specific category
```

#### **Updated Task APIs:**
```
POST   /api/brands/:brandId/tasks
       → Now requires category_id field

PUT    /api/brands/:brandId/tasks/:taskId
       → Can update category_id to move tasks between categories
```

---

## 🔄 Migration Plan

### **Step 1: Clean Existing Data**
```javascript
// Delete all existing tasks and subtasks
await Task.deleteMany({});
await Subtask.deleteMany({});
```

### **Step 2: Create Category Model**
- Add new Category model to the system

### **Step 3: Update Task Model**
- Add `category_id` field (required)

### **Step 4: Update Project Creation**
- Automatically create 3 default categories when project is created

### **Step 5: Update User Registration**
- Add role selection (admin, brand_admin, user)

### **Step 6: Update Brand Access Logic**
- Admin: sees all brands
- Brand Admin: sees own/invited brands
- User: sees invited brands only

---

## 📊 Example Scenarios

### **Scenario 1: Design Agency Project**
```
Project: "Client Website Design"

Categories:
├─ "Initial Planning" → Tasks: Research, Wireframes, Client meeting
├─ "Design Phase" → Tasks: Logo design, Color palette, UI mockups
├─ "Development" → Tasks: Frontend coding, Backend API, Database
├─ "Testing" → Tasks: QA testing, Bug fixes, User testing
└─ "Launch" → Tasks: Deploy, Documentation, Handover
```

### **Scenario 2: Marketing Campaign**
```
Project: "Q1 Marketing Campaign"

Categories:
├─ "Content Creation" → Tasks: Blog posts, Videos, Graphics
├─ "Social Media" → Tasks: Instagram, Facebook, Twitter
├─ "Email Marketing" → Tasks: Newsletter, Drip campaign
├─ "Paid Ads" → Tasks: Google Ads, Facebook Ads
└─ "Analytics" → Tasks: Track metrics, Generate reports
```

### **Scenario 3: Software Development**
```
Project: "Mobile App Development"

Categories:
├─ "Backend" → Tasks: API development, Database design, Authentication
├─ "Frontend" → Tasks: UI components, Screens, Navigation
├─ "Testing" → Tasks: Unit tests, Integration tests, E2E tests
├─ "DevOps" → Tasks: CI/CD, Deployment, Monitoring
└─ "Documentation" → Tasks: API docs, User guide, README
```

---

## ✅ Benefits

### **For Team Organization:**
- Clear separation of tasks by department/type
- Teams can focus on their category only
- Reduces noise and confusion
- Better task visibility

### **For Project Management:**
- Better overview of project structure
- Easy to see progress by category
- Flexible categorization
- Customizable to any workflow

### **For Users:**
- Easier to find relevant tasks
- Less time searching through all tasks
- Clear understanding of task context
- Better focus on assigned work

---

## 🚀 Summary

### **Key Changes:**
1. ✅ 3 Role System: Admin, Brand Admin, User
2. ✅ Category layer added: Brand → Project → **Category** → Task → Subtask
3. ✅ 3 Default categories: "Yet to Start", "In Progress", "Completed"
4. ✅ Unlimited custom categories
5. ✅ All tasks must belong to a category
6. ✅ Deleting category deletes all tasks inside
7. ✅ Drag & drop category reordering
8. ✅ Role-based access control for all operations

### **Migration:**
- Delete all existing tasks and subtasks
- All new tasks will be created inside categories

### **Access Control:**
- **Admin**: Full access to all brands
- **Brand Admin**: Access to own/invited brands only
- **User**: Access to invited brands only, limited permissions

---

*Last Updated: October 1, 2025*


