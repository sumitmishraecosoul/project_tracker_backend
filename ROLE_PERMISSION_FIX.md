# 🔧 Role Permission Fix - Task Status Update Issue

## 🚨 **Problem Identified:**

Users with `'user'` global role and `'member'` brand role were getting **"INSUFFICIENT_ROLE"** errors when trying to update task status.

## 🔍 **Root Cause:**

The system has **two different role systems**:

1. **Global User Roles** (User model): `admin`, `brand_admin`, `user`
2. **Brand-Specific Roles** (UserBrand model): `owner`, `admin`, `manager`, `member`, `client`, `guest`

**The Issue:**
- Routes were using `authorize(['admin', 'manager', 'employee'])` 
- But users have:
  - Global role: `'user'` (not `'employee'`)
  - Brand role: `'member'` (not `'employee'`)

## ✅ **Fixes Applied:**

### **1. Updated Task Status Route:**
```javascript
// Before (BROKEN):
router.put('/:brandId/tasks/:id/status', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandTaskController.updateTaskStatus);

// After (FIXED):
router.put('/:brandId/tasks/:id/status', auth, brandContext, authorizeBrand(['admin', 'manager', 'member']), brandTaskController.updateTaskStatus);
```

### **2. Updated Task Update Route:**
```javascript
// Before (BROKEN):
router.put('/:brandId/tasks/:id', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandTaskController.updateBrandTask);

// After (FIXED):
router.put('/:brandId/tasks/:id', auth, brandContext, authorizeBrand(['admin', 'manager', 'member']), brandTaskController.updateBrandTask);
```

### **3. Updated Subtask Status Route:**
```javascript
// Before (BROKEN):
router.put('/:brandId/subtasks/:id/status', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandSubtaskController.updateSubtaskStatus);

// After (FIXED):
router.put('/:brandId/subtasks/:id/status', auth, brandContext, authorizeBrand(['admin', 'manager', 'member']), brandSubtaskController.updateSubtaskStatus);
```

## 🎯 **Key Changes:**

1. **Changed `authorize` to `authorizeBrand`** - Uses brand-specific roles instead of global roles
2. **Changed `'employee'` to `'member'`** - Uses correct brand role name
3. **Added `'member'` role** - Regular users can now update task status

## 📋 **Role Permissions Summary:**

### **Brand-Specific Roles (UserBrand model):**
- **`owner`** - Full access to everything
- **`admin`** - Can manage users, create projects, assign tasks
- **`manager`** - Can create projects, assign tasks, view analytics
- **`member`** - Can create/edit tasks, update status ✅ **FIXED**
- **`client`** - Read-only access
- **`guest`** - Limited access

### **What `'member'` Role Can Do:**
- ✅ **Create tasks** (`can_create_tasks: true`)
- ✅ **Edit tasks** (`can_edit_tasks: true`)
- ✅ **Update task status** ✅ **FIXED**
- ✅ **View all projects** (`can_view_all_projects: true`)
- ❌ **Delete tasks** (`can_delete_tasks: false`)
- ❌ **Assign tasks** (`can_assign_tasks: false`)
- ❌ **Manage users** (`can_manage_users: false`)

## 🚀 **Expected Results:**

After this fix:
- ✅ **Regular users** can update task status
- ✅ **No more "INSUFFICIENT_ROLE" errors**
- ✅ **Task status updates work** for all users
- ✅ **Proper role-based permissions** maintained

## 🔧 **Files Modified:**

1. `routes/brandTasks.js` - Fixed task status and update routes
2. `routes/brandSubtasks.js` - Fixed subtask status route

## 📝 **Testing:**

Test with a regular user (role: `'user'`, brand role: `'member'`):
- ✅ Should be able to update task status
- ✅ Should be able to edit tasks
- ✅ Should be able to create tasks
- ❌ Should NOT be able to delete tasks
- ❌ Should NOT be able to assign tasks to others

---

**🎉 This fix resolves the "INSUFFICIENT_ROLE" error for task status updates!**
