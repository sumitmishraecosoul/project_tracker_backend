# Comments & Activity System - Implementation Requirements

## 📋 Overview
This document outlines the complete requirements for implementing a comprehensive Comments & Activity system with real-time updates, markdown support, threading, and notifications.

## 🎯 Key Features
- ✅ Markdown formatting support
- ✅ Real-time notifications (email + inbox)
- ✅ Comment editing/deletion
- ✅ Comment threading (replies)
- ✅ Real-time activity feed
- ✅ @ mention system with suggestions
- ✅ Link sharing (OneDrive, Google Drive, etc.)
- ✅ Reaction system
- ✅ Collaborator management

---

## 🔧 BACKEND REQUIREMENTS

### 1. Database Schema (MongoDB)

#### Comments Collection
```javascript
{
  _id: ObjectId,
  taskId: ObjectId,
  projectId: ObjectId,
  brandId: ObjectId,
  content: String, // Markdown formatted content
  contentHtml: String, // Rendered HTML for display
  author: {
    userId: ObjectId,
    name: String,
    email: String,
    avatar: String
  },
  mentions: [{
    userId: ObjectId,
    name: String,
    email: String,
    mentionedAt: Date
  }],
  links: [{
    url: String,
    title: String,
    description: String,
    type: String, // 'onedrive', 'googledrive', 'external'
    preview: {
      image: String,
      domain: String
    }
  }],
  reactions: [{
    userId: ObjectId,
    emoji: String,
    createdAt: Date
  }],
  // Threading support
  parentCommentId: ObjectId, // null for top-level
  replies: [ObjectId], // Array of reply IDs
  replyCount: Number,
  // Editing support
  editedAt: Date,
  editHistory: [{
    content: String,
    editedAt: Date,
    editedBy: ObjectId
  }],
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId
}
```

#### Activities Collection
```javascript
{
  _id: ObjectId,
  taskId: ObjectId,
  projectId: ObjectId,
  brandId: ObjectId,
  type: String, // 'created', 'completed', 'commented', 'assigned'
  description: String,
  user: {
    userId: ObjectId,
    name: String,
    email: String,
    avatar: String
  },
  metadata: {
    oldValue: Mixed,
    newValue: Mixed
  },
  reactions: [{
    userId: ObjectId,
    emoji: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

#### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Recipient
  type: String, // 'mention', 'comment', 'reply', 'activity'
  title: String,
  message: String,
  data: {
    taskId: ObjectId,
    commentId: ObjectId,
    activityId: ObjectId,
    mentionedBy: ObjectId
  },
  isRead: Boolean,
  readAt: Date,
  createdAt: Date,
  emailSent: Boolean,
  emailSentAt: Date
}
```

#### Real-time Subscriptions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  taskId: ObjectId,
  subscriptionType: String, // 'comments', 'activities', 'mentions'
  createdAt: Date,
  lastSeenAt: Date
}
```

### 2. API Endpoints

#### Comments API
```javascript
// Get comments with threading
GET /api/tasks/:taskId/comments
Query: ?thread=true&limit=20&offset=0

// Create comment
POST /api/tasks/:taskId/comments
Body: { content: string, parentCommentId?: string, mentions: [], links: [] }

// Update comment (edit)
PUT /api/comments/:commentId
Body: { content: string }

// Delete comment
DELETE /api/comments/:commentId

// Get replies
GET /api/comments/:commentId/replies

// Add reply
POST /api/comments/:commentId/replies
Body: { content: string, mentions: [] }

// Add reaction
POST /api/comments/:commentId/reactions
Body: { emoji: string }

// Remove reaction
DELETE /api/comments/:commentId/reactions/:reactionId
```

#### Real-time API
```javascript
// WebSocket connection
WS /api/ws/tasks/:taskId
Events: 'comment_added', 'comment_updated', 'comment_deleted', 'activity_added'

// Subscribe to updates
POST /api/tasks/:taskId/subscribe
Body: { userId: string, subscriptionType: string[] }

// Unsubscribe
DELETE /api/tasks/:taskId/subscribe
```

#### Notifications API
```javascript
// Get notifications
GET /api/notifications
Query: ?unread=true&limit=20&offset=0

// Mark as read
PUT /api/notifications/:notificationId/read

// Mark all as read
PUT /api/notifications/read-all

// Get inbox
GET /api/inbox
```

#### Mention Suggestions API
```javascript
// Get mention suggestions
GET /api/brands/:brandId/mention-suggestions
Query: ?q=sumit&type=user,project,task
```

### 3. Backend Services Required

#### MarkdownService
- Convert markdown to HTML
- Sanitize HTML content
- Extract link previews
- Handle mentions in content

#### RealtimeService
- WebSocket connection management
- Broadcast comment updates
- Broadcast mention notifications
- Broadcast activity updates

#### EmailService
- Send mention emails
- Send comment emails
- Send reply emails
- Send activity emails

#### NotificationService
- Create notifications
- Send email notifications
- Manage inbox updates
- Track read status

### 4. Dependencies Required
```json
{
  "marked": "^9.0.0",
  "ws": "^8.14.0",
  "nodemailer": "^6.9.0",
  "cheerio": "^1.0.0-rc.12",
  "socket.io": "^4.7.0"
}
```

---

## 🎨 FRONTEND REQUIREMENTS

### 1. React Components

#### CommentsSection Component
```typescript
interface CommentsSectionProps {
  taskId: string;
  brandId: string;
  currentUser: User;
}
```

#### CommentInput Component
```typescript
interface CommentInputProps {
  onSubmit: (comment: CommentData) => void;
  onReply?: (reply: CommentData, parentId: string) => void;
  parentCommentId?: string;
  placeholder?: string;
  isReply?: boolean;
}
```

#### CommentThread Component
```typescript
interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  onReply: (reply: CommentData) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onReaction: (commentId: string, emoji: string) => void;
  currentUser: User;
}
```

#### MarkdownEditor Component
```typescript
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onMention: (query: string) => Promise<MentionSuggestion[]>;
  showPreview?: boolean;
}
```

#### NotificationCenter Component
```typescript
interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}
```

### 2. Custom Hooks

#### useRealtimeComments
- Manage real-time comment updates
- Handle WebSocket connections
- Add/edit/delete comments
- Manage threading

#### useNotifications
- Fetch notifications
- Mark as read functionality
- Real-time notification updates

#### useWebSocket
- WebSocket connection management
- Event subscription
- Reconnection handling

### 3. State Management

#### Comments State
```typescript
interface CommentsState {
  comments: Comment[];
  activities: Activity[];
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  expandedThreads: Set<string>;
  mentionSuggestions: MentionSuggestion[];
  showMentionDropdown: boolean;
  editingCommentId: string | null;
}
```

### 4. Dependencies Required
```json
{
  "@uiw/react-md-editor": "^4.0.0",
  "react-markdown": "^8.0.0",
  "marked": "^9.0.0",
  "socket.io-client": "^4.7.0",
  "emoji-picker-react": "^4.5.0"
}
```

---

## 📅 Implementation Timeline

### Phase 1: Backend Foundation (5-6 days)
- Database schema setup
- Basic API endpoints
- Markdown processing
- WebSocket setup

### Phase 2: Frontend Core (6-7 days)
- Comments section component
- Markdown editor
- Real-time integration
- Basic threading

### Phase 3: Advanced Features (4-5 days)
- Notification center
- Link previews
- Mention system
- Email notifications

### Phase 4: Polish & Testing (3-4 days)
- Performance optimization
- Error handling
- Testing and bug fixes

**Total Estimated Time: 18-22 days**

---

## 🔗 Integration Points

### Backend Integration
- MongoDB collections
- WebSocket server
- Email service
- File storage (for link previews)

### Frontend Integration
- Task detail page
- Navigation sidebar
- User management
- Brand context

---

## ✅ Acceptance Criteria

1. **Markdown Support**: Comments support full markdown formatting
2. **Real-time Updates**: Changes appear instantly for all users
3. **Threading**: Users can reply to comments with nested structure
4. **Mentions**: @ mentions trigger notifications and suggestions
5. **Notifications**: Email + inbox notifications for all events
6. **Editing**: Comments can be edited with history tracking
7. **Link Sharing**: External links are detected and previewed
8. **Reactions**: Users can react to comments and activities
9. **Collaborators**: Task collaborators receive all notifications
10. **Performance**: System handles 100+ concurrent users

---

*This document should be shared with both frontend and backend teams for implementation coordination.*
