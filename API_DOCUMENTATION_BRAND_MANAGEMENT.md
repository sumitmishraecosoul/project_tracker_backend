# Project Tracker - Brand Management API Documentation

## Overview
This document provides comprehensive documentation for the Brand Management APIs in the multi-brand project tracker system. The APIs support complete brand lifecycle management, user management, and brand-aware project/task operations.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All API endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Brand Management

#### 1.1 Get All Brands
**GET** `/brands`

Retrieves all brands associated with the authenticated user.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Acme Corporation",
      "slug": "acme-corporation",
      "description": "Leading technology company",
      "logo": "https://example.com/logo.png",
      "status": "active",
      "role": "owner",
      "permissions": {
        "can_create_projects": true,
        "can_edit_projects": true,
        "can_delete_projects": true,
        "can_view_all_projects": true,
        "can_create_tasks": true,
        "can_edit_tasks": true,
        "can_delete_tasks": true,
        "can_assign_tasks": true,
        "can_manage_users": true,
        "can_invite_users": true,
        "can_remove_users": true,
        "can_view_analytics": true,
        "can_export_data": true,
        "can_generate_reports": true,
        "can_manage_brand_settings": true,
        "can_manage_billing": true
      },
      "joined_at": "2024-01-15T10:30:00.000Z",
      "subscription": {
        "plan": "premium",
        "status": "active",
        "trial_ends_at": "2024-02-15T10:30:00.000Z",
        "billing_cycle": "monthly",
        "max_users": 100,
        "max_projects": 200,
        "features": ["unlimited_projects", "advanced_analytics", "api_access"]
      }
    }
  ],
  "message": "Brands retrieved successfully"
}
```

#### 1.2 Get Brand Details
**GET** `/brands/:id`

Retrieves detailed information about a specific brand.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Parameters:**
- `id` (string, required): Brand ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Acme Corporation",
    "slug": "acme-corporation",
    "description": "Leading technology company",
    "logo": "https://example.com/logo.png",
    "status": "active",
    "settings": {
      "timezone": "America/New_York",
      "date_format": "MM/DD/YYYY",
      "currency": "USD",
      "language": "en",
      "working_hours": {
        "start": "09:00",
        "end": "17:00",
        "timezone": "America/New_York"
      },
      "holidays": [
        {
          "name": "New Year's Day",
          "date": "2024-01-01T00:00:00.000Z",
          "recurring": true
        }
      ],
      "custom_fields": {}
    },
    "subscription": {
      "plan": "premium",
      "status": "active",
      "trial_ends_at": "2024-02-15T10:30:00.000Z",
      "billing_cycle": "monthly",
      "max_users": 100,
      "max_projects": 200,
      "features": ["unlimited_projects", "advanced_analytics", "api_access"]
    },
    "compliance": {
      "data_retention_days": 2555,
      "gdpr_compliant": true,
      "audit_logging": true,
      "data_encryption": true
    },
    "created_by": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-20T14:45:00.000Z",
    "user_role": "owner",
    "user_permissions": {
      "can_create_projects": true,
      "can_edit_projects": true,
      "can_delete_projects": true,
      "can_view_all_projects": true,
      "can_create_tasks": true,
      "can_edit_tasks": true,
      "can_delete_tasks": true,
      "can_assign_tasks": true,
      "can_manage_users": true,
      "can_invite_users": true,
      "can_remove_users": true,
      "can_view_analytics": true,
      "can_export_data": true,
      "can_generate_reports": true,
      "can_manage_brand_settings": true,
      "can_manage_billing": true
    }
  },
  "message": "Brand details retrieved successfully"
}
```

#### 1.3 Create Brand
**POST** `/brands`

Creates a new brand and assigns the creator as the owner.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "description": "Leading technology company",
  "logo": "https://example.com/logo.png",
  "settings": {
    "timezone": "America/New_York",
    "date_format": "MM/DD/YYYY",
    "currency": "USD",
    "language": "en",
    "working_hours": {
      "start": "09:00",
      "end": "17:00",
      "timezone": "America/New_York"
    },
    "holidays": [
      {
        "name": "New Year's Day",
        "date": "2024-01-01T00:00:00.000Z",
        "recurring": true
      }
    ],
    "custom_fields": {}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Acme Corporation",
    "slug": "acme-corporation",
    "description": "Leading technology company",
    "logo": "https://example.com/logo.png",
    "status": "active",
    "settings": {
      "timezone": "America/New_York",
      "date_format": "MM/DD/YYYY",
      "currency": "USD",
      "language": "en",
      "working_hours": {
        "start": "09:00",
        "end": "17:00",
        "timezone": "America/New_York"
      },
      "holidays": [
        {
          "name": "New Year's Day",
          "date": "2024-01-01T00:00:00.000Z",
          "recurring": true
        }
      ],
      "custom_fields": {}
    },
    "subscription": {
      "plan": "free",
      "status": "trial",
      "trial_ends_at": "2024-02-15T10:30:00.000Z",
      "billing_cycle": "monthly",
      "max_users": 5,
      "max_projects": 10,
      "features": []
    },
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Brand created successfully"
}
```

#### 1.4 Update Brand
**PUT** `/brands/:id`

Updates brand information. Requires owner or admin role.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Parameters:**
- `id` (string, required): Brand ID

**Request Body:**
```json
{
  "name": "Acme Corporation Updated",
  "description": "Leading technology company - Updated",
  "logo": "https://example.com/new-logo.png",
  "settings": {
    "timezone": "America/Los_Angeles",
    "date_format": "DD/MM/YYYY",
    "currency": "EUR",
    "language": "en"
  },
  "subscription": {
    "plan": "premium",
    "max_users": 100,
    "max_projects": 200
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Acme Corporation Updated",
    "slug": "acme-corporation-updated",
    "description": "Leading technology company - Updated",
    "logo": "https://example.com/new-logo.png",
    "status": "active",
    "settings": {
      "timezone": "America/Los_Angeles",
      "date_format": "DD/MM/YYYY",
      "currency": "EUR",
      "language": "en"
    },
    "subscription": {
      "plan": "premium",
      "status": "active",
      "max_users": 100,
      "max_projects": 200
    },
    "updated_at": "2024-01-20T14:45:00.000Z"
  },
  "message": "Brand updated successfully"
}
```

#### 1.5 Delete Brand
**DELETE** `/brands/:id`

Soft deletes a brand. Only brand owners can delete brands.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Parameters:**
- `id` (string, required): Brand ID

**Response:**
```json
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

#### 1.6 Switch to Brand
**POST** `/brands/:id/switch`

Switches the user's context to a specific brand.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Parameters:**
- `id` (string, required): Brand ID

**Response:**
```json
{
  "success": true,
  "data": {
    "brand_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "brand_name": "Acme Corporation",
    "brand_slug": "acme-corporation",
    "role": "owner",
    "permissions": {
      "can_create_projects": true,
      "can_edit_projects": true,
      "can_delete_projects": true,
      "can_view_all_projects": true,
      "can_create_tasks": true,
      "can_edit_tasks": true,
      "can_delete_tasks": true,
      "can_assign_tasks": true,
      "can_manage_users": true,
      "can_invite_users": true,
      "can_remove_users": true,
      "can_view_analytics": true,
      "can_export_data": true,
      "can_generate_reports": true,
      "can_manage_brand_settings": true,
      "can_manage_billing": true
    },
    "subscription": {
      "plan": "premium",
      "status": "active",
      "max_users": 100,
      "max_projects": 200
    }
  },
  "message": "Switched to brand successfully"
}
```

### 2. Brand User Management

#### 2.1 Get Brand Users
**GET** `/brands/:brandId/users`

Retrieves all users associated with a specific brand.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Parameters:**
- `brandId` (string, required): Brand ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "role": "owner",
      "permissions": {
        "can_create_projects": true,
        "can_edit_projects": true,
        "can_delete_projects": true,
        "can_view_all_projects": true,
        "can_create_tasks": true,
        "can_edit_tasks": true,
        "can_delete_tasks": true,
        "can_assign_tasks": true,
        "can_manage_users": true,
        "can_invite_users": true,
        "can_remove_users": true,
        "can_view_analytics": true,
        "can_export_data": true,
        "can_generate_reports": true,
        "can_manage_brand_settings": true,
        "can_manage_billing": true
      },
      "status": "active",
      "joined_at": "2024-01-15T10:30:00.000Z",
      "invited_by": null
    },
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatar": "https://example.com/avatar2.jpg",
      "role": "member",
      "permissions": {
        "can_create_projects": false,
        "can_edit_projects": false,
        "can_delete_projects": false,
        "can_view_all_projects": true,
        "can_create_tasks": true,
        "can_edit_tasks": true,
        "can_delete_tasks": false,
        "can_assign_tasks": false,
        "can_manage_users": false,
        "can_invite_users": false,
        "can_remove_users": false,
        "can_view_analytics": false,
        "can_export_data": false,
        "can_generate_reports": false,
        "can_manage_brand_settings": false,
        "can_manage_billing": false
      },
      "status": "active",
      "joined_at": "2024-01-16T09:15:00.000Z",
      "invited_by": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "message": "Brand users retrieved successfully"
}
```

#### 2.2 Add User to Brand
**POST** `/brands/:brandId/users`

Adds an existing user to a brand with specified role and permissions.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Parameters:**
- `brandId` (string, required): Brand ID

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "member",
  "permissions": {
    "can_create_tasks": true,
    "can_edit_tasks": true,
    "can_view_analytics": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg"
    },
    "role": "member",
    "permissions": {
      "can_create_tasks": true,
      "can_edit_tasks": true,
      "can_view_analytics": false
    },
    "status": "active",
    "joined_at": "2024-01-20T14:45:00.000Z",
    "invited_by": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "User added to brand successfully"
}
```

#### 2.3 Update User Role
**PUT** `/brands/:brandId/users/:userId`

Updates a user's role and permissions within a brand.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Parameters:**
- `brandId` (string, required): Brand ID
- `userId` (string, required): User ID

**Request Body:**
```json
{
  "role": "manager",
  "permissions": {
    "can_create_projects": true,
    "can_edit_projects": true,
    "can_manage_users": true,
    "can_invite_users": true,
    "can_view_analytics": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg"
    },
    "role": "manager",
    "permissions": {
      "can_create_projects": true,
      "can_edit_projects": true,
      "can_manage_users": true,
      "can_invite_users": true,
      "can_view_analytics": true
    },
    "status": "active",
    "joined_at": "2024-01-20T14:45:00.000Z",
    "invited_by": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "User role updated successfully"
}
```

#### 2.4 Remove User from Brand
**DELETE** `/brands/:brandId/users/:userId`

Removes a user from a brand (soft delete).

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Parameters:**
- `brandId` (string, required): Brand ID
- `userId` (string, required): User ID

**Response:**
```json
{
  "success": true,
  "message": "User removed from brand successfully"
}
```

#### 2.5 Invite User to Brand
**POST** `/brands/:brandId/users/invite`

Invites a user to join a brand via email.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Parameters:**
- `brandId` (string, required): Brand ID

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "member",
  "message": "You have been invited to join our brand!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d5",
    "email": "newuser@example.com",
    "role": "member",
    "status": "pending",
    "invited_at": "2024-01-20T14:45:00.000Z"
  },
  "message": "Invitation sent successfully"
}
```

### 3. Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details",
    "field_errors": {
      "field_name": "Field-specific error message"
    }
  },
  "timestamp": "2024-01-20T14:45:00.000Z",
  "request_id": "req_123456789"
}
```

### 4. Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `ACCESS_DENIED` | 403 | Access denied to resource |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `BRAND_NOT_FOUND` | 404 | Brand not found |
| `USER_NOT_FOUND` | 404 | User not found |
| `BRAND_EXISTS` | 400 | Brand name already exists |
| `USER_ALREADY_IN_BRAND` | 400 | User already in brand |
| `CANNOT_CHANGE_OWN_ROLE` | 400 | Cannot change own role |
| `CANNOT_REMOVE_SELF` | 400 | Cannot remove yourself |
| `BRAND_INACTIVE` | 400 | Brand is not active |
| `BRANDS_FETCH_ERROR` | 500 | Failed to fetch brands |
| `BRAND_CREATE_ERROR` | 500 | Failed to create brand |
| `BRAND_UPDATE_ERROR` | 500 | Failed to update brand |
| `BRAND_DELETE_ERROR` | 500 | Failed to delete brand |
| `USER_ADD_ERROR` | 500 | Failed to add user |
| `USER_UPDATE_ERROR` | 500 | Failed to update user |
| `USER_REMOVE_ERROR` | 500 | Failed to remove user |
| `INVITATION_ERROR` | 500 | Failed to send invitation |

### 5. Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Per User**: 1000 requests/hour
- **Per Brand**: 10000 requests/hour
- **Global**: 100000 requests/hour

### 6. Pagination

List endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `sort`: Sort field (default: created_at)
- `order`: Sort order (asc/desc, default: desc)

### 7. Filtering

List endpoints support filtering:
- `status`: Filter by status
- `role`: Filter by user role
- `date_from`: Filter from date
- `date_to`: Filter to date

### 8. Examples

#### Complete Brand Setup Workflow

1. **Create Brand**
```bash
curl -X POST http://localhost:5000/api/brands \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "description": "My company description",
    "settings": {
      "timezone": "America/New_York",
      "currency": "USD"
    }
  }'
```

2. **Add Users to Brand**
```bash
curl -X POST http://localhost:5000/api/brands/<brand_id>/users \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "role": "member"
  }'
```

3. **Switch to Brand**
```bash
curl -X POST http://localhost:5000/api/brands/<brand_id>/switch \
  -H "Authorization: Bearer <jwt_token>"
```

### 9. Testing

Use the provided Postman collection `Project_Tracker_Brand_Management.postman_collection.json` to test all endpoints. The collection includes:
- Pre-configured requests
- Environment variables
- Test scripts for auto-extraction of IDs
- Example request/response data

### 10. Support

For API support and questions:
- Email: support@projecttracker.com
- Documentation: https://docs.projecttracker.com
- Status Page: https://status.projecttracker.com

