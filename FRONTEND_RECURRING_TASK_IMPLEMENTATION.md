# Frontend Implementation Guide: Recurring Tasks

## Overview
The Project Tracker API now supports **Recurring Tasks** - tasks that repeat regularly without specific start/end dates. This guide provides implementation details for frontend developers.

## Backend Changes Summary

### New Task Status
- Added `"Recurring"` to the task status enum
- Recurring tasks cannot have `startDate` or `eta` fields
- These fields are automatically set to `null` for recurring tasks

### API Validation Rules
- **Regular Tasks**: `eta` is required, `startDate` is optional
- **Recurring Tasks**: Neither `eta` nor `startDate` are allowed
- Clear error messages for validation failures

## Frontend Implementation Requirements

### 1. Task Creation Form

#### Status Dropdown Enhancement
```javascript
// Update your status options to include "Recurring"
const statusOptions = [
  { value: 'Yet to Start', label: 'Yet to Start' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Blocked', label: 'Blocked' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Recurring', label: 'Recurring' } // NEW
];
```

#### Conditional Field Display
```javascript
// React example for conditional field rendering
const [selectedStatus, setSelectedStatus] = useState('Yet to Start');

const isRecurringTask = selectedStatus === 'Recurring';

return (
  <form>
    {/* Status dropdown */}
    <select 
      value={selectedStatus} 
      onChange={(e) => setSelectedStatus(e.target.value)}
    >
      {statusOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>

    {/* Conditional date fields */}
    {!isRecurringTask && (
      <>
        <input
          type="date"
          name="startDate"
          placeholder="Start Date (Optional)"
        />
        <input
          type="date"
          name="eta"
          placeholder="ETA (Required)"
          required={!isRecurringTask}
        />
      </>
    )}

    {/* Show message for recurring tasks */}
    {isRecurringTask && (
      <div className="info-message">
        <i className="icon-info"></i>
        <span>Recurring tasks don't have specific start/end dates</span>
      </div>
    )}
  </form>
);
```

### 2. Form Validation

#### Client-Side Validation
```javascript
const validateTaskForm = (formData) => {
  const errors = {};

  // Basic required fields
  if (!formData.projectId) errors.projectId = 'Project is required';
  if (!formData.task) errors.task = 'Task name is required';
  if (!formData.assignedTo) errors.assignedTo = 'Assignee is required';
  if (!formData.reporter) errors.reporter = 'Reporter is required';

  // Conditional validation based on status
  if (formData.status === 'Recurring') {
    if (formData.eta) {
      errors.eta = 'ETA cannot be set for recurring tasks';
    }
    if (formData.startDate) {
      errors.startDate = 'Start date cannot be set for recurring tasks';
    }
  } else {
    // For non-recurring tasks, eta is required
    if (!formData.eta) {
      errors.eta = 'ETA is required for non-recurring tasks';
    }
  }

  return errors;
};
```

#### Form Submission
```javascript
const handleSubmit = async (formData) => {
  // Remove date fields for recurring tasks
  const submitData = { ...formData };
  
  if (formData.status === 'Recurring') {
    delete submitData.eta;
    delete submitData.startDate;
  }

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(submitData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    // Handle success
    const task = await response.json();
    console.log('Task created:', task);
  } catch (error) {
    console.error('Error creating task:', error.message);
  }
};
```

### 3. Task Display/Listing

#### Task Card Component
```javascript
const TaskCard = ({ task }) => {
  const isRecurring = task.status === 'Recurring';

  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.task}</h3>
        <span className={`status-badge ${task.status.toLowerCase()}`}>
          {task.status}
        </span>
      </div>

      <div className="task-details">
        <p>{task.description}</p>
        
        {/* Conditional date display */}
        {isRecurring ? (
          <div className="recurring-info">
            <i className="icon-repeat"></i>
            <span>Recurring Task - No specific dates</span>
          </div>
        ) : (
          <div className="date-info">
            {task.startDate && (
              <div>Start: {new Date(task.startDate).toLocaleDateString()}</div>
            )}
            {task.eta && (
              <div>ETA: {new Date(task.eta).toLocaleDateString()}</div>
            )}
          </div>
        )}

        <div className="task-meta">
          <span>Assigned to: {task.assignedTo.name}</span>
          <span>Priority: {task.priority}</span>
          {task.estimatedHours && (
            <span>Est. Hours: {task.estimatedHours}</span>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 4. Task Edit Form

#### Pre-populate Form
```javascript
const TaskEditForm = ({ task, onSubmit }) => {
  const [formData, setFormData] = useState({
    ...task,
    startDate: task.startDate ? task.startDate.split('T')[0] : '',
    eta: task.eta ? task.eta.split('T')[0] : ''
  });

  const isRecurring = formData.status === 'Recurring';

  const handleStatusChange = (newStatus) => {
    setFormData(prev => ({
      ...prev,
      status: newStatus,
      // Clear date fields when switching to recurring
      ...(newStatus === 'Recurring' && {
        startDate: '',
        eta: ''
      })
    }));
  };

  return (
    <form onSubmit={onSubmit}>
      {/* Status dropdown */}
      <select 
        value={formData.status}
        onChange={(e) => handleStatusChange(e.target.value)}
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Conditional date fields */}
      {!isRecurring && (
        <>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              startDate: e.target.value
            }))}
            placeholder="Start Date (Optional)"
          />
          <input
            type="date"
            value={formData.eta}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              eta: e.target.value
            }))}
            placeholder="ETA (Required)"
            required={!isRecurring}
          />
        </>
      )}

      {/* Other form fields... */}
    </form>
  );
};
```

### 5. CSS Styling

#### Recurring Task Indicators
```css
/* Recurring task styling */
.task-card.recurring {
  border-left: 4px solid #9c27b0;
}

.recurring-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9c27b0;
  font-style: italic;
  margin: 8px 0;
}

.status-badge.recurring {
  background-color: #9c27b0;
  color: white;
}

/* Info message styling */
.info-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 4px;
  color: #1976d2;
  margin: 8px 0;
}

.info-message .icon-info {
  color: #2196f3;
}
```

### 6. Error Handling

#### API Error Messages
```javascript
const handleApiError = (error) => {
  switch (error.message) {
    case 'ETA cannot be set for recurring tasks':
      return 'Please remove the ETA field for recurring tasks';
    
    case 'Start date cannot be set for recurring tasks':
      return 'Please remove the start date field for recurring tasks';
    
    case 'ETA is required for non-recurring tasks':
      return 'Please provide an ETA for this task';
    
    default:
      return error.message;
  }
};
```

### 7. Testing Checklist

#### Frontend Testing
- [ ] Status dropdown includes "Recurring" option
- [ ] Date fields are hidden when "Recurring" is selected
- [ ] Date fields are shown for other statuses
- [ ] Form validation prevents date input for recurring tasks
- [ ] Form validation requires ETA for non-recurring tasks
- [ ] Task cards display recurring indicator
- [ ] Edit form clears dates when switching to recurring
- [ ] Error messages are user-friendly

#### API Integration Testing
- [ ] Create recurring task without dates (should succeed)
- [ ] Create recurring task with dates (should fail)
- [ ] Create regular task without ETA (should fail)
- [ ] Update task to recurring (should clear dates)
- [ ] Update recurring task to regular (should require ETA)

## Example Use Cases

### 1. Daily Standup Meeting
```json
{
  "projectId": "PROJ-001",
  "task": "Daily Standup Meeting",
  "description": "Daily team standup meeting to discuss progress and blockers",
  "taskType": "Daily",
  "priority": "Medium",
  "status": "Recurring",
  "assignedTo": "user-id",
  "reporter": "user-id",
  "estimatedHours": 0.5,
  "labels": ["meeting", "daily", "team"]
}
```

### 2. Weekly Code Review
```json
{
  "projectId": "PROJ-001",
  "task": "Weekly Code Review",
  "description": "Review pull requests and provide feedback",
  "taskType": "Weekly",
  "priority": "High",
  "status": "Recurring",
  "assignedTo": "user-id",
  "reporter": "user-id",
  "estimatedHours": 2,
  "labels": ["code-review", "weekly", "quality"]
}
```

### 3. Monthly Report Generation
```json
{
  "projectId": "PROJ-001",
  "task": "Monthly Progress Report",
  "description": "Generate and submit monthly project progress report",
  "taskType": "Monthly",
  "priority": "Medium",
  "status": "Recurring",
  "assignedTo": "user-id",
  "reporter": "user-id",
  "estimatedHours": 4,
  "labels": ["report", "monthly", "documentation"]
}
```

## Migration Notes

### Existing Tasks
- Existing tasks with dates will continue to work normally
- No migration required for existing data
- Users can manually convert tasks to recurring if needed

### Backward Compatibility
- All existing API endpoints continue to work
- Frontend can gradually implement recurring task support
- No breaking changes to existing functionality

## Support

For questions or issues with the recurring task implementation:
1. Check the API documentation for detailed endpoint information
2. Review error messages for validation failures
3. Test with Postman collection examples
4. Contact the backend team for API-specific issues
