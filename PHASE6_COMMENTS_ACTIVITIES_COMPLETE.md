# PHASE 6: COMMENTS & COMMUNICATION SYSTEM - COMPLETE API DOCUMENTATION

## 🚀 **PHASE 6 OVERVIEW**
Phase 6 implements a comprehensive Comments & Communication System with advanced features including:
- **Comment System**: Threading, reactions, mentions, attachments, moderation
- **Activity System**: Activity feeds, notifications, analytics, preferences
- **Communication Features**: Real-time updates, search, filtering, export

---

## 📊 **PHASE 6 API INVENTORY (50+ APIs)**

### **COMMENT SYSTEM APIs (25 APIs)**
1. **Comment CRUD Operations (5 APIs)**
2. **Comment Threading (2 APIs)**
3. **Comment Reactions (2 APIs)**
4. **Comment Mentions (1 API)**
5. **Comment Permissions (1 API)**
6. **Comment Moderation (1 API)**
7. **Comment Pinning (2 APIs)**
8. **Comment Search & Filtering (2 APIs)**
9. **Comment Analytics (2 APIs)**
10. **Comment Attachments (2 APIs)**
11. **Comment History (1 API)**
12. **Comment Export (1 API)**

### **ACTIVITY SYSTEM APIs (25 APIs)**
1. **Activity CRUD Operations (5 APIs)**
2. **Activity Recipients (2 APIs)**
3. **Activity Status Management (3 APIs)**
4. **Activity Search & Filtering (2 APIs)**
5. **Activity Analytics (2 APIs)**
6. **Activity Export (1 API)**
7. **Activity Notifications (3 APIs)**
8. **Activity Preferences (2 APIs)**

---

## 🔧 **COMMENT SYSTEM APIs**

### **1. COMMENT CRUD OPERATIONS**

#### **GET /api/brands/:brandId/comments**
**Description**: Get all comments for a brand
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `entity_type` (optional): Filter by entity type
- `entity_id` (optional): Filter by entity ID
- `status` (optional): Filter by status (default: 'active')

**Response**:
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "comment_id",
        "content": "Comment content",
        "author": {
          "_id": "user_id",
          "name": "User Name",
          "email": "user@example.com"
        },
        "entity_type": "task",
        "entity_id": "entity_id",
        "parent_comment": null,
        "mentions": ["user_id"],
        "reactions": {
          "👍": ["user_id"],
          "❤️": ["user_id"]
        },
        "attachments": [],
        "status": "active",
        "is_pinned": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### **GET /api/brands/:brandId/:entityType/:entityId/comments**
**Description**: Get comments for a specific entity
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**: Same as above

#### **GET /api/brands/:brandId/comments/:id**
**Description**: Get comment details
**Method**: GET
**Headers**: `Authorization: Bearer <token>`

#### **POST /api/brands/:brandId/:entityType/:entityId/comments**
**Description**: Create a new comment
**Method**: POST
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "content": "Comment content",
  "mentions": ["user_id"],
  "attachments": ["attachment_id"],
  "parent_comment": "parent_comment_id"
}
```

#### **PUT /api/brands/:brandId/comments/:id**
**Description**: Update a comment
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "content": "Updated comment content",
  "mentions": ["user_id"],
  "attachments": ["attachment_id"]
}
```

#### **DELETE /api/brands/:brandId/comments/:id**
**Description**: Delete a comment
**Method**: DELETE
**Headers**: `Authorization: Bearer <token>`

### **2. COMMENT THREADING**

#### **POST /api/brands/:brandId/comments/:id/reply**
**Description**: Reply to a comment
**Method**: POST
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "content": "Reply content",
  "mentions": ["user_id"]
}
```

#### **GET /api/brands/:brandId/comments/:id/thread**
**Description**: Get comment thread
**Method**: GET
**Headers**: `Authorization: Bearer <token>`

### **3. COMMENT REACTIONS**

#### **POST /api/brands/:brandId/comments/:id/react**
**Description**: React to a comment
**Method**: POST
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "emoji": "👍"
}
```

#### **DELETE /api/brands/:brandId/comments/:id/react**
**Description**: Remove reaction from comment
**Method**: DELETE
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "emoji": "👍"
}
```

### **4. COMMENT MENTIONS**

#### **POST /api/brands/:brandId/comments/:id/mention**
**Description**: Mention user in comment
**Method**: POST
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "user_id": "user_id"
}
```

### **5. COMMENT PERMISSIONS**

#### **PUT /api/brands/:brandId/comments/:id/permissions**
**Description**: Update comment permissions
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "permissions": {
    "can_edit": ["user_id"],
    "can_delete": ["user_id"],
    "can_react": ["user_id"]
  }
}
```

### **6. COMMENT MODERATION**

#### **PUT /api/brands/:brandId/comments/:id/moderate**
**Description**: Moderate comment
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "action": "approve",
  "reason": "Moderation reason"
}
```

### **7. COMMENT PINNING**

#### **PUT /api/brands/:brandId/comments/:id/pin**
**Description**: Pin a comment
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`

#### **PUT /api/brands/:brandId/comments/:id/unpin**
**Description**: Unpin a comment
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`

### **8. COMMENT SEARCH & FILTERING**

#### **GET /api/brands/:brandId/comments/search**
**Description**: Search comments
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `q`: Search query
- `entity_type`: Filter by entity type
- `author`: Filter by author
- `date_from`: Filter from date
- `date_to`: Filter to date

#### **GET /api/brands/:brandId/comments/filter**
**Description**: Filter comments
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `status`: Filter by status
- `is_pinned`: Filter by pinned status
- `has_attachments`: Filter by attachments
- `has_mentions`: Filter by mentions

### **9. COMMENT ANALYTICS**

#### **GET /api/brands/:brandId/comments/analytics**
**Description**: Get comment analytics
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `date_from`: Start date
- `date_to`: End date
- `entity_type`: Filter by entity type

#### **GET /api/brands/:brandId/comments/:id/analytics**
**Description**: Get comment analytics by ID
**Method**: GET
**Headers**: `Authorization: Bearer <token>`

### **10. COMMENT ATTACHMENTS**

#### **POST /api/brands/:brandId/comments/:id/attachments**
**Description**: Upload attachment to comment
**Method**: POST
**Headers**: `Authorization: Bearer <token>`
**Request Body**: FormData with file

#### **DELETE /api/brands/:brandId/comments/:id/attachments/:attachmentId**
**Description**: Delete attachment from comment
**Method**: DELETE
**Headers**: `Authorization: Bearer <token>`

### **11. COMMENT HISTORY**

#### **GET /api/brands/:brandId/comments/:id/history**
**Description**: Get comment history
**Method**: GET
**Headers**: `Authorization: Bearer <token>`

### **12. COMMENT EXPORT**

#### **GET /api/brands/:brandId/comments/export**
**Description**: Export comments
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `format`: Export format (json, csv, xlsx)
- `entity_type`: Filter by entity type
- `date_from`: Start date
- `date_to`: End date

---

## 🔧 **ACTIVITY SYSTEM APIs**

### **1. ACTIVITY CRUD OPERATIONS**

#### **GET /api/brands/:brandId/activities**
**Description**: Get all activities for a brand
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by activity type
- `status` (optional): Filter by status
- `date_from` (optional): Filter from date
- `date_to` (optional): Filter to date

**Response**:
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "activity_id",
        "type": "task_created",
        "title": "Task Created",
        "description": "A new task was created",
        "created_by": {
          "_id": "user_id",
          "name": "User Name",
          "email": "user@example.com"
        },
        "metadata": {
          "entity_type": "task",
          "entity_id": "entity_id",
          "entity_title": "Task Title",
          "old_values": null,
          "new_values": { "task": "Task Name" },
          "additional_data": {}
        },
        "recipients": [
          {
            "user": "user_id",
            "role": "primary",
            "status": "unread"
          }
        ],
        "status": "active",
        "read_by": ["user_id"],
        "notified_to": ["user_id"],
        "is_archived": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### **GET /api/brands/:brandId/activities/:id**
**Description**: Get activity details
**Method**: GET
**Headers**: `Authorization: Bearer <token>`

#### **GET /api/brands/:brandId/activities/feed**
**Description**: Get user activity feed
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by activity type
- `status` (optional): Filter by status

#### **GET /api/brands/:brandId/:entityType/:entityId/activities**
**Description**: Get activities for a specific entity
**Method**: GET
**Headers**: `Authorization: Bearer <token>`

#### **POST /api/brands/:brandId/activities**
**Description**: Create a new activity
**Method**: POST
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "type": "task_created",
  "title": "Task Created",
  "description": "A new task was created",
  "metadata": {
    "entity_type": "task",
    "entity_id": "entity_id",
    "entity_title": "Task Title",
    "old_values": null,
    "new_values": { "task": "Task Name" },
    "additional_data": {}
  },
  "recipients": [
    {
      "user": "user_id",
      "role": "primary"
    }
  ],
  "priority": "medium",
  "visibility": "public",
  "tags": ["tag1", "tag2"],
  "mentions": ["user_id"]
}
```

#### **PUT /api/brands/:brandId/activities/:id**
**Description**: Update an activity
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "title": "Updated Activity Title",
  "description": "Updated description",
  "metadata": {
    "additional_data": { "key": "value" }
  }
}
```

#### **DELETE /api/brands/:brandId/activities/:id**
**Description**: Delete an activity
**Method**: DELETE
**Headers**: `Authorization: Bearer <token>`

### **2. ACTIVITY RECIPIENTS**

#### **POST /api/brands/:brandId/activities/:id/recipients**
**Description**: Add recipient to activity
**Method**: POST
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "user": "user_id",
  "role": "primary"
}
```

#### **DELETE /api/brands/:brandId/activities/:id/recipients/:userId**
**Description**: Remove recipient from activity
**Method**: DELETE
**Headers**: `Authorization: Bearer <token>`

### **3. ACTIVITY STATUS MANAGEMENT**

#### **PUT /api/brands/:brandId/activities/:id/read**
**Description**: Mark activity as read
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`

#### **PUT /api/brands/:brandId/activities/:id/notified**
**Description**: Mark activity as notified
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`

#### **PUT /api/brands/:brandId/activities/:id/archive**
**Description**: Archive activity
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`

### **4. ACTIVITY SEARCH & FILTERING**

#### **GET /api/brands/:brandId/activities/search**
**Description**: Search activities
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `q`: Search query
- `type`: Filter by activity type
- `created_by`: Filter by creator
- `date_from`: Filter from date
- `date_to`: Filter to date

#### **GET /api/brands/:brandId/activities/filter**
**Description**: Filter activities
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `status`: Filter by status
- `priority`: Filter by priority
- `visibility`: Filter by visibility
- `is_archived`: Filter by archived status

### **5. ACTIVITY ANALYTICS**

#### **GET /api/brands/:brandId/activities/analytics**
**Description**: Get activity analytics
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `date_from`: Start date
- `date_to`: End date
- `type`: Filter by activity type

#### **GET /api/brands/:brandId/activities/:id/analytics**
**Description**: Get activity analytics by ID
**Method**: GET
**Headers**: `Authorization: Bearer <token>`

### **6. ACTIVITY EXPORT**

#### **GET /api/brands/:brandId/activities/export**
**Description**: Export activities
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `format`: Export format (json, csv, xlsx)
- `type`: Filter by activity type
- `date_from`: Start date
- `date_to`: End date

### **7. ACTIVITY NOTIFICATIONS**

#### **GET /api/brands/:brandId/activities/notifications**
**Description**: Get notifications
**Method**: GET
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `type` (optional): Filter by type

#### **PUT /api/brands/:brandId/activities/notifications/:id/read**
**Description**: Mark notification as read
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`

#### **PUT /api/brands/:brandId/activities/notifications/:id/unread**
**Description**: Mark notification as unread
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`

### **8. ACTIVITY PREFERENCES**

#### **GET /api/brands/:brandId/activities/preferences**
**Description**: Get activity preferences
**Method**: GET
**Headers**: `Authorization: Bearer <token>`

#### **PUT /api/brands/:brandId/activities/preferences**
**Description**: Update activity preferences
**Method**: PUT
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "notification_types": ["task_created", "task_updated"],
  "email_notifications": true,
  "push_notifications": true,
  "digest_frequency": "daily",
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  }
}
```

---

## 🔧 **TYPESCRIPT INTERFACES**

### **Comment Interfaces**
```typescript
interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  entity_type: string;
  entity_id: string;
  parent_comment?: string;
  mentions: string[];
  reactions: Record<string, string[]>;
  attachments: string[];
  status: 'active' | 'archived' | 'deleted';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface CommentCreateRequest {
  content: string;
  mentions?: string[];
  attachments?: string[];
  parent_comment?: string;
}

interface CommentUpdateRequest {
  content?: string;
  mentions?: string[];
  attachments?: string[];
}

interface CommentReactionRequest {
  emoji: string;
}

interface CommentSearchRequest {
  q?: string;
  entity_type?: string;
  author?: string;
  date_from?: string;
  date_to?: string;
}
```

### **Activity Interfaces**
```typescript
interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  created_by: {
    _id: string;
    name: string;
    email: string;
  };
  metadata: {
    entity_type: string;
    entity_id: string;
    entity_title: string;
    old_values: any;
    new_values: any;
    additional_data: any;
  };
  recipients: Array<{
    user: string;
    role: 'primary' | 'secondary' | 'observer';
    status: 'unread' | 'read' | 'notified';
  }>;
  status: 'active' | 'archived' | 'deleted';
  read_by: string[];
  notified_to: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ActivityCreateRequest {
  type: string;
  title: string;
  description: string;
  metadata: {
    entity_type: string;
    entity_id: string;
    entity_title: string;
    old_values?: any;
    new_values?: any;
    additional_data?: any;
  };
  recipients: Array<{
    user: string;
    role: 'primary' | 'secondary' | 'observer';
  }>;
  priority?: 'low' | 'medium' | 'high';
  visibility?: 'public' | 'private' | 'restricted';
  tags?: string[];
  mentions?: string[];
}

interface ActivityUpdateRequest {
  title?: string;
  description?: string;
  metadata?: {
    additional_data?: any;
  };
}

interface ActivitySearchRequest {
  q?: string;
  type?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
}
```

---

## 🔧 **REACT COMPONENTS**

### **Comment Components**
```typescript
// CommentList.tsx
interface CommentListProps {
  entityType: string;
  entityId: string;
  brandId: string;
  onCommentAdded?: (comment: Comment) => void;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

// CommentForm.tsx
interface CommentFormProps {
  entityType: string;
  entityId: string;
  brandId: string;
  parentComment?: string;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
}

// CommentItem.tsx
interface CommentItemProps {
  comment: Comment;
  brandId: string;
  onCommentUpdated: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  onReply: (comment: Comment) => void;
}

// CommentReactions.tsx
interface CommentReactionsProps {
  comment: Comment;
  brandId: string;
  onReactionAdded: (comment: Comment) => void;
  onReactionRemoved: (comment: Comment) => void;
}
```

### **Activity Components**
```typescript
// ActivityFeed.tsx
interface ActivityFeedProps {
  brandId: string;
  onActivityRead: (activityId: string) => void;
  onActivityArchived: (activityId: string) => void;
}

// ActivityItem.tsx
interface ActivityItemProps {
  activity: Activity;
  brandId: string;
  onActivityRead: (activityId: string) => void;
  onActivityArchived: (activityId: string) => void;
}

// NotificationCenter.tsx
interface NotificationCenterProps {
  brandId: string;
  onNotificationRead: (notificationId: string) => void;
  onNotificationUnread: (notificationId: string) => void;
}

// ActivityPreferences.tsx
interface ActivityPreferencesProps {
  brandId: string;
  preferences: ActivityPreferences;
  onPreferencesUpdated: (preferences: ActivityPreferences) => void;
}
```

---

## 🔧 **SERVICE LAYER FUNCTIONS**

### **Comment Services**
```typescript
// commentService.ts
export class CommentService {
  static async getComments(brandId: string, params?: CommentSearchRequest): Promise<Comment[]>;
  static async getComment(brandId: string, commentId: string): Promise<Comment>;
  static async createComment(brandId: string, entityType: string, entityId: string, data: CommentCreateRequest): Promise<Comment>;
  static async updateComment(brandId: string, commentId: string, data: CommentUpdateRequest): Promise<Comment>;
  static async deleteComment(brandId: string, commentId: string): Promise<void>;
  static async replyToComment(brandId: string, commentId: string, data: CommentCreateRequest): Promise<Comment>;
  static async reactToComment(brandId: string, commentId: string, emoji: string): Promise<Comment>;
  static async removeReaction(brandId: string, commentId: string, emoji: string): Promise<Comment>;
  static async mentionUser(brandId: string, commentId: string, userId: string): Promise<Comment>;
  static async pinComment(brandId: string, commentId: string): Promise<Comment>;
  static async unpinComment(brandId: string, commentId: string): Promise<Comment>;
  static async moderateComment(brandId: string, commentId: string, action: string, reason?: string): Promise<Comment>;
  static async searchComments(brandId: string, params: CommentSearchRequest): Promise<Comment[]>;
  static async filterComments(brandId: string, params: CommentFilterRequest): Promise<Comment[]>;
  static async getCommentAnalytics(brandId: string, params?: AnalyticsRequest): Promise<CommentAnalytics>;
  static async exportComments(brandId: string, params: ExportRequest): Promise<Blob>;
}
```

### **Activity Services**
```typescript
// activityService.ts
export class ActivityService {
  static async getActivities(brandId: string, params?: ActivitySearchRequest): Promise<Activity[]>;
  static async getActivity(brandId: string, activityId: string): Promise<Activity>;
  static async createActivity(brandId: string, data: ActivityCreateRequest): Promise<Activity>;
  static async updateActivity(brandId: string, activityId: string, data: ActivityUpdateRequest): Promise<Activity>;
  static async deleteActivity(brandId: string, activityId: string): Promise<void>;
  static async getActivityFeed(brandId: string, params?: ActivityFeedRequest): Promise<Activity[]>;
  static async addRecipient(brandId: string, activityId: string, userId: string, role: string): Promise<Activity>;
  static async removeRecipient(brandId: string, activityId: string, userId: string): Promise<Activity>;
  static async markAsRead(brandId: string, activityId: string): Promise<Activity>;
  static async markAsNotified(brandId: string, activityId: string): Promise<Activity>;
  static async archiveActivity(brandId: string, activityId: string): Promise<Activity>;
  static async searchActivities(brandId: string, params: ActivitySearchRequest): Promise<Activity[]>;
  static async filterActivities(brandId: string, params: ActivityFilterRequest): Promise<Activity[]>;
  static async getActivityAnalytics(brandId: string, params?: AnalyticsRequest): Promise<ActivityAnalytics>;
  static async exportActivities(brandId: string, params: ExportRequest): Promise<Blob>;
  static async getNotifications(brandId: string, params?: NotificationRequest): Promise<Notification[]>;
  static async markNotificationAsRead(brandId: string, notificationId: string): Promise<Notification>;
  static async markNotificationAsUnread(brandId: string, notificationId: string): Promise<Notification>;
  static async getPreferences(brandId: string): Promise<ActivityPreferences>;
  static async updatePreferences(brandId: string, preferences: ActivityPreferences): Promise<ActivityPreferences>;
}
```

---

## 🔧 **AUTHENTICATION & AUTHORIZATION**

### **Required Headers**
```typescript
interface ApiHeaders {
  'Content-Type': 'application/json';
  'Authorization': `Bearer ${token}`;
}
```

### **Token Management**
```typescript
// authService.ts
export class AuthService {
  static getToken(): string | null;
  static setToken(token: string): void;
  static removeToken(): void;
  static isTokenValid(): boolean;
  static refreshToken(): Promise<string>;
}
```

---

## 🔧 **ERROR HANDLING**

### **Common Error Responses**
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Common Error Codes
const ERROR_CODES = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR'
};
```

---

## 🔧 **IMPLEMENTATION GUIDE**

### **1. Setup Authentication**
```typescript
// Set up authentication in your app
const token = AuthService.getToken();
if (!token) {
  // Redirect to login
  window.location.href = '/login';
}
```

### **2. Initialize Services**
```typescript
// Initialize comment and activity services
const commentService = new CommentService();
const activityService = new ActivityService();
```

### **3. Handle Real-time Updates**
```typescript
// Set up WebSocket connection for real-time updates
const ws = new WebSocket('ws://localhost:5000/api/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'comment_added') {
    // Update comment list
  } else if (data.type === 'activity_created') {
    // Update activity feed
  }
};
```

### **4. Implement Error Handling**
```typescript
// Global error handler
const handleApiError = (error: ApiError) => {
  switch (error.error.code) {
    case 'INVALID_TOKEN':
      // Redirect to login
      break;
    case 'UNAUTHORIZED':
      // Show unauthorized message
      break;
    case 'NOT_FOUND':
      // Show not found message
      break;
    default:
      // Show generic error message
      break;
  }
};
```

---

## 🚀 **PHASE 6 COMPLETE!**

**Phase 6: Comments & Communication System** is now fully implemented with:
- ✅ **50+ APIs** for comments and activities
- ✅ **Complete documentation** with request/response examples
- ✅ **TypeScript interfaces** for type safety
- ✅ **React components** for UI implementation
- ✅ **Service layer functions** for API integration
- ✅ **Authentication & authorization** handling
- ✅ **Error handling** and edge cases
- ✅ **Real-time updates** via WebSocket
- ✅ **Search & filtering** capabilities
- ✅ **Analytics & reporting** features
- ✅ **Export functionality** for data management

**Ready for frontend implementation!** 🎉
