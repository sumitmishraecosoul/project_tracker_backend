# Frontend Integration Guide - Department-Based Filtering

## 🎯 **Overview**
This guide provides comprehensive instructions for implementing department-based filtering across all pages (Dashboard, Project Tracker, Task Tracker) with proper default department logic.

## 🔧 **Key Changes Implemented**

### **1. Default Department Logic**
- **Admin**: Defaults to admin's own department, or "All Departments" if admin has no department
- **Manager**: Always uses their own department
- **Employee**: Always uses their own department

### **2. Team Members Filtering**
- Team members are now properly filtered by selected department
- Only shows team members from the selected department

### **3. New API Endpoint**
- Added `/api/dashboard/departments` to get all departments and user info

## 📋 **Frontend Implementation Requirements**

### **1. Dashboard Page Updates**

#### **A. Department Dropdown Implementation**
```javascript
// Add this to your dashboard component
const [departments, setDepartments] = useState([]);
const [selectedDepartment, setSelectedDepartment] = useState('');
const [userDepartment, setUserDepartment] = useState('');
const [userRole, setUserRole] = useState('');

// Fetch departments on component mount
useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/dashboard/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      setDepartments(data.departments);
      setUserDepartment(data.userDepartment);
      setUserRole(data.userRole);
      
      // Set default department based on user role
      if (data.userRole === 'admin') {
        setSelectedDepartment(data.userDepartment || 'All Departments');
      } else {
        setSelectedDepartment(data.userDepartment);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };
  
  fetchDepartments();
}, []);

// Department dropdown component
const DepartmentSelector = () => {
  if (userRole !== 'admin') return null;
  
  return (
    <select 
      value={selectedDepartment} 
      onChange={(e) => setSelectedDepartment(e.target.value)}
      className="department-dropdown"
    >
      <option value="All Departments">All Departments</option>
      {departments.map(dept => (
        <option key={dept} value={dept}>{dept}</option>
      ))}
    </select>
  );
};
```

#### **B. Dashboard Data Fetching**
```javascript
// Update your dashboard data fetching
const fetchDashboardData = async () => {
  try {
    const url = userRole === 'admin' && selectedDepartment 
      ? `/api/dashboard/summary?department=${encodeURIComponent(selectedDepartment)}`
      : '/api/dashboard/summary';
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    setDashboardData(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

// Call this whenever selectedDepartment changes
useEffect(() => {
  if (selectedDepartment) {
    fetchDashboardData();
  }
}, [selectedDepartment]);
```

#### **C. Team Members Display**
```javascript
// Team members are now filtered by department automatically
const TeamMembersSection = ({ teamMembers }) => {
  return (
    <div className="team-members">
      <h3>My Team ({teamMembers.length})</h3>
      {teamMembers.map(member => (
        <div key={member._id} className="team-member">
          <div className="member-avatar">{member.name[0]}</div>
          <div className="member-info">
            <div className="member-name">{member.name}</div>
            <div className="member-email">{member.email}</div>
            <div className="member-role">{member.role}</div>
            <div className="member-department">{member.department}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### **2. Project Tracker Page Updates**

#### **A. Department Filtering**
```javascript
// Update project fetching with department filter
const fetchProjects = async () => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (search) params.append('search', search);
    
    // Add department filter for admin
    if (userRole === 'admin' && selectedDepartment && selectedDepartment !== 'All Departments') {
      params.append('department', selectedDepartment);
    }
    
    const url = `/api/projects?${params.toString()}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    setProjects(data.projects);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};
```

#### **B. Project Display with Department Info**
```javascript
const ProjectCard = ({ project }) => {
  return (
    <div className="project-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className="project-status">{project.status}</span>
      </div>
      
      <div className="project-details">
        <p>{project.description}</p>
        
        {/* Department Information */}
        <div className="project-department">
          <strong>Department:</strong> {project.department}
        </div>
        
        {/* Active Members Count */}
        <div className="project-members">
          <strong>Active Members:</strong> {project.activeMembersCount}
        </div>
        
        {/* Project Creator */}
        <div className="project-creator">
          <strong>Created by:</strong> {project.createdBy.name} ({project.createdBy.department})
        </div>
      </div>
    </div>
  );
};
```

### **3. Task Tracker Page Updates**

#### **A. Add Department Dropdown (New Feature)**
```javascript
// Add department selector to Task Tracker page
const TaskTrackerPage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // Same department fetching logic as Dashboard
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/dashboard/departments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        setDepartments(data.departments);
        setUserDepartment(data.userDepartment);
        setUserRole(data.userRole);
        
        // Set default department
        if (data.userRole === 'admin') {
          setSelectedDepartment(data.userDepartment || 'All Departments');
        } else {
          setSelectedDepartment(data.userDepartment);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);
  
  return (
    <div className="task-tracker">
      {/* Department Selector for Admin */}
      {userRole === 'admin' && (
        <div className="department-filter">
          <label>Filter by Department:</label>
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="All Departments">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* Task List */}
      <TaskList selectedDepartment={selectedDepartment} />
    </div>
  );
};
```

#### **B. Task Fetching with Department Filter**
```javascript
const fetchTasks = async () => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (taskType) params.append('taskType', taskType);
    if (view) params.append('view', view);
    
    // Add department filter for admin
    if (userRole === 'admin' && selectedDepartment && selectedDepartment !== 'All Departments') {
      params.append('department', selectedDepartment);
    }
    
    const url = `/api/tasks?${params.toString()}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    setTasks(data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};
```

### **4. Global State Management**

#### **A. User Context/Store**
```javascript
// Create a user context to store user info globally
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({
    department: '',
    role: '',
    departments: []
  });
  
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/dashboard/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      setUserInfo({
        department: data.userDepartment,
        role: data.userRole,
        departments: data.departments
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };
  
  useEffect(() => {
    fetchUserInfo();
  }, []);
  
  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
```

#### **B. Department Context/Store**
```javascript
// Create a department context for managing selected department
const DepartmentContext = createContext();

const DepartmentProvider = ({ children }) => {
  const { userInfo } = useContext(UserContext);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  useEffect(() => {
    // Set default department based on user role
    if (userInfo.role === 'admin') {
      setSelectedDepartment(userInfo.department || 'All Departments');
    } else {
      setSelectedDepartment(userInfo.department);
    }
  }, [userInfo]);
  
  return (
    <DepartmentContext.Provider value={{ selectedDepartment, setSelectedDepartment }}>
      {children}
    </DepartmentContext.Provider>
  );
};
```

## 🎨 **UI/UX Guidelines**

### **1. Department Dropdown Styling**
```css
.department-dropdown {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  min-width: 200px;
}

.department-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.department-filter label {
  font-weight: 600;
  color: #333;
}
```

### **2. Department Indicators**
```css
.department-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.member-department {
  color: #666;
  font-size: 12px;
  margin-top: 2px;
}
```

## 🔄 **API Integration Summary**

### **Endpoints Updated:**
1. **`GET /api/dashboard/summary`** - Now includes default department logic
2. **`GET /api/dashboard/departments`** - New endpoint for department list
3. **`GET /api/projects`** - Now includes default department logic
4. **`GET /api/tasks`** - Now includes default department logic

### **Response Changes:**
- All endpoints now return `selectedDepartment` in response
- Team members are filtered by department
- Projects include department information and active member counts

## 🧪 **Testing Checklist**

- [ ] Admin sees their own department by default
- [ ] Admin can switch to "All Departments"
- [ ] Admin can select any specific department
- [ ] Team members are filtered by selected department
- [ ] Projects show department information
- [ ] Tasks are filtered by department
- [ ] Manager sees only their department data
- [ ] Employee sees only their own data
- [ ] Department dropdown appears only for admin users
- [ ] Default department logic works across all pages

## 🚀 **Deployment Notes**

1. **Backend Changes**: All backend changes are complete and tested
2. **Frontend Changes**: Implement the above code changes
3. **Testing**: Test with different user roles and departments
4. **User Training**: Inform users about the new department filtering feature

## 📞 **Support**

If you encounter any issues during implementation:
1. Check browser console for API errors
2. Verify authentication tokens are valid
3. Ensure all API endpoints are accessible
4. Test with different user roles and departments

The backend is fully ready and tested! 🎉
