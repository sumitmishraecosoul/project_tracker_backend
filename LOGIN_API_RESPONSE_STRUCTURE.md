# 🔐 LOGIN API RESPONSE STRUCTURE

## 📋 **API Endpoint**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "currentBrandId": "optional_brand_id" // Optional
}
```

---

## ✅ **SUCCESS RESPONSE (200 OK)**

### **Response Structure:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin|manager|employee",
    "employeeNumber": "EMP001",
    "department": "Engineering",
    "manager": "manager_id",
    "jobTitle": "Software Engineer",
    "location": "Remote",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "brands": [
    {
      "id": "brand_id",
      "name": "Brand Name",
      "slug": "brand-slug",
      "role": "admin|manager|employee",
      "permissions": {
        "can_manage_users": true,
        "can_invite_users": true,
        "can_remove_users": true,
        "can_manage_projects": true,
        "can_manage_tasks": true
      },
      "status": "active"
    }
  ],
  "currentBrand": {
    "id": "brand_id",
    "name": "Brand Name",
    "slug": "brand-slug",
    "role": "admin|manager|employee",
    "permissions": {
      "can_manage_users": true,
      "can_invite_users": true,
      "can_remove_users": true,
      "can_manage_projects": true,
      "can_manage_tasks": true
    }
  }
}
```

---

## 🔍 **RESPONSE FIELD EXPLANATIONS**

### **1. `token` (String)**
- **JWT Token** for authentication
- **Expires:** 1 day
- **Contains:** User ID, brands array, current brand
- **Usage:** Include in `Authorization: Bearer {token}` header

### **2. `user` (Object)**
- **Complete user profile** (password excluded)
- **Fields:**
  - `_id`: User ID
  - `name`: Full name
  - `email`: Email address
  - `role`: Global role (admin/manager/employee)
  - `employeeNumber`: Unique employee number
  - `department`: User's department
  - `manager`: Manager's user ID
  - `jobTitle`: Job title
  - `location`: Work location
  - `avatarUrl`: Profile picture URL
  - `status`: Account status (active/inactive)
  - `created_at`: Account creation date
  - `updated_at`: Last update date

### **3. `brands` (Array)**
- **All brands** the user has access to
- **Admin users:** Get ALL brands in the system
- **Non-admin users:** Get brands from UserBrand relationships
- **Each brand object contains:**
  - `id`: Brand ID
  - `name`: Brand name
  - `slug`: Brand URL slug
  - `role`: User's role in this brand
  - `permissions`: Brand-specific permissions
  - `status`: Brand status (active/inactive)

### **4. `currentBrand` (Object)**
- **Currently selected brand** for the user
- **Determined by:**
  1. `currentBrandId` parameter (if provided and valid)
  2. First active brand from user's brands
  3. `null` if no brands available
- **Contains:** Same structure as brands array items

---

## 👑 **ADMIN USER RESPONSE**

### **Admin users get special treatment:**
```json
{
  "token": "...",
  "user": {
    "_id": "admin_id",
    "name": "System Administrator",
    "email": "admin@system.local",
    "role": "admin",
    "employeeNumber": "ADMIN001",
    "status": "active"
  },
  "brands": [
    {
      "id": "brand1_id",
      "name": "Brand 1",
      "slug": "brand-1",
      "role": "admin",
      "permissions": {},
      "status": "active"
    },
    {
      "id": "brand2_id", 
      "name": "Brand 2",
      "slug": "brand-2",
      "role": "admin",
      "permissions": {},
      "status": "active"
    }
    // ... ALL brands in the system
  ],
  "currentBrand": {
    "id": "brand1_id",
    "name": "Brand 1",
    "slug": "brand-1",
    "role": "admin",
    "permissions": {}
  }
}
```

### **Admin Special Features:**
- ✅ **Access to ALL brands** in the system
- ✅ **Admin role** in every brand
- ✅ **No permission restrictions**
- ✅ **Can manage users** in any brand
- ✅ **Can invite users** to any brand

---

## 👥 **REGULAR USER RESPONSE**

### **Non-admin users get limited access:**
```json
{
  "token": "...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "employeeNumber": "EMP001",
    "department": "Engineering"
  },
  "brands": [
    {
      "id": "brand1_id",
      "name": "Brand 1",
      "slug": "brand-1",
      "role": "manager",
      "permissions": {
        "can_manage_users": true,
        "can_invite_users": true,
        "can_manage_projects": true
      },
      "status": "active"
    }
    // ... Only brands user is member of
  ],
  "currentBrand": {
    "id": "brand1_id",
    "name": "Brand 1",
    "slug": "brand-1",
    "role": "manager",
    "permissions": {
      "can_manage_users": true,
      "can_invite_users": true,
      "can_manage_projects": true
    }
  }
}
```

---

## ❌ **ERROR RESPONSES**

### **1. User Not Found (404)**
```json
{
  "message": "User not found"
}
```

### **2. Invalid Credentials (400)**
```json
{
  "message": "Invalid credentials"
}
```

### **3. Login Failed (500)**
```json
{
  "message": "Login failed",
  "error": "Error details"
}
```

---

## 🔧 **FRONTEND INTEGRATION**

### **Store Login Response:**
```javascript
// After successful login
const loginResponse = await apiService.login(email, password);

// Store in state/context
setUser(loginResponse.user);
setBrands(loginResponse.brands);
setCurrentBrand(loginResponse.currentBrand);
setAuthToken(loginResponse.token);

// Use token for API calls
apiService.setAuthToken(loginResponse.token);
```

### **Brand Switching:**
```javascript
// Switch to different brand
const switchBrand = async (brandId) => {
  const response = await apiService.login(email, password, brandId);
  setCurrentBrand(response.currentBrand);
};
```

### **Permission Checking:**
```javascript
// Check if user can perform action
const canManageUsers = currentBrand?.permissions?.can_manage_users;
const canInviteUsers = currentBrand?.permissions?.can_invite_users;
const isAdmin = user?.role === 'admin';
```

---

## 📊 **RESPONSE SIZE**

### **Typical Response Sizes:**
- **Admin user:** ~2-5KB (depends on number of brands)
- **Regular user:** ~1-2KB (depends on number of brands)
- **Token size:** ~500-800 bytes

### **Performance Notes:**
- ✅ **Fast response** (< 200ms typical)
- ✅ **Efficient queries** (optimized database calls)
- ✅ **Minimal data** (password excluded)
- ✅ **Cached brands** (for admin users)

---

## 🎯 **SUMMARY**

**The login API returns everything needed for frontend:**
- ✅ **Authentication token** for API calls
- ✅ **Complete user profile** for display
- ✅ **All accessible brands** for navigation
- ✅ **Current brand context** for operations
- ✅ **Role-based permissions** for UI control
- ✅ **Admin privileges** for system management

**Perfect for building a multi-brand application!** 🚀
