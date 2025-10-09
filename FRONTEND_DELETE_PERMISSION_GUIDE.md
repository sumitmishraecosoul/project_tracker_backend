# 🎨 Frontend Task Delete Button - Permission Guide

## 🎯 **Goal:**

Show the delete button ONLY to users who have permission to delete tasks.

## 📋 **Permission Rules (Backend Logic):**

### **Who CAN see delete button:**
1. ✅ **Global Admin** (`admin` global role) - Always
2. ✅ **Brand Admin with Owner role** (`brand_admin` + `owner` brand role)
3. ✅ **Brand Admin with Manager role** (`brand_admin` + `manager` brand role)

### **Who CANNOT see delete button:**
1. ❌ **Brand Admin with Member role** (`brand_admin` + `member` brand role)
2. ❌ **Regular User** (`user` global role) - Regardless of brand role
3. ❌ **Any user without proper permissions**

## 🔧 **Implementation:**

### **Step 1: Create Permission Helper Function**

Create a file: `utils/permissions.js` or `lib/permissions.js`

```javascript
/**
 * Check if user can delete tasks in a brand
 * @param {Object} user - User object with role property
 * @param {Object} userBrand - UserBrand object with role property (optional)
 * @returns {boolean} - True if user can delete tasks
 */
export const canDeleteTask = (user, userBrand) => {
  // Rule 1: Global admin - always can delete
  if (user?.role === 'admin') {
    return true;
  }
  
  // Rule 2: Brand admin with owner/manager brand role
  if (user?.role === 'brand_admin') {
    // Must have a brand membership
    if (!userBrand) {
      return false;
    }
    // Must have owner or manager role in the brand
    return ['owner', 'manager'].includes(userBrand.role);
  }
  
  // Rule 3: Regular user - never can delete (even with owner/manager brand role)
  return false;
};

/**
 * Check if user can delete a specific task
 * @param {Object} user - User object
 * @param {Object} userBrand - UserBrand object
 * @param {Object} task - Task object (optional, for future task-specific checks)
 * @returns {boolean}
 */
export const canDeleteSpecificTask = (user, userBrand, task = null) => {
  // For now, use the same logic as canDeleteTask
  // In future, you can add task-specific checks here
  // e.g., check if task is locked, archived, etc.
  return canDeleteTask(user, userBrand);
};
```

### **Step 2: Usage in React Component**

#### **Example 1: Task List Component**

```jsx
import React from 'react';
import { canDeleteTask } from '@/utils/permissions';

const TaskList = ({ tasks, user, userBrand }) => {
  // Check permission once for the entire component
  const hasDeletePermission = canDeleteTask(user, userBrand);

  const handleDeleteTask = async (taskId) => {
    if (!hasDeletePermission) {
      alert('You do not have permission to delete tasks');
      return;
    }
    
    try {
      await deleteTask(brandId, taskId);
      // Refresh task list
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="task-list">
      {tasks.map(task => (
        <div key={task.id} className="task-item">
          <h3>{task.task}</h3>
          <p>{task.description}</p>
          
          {/* Only show delete button if user has permission */}
          {hasDeletePermission && (
            <button 
              onClick={() => handleDeleteTask(task.id)}
              className="btn-delete"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
```

#### **Example 2: Task Detail Component**

```jsx
import React from 'react';
import { canDeleteTask } from '@/utils/permissions';

const TaskDetail = ({ task, user, userBrand, onDelete }) => {
  const hasDeletePermission = canDeleteTask(user, userBrand);

  return (
    <div className="task-detail">
      <h2>{task.task}</h2>
      <p>{task.description}</p>
      
      <div className="task-actions">
        {/* Edit button - shown to more users */}
        <button className="btn-edit">Edit</button>
        
        {/* Delete button - only shown to authorized users */}
        {hasDeletePermission && (
          <button 
            onClick={onDelete}
            className="btn-delete"
          >
            Delete Task
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
```

#### **Example 3: Dropdown Menu**

```jsx
import React from 'react';
import { canDeleteTask } from '@/utils/permissions';

const TaskDropdownMenu = ({ task, user, userBrand }) => {
  const hasDeletePermission = canDeleteTask(user, userBrand);

  return (
    <div className="dropdown-menu">
      <button className="menu-item">View Details</button>
      <button className="menu-item">Edit Task</button>
      <button className="menu-item">Assign To</button>
      
      {/* Conditionally render delete option */}
      {hasDeletePermission && (
        <>
          <div className="menu-divider"></div>
          <button className="menu-item menu-item-danger">
            Delete Task
          </button>
        </>
      )}
    </div>
  );
};

export default TaskDropdownMenu;
```

### **Step 3: Get User and UserBrand Data**

You need to have access to `user` and `userBrand` objects in your components.

#### **Option A: From Context/Store**

```jsx
import { useAuth } from '@/contexts/AuthContext';
import { useBrand } from '@/contexts/BrandContext';
import { canDeleteTask } from '@/utils/permissions';

const TaskComponent = () => {
  const { user } = useAuth(); // Get current user
  const { currentBrand, userBrand } = useBrand(); // Get current brand and user's role in it
  
  const hasDeletePermission = canDeleteTask(user, userBrand);
  
  return (
    <div>
      {hasDeletePermission && (
        <button>Delete</button>
      )}
    </div>
  );
};
```

#### **Option B: From Props**

```jsx
const TaskComponent = ({ user, userBrand }) => {
  const hasDeletePermission = canDeleteTask(user, userBrand);
  
  return (
    <div>
      {hasDeletePermission && (
        <button>Delete</button>
      )}
    </div>
  );
};
```

#### **Option C: From Redux/Zustand Store**

```jsx
import { useSelector } from 'react-redux';
import { canDeleteTask } from '@/utils/permissions';

const TaskComponent = () => {
  const user = useSelector(state => state.auth.user);
  const userBrand = useSelector(state => state.brand.userBrand);
  
  const hasDeletePermission = canDeleteTask(user, userBrand);
  
  return (
    <div>
      {hasDeletePermission && (
        <button>Delete</button>
      )}
    </div>
  );
};
```

## 📊 **User and UserBrand Object Structure:**

### **User Object (from login response):**

```javascript
{
  "_id": "68e4d693fe53aae54691b75e",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "brand_admin", // Global role: 'admin', 'brand_admin', or 'user'
  "department": "Operations",
  // ... other fields
}
```

### **UserBrand Object (from brand context):**

```javascript
{
  "_id": "68e1dd889ee979a7408876cc",
  "user_id": "68e4d693fe53aae54691b75e",
  "brand_id": "68e1ddaa9ee979a7408876e9",
  "role": "manager", // Brand-specific role: 'owner', 'admin', 'manager', 'member', 'client', 'guest'
  "permissions": {
    "can_create_tasks": true,
    "can_edit_tasks": true,
    // ... other permissions
  }
}
```

## 🎨 **UI/UX Best Practices:**

### **1. Hide Button Completely (Recommended)**

```jsx
{hasDeletePermission && (
  <button onClick={handleDelete}>Delete</button>
)}
```

**Pros:**
- ✅ Clean UI - no clutter
- ✅ Clear indication of permissions
- ✅ No confusion for users

### **2. Show Disabled Button with Tooltip**

```jsx
<button 
  onClick={handleDelete}
  disabled={!hasDeletePermission}
  title={hasDeletePermission ? 'Delete task' : 'You do not have permission to delete tasks'}
>
  Delete
</button>
```

**Pros:**
- ✅ Users know the feature exists
- ✅ Clear why they can't use it

**Cons:**
- ❌ Can clutter UI
- ❌ May frustrate users

### **3. Show with Permission Badge**

```jsx
{hasDeletePermission ? (
  <button onClick={handleDelete}>
    Delete
  </button>
) : (
  <div className="permission-required">
    <button disabled>Delete</button>
    <span className="badge">Admin Only</span>
  </div>
)}
```

## 🧪 **Testing the Permission Logic:**

### **Test Cases:**

```javascript
// Test file: permissions.test.js
import { canDeleteTask } from '@/utils/permissions';

describe('canDeleteTask', () => {
  test('Global admin can delete', () => {
    const user = { role: 'admin' };
    const userBrand = { role: 'member' };
    expect(canDeleteTask(user, userBrand)).toBe(true);
  });

  test('Brand admin with owner role can delete', () => {
    const user = { role: 'brand_admin' };
    const userBrand = { role: 'owner' };
    expect(canDeleteTask(user, userBrand)).toBe(true);
  });

  test('Brand admin with manager role can delete', () => {
    const user = { role: 'brand_admin' };
    const userBrand = { role: 'manager' };
    expect(canDeleteTask(user, userBrand)).toBe(true);
  });

  test('Brand admin with member role cannot delete', () => {
    const user = { role: 'brand_admin' };
    const userBrand = { role: 'member' };
    expect(canDeleteTask(user, userBrand)).toBe(false);
  });

  test('Regular user with owner role cannot delete', () => {
    const user = { role: 'user' };
    const userBrand = { role: 'owner' };
    expect(canDeleteTask(user, userBrand)).toBe(false);
  });

  test('Regular user with manager role cannot delete', () => {
    const user = { role: 'user' };
    const userBrand = { role: 'manager' };
    expect(canDeleteTask(user, userBrand)).toBe(false);
  });

  test('Brand admin without brand membership cannot delete', () => {
    const user = { role: 'brand_admin' };
    const userBrand = null;
    expect(canDeleteTask(user, userBrand)).toBe(false);
  });
});
```

## 🔄 **Complete Example: Task Card Component**

```jsx
import React, { useState } from 'react';
import { canDeleteTask } from '@/utils/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { useBrand } from '@/contexts/BrandContext';

const TaskCard = ({ task, onUpdate }) => {
  const { user } = useAuth();
  const { userBrand } = useBrand();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check permission
  const hasDeletePermission = canDeleteTask(user, userBrand);

  const handleDelete = async () => {
    // Double-check permission (security)
    if (!hasDeletePermission) {
      alert('You do not have permission to delete this task');
      return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch(
        `/api/brands/${task.brand_id}/tasks/${task._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      // Success - notify parent component
      onUpdate();
      alert('Task deleted successfully');
      
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(`Failed to delete task: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="task-card">
      <h3>{task.task}</h3>
      <p>{task.description}</p>
      <div className="task-meta">
        <span>Status: {task.status}</span>
        <span>Priority: {task.priority}</span>
      </div>
      
      <div className="task-actions">
        {/* Edit button - shown to more users */}
        <button className="btn btn-secondary">
          Edit
        </button>
        
        {/* Delete button - only shown to authorized users */}
        {hasDeletePermission && (
          <button 
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
```

## 📝 **Summary:**

### **Frontend Permission Check:**

```javascript
// Simple function to check permission
const canDeleteTask = (user, userBrand) => {
  if (user?.role === 'admin') return true;
  if (user?.role === 'brand_admin') {
    return ['owner', 'manager'].includes(userBrand?.role);
  }
  return false;
};

// Usage in component
{canDeleteTask(user, userBrand) && (
  <button onClick={handleDelete}>Delete</button>
)}
```

### **Key Points:**

1. ✅ **Create a reusable permission helper function**
2. ✅ **Check permission before rendering delete button**
3. ✅ **Also check permission in delete handler (double security)**
4. ✅ **Hide button completely for clean UI**
5. ✅ **Backend still validates (frontend is just UI)**

---

**🎉 Your frontend can now correctly show/hide the delete button based on user permissions!**
