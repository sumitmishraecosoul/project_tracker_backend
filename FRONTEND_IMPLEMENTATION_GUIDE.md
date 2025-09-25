# Frontend Implementation Guide - Project Tracker

## 🚀 **Overview**

This guide provides comprehensive instructions for implementing the Project Tracker frontend with multi-brand support. The frontend should be built to work seamlessly with the backend API and provide a modern, user-friendly interface.

## 📋 **Prerequisites**

- Node.js 16+ and npm/yarn
- React 18+ or Vue 3+ or Angular 15+
- Axios or Fetch API for HTTP requests
- State management library (Redux, Zustand, Pinia, etc.)
- UI component library (Material-UI, Ant Design, Chakra UI, etc.)

## 🏗️ **Architecture Overview**

### Core Components
1. **Authentication System** - Login/logout with JWT
2. **Brand Management** - Multi-brand switching and management
3. **Project Management** - CRUD operations for projects
4. **Task Management** - Task creation, assignment, and tracking
5. **User Management** - Team member management
6. **Dashboard** - Analytics and overview

### State Management Structure
```javascript
// Redux/Zustand Store Structure
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false
  },
  brands: {
    currentBrand: null,
    availableBrands: [],
    brandUsers: []
  },
  projects: {
    list: [],
    currentProject: null,
    loading: false
  },
  tasks: {
    list: [],
    currentTask: null,
    loading: false
  },
  ui: {
    sidebarOpen: true,
    theme: 'light',
    notifications: []
  }
}
```

## 🔐 **Authentication Implementation**

### 1. Login Component
```jsx
import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update global state
      onLogin({ token, user });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={credentials.email}
        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### 2. Authentication Service
```javascript
// services/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
```

## 🏢 **Brand Management Implementation**

### 1. Brand Context Provider
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { brandService } from '../services/brandService';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [currentBrand, setCurrentBrand] = useState(null);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user's brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const brands = await brandService.getBrands();
      setAvailableBrands(brands);
      
      // Set first brand as current if none selected
      if (brands.length > 0 && !currentBrand) {
        setCurrentBrand(brands[0]);
      }
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchBrand = async (brandId) => {
    try {
      const brandData = await brandService.switchToBrand(brandId);
      const brand = availableBrands.find(b => b.id === brandId);
      setCurrentBrand(brand);
      return brandData;
    } catch (error) {
      console.error('Failed to switch brand:', error);
      throw error;
    }
  };

  const createBrand = async (brandData) => {
    try {
      const newBrand = await brandService.createBrand(brandData);
      setAvailableBrands([...availableBrands, newBrand]);
      return newBrand;
    } catch (error) {
      console.error('Failed to create brand:', error);
      throw error;
    }
  };

  const value = {
    currentBrand,
    availableBrands,
    loading,
    switchBrand,
    createBrand,
    loadBrands
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
```

### 2. Brand Service
```javascript
// services/brandService.js
import axios from 'axios';

export const brandService = {
  getBrands: async () => {
    const response = await axios.get('/brands');
    return response.data.data;
  },

  getBrandDetails: async (brandId) => {
    const response = await axios.get(`/brands/${brandId}`);
    return response.data.data;
  },

  createBrand: async (brandData) => {
    const response = await axios.post('/brands', brandData);
    return response.data.data;
  },

  updateBrand: async (brandId, brandData) => {
    const response = await axios.put(`/brands/${brandId}`, brandData);
    return response.data.data;
  },

  deleteBrand: async (brandId) => {
    const response = await axios.delete(`/brands/${brandId}`);
    return response.data;
  },

  switchToBrand: async (brandId) => {
    const response = await axios.post(`/brands/${brandId}/switch`);
    return response.data.data;
  },

  getBrandUsers: async (brandId) => {
    const response = await axios.get(`/brands/${brandId}/users`);
    return response.data.data;
  },

  addUserToBrand: async (brandId, userData) => {
    const response = await axios.post(`/brands/${brandId}/users`, userData);
    return response.data.data;
  },

  updateUserRole: async (brandId, userId, roleData) => {
    const response = await axios.put(`/brands/${brandId}/users/${userId}`, roleData);
    return response.data.data;
  },

  removeUserFromBrand: async (brandId, userId) => {
    const response = await axios.delete(`/brands/${brandId}/users/${userId}`);
    return response.data;
  }
};
```

### 3. Brand Selector Component
```jsx
import React from 'react';
import { useBrand } from '../contexts/BrandContext';

const BrandSelector = () => {
  const { currentBrand, availableBrands, switchBrand, loading } = useBrand();

  const handleBrandChange = async (brandId) => {
    try {
      await switchBrand(brandId);
    } catch (error) {
      console.error('Failed to switch brand:', error);
    }
  };

  if (loading) {
    return <div>Loading brands...</div>;
  }

  return (
    <div className="brand-selector">
      <label>Current Brand:</label>
      <select 
        value={currentBrand?.id || ''} 
        onChange={(e) => handleBrandChange(e.target.value)}
      >
        {availableBrands.map(brand => (
          <option key={brand.id} value={brand.id}>
            {brand.name} ({brand.subscription.plan})
          </option>
        ))}
      </select>
    </div>
  );
};
```

## 📊 **Project Management Implementation**

### 1. Project Service
```javascript
// services/projectService.js
import axios from 'axios';

export const projectService = {
  getProjects: async (brandId) => {
    const response = await axios.get(`/brands/${brandId}/projects`);
    return response.data.data;
  },

  getProjectDetails: async (projectId) => {
    const response = await axios.get(`/projects/${projectId}`);
    return response.data.data;
  },

  createProject: async (brandId, projectData) => {
    const response = await axios.post(`/brands/${brandId}/projects`, projectData);
    return response.data.data;
  },

  updateProject: async (projectId, projectData) => {
    const response = await axios.put(`/projects/${projectId}`, projectData);
    return response.data.data;
  },

  deleteProject: async (projectId) => {
    const response = await axios.delete(`/projects/${projectId}`);
    return response.data;
  }
};
```

### 2. Project List Component
```jsx
import React, { useState, useEffect } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { projectService } from '../services/projectService';

const ProjectList = () => {
  const { currentBrand } = useBrand();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentBrand) {
      loadProjects();
    }
  }, [currentBrand]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await projectService.getProjects(currentBrand.id);
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await projectService.createProject(currentBrand.id, projectData);
      setProjects([...projects, newProject]);
    } catch (err) {
      setError('Failed to create project');
    }
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="project-list">
      <h2>Projects for {currentBrand?.name}</h2>
      <button onClick={() => handleCreateProject({ name: 'New Project' })}>
        Create Project
      </button>
      {projects.map(project => (
        <div key={project.id} className="project-item">
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <span className="status">{project.status}</span>
        </div>
      ))}
    </div>
  );
};
```

## ✅ **Task Management Implementation**

### 1. Task Service
```javascript
// services/taskService.js
import axios from 'axios';

export const taskService = {
  getTasks: async (projectId) => {
    const response = await axios.get(`/projects/${projectId}/tasks`);
    return response.data.data;
  },

  getTaskDetails: async (taskId) => {
    const response = await axios.get(`/tasks/${taskId}`);
    return response.data.data;
  },

  createTask: async (projectId, taskData) => {
    const response = await axios.post(`/projects/${projectId}/tasks`, taskData);
    return response.data.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await axios.put(`/tasks/${taskId}`, taskData);
    return response.data.data;
  },

  deleteTask: async (taskId) => {
    const response = await axios.delete(`/tasks/${taskId}`);
    return response.data;
  },

  assignTask: async (taskId, userId) => {
    const response = await axios.post(`/tasks/${taskId}/assign`, { userId });
    return response.data.data;
  }
};
```

### 2. Task Board Component
```jsx
import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';

const TaskBoard = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const tasksData = await taskService.getTasks(projectId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(projectId, taskData);
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, updates);
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="task-board">
      <div className="task-columns">
        <div className="column">
          <h3>To Do</h3>
          {tasks.filter(task => task.status === 'todo').map(task => (
            <div key={task.id} className="task-card">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <span className="priority">{task.priority}</span>
            </div>
          ))}
        </div>
        <div className="column">
          <h3>In Progress</h3>
          {tasks.filter(task => task.status === 'in_progress').map(task => (
            <div key={task.id} className="task-card">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <span className="priority">{task.priority}</span>
            </div>
          ))}
        </div>
        <div className="column">
          <h3>Completed</h3>
          {tasks.filter(task => task.status === 'completed').map(task => (
            <div key={task.id} className="task-card">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <span className="priority">{task.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 🎨 **UI/UX Implementation**

### 1. Main Layout Component
```jsx
import React from 'react';
import { useBrand } from '../contexts/BrandContext';
import { useAuth } from '../contexts/AuthContext';
import BrandSelector from './BrandSelector';
import ProjectList from './ProjectList';
import TaskBoard from './TaskBoard';

const MainLayout = () => {
  const { currentBrand } = useBrand();
  const { user } = useAuth();

  return (
    <div className="main-layout">
      <header className="header">
        <h1>Project Tracker</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={() => authService.logout()}>Logout</button>
        </div>
      </header>
      
      <div className="content">
        <aside className="sidebar">
          <BrandSelector />
          {currentBrand && (
            <div className="brand-info">
              <h3>{currentBrand.name}</h3>
              <p>Plan: {currentBrand.subscription.plan}</p>
            </div>
          )}
        </aside>
        
        <main className="main-content">
          {currentBrand ? (
            <>
              <ProjectList />
              <TaskBoard />
            </>
          ) : (
            <div>Please select a brand</div>
          )}
        </main>
      </div>
    </div>
  );
};
```

### 2. CSS Styles
```css
/* styles/main.css */
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.content {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
  padding: 1rem;
}

.main-content {
  flex: 1;
  padding: 1rem;
}

.brand-selector {
  margin-bottom: 1rem;
}

.brand-selector select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.project-list {
  margin-bottom: 2rem;
}

.project-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: white;
}

.task-board {
  display: flex;
  gap: 1rem;
}

.task-columns {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.column {
  flex: 1;
  background: #f9f9f9;
  border-radius: 4px;
  padding: 1rem;
}

.task-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.priority {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.priority.high {
  background: #ffebee;
  color: #c62828;
}

.priority.medium {
  background: #fff3e0;
  color: #ef6c00;
}

.priority.low {
  background: #e8f5e8;
  color: #2e7d32;
}
```

## 🔒 **Permission-Based UI**

### 1. Permission Hook
```javascript
// hooks/usePermissions.js
import { useBrand } from '../contexts/BrandContext';

export const usePermissions = () => {
  const { currentBrand } = useBrand();
  
  const permissions = currentBrand?.permissions || {};
  
  const can = (permission) => {
    return permissions[permission] === true;
  };
  
  const canCreateProjects = () => can('can_create_projects');
  const canEditProjects = () => can('can_edit_projects');
  const canDeleteProjects = () => can('can_delete_projects');
  const canManageUsers = () => can('can_manage_users');
  const canViewAnalytics = () => can('can_view_analytics');
  
  return {
    permissions,
    can,
    canCreateProjects,
    canEditProjects,
    canDeleteProjects,
    canManageUsers,
    canViewAnalytics
  };
};
```

### 2. Permission-Based Component
```jsx
import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

const ProjectActions = ({ project }) => {
  const { canEditProjects, canDeleteProjects } = usePermissions();

  return (
    <div className="project-actions">
      {canEditProjects() && (
        <button onClick={() => editProject(project.id)}>
          Edit Project
        </button>
      )}
      {canDeleteProjects() && (
        <button 
          onClick={() => deleteProject(project.id)}
          className="danger"
        >
          Delete Project
        </button>
      )}
    </div>
  );
};
```

## 📱 **Responsive Design**

### 1. Mobile-First Approach
```css
/* Mobile styles */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    order: 2;
  }
  
  .main-content {
    order: 1;
  }
  
  .task-columns {
    flex-direction: column;
  }
  
  .column {
    margin-bottom: 1rem;
  }
}
```

### 2. Tablet and Desktop Enhancements
```css
/* Tablet styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }
  
  .task-columns {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop styles */
@media (min-width: 1025px) {
  .sidebar {
    width: 250px;
  }
  
  .task-columns {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🚀 **Deployment Considerations**

### 1. Environment Configuration
```javascript
// config/environment.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    WS_URL: 'ws://localhost:5000'
  },
  production: {
    API_BASE_URL: 'https://api.yourdomain.com/api',
    WS_URL: 'wss://api.yourdomain.com'
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### 2. Build Configuration
```json
// package.json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.8.0"
  }
}
```

## 🧪 **Testing Implementation**

### 1. Unit Tests
```javascript
// tests/services/authService.test.js
import { authService } from '../services/authService';

describe('AuthService', () => {
  test('should login with valid credentials', async () => {
    const credentials = {
      email: 'admin@system.local',
      password: 'admin123'
    };
    
    const result = await authService.login(credentials);
    
    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
  });
});
```

### 2. Integration Tests
```javascript
// tests/components/Login.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../components/Login';

describe('Login Component', () => {
  test('should handle login form submission', () => {
    const mockOnLogin = jest.fn();
    render(<Login onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'admin@system.local' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'admin123' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    expect(mockOnLogin).toHaveBeenCalled();
  });
});
```

## 📚 **Additional Resources**

### 1. State Management Libraries
- **Redux Toolkit** - For complex state management
- **Zustand** - Lightweight state management
- **Context API** - Built-in React state management

### 2. UI Component Libraries
- **Material-UI** - Google's Material Design
- **Ant Design** - Enterprise-class UI design
- **Chakra UI** - Modular and accessible
- **Tailwind CSS** - Utility-first CSS framework

### 3. Form Handling
- **React Hook Form** - Performant forms
- **Formik** - Form library for React
- **Yup** - Schema validation

### 4. HTTP Client Libraries
- **Axios** - Promise-based HTTP client
- **Fetch API** - Native browser API
- **SWR** - Data fetching with caching

## 🎯 **Best Practices**

### 1. Code Organization
- Use feature-based folder structure
- Separate concerns (components, services, hooks)
- Implement proper error boundaries
- Use TypeScript for type safety

### 2. Performance Optimization
- Implement lazy loading for routes
- Use React.memo for expensive components
- Optimize bundle size with code splitting
- Implement proper caching strategies

### 3. Security Considerations
- Never store sensitive data in localStorage
- Implement proper token refresh logic
- Use HTTPS in production
- Validate all user inputs

### 4. Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

---

**This guide provides a comprehensive foundation for implementing the Project Tracker frontend. Adapt the code examples to your chosen framework and follow the established patterns for consistency.**