# 🔒 Task Deletion Permissions - Implementation Complete

## 🎯 **Requirements:**

### **Who CAN Delete Tasks:**
1. ✅ **Global Admin** (`admin` global role) - Can delete ANY task in ANY brand
2. ✅ **Brand Owner** (`owner` brand role) - Can delete ANY task in their brand
3. ✅ **Brand Manager** (`manager` brand role) - Can delete ANY task in their brand

### **Who CANNOT Delete Tasks:**
1. ❌ **Brand Member** (`member` brand role) - Cannot delete tasks
2. ❌ **Brand Client** (`client` brand role) - Cannot delete tasks
3. ❌ **Brand Guest** (`guest` brand role) - Cannot delete tasks
4. ❌ **Brand Admin** (`brand_admin` global role) - Cannot delete tasks (unless they also have owner/manager brand role)

## ✅ **Implementation:**

### **Fix Applied:**

**File**: `routes/brandTasks.js`

```javascript
// Before (BROKEN):
router.delete('/:brandId/tasks/:id', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.deleteBrandTask);

// After (FIXED):
router.delete('/:brandId/tasks/:id', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandTaskController.deleteBrandTask);
```

### **Key Changes:**

1. **Changed Middleware**: `authorize` → `authorizeBrand`
   - `authorize` checks **global roles** only
   - `authorizeBrand` checks **brand-specific roles** (with global admin override)

2. **Updated Allowed Roles**: `['admin', 'manager']` → `['owner', 'admin', 'manager']`
   - Added `'owner'` brand role
   - `'admin'` now refers to brand admin role (but global admin still has override)
   - `'manager'` refers to brand manager role

## 🔍 **How It Works:**

### **authorizeBrand Middleware Logic:**

```javascript
// From middleware/authorize.js (lines 72-75)
if (req.user.role === 'admin') {
  // Global admin users can perform any action in any brand
  return next();
}

// Then checks brand-specific role
if (!allowedRoles.includes(req.userRole)) {
  return res.status(403).json({ 
    success: false,
    error: {
      code: 'INSUFFICIENT_BRAND_ROLE',
      message: 'Forbidden: insufficient role in this brand'
    }
  });
}
```

### **Permission Flow:**

1. **Check if user is global admin** → ✅ Allow immediately
2. **Check user's brand-specific role** → Allow if `owner`, `admin`, or `manager`
3. **Otherwise** → ❌ Deny with `INSUFFICIENT_BRAND_ROLE` error

## 📊 **Test Results:**

### **Test Brand: "Brand1"**

| User | Global Role | Brand Role | Can Delete? | Reason |
|------|-------------|------------|-------------|--------|
| System Administrator | `admin` | None | ✅ **YES** | Global admin override |
| Shivank | `admin` | `owner` | ✅ **YES** | Global admin OR brand owner |
| Sumit | `user` | `member` | ❌ **NO** | Brand member (not allowed) |
| Govind | `user` | `member` | ❌ **NO** | Brand member (not allowed) |

## 🎯 **Real-World Examples:**

### **Example 1: Global Admin**
```
User: System Administrator
Global Role: admin
Brand Role: None (not in UserBrand)
Result: ✅ CAN delete tasks in ANY brand
Reason: Global admin override (line 72-75 in authorizeBrand)
```

### **Example 2: Brand Owner**
```
User: John Doe
Global Role: user
Brand Role: owner (in Brand A)
Result: ✅ CAN delete tasks in Brand A
Reason: Has 'owner' brand role
```

### **Example 3: Brand Manager**
```
User: Jane Smith
Global Role: brand_admin
Brand Role: manager (in Brand B)
Result: ✅ CAN delete tasks in Brand B
Reason: Has 'manager' brand role (global role doesn't matter)
```

### **Example 4: Brand Member**
```
User: Bob Johnson
Global Role: user
Brand Role: member (in Brand C)
Result: ❌ CANNOT delete tasks
Reason: Only has 'member' brand role (not in allowed list)
```

### **Example 5: Brand Admin with Manager Role**
```
User: Alice Williams
Global Role: brand_admin
Brand Role: manager (in Brand D)
Result: ✅ CAN delete tasks in Brand D
Reason: Has 'manager' brand role
```

## 🔐 **Security:**

### **What's Protected:**

1. ✅ **Brand Isolation** - Users can only delete tasks in brands where they have proper roles
2. ✅ **Role-Based Access** - Only owner/admin/manager brand roles can delete
3. ✅ **Global Admin Override** - System admins can manage any brand
4. ✅ **No Privilege Escalation** - Brand members cannot delete tasks

### **API Endpoint:**

```
DELETE /api/brands/:brandId/tasks/:id
```

**Authorization**: Bearer token required

**Permissions**:
- Global `admin` role, OR
- Brand `owner` role, OR
- Brand `admin` role, OR
- Brand `manager` role

**Error Responses**:
- `401 UNAUTHORIZED` - No valid token
- `403 INSUFFICIENT_BRAND_ROLE` - User doesn't have required brand role
- `404 TASK_NOT_FOUND` - Task doesn't exist in this brand

## 📝 **Frontend Integration:**

### **Delete Task Function:**

```javascript
const deleteTask = async (brandId, taskId) => {
  try {
    const response = await fetch(
      `/api/brands/${brandId}/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      if (error.error.code === 'INSUFFICIENT_BRAND_ROLE') {
        alert('You do not have permission to delete tasks in this brand');
      }
      throw new Error(error.error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
};
```

### **Check Delete Permission (Frontend):**

```javascript
const canDeleteTask = (user, userBrand) => {
  // Global admin can always delete
  if (user.role === 'admin') {
    return true;
  }
  
  // Check brand-specific role
  if (!userBrand) {
    return false;
  }
  
  return ['owner', 'admin', 'manager'].includes(userBrand.role);
};

// Usage in component:
{canDeleteTask(user, userBrand) && (
  <button onClick={() => deleteTask(brandId, taskId)}>
    Delete Task
  </button>
)}
```

## ✅ **Summary:**

### **Before:**
- ❌ Only global admins could delete tasks
- ❌ Brand owners couldn't delete tasks
- ❌ Brand managers couldn't delete tasks
- ❌ Route used wrong middleware

### **After:**
- ✅ Global admins can delete ANY task
- ✅ Brand owners can delete tasks in their brand
- ✅ Brand managers can delete tasks in their brand
- ✅ Brand members CANNOT delete tasks
- ✅ Proper brand-specific role checking

---

**🎉 Task deletion permissions are now correctly implemented and tested!**
