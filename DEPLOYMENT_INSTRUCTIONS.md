# Deployment Instructions - Category & Role System

## 🚀 **Quick Start Guide**

This document provides step-by-step instructions to deploy the new Category and Role system.

---

## 📋 **Pre-Deployment Checklist:**

- [ ] Backup your database (if needed)
- [ ] Review changes in `CATEGORY_SYSTEM_IMPLEMENTATION_SUMMARY.md`
- [ ] Test on local environment first
- [ ] Inform users about downtime (if applicable)

---

## 🗂️ **Step 1: Clean Database (REQUIRED)**

### **⚠️ WARNING: This will delete ALL data!**

The new system requires a clean database because:
1. Tasks now require `category_id` (breaking change)
2. User roles have changed
3. Need fresh start with new structure

### **Run Migration Script:**

```bash
# Navigate to project directory
cd C:\Users\Sumit Mishra\Downloads\project-tracker-backend

# Run the cleanup script
node migration-delete-all-data-complete.js
```

### **What This Does:**
- Deletes all users, brands, projects, tasks, etc.
- Shows detailed progress
- Verifies deletion
- Takes ~10 seconds (with countdown)

### **Output Example:**
```
═══════════════════════════════════════════════════════════
    ⚠️  COMPLETE DATABASE CLEANUP - DELETE ALL DATA  ⚠️
═══════════════════════════════════════════════════════════

🚨 WARNING: This will permanently delete ALL data from ALL collections!
⏱️  Starting in 10 seconds... Press Ctrl+C to cancel.

📊 Found 20 collections in database:

   users                          :     15 documents
   brands                         :      3 documents
   projects                       :      8 documents
   tasks                          :    142 documents
   subtasks                       :     67 documents
   ...

🗑️  Starting deletion process...
   ✅ Deleted 15 documents from users
   ✅ Deleted 3 documents from brands
   ...

✅ DATABASE CLEANUP COMPLETED SUCCESSFULLY!
```

---

## 📦 **Step 2: Commit and Push Changes**

### **Commands:**

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Implement Category system and 3-role access control

- Add Category model with auto-create 3 defaults
- Update Task model to require category_id
- Implement category CRUD operations
- Update User roles (admin, brand_admin, user)
- Implement role-based brand access
- Add migration scripts for database cleanup
- Add comprehensive documentation"

# Push to main branch
git push origin main
```

---

## 🔧 **Step 3: Update Environment Variables**

### **Vercel Environment Variables:**

Ensure these are set in your Vercel dashboard:

1. **MONGODB_URI** or **MONGO_URI**
   ```
   mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana?retryWrites=true&w=majority
   ```

2. **JWT_SECRET**
   ```
   supersecretkey
   ```

3. **NODE_ENV** (optional)
   ```
   production
   ```

### **How to Set:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add/Update variables
5. Redeploy

---

## 🧪 **Step 4: Test the System**

### **Test 1: Create Admin User**

```bash
POST /api/auth/signup
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### **Test 2: Login**

```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

# Save the JWT token from response
```

### **Test 3: Create Brand**

```bash
POST /api/brands
Headers: Authorization: Bearer YOUR_JWT_TOKEN
{
  "name": "Test Brand",
  "description": "Test brand description"
}

# Save the brand ID
```

### **Test 4: Create Project**

```bash
POST /api/brands/:brandId/projects
Headers: Authorization: Bearer YOUR_JWT_TOKEN
{
  "title": "Test Project",
  "description": "Test project description"
}

# Save the project ID
```

### **Test 5: Verify Categories Created**

```bash
GET /api/brands/:brandId/projects/:projectId/categories
Headers: Authorization: Bearer YOUR_JWT_TOKEN

# Should return 3 default categories:
# - Yet to Start
# - In Progress
# - Completed
```

### **Test 6: Create Task in Category**

```bash
# First, get a category ID from previous step
# Then create a task:

POST /api/brands/:brandId/tasks
Headers: Authorization: Bearer YOUR_JWT_TOKEN
{
  "task": "Test Task",
  "category_id": "CATEGORY_ID_HERE",
  "projectId": "PROJECT_ID",
  "assignedTo": "USER_ID",
  "reporter": "USER_ID",
  "eta": "2025-12-31",
  "priority": "Medium",
  "status": "Yet to Start"
}
```

---

## 📱 **Step 5: Update Frontend**

### **Required Frontend Changes:**

#### **1. Task Creation - Add Category Selection**

```typescript
// Add category selection dropdown
const [selectedCategory, setSelectedCategory] = useState('');

// Fetch categories when project is selected
useEffect(() => {
  if (projectId) {
    fetchCategories(brandId, projectId);
  }
}, [projectId]);

// Include category_id when creating task
const createTask = async (taskData) => {
  await api.post(`/api/brands/${brandId}/tasks`, {
    ...taskData,
    category_id: selectedCategory,  // REQUIRED!
  });
};
```

#### **2. User Signup - Update Role Options**

```typescript
// OLD roles: ['admin', 'manager', 'employee']
// NEW roles: ['admin', 'brand_admin', 'user']

<select name="role">
  <option value="admin">Admin (Primary Admin)</option>
  <option value="brand_admin">Brand Admin</option>
  <option value="user">User</option>
</select>
```

#### **3. Brand List - Handle Role-Based Access**

```typescript
// Check user's global role
const { user_global_role } = response;

if (user_global_role === 'admin') {
  // Show indicator that user can see all brands
  console.log('Admin: Can see all brands');
}
```

#### **4. Category Display in Project View**

```typescript
// Fetch categories for project
const categories = await api.get(
  `/api/brands/${brandId}/projects/${projectId}/categories`
);

// Display categories with task counts
{categories.map(category => (
  <div key={category._id} style={{ borderLeft: `4px solid ${category.color}` }}>
    <h3>{category.name}</h3>
    <span>{category.taskCount} tasks</span>
  </div>
))}
```

---

## ✅ **Step 6: Verification Checklist**

After deployment, verify these work:

- [ ] User can signup with new roles (admin/brand_admin/user)
- [ ] Admin can see all brands
- [ ] Brand Admin can only see own/invited brands
- [ ] User can only see invited brands
- [ ] Creating a project auto-creates 3 categories
- [ ] Can create custom categories
- [ ] Can create tasks in categories
- [ ] Can delete categories (deletes tasks inside)
- [ ] Can reorder categories
- [ ] Task creation requires category_id

---

## 🐛 **Troubleshooting:**

### **Issue: "category_id is required" error**
**Solution:** Update frontend to include `category_id` when creating tasks

### **Issue: "Only admins and brand admins can create brands"**
**Solution:** User has 'user' role - they cannot create brands (by design)

### **Issue: "Invalid category_id"**
**Solution:** Ensure you're sending a valid MongoDB ObjectId for category_id

### **Issue: Cannot see any brands**
**Solution:** User needs to be invited to a brand, or have admin/brand_admin role to create one

### **Issue: Default categories not created**
**Solution:** Check server logs - category creation happens automatically when project is created

---

## 📊 **Monitoring:**

### **Check Server Logs:**
```bash
# Vercel logs
vercel logs

# Or check Vercel dashboard
```

### **Check Database:**
```bash
# Connect to MongoDB
mongo YOUR_MONGODB_URI

# Check categories collection
db.categories.find().pretty()

# Check users collection with new roles
db.users.find({}, { name: 1, email: 1, role: 1 }).pretty()
```

---

## 🔄 **Rollback Plan (If Needed):**

If something goes wrong:

### **1. Revert Git Changes:**
```bash
git revert HEAD
git push origin main
```

### **2. Restore Database Backup:**
```bash
# If you created a backup before migration
mongorestore --uri="YOUR_MONGODB_URI" --archive=backup.archive
```

### **3. Redeploy Previous Version:**
- Go to Vercel Dashboard
- Find previous deployment
- Click "Redeploy"

---

## 📞 **Support:**

If you encounter issues:

1. Check `CATEGORY_SYSTEM_IMPLEMENTATION_SUMMARY.md` for detailed implementation
2. Review `CATEGORY_AND_ROLE_SYSTEM_DOCUMENTATION.md` for architecture
3. Check server logs on Vercel
4. Verify environment variables are set correctly

---

## 🎉 **Post-Deployment:**

After successful deployment:

1. ✅ Notify users about new features
2. ✅ Provide training on category system
3. ✅ Monitor for any issues
4. ✅ Collect feedback from users
5. ✅ Update frontend documentation

---

## 📚 **Related Documentation:**

- `CATEGORY_SYSTEM_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `CATEGORY_AND_ROLE_SYSTEM_DOCUMENTATION.md` - System architecture and design
- `README.md` - General project documentation

---

**Deployment Date:** October 1, 2025  
**Version:** 2.0.0 (Category & Role System)  
**Status:** Ready for Production ✅

---

## ⚡ **Quick Command Reference:**

```bash
# 1. Clean database
node migration-delete-all-data-complete.js

# 2. Commit changes
git add .
git commit -m "feat: Category and Role system"
git push origin main

# 3. Test health endpoint
curl https://your-backend.vercel.app/api/health

# 4. Create test user
curl -X POST https://your-backend.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"test123","role":"admin"}'

# 5. Done! 🎉
```


