# 🎯 FRONTEND IMPLEMENTATION GUIDE: "Under Review" Status

## ✅ **BACKEND CHANGES COMPLETED**

**File Modified:** `models/Task.js`
**Status Added:** "Under Review" 
**New Status Order:** `['Yet to Start', 'In Progress', 'Under Review', 'Completed', 'Blocked', 'On Hold', 'Cancelled', 'Recurring']`

---

## 🎨 **FRONTEND CHANGES REQUIRED**

### **1. Status Dropdown/Select Component**

**Update your task status dropdown to include the new status:**

```javascript
// Before (7 options)
const taskStatuses = [
  'Yet to Start',
  'In Progress', 
  'Completed',
  'Blocked',
  'On Hold',
  'Cancelled',
  'Recurring'
];

// After (8 options)
const taskStatuses = [
  'Yet to Start',
  'In Progress',
  'Under Review',  // ← NEW STATUS
  'Completed',
  'Blocked',
  'On Hold',
  'Cancelled',
  'Recurring'
];
```

### **2. Status Colors/Visual Indicators**

**Add color coding for the new status:**

```javascript
const getStatusColor = (status) => {
  switch(status) {
    case 'Yet to Start': return '#94A3B8'; // Gray
    case 'In Progress': return '#3B82F6';  // Blue
    case 'Under Review': return '#F59E0B'; // Amber/Orange ← NEW
    case 'Completed': return '#10B981';    // Green
    case 'Blocked': return '#EF4444';     // Red
    case 'On Hold': return '#8B5CF6';     // Purple
    case 'Cancelled': return '#6B7280';   // Gray
    case 'Recurring': return '#06B6D4';   // Cyan
    default: return '#6B7280';
  }
};
```

### **3. Status Icons**

**Add appropriate icon for "Under Review" status:**

```javascript
const getStatusIcon = (status) => {
  switch(status) {
    case 'Yet to Start': return '⏳';
    case 'In Progress': return '🔄';
    case 'Under Review': return '👀'; // ← NEW ICON
    case 'Completed': return '✅';
    case 'Blocked': return '🚫';
    case 'On Hold': return '⏸️';
    case 'Cancelled': return '❌';
    case 'Recurring': return '🔄';
    default: return '❓';
  }
};
```

### **4. Task Status Workflow Logic**

**Update your task status workflow to include the new status:**

```javascript
// Example: Status progression logic
const getNextStatus = (currentStatus) => {
  switch(currentStatus) {
    case 'Yet to Start': return ['In Progress'];
    case 'In Progress': return ['Under Review', 'Blocked', 'On Hold'];
    case 'Under Review': return ['Completed', 'In Progress']; // ← NEW LOGIC
    case 'Completed': return []; // Terminal status
    case 'Blocked': return ['In Progress', 'Cancelled'];
    case 'On Hold': return ['In Progress', 'Cancelled'];
    case 'Cancelled': return []; // Terminal status
    case 'Recurring': return ['In Progress'];
    default: return [];
  }
};
```

### **5. Task Filtering/Search**

**Update your task filtering to include the new status:**

```javascript
// Filter options
const statusFilters = [
  { value: 'all', label: 'All Tasks' },
  { value: 'Yet to Start', label: 'Yet to Start' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Under Review', label: 'Under Review' }, // ← NEW FILTER
  { value: 'Completed', label: 'Completed' },
  { value: 'Blocked', label: 'Blocked' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Recurring', label: 'Recurring' }
];
```

### **6. Dashboard/Statistics**

**Update your task statistics to include the new status:**

```javascript
// Task count by status
const getTaskCounts = (tasks) => {
  return {
    'Yet to Start': tasks.filter(t => t.status === 'Yet to Start').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    'Under Review': tasks.filter(t => t.status === 'Under Review').length, // ← NEW
    'Completed': tasks.filter(t => t.status === 'Completed').length,
    'Blocked': tasks.filter(t => t.status === 'Blocked').length,
    'On Hold': tasks.filter(t => t.status === 'On Hold').length,
    'Cancelled': tasks.filter(t => t.status === 'Cancelled').length,
    'Recurring': tasks.filter(t => t.status === 'Recurring').length
  };
};
```

### **7. Task Cards/Components**

**Update your task card components to display the new status:**

```jsx
// Example React component
const TaskCard = ({ task }) => {
  const statusColor = getStatusColor(task.status);
  const statusIcon = getStatusIcon(task.status);
  
  return (
    <div className="task-card">
      <div className="task-header">
        <span className="task-title">{task.task}</span>
        <span 
          className="task-status"
          style={{ backgroundColor: statusColor }}
        >
          {statusIcon} {task.status}
        </span>
      </div>
      {/* Rest of task card content */}
    </div>
  );
};
```

### **8. API Integration**

**No changes needed to API calls - the backend already supports the new status:**

```javascript
// Update task status API call (no changes needed)
const updateTaskStatus = async (taskId, newStatus) => {
  const response = await fetch(`/api/brands/${brandId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: newStatus // Can now be "Under Review"
    })
  });
  
  return response.json();
};
```

---

## 🎨 **UI/UX RECOMMENDATIONS**

### **Visual Design:**
- **Color:** Use amber/orange (#F59E0B) for "Under Review" status
- **Icon:** Use eye icon (👀) or review icon
- **Position:** Place between "In Progress" and "Completed" in dropdowns

### **User Experience:**
- **Clear Labeling:** Use "Under Review" (not "Review" or "Pending Review")
- **Status Flow:** Show logical progression: In Progress → Under Review → Completed
- **Filtering:** Include in all status filters and search options

### **Accessibility:**
- **Screen Readers:** Ensure status is properly announced
- **Color Contrast:** Maintain good contrast for the amber color
- **Keyboard Navigation:** Ensure dropdown is keyboard accessible

---

## 🧪 **TESTING CHECKLIST**

### **Frontend Testing:**
- [ ] Status dropdown shows "Under Review" option
- [ ] Status color displays correctly (amber/orange)
- [ ] Status icon displays correctly
- [ ] Task filtering works with new status
- [ ] Task search includes new status
- [ ] Dashboard statistics include new status
- [ ] Task cards display new status correctly
- [ ] Status workflow logic works correctly

### **API Testing:**
- [ ] Can create task with "Under Review" status
- [ ] Can update task to "Under Review" status
- [ ] Can filter tasks by "Under Review" status
- [ ] API returns correct status in responses

---

## 📋 **IMPLEMENTATION SUMMARY**

### **Files to Update:**
1. **Status dropdown components**
2. **Color/icon mapping functions**
3. **Task filtering logic**
4. **Dashboard statistics**
5. **Task card components**
6. **Status workflow logic**

### **No Changes Needed:**
- ✅ **API endpoints** - Already support new status
- ✅ **Database schema** - Already updated
- ✅ **Backend validation** - Already includes new status

### **New Status Details:**
- **Value:** "Under Review"
- **Color:** #F59E0B (Amber/Orange)
- **Icon:** 👀 (Eye icon)
- **Position:** Between "In Progress" and "Completed"
- **Workflow:** In Progress → Under Review → Completed

---

*The backend is ready! Just update your frontend components to include the new "Under Review" status.*
