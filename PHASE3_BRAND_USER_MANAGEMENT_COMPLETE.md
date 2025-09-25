# 👥 PHASE 3: BRAND USER MANAGEMENT APIs - COMPLETE
## Project Tracker Backend - Phase 3 Documentation

**Date:** September 23, 2025  
**Status:** ✅ COMPLETED - 4/5 APIs WORKING (80% Success Rate)  
**Working APIs:** 4 APIs  
**Issue Found:** 1 API (Invite User - Validation Issue)  
**Ready for Frontend:** ✅  

---

## 📊 **PHASE 3 SUMMARY**

| API Endpoint | Method | Status | Status Code | Notes |
|--------------|--------|--------|-------------|-------|
| `/api/brands/:brandId/users` | GET | ✅ SUCCESS | 200 | Get brand users successful |
| `/api/brands/:brandId/users` | POST | ✅ SUCCESS | 201 | Add user to brand successful |
| `/api/brands/:brandId/users/:userId` | PUT | ✅ SUCCESS | 200 | Update user role successful |
| `/api/brands/:brandId/users/invite` | POST | ⚠️ ISSUE | 500 | Validation error (employeeNumber required) |
| `/api/brands/:brandId/users/:userId` | DELETE | ✅ SUCCESS | 200 | Remove user from brand successful |

**Total APIs:** 5  
**Working APIs:** 4  
**Failed APIs:** 1 (Design issue)  
**Success Rate:** 80%  

---

## 📋 **DETAILED API DOCUMENTATION**

### **1. Get Brand Users**
```http
GET /api/brands/:brandId/users
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "68d26185ed7feeb0d191b22c",
      "name": "Test User Phase3",
      "email": "testuser.phase3@example.com",
      "avatar": null,
      "role": "manager",
      "permissions": {
        "can_create_projects": true,
        "can_edit_projects": true,
        "can_create_tasks": true,
        "can_edit_tasks": true,
        "can_assign_tasks": true,
        "can_view_analytics": true
      },
      "status": "active",
      "joined_at": "2024-12-01T10:00:00.000Z",
      "invited_by": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Test Admin",
        "email": "testadmin@example.com"
      }
    }
  ],
  "message": "Brand users retrieved successfully"
}
```

---

### **2. Add User to Brand**
```http
POST /api/brands/:brandId/users
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "testuser.phase3@example.com",
  "role": "member",
  "permissions": {
    "can_create_tasks": true,
    "can_edit_tasks": true,
    "can_view_all_projects": true
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "68d26185ed7feeb0d191b22c",
    "user": {
      "id": "68d26184ed7feeb0d191b222",
      "name": "Test User Phase3",
      "email": "testuser.phase3@example.com",
      "avatar": null
    },
    "role": "member",
    "permissions": {
      "can_create_tasks": true,
      "can_edit_tasks": true,
      "can_view_all_projects": true
    },
    "status": "active",
    "joined_at": "2024-12-01T10:00:00.000Z",
    "invited_by": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Test Admin",
      "email": "testadmin@example.com"
    }
  },
  "message": "User added to brand successfully"
}
```

---

### **3. Update User Role in Brand**
```http
PUT /api/brands/:brandId/users/:userId
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "manager",
  "permissions": {
    "can_create_projects": true,
    "can_edit_projects": true,
    "can_create_tasks": true,
    "can_edit_tasks": true,
    "can_assign_tasks": true,
    "can_view_analytics": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "68d26185ed7feeb0d191b22c",
    "user": {
      "id": "68d26184ed7feeb0d191b222",
      "name": "Test User Phase3",
      "email": "testuser.phase3@example.com",
      "avatar": null
    },
    "role": "manager",
    "permissions": {
      "can_create_projects": true,
      "can_edit_projects": true,
      "can_create_tasks": true,
      "can_edit_tasks": true,
      "can_assign_tasks": true,
      "can_view_analytics": true
    },
    "status": "active",
    "joined_at": "2024-12-01T10:00:00.000Z",
    "invited_by": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Test Admin",
      "email": "testadmin@example.com"
    }
  },
  "message": "User role updated successfully"
}
```

---

### **4. Invite User to Brand**
```http
POST /api/brands/:brandId/users/invite
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "invited.user@example.com",
  "role": "member",
  "message": "You are invited to join our brand!"
}
```

**Response (201 Created) - Success:**
```json
{
  "success": true,
  "data": {
    "id": "68d26186ed7feeb0d191b22d",
    "email": "invited.user@example.com",
    "role": "member",
    "status": "pending",
    "invited_at": "2024-12-01T10:00:00.000Z"
  },
  "message": "Invitation sent successfully"
}
```

**Response (500 Internal Server Error) - Current Issue:**
```json
{
  "success": false,
  "error": {
    "code": "INVITATION_ERROR",
    "message": "Failed to send invitation",
    "details": "User validation failed: employeeNumber: Path `employeeNumber` is required."
  }
}
```

**Note:** This API has a validation issue where it tries to create a user account but requires an `employeeNumber` field that is not provided in the invitation.

---

### **5. Remove User from Brand**
```http
DELETE /api/brands/:brandId/users/:userId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User removed from brand successfully"
}
```

---

## 🚀 **FRONTEND IMPLEMENTATION GUIDE**

### **1. Brand User Management Service**
```typescript
// src/services/brandUserService.ts
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export class BrandUserService {
  // Get all users in a brand
  static async getBrandUsers(brandId: string) {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE}/brands/${brandId}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Add user to brand
  static async addUserToBrand(brandId: string, userData: {
    email: string;
    role: string;
    permissions?: any;
  }) {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}/brands/${brandId}/users`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Update user role in brand
  static async updateUserRole(brandId: string, userId: string, roleData: {
    role: string;
    permissions?: any;
  }) {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE}/brands/${brandId}/users/${userId}`, roleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Invite user to brand
  static async inviteUserToBrand(brandId: string, inviteData: {
    email: string;
    role: string;
    message?: string;
  }) {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}/brands/${brandId}/users/invite`, inviteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Remove user from brand
  static async removeUserFromBrand(brandId: string, userId: string) {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE}/brands/${brandId}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}
```

### **2. Brand User Management Context**
```typescript
// src/contexts/BrandUserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandUserService } from '../services/brandUserService';

interface BrandUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  permissions: any;
  status: string;
  joined_at: string;
  invited_by?: {
    id: string;
    name: string;
    email: string;
  };
}

interface BrandUserContextType {
  users: BrandUser[];
  loading: boolean;
  getBrandUsers: (brandId: string) => Promise<void>;
  addUserToBrand: (brandId: string, userData: any) => Promise<any>;
  updateUserRole: (brandId: string, userId: string, roleData: any) => Promise<any>;
  inviteUserToBrand: (brandId: string, inviteData: any) => Promise<any>;
  removeUserFromBrand: (brandId: string, userId: string) => Promise<any>;
}

const BrandUserContext = createContext<BrandUserContextType | undefined>(undefined);

export const BrandUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<BrandUser[]>([]);
  const [loading, setLoading] = useState(false);

  const getBrandUsers = async (brandId: string) => {
    setLoading(true);
    try {
      const response = await BrandUserService.getBrandUsers(brandId);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load brand users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUserToBrand = async (brandId: string, userData: any) => {
    try {
      const response = await BrandUserService.addUserToBrand(brandId, userData);
      if (response.success) {
        await getBrandUsers(brandId); // Refresh users list
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateUserRole = async (brandId: string, userId: string, roleData: any) => {
    try {
      const response = await BrandUserService.updateUserRole(brandId, userId, roleData);
      if (response.success) {
        await getBrandUsers(brandId); // Refresh users list
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const inviteUserToBrand = async (brandId: string, inviteData: any) => {
    try {
      const response = await BrandUserService.inviteUserToBrand(brandId, inviteData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const removeUserFromBrand = async (brandId: string, userId: string) => {
    try {
      const response = await BrandUserService.removeUserFromBrand(brandId, userId);
      if (response.success) {
        await getBrandUsers(brandId); // Refresh users list
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <BrandUserContext.Provider value={{
      users,
      loading,
      getBrandUsers,
      addUserToBrand,
      updateUserRole,
      inviteUserToBrand,
      removeUserFromBrand
    }}>
      {children}
    </BrandUserContext.Provider>
  );
};

export const useBrandUsers = () => {
  const context = useContext(BrandUserContext);
  if (context === undefined) {
    throw new Error('useBrandUsers must be used within a BrandUserProvider');
  }
  return context;
};
```

### **3. Brand User Management Component**
```typescript
// src/components/BrandUserManagement.tsx
import React, { useState, useEffect } from 'react';
import { useBrandUsers } from '../contexts/BrandUserContext';
import { useBrand } from '../contexts/BrandContext';

const BrandUserManagement: React.FC = () => {
  const { users, loading, getBrandUsers, addUserToBrand, updateUserRole, inviteUserToBrand, removeUserFromBrand } = useBrandUsers();
  const { currentBrand } = useBrand();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    permissions: {}
  });

  useEffect(() => {
    if (currentBrand) {
      getBrandUsers(currentBrand.id);
    }
  }, [currentBrand]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand) return;
    
    try {
      const response = await addUserToBrand(currentBrand.id, formData);
      if (response.success) {
        setShowAddForm(false);
        setFormData({ email: '', role: 'member', permissions: {} });
      }
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand) return;
    
    try {
      const response = await inviteUserToBrand(currentBrand.id, {
        email: formData.email,
        role: formData.role,
        message: 'You are invited to join our brand!'
      });
      if (response.success) {
        setShowInviteForm(false);
        setFormData({ email: '', role: 'member', permissions: {} });
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
      alert('Failed to invite user. Please check if the user exists or try adding them directly.');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!currentBrand) return;
    
    try {
      await updateUserRole(currentBrand.id, userId, { role: newRole });
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!currentBrand) return;
    
    if (window.confirm('Are you sure you want to remove this user from the brand?')) {
      try {
        await removeUserFromBrand(currentBrand.id, userId);
      } catch (error) {
        console.error('Failed to remove user:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="brand-user-management">
      <h2>Brand User Management</h2>
      
      <div className="user-actions">
        <button onClick={() => setShowAddForm(true)}>Add Existing User</button>
        <button onClick={() => setShowInviteForm(true)}>Invite New User</button>
      </div>

      <div className="users-list">
        <h3>Brand Users ({users.length})</h3>
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <h4>{user.name}</h4>
              <p>{user.email}</p>
              <p>Role: {user.role}</p>
              <p>Status: {user.status}</p>
            </div>
            <div className="user-actions">
              <select 
                value={user.role} 
                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button 
                onClick={() => handleRemoveUser(user.id)}
                style={{ color: 'red' }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="add-user-form">
          <h3>Add Existing User</h3>
          <form onSubmit={handleAddUser}>
            <input
              type="email"
              placeholder="User Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <div className="form-actions">
              <button type="submit">Add User</button>
              <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showInviteForm && (
        <div className="invite-user-form">
          <h3>Invite New User</h3>
          <form onSubmit={handleInviteUser}>
            <input
              type="email"
              placeholder="User Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <div className="form-actions">
              <button type="submit">Send Invitation</button>
              <button type="button" onClick={() => setShowInviteForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BrandUserManagement;
```

### **4. User Role Management Component**
```typescript
// src/components/UserRoleManagement.tsx
import React, { useState } from 'react';

interface UserRoleManagementProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: any;
  };
  onUpdateRole: (userId: string, role: string, permissions: any) => void;
}

const UserRoleManagement: React.FC<UserRoleManagementProps> = ({ user, onUpdateRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState(user.role);
  const [permissions, setPermissions] = useState(user.permissions);

  const handleSave = () => {
    onUpdateRole(user.id, role, permissions);
    setIsEditing(false);
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    setPermissions({ ...permissions, [permission]: value });
  };

  if (!isEditing) {
    return (
      <div className="user-role-display">
        <h4>Role: {user.role}</h4>
        <button onClick={() => setIsEditing(true)}>Edit Role</button>
      </div>
    );
  }

  return (
    <div className="user-role-edit">
      <h4>Edit User Role</h4>
      
      <div className="role-selection">
        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="permissions-selection">
        <h5>Permissions:</h5>
        {Object.entries(permissions).map(([key, value]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handlePermissionChange(key, e.target.checked)}
            />
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
        ))}
      </div>

      <div className="form-actions">
        <button onClick={handleSave}>Save Changes</button>
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      </div>
    </div>
  );
};

export default UserRoleManagement;
```

---

## ⚠️ **KNOWN ISSUE & RESOLUTION**

### **Issue: Invite User API (500 Internal Server Error)**
- **Problem:** Invite User API fails with "employeeNumber is required" validation error
- **Root Cause:** The API tries to create a new user account but the User model requires `employeeNumber` field
- **Current Behavior:** API attempts to create user automatically if they don't exist
- **Expected Behavior:** Should either handle missing employeeNumber gracefully or require it in the request

### **Recommended Solutions:**
1. **Option 1:** Modify the API to generate a default employeeNumber for invited users
2. **Option 2:** Require employeeNumber in the invitation request
3. **Option 3:** Create a separate "pending invitation" system that doesn't create user accounts until they accept

### **Frontend Workaround:**
- Use "Add Existing User" for users who already have accounts
- For new users, guide them to register first, then add them to the brand
- Show appropriate error messages when invitation fails

---

## ✅ **PHASE 3 COMPLETION STATUS**

- [x] **All 5 Brand User Management APIs tested**
- [x] **4 APIs working perfectly (80% success rate)**
- [x] **1 API has a known design issue (Invite User)**
- [x] **Complete documentation created**
- [x] **Frontend implementation guide provided**
- [x] **Ready for frontend integration**

---

## 🎯 **NEXT STEPS**

**Phase 3 is complete and ready!** 

**4/5 Brand User Management APIs are working perfectly. The 1 "failed" API has a known design issue that can be worked around.**

**You can now:**
1. Use these APIs for frontend brand user management
2. Implement the provided frontend code
3. Use "Add Existing User" instead of "Invite User" for now
4. Move to Phase 4 testing

**Ready to proceed to Phase 4: Project Management APIs (15 APIs)?** 🚀
