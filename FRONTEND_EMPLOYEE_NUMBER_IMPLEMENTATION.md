# Frontend Implementation Guide: Employee Number Requirement

## Overview
The Project Tracker API now requires a unique `employeeNumber` field for all user registration and creation operations. This guide provides implementation details for frontend developers.

## API Changes

### Required Fields for User Registration
- `name` (string): Full name of the user
- `email` (string): Unique email address  
- `password` (string): User password (minimum 6 characters)
- `employeeNumber` (string): **REQUIRED** - Unique employee identification number

### Error Messages
The API now returns specific error messages for validation:

1. **Missing Employee Number (400):**
```json
{
  "message": "Signup failed",
  "error": "Employee Number is required. Please provide a unique employee number for this user."
}
```

2. **Duplicate Employee Number (409):**
```json
{
  "message": "Signup failed", 
  "error": "Employee Number 'EMP-1001' already exists. Please use a different employee number."
}
```

3. **Duplicate Email (409):**
```json
{
  "message": "Signup failed",
  "error": "Email already exists"
}
```

## Frontend Implementation

### 1. Registration Form Updates

Add an employee number field to your registration form:

```html
<form id="registrationForm">
  <div class="form-group">
    <label for="name">Full Name *</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div class="form-group">
    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label for="password">Password *</label>
    <input type="password" id="password" name="password" required minlength="6">
  </div>
  
  <div class="form-group">
    <label for="employeeNumber">Employee Number *</label>
    <input type="text" id="employeeNumber" name="employeeNumber" required>
    <small class="form-text text-muted">
      Enter a unique employee identification number (e.g., EMP-1001, ECOSIND0044, THRIVE001)
    </small>
  </div>
  
  <div class="form-group">
    <label for="role">Role</label>
    <select id="role" name="role">
      <option value="employee">Employee</option>
      <option value="manager">Manager</option>
      <option value="admin">Admin</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="department">Department</label>
    <select id="department" name="department">
      <option value="India E-commerce">India E-commerce</option>
      <option value="New Product Design">New Product Design</option>
      <option value="Supply Chain-Operations">Supply Chain-Operations</option>
      <!-- Add other departments as needed -->
    </select>
  </div>
  
  <button type="submit">Register</button>
</form>
```

### 2. JavaScript Validation

```javascript
// Form validation
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    employeeNumber: document.getElementById('employeeNumber').value.trim(),
    role: document.getElementById('role').value,
    department: document.getElementById('department').value
  };
  
  // Client-side validation
  if (!formData.employeeNumber) {
    showError('Employee Number is required');
    return;
  }
  
  if (formData.employeeNumber.length < 2) {
    showError('Employee Number must be at least 2 characters long');
    return;
  }
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showSuccess('User registered successfully!');
      // Redirect to login or dashboard
    } else {
      showError(data.error || 'Registration failed');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
});

// Error display function
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  errorDiv.className = 'alert alert-danger';
}

// Success display function
function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  successDiv.className = 'alert alert-success';
}
```

### 3. React Component Example

```jsx
import React, { useState } from 'react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeNumber: '',
    role: 'employee',
    department: 'India E-commerce'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.employeeNumber.trim()) {
      setError('Employee Number is required');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('User registered successfully!');
        // Reset form or redirect
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="registration-form">
      <h2>User Registration</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="employeeNumber">Employee Number *</label>
          <input
            type="text"
            id="employeeNumber"
            name="employeeNumber"
            value={formData.employeeNumber}
            onChange={handleChange}
            required
            placeholder="e.g., EMP-1001, ECOSIND0044"
          />
          <small className="form-text">
            Enter a unique employee identification number
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="department">Department</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          >
            <option value="India E-commerce">India E-commerce</option>
            <option value="New Product Design">New Product Design</option>
            <option value="Supply Chain-Operations">Supply Chain-Operations</option>
            <option value="Human Resources and Administration">Human Resources and Administration</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Retail E-commerce">Retail E-commerce</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
            <option value="Zonal Sales (India)- HORECA">Zonal Sales (India)- HORECA</option>
            <option value="Zonal Sales (India)">Zonal Sales (India)</option>
            <option value="Supply Chain & Operation">Supply Chain & Operation</option>
            <option value="Zonal Sales">Zonal Sales</option>
            <option value="Digital Marketing">Digital Marketing</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
```

### 4. Vue.js Component Example

```vue
<template>
  <div class="registration-form">
    <h2>User Registration</h2>
    
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Full Name *</label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          required
        />
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password *</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          required
          minlength="6"
        />
      </div>

      <div class="form-group">
        <label for="employeeNumber">Employee Number *</label>
        <input
          type="text"
          id="employeeNumber"
          v-model="formData.employeeNumber"
          required
          placeholder="e.g., EMP-1001, ECOSIND0044"
        />
        <small class="form-text">
          Enter a unique employee identification number
        </small>
      </div>

      <div class="form-group">
        <label for="role">Role</label>
        <select id="role" v-model="formData.role">
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div class="form-group">
        <label for="department">Department</label>
        <select id="department" v-model="formData.department">
          <option value="India E-commerce">India E-commerce</option>
          <option value="New Product Design">New Product Design</option>
          <option value="Supply Chain-Operations">Supply Chain-Operations</option>
          <!-- Add other departments -->
        </select>
      </div>

      <button type="submit" class="btn btn-primary">Register</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'RegistrationForm',
  data() {
    return {
      formData: {
        name: '',
        email: '',
        password: '',
        employeeNumber: '',
        role: 'employee',
        department: 'India E-commerce'
      },
      error: '',
      success: ''
    };
  },
  methods: {
    async handleSubmit() {
      this.error = '';
      this.success = '';

      // Validation
      if (!this.formData.employeeNumber.trim()) {
        this.error = 'Employee Number is required';
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formData)
        });

        const data = await response.json();

        if (response.ok) {
          this.success = 'User registered successfully!';
          // Reset form or redirect
        } else {
          this.error = data.error || 'Registration failed';
        }
      } catch (error) {
        this.error = 'Network error. Please try again.';
      }
    }
  }
};
</script>
```

## Employee Number Format Guidelines

### Recommended Formats
- **Company Prefix + Number**: `EMP-1001`, `ECOSIND0044`, `THRIVE001`
- **Department + Number**: `HR-2024-001`, `IT-2024-001`
- **Year + Sequential**: `2024-001`, `2024-002`
- **Location + Number**: `BLR-001`, `DEL-001`

### Validation Rules
- Must be unique across all users
- Minimum 2 characters
- Can contain letters, numbers, hyphens, and underscores
- Case-sensitive (recommend using uppercase for consistency)

## Testing

### Test Cases for Frontend
1. **Valid Registration**: All required fields provided
2. **Missing Employee Number**: Should show clear error message
3. **Duplicate Employee Number**: Should show specific error message
4. **Duplicate Email**: Should show email conflict error
5. **Invalid Employee Number Format**: Should show validation error

### API Testing with Postman
Use the updated Postman collection which includes:
- Success response examples
- Missing employee number error
- Duplicate employee number error
- Duplicate email error

## Migration Notes

### For Existing Users
If you have existing users without employee numbers, you'll need to:
1. Update the database to add employee numbers for existing users
2. Ensure all employee numbers are unique
3. Update any existing frontend forms to include the employee number field

### Backward Compatibility
- The API will reject requests without employee numbers
- Existing users should be updated before deploying frontend changes
- Consider a migration script to assign employee numbers to existing users
