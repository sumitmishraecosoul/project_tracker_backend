# 🚀 Frontend API Error Handling Guide

## 📋 Overview

This document outlines important changes made to the backend API error handling that the frontend team needs to be aware of and implement proper handling for.

---

## ✅ What Changed in Backend?

### **ObjectId Validation Added**

All brand-related API endpoints that accept `:id` or `:brandId` parameters now validate that the ID is a valid MongoDB ObjectId **before** processing the request.

### **Affected Endpoints:**

1. `GET /api/brands/:id` - Get brand details
2. `PUT /api/brands/:id` - Update brand
3. `DELETE /api/brands/:id` - Delete brand
4. `POST /api/brands/:id/switch` - Switch to brand

---

## 🔧 New Error Response Format

### **Error Code: `INVALID_BRAND_ID`**

When an invalid brand ID is provided, the API now returns:

**HTTP Status:** `400 Bad Request`

**Response Body:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_BRAND_ID",
    "message": "Invalid brand ID format"
  }
}
```

---

## 📊 What is a Valid Brand ID?

A valid MongoDB ObjectId must be:
- **24 characters long**
- **Hexadecimal characters only** (0-9, a-f, A-F)

### Examples:

✅ **Valid Brand IDs:**
```
507f1f77bcf86cd799439011
5f8d0d55b54764421b7156d4
6123456789abcdef01234567
```

❌ **Invalid Brand IDs:**
```
subtasks          // Not a valid ObjectId format
123               // Too short
invalid-id        // Contains hyphens
test-brand        // Not hexadecimal
null              // Null value
undefined         // Undefined value
""                // Empty string
```

---

## 🎯 Frontend Implementation Required

### **1. Client-Side Validation (Optional but Recommended)**

Before making API calls, validate the brand ID on the frontend to avoid unnecessary network requests:

```javascript
// Utility function to validate MongoDB ObjectId
export const isValidObjectId = (id) => {
  // Check if id exists and is a string
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // Check if it matches ObjectId format (24 hex characters)
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

// Usage example
const brandId = "507f1f77bcf86cd799439011";

if (!isValidObjectId(brandId)) {
  console.error('Invalid brand ID format');
  // Show error message to user
  return;
}

// Safe to make API call
const response = await fetch(`/api/brands/${brandId}`);
```

---

### **2. Error Handling in API Calls**

Update your API error handling to catch the new `INVALID_BRAND_ID` error:

#### **Example: React with Axios**

```javascript
import axios from 'axios';

const getBrandDetails = async (brandId) => {
  try {
    const response = await axios.get(`/api/brands/${brandId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
    
  } catch (error) {
    // Handle the new error code
    if (error.response?.data?.error?.code === 'INVALID_BRAND_ID') {
      console.error('Invalid brand ID provided');
      // Show user-friendly error message
      showErrorNotification('The brand ID is not valid. Please try again.');
      return null;
    }
    
    // Handle other errors
    if (error.response?.data?.error?.code === 'ACCESS_DENIED') {
      showErrorNotification('You do not have access to this brand.');
      return null;
    }
    
    // Generic error handling
    console.error('Error fetching brand details:', error);
    showErrorNotification('Failed to fetch brand details. Please try again.');
    return null;
  }
};
```

#### **Example: React with Fetch API**

```javascript
const getBrandDetails = async (brandId) => {
  try {
    const response = await fetch(`/api/brands/${brandId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Check for errors
    if (!response.ok) {
      // Handle invalid brand ID
      if (data.error?.code === 'INVALID_BRAND_ID') {
        console.error('Invalid brand ID format');
        showErrorNotification('The brand ID is not valid.');
        return null;
      }
      
      // Handle other errors
      throw new Error(data.error?.message || 'Failed to fetch brand details');
    }
    
    return data;
    
  } catch (error) {
    console.error('Error fetching brand details:', error);
    showErrorNotification('Failed to fetch brand details. Please try again.');
    return null;
  }
};
```

#### **Example: Vue.js with Axios**

```javascript
// In your Vue component or Vuex action
async fetchBrandDetails({ commit }, brandId) {
  try {
    const response = await this.$axios.get(`/api/brands/${brandId}`);
    commit('SET_BRAND_DETAILS', response.data.data);
    return response.data;
    
  } catch (error) {
    // Handle invalid brand ID error
    if (error.response?.data?.error?.code === 'INVALID_BRAND_ID') {
      this.$notify({
        type: 'error',
        title: 'Invalid Brand ID',
        message: 'The brand ID format is not valid.'
      });
      return null;
    }
    
    // Handle other errors
    this.$notify({
      type: 'error',
      title: 'Error',
      message: error.response?.data?.error?.message || 'Failed to fetch brand details'
    });
    
    return null;
  }
}
```

#### **Example: Angular with HttpClient**

```typescript
// In your Angular service
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

getBrandDetails(brandId: string): Observable<any> {
  return this.http.get(`/api/brands/${brandId}`).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle invalid brand ID
      if (error.error?.error?.code === 'INVALID_BRAND_ID') {
        this.notificationService.showError('Invalid brand ID format');
        return throwError(() => new Error('Invalid brand ID'));
      }
      
      // Handle other errors
      const errorMessage = error.error?.error?.message || 'Failed to fetch brand details';
      this.notificationService.showError(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
}
```

---

### **3. Centralized Error Handler (Recommended)**

Create a centralized error handler to manage all API errors consistently:

```javascript
// utils/apiErrorHandler.js

export const handleApiError = (error, context = '') => {
  // Extract error details
  const errorCode = error.response?.data?.error?.code;
  const errorMessage = error.response?.data?.error?.message;
  const statusCode = error.response?.status;
  
  console.error(`API Error [${context}]:`, {
    code: errorCode,
    message: errorMessage,
    status: statusCode
  });
  
  // Handle specific error codes
  switch (errorCode) {
    case 'INVALID_BRAND_ID':
      return {
        title: 'Invalid Brand ID',
        message: 'The brand ID format is not valid. Please try again.',
        shouldRetry: false
      };
      
    case 'ACCESS_DENIED':
      return {
        title: 'Access Denied',
        message: 'You do not have permission to access this brand.',
        shouldRetry: false
      };
      
    case 'BRAND_NOT_FOUND':
      return {
        title: 'Brand Not Found',
        message: 'The requested brand could not be found.',
        shouldRetry: false
      };
      
    case 'PERMISSION_DENIED':
      return {
        title: 'Permission Denied',
        message: errorMessage || 'You do not have permission to perform this action.',
        shouldRetry: false
      };
      
    case 'INSUFFICIENT_PERMISSION':
      return {
        title: 'Insufficient Permission',
        message: errorMessage || 'You do not have sufficient permissions.',
        shouldRetry: false
      };
      
    // Network errors
    case 'NETWORK_ERROR':
    case 'TIMEOUT':
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        shouldRetry: true
      };
      
    // Generic error
    default:
      return {
        title: 'Error',
        message: errorMessage || 'An unexpected error occurred. Please try again.',
        shouldRetry: true
      };
  }
};

// Usage in your API calls
import { handleApiError } from './utils/apiErrorHandler';

const getBrandDetails = async (brandId) => {
  try {
    const response = await axios.get(`/api/brands/${brandId}`);
    return response.data;
  } catch (error) {
    const errorInfo = handleApiError(error, 'getBrandDetails');
    showNotification(errorInfo.title, errorInfo.message, 'error');
    
    // Optionally retry
    if (errorInfo.shouldRetry) {
      // Implement retry logic
    }
    
    return null;
  }
};
```

---

## 🎨 User-Facing Error Messages

### **Recommended Error Messages for Users:**

| Error Code | User-Friendly Message |
|------------|----------------------|
| `INVALID_BRAND_ID` | "The brand link appears to be invalid. Please check the URL and try again." |
| `ACCESS_DENIED` | "You don't have access to this brand. Please contact your administrator." |
| `BRAND_NOT_FOUND` | "This brand could not be found. It may have been deleted." |
| `PERMISSION_DENIED` | "You don't have permission to perform this action." |
| `INSUFFICIENT_PERMISSION` | "Your current role doesn't allow you to perform this action." |

---

## 🔍 Debugging Tips

### **Check Brand ID Format Before API Calls:**

```javascript
// Add this to your browser console for debugging
const debugBrandId = (id) => {
  console.log('Brand ID:', id);
  console.log('Type:', typeof id);
  console.log('Length:', id?.length);
  console.log('Is Valid ObjectId:', /^[0-9a-fA-F]{24}$/.test(id));
};

// Usage
debugBrandId('507f1f77bcf86cd799439011'); // Valid
debugBrandId('subtasks');                 // Invalid
```

### **Common Issues:**

1. **Issue:** Using brand slug instead of brand ID
   - **Fix:** Ensure you're using the `_id` field, not the `slug` field
   
2. **Issue:** Brand ID is undefined or null
   - **Fix:** Check your state management and ensure brand ID is properly set
   
3. **Issue:** Brand ID is being concatenated with other strings
   - **Fix:** Verify string interpolation in your API URLs

---

## 📱 Testing Checklist

Before deploying frontend changes, test the following scenarios:

- [ ] Valid brand ID - should work normally
- [ ] Invalid brand ID format - should show proper error message
- [ ] Null or undefined brand ID - should handle gracefully
- [ ] Empty string brand ID - should handle gracefully
- [ ] Non-existent brand ID (valid format) - should show "Brand not found"
- [ ] Brand ID from URL parameters - should validate before use
- [ ] Brand switching with invalid ID - should show appropriate error

---

## 🚨 Breaking Changes

### **None - This is a Non-Breaking Change**

The backend changes are **backward compatible**. Valid brand IDs will continue to work exactly as before. The only change is that invalid IDs now return a proper error response instead of causing a server error.

### **Migration Path:**

1. ✅ Add client-side validation (optional but recommended)
2. ✅ Update error handling to catch `INVALID_BRAND_ID` error code
3. ✅ Test with both valid and invalid brand IDs
4. ✅ Deploy frontend changes

---

## 📞 Support

If you encounter any issues or have questions about these changes, please contact the backend team or create an issue in the project repository.

---

## 📚 Additional Resources

### **All Error Codes Used in Brand APIs:**

```javascript
// Brand-related error codes
const BRAND_ERROR_CODES = {
  INVALID_BRAND_ID: 'Invalid brand ID format',
  BRAND_NOT_FOUND: 'Brand not found',
  ACCESS_DENIED: 'Access denied to this brand',
  PERMISSION_DENIED: 'Permission denied',
  INSUFFICIENT_PERMISSION: 'Insufficient permissions',
  BRAND_EXISTS: 'Brand with this name already exists',
  VALIDATION_ERROR: 'Validation error',
  BRAND_CREATE_ERROR: 'Failed to create brand',
  BRAND_UPDATE_ERROR: 'Failed to update brand',
  BRAND_DELETE_ERROR: 'Failed to delete brand',
  BRAND_SWITCH_ERROR: 'Failed to switch brand',
  BRAND_FETCH_ERROR: 'Failed to fetch brand details',
  BRANDS_FETCH_ERROR: 'Failed to fetch brands'
};
```

---

**Document Version:** 1.0  
**Last Updated:** Current Session  
**Backend API Version:** Latest  

---

## ✅ Summary

**What the backend team did:**
- Added ObjectId validation to prevent server crashes
- Returns proper `400 Bad Request` with `INVALID_BRAND_ID` error code for invalid IDs

**What the frontend team needs to do:**
1. Add error handling for the new `INVALID_BRAND_ID` error code
2. (Optional) Add client-side ObjectId validation before API calls
3. Show user-friendly error messages when invalid brand IDs are detected
4. Test with various invalid brand ID scenarios

**Impact:** Minimal - backward compatible, only affects error handling for invalid IDs.

