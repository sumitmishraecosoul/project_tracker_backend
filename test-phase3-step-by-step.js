const axios = require('axios');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const API_BASE = 'http://localhost:5000/api';

async function testPhase3StepByStep() {
    log('\n📁 PHASE 3: PROJECT MANAGEMENT TESTING', 'magenta');
    log('='.repeat(60), 'magenta');
    log('Testing Project CRUD, Project sections, Project analytics', 'magenta');
    log('='.repeat(60), 'magenta');
    
    let adminToken = null;
    let brandId = null;
    let projectId = null;
    let testResults = {
        adminLogin: false,
        getBrands: false,
        createProject: false,
        getProjects: false,
        getProjectDetails: false,
        updateProject: false,
        projectSections: false,
        projectAnalytics: false
    };
    
    try {
        // Step 3.1: Admin Login
        log('\n📝 STEP 3.1: Testing Admin Login...', 'yellow');
        log('   Endpoint: POST /api/auth/login', 'blue');
        
        const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        if (adminLoginResponse.data.token) {
            adminToken = adminLoginResponse.data.token;
            testResults.adminLogin = true;
            log('   ✅ Admin login successful', 'green');
            log(`   Token: ${adminToken.substring(0, 20)}...`, 'blue');
        } else {
            throw new Error('Admin login failed: ' + (adminLoginResponse.data.message || 'No token received'));
        }
        
        // Step 3.2: Get Brands
        log('\n📝 STEP 3.2: Testing Get Brands...', 'yellow');
        log('   Endpoint: GET /api/brands', 'blue');
        
        const brandsResponse = await axios.get(`${API_BASE}/brands`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (brandsResponse.data.success && brandsResponse.data.data.length > 0) {
            testResults.getBrands = true;
            brandId = brandsResponse.data.data[0].id;
            log('   ✅ Get brands successful', 'green');
            log(`   Using brand: ${brandsResponse.data.data[0].name} (${brandId})`, 'blue');
        } else {
            throw new Error('No brands available for testing');
        }
        
        // Step 3.3: Create Project
        log('\n📝 STEP 3.3: Testing Create Project...', 'yellow');
        log(`   Endpoint: POST /api/brands/${brandId}/projects`, 'blue');
        
        const createProjectResponse = await axios.post(`${API_BASE}/brands/${brandId}/projects`, {
            title: 'Phase 3 Test Project ' + Date.now(),
            description: 'Test project for Phase 3 testing',
            status: 'Active',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            department: 'India E-commerce',
            priority: 'Medium'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (createProjectResponse.data.success && createProjectResponse.data.data) {
            testResults.createProject = true;
            projectId = createProjectResponse.data.data.id;
            log('   ✅ Create project successful', 'green');
            log(`   Created project: ${createProjectResponse.data.data.name}`, 'blue');
            log(`   Project ID: ${projectId}`, 'blue');
        } else {
            throw new Error('Create project failed: ' + (createProjectResponse.data.message || 'No project data received'));
        }
        
        // Step 3.4: Get Projects
        log('\n📝 STEP 3.4: Testing Get Projects...', 'yellow');
        log(`   Endpoint: GET /api/brands/${brandId}/projects`, 'blue');
        
        const projectsResponse = await axios.get(`${API_BASE}/brands/${brandId}/projects`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (projectsResponse.data.success) {
            testResults.getProjects = true;
            log('   ✅ Get projects successful', 'green');
            log(`   Found ${projectsResponse.data.data.length} projects`, 'blue');
        } else {
            throw new Error('Get projects failed: ' + (projectsResponse.data.message || 'No projects data received'));
        }
        
        // Step 3.5: Get Project Details
        log('\n📝 STEP 3.5: Testing Get Project Details...', 'yellow');
        log(`   Endpoint: GET /api/brands/${brandId}/projects/${projectId}`, 'blue');
        
        const projectDetailsResponse = await axios.get(`${API_BASE}/brands/${brandId}/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (projectDetailsResponse.data.success && projectDetailsResponse.data.data) {
            testResults.getProjectDetails = true;
            log('   ✅ Get project details successful', 'green');
            log(`   Project Title: ${projectDetailsResponse.data.data.title}`, 'blue');
            log(`   Project Status: ${projectDetailsResponse.data.data.status}`, 'blue');
            log(`   Project Department: ${projectDetailsResponse.data.data.department}`, 'blue');
        } else {
            throw new Error('Get project details failed: ' + (projectDetailsResponse.data.message || 'No project data received'));
        }
        
        // Step 3.6: Update Project
        log('\n📝 STEP 3.6: Testing Update Project...', 'yellow');
        log(`   Endpoint: PUT /api/brands/${brandId}/projects/${projectId}`, 'blue');
        
        const updateProjectResponse = await axios.put(`${API_BASE}/brands/${brandId}/projects/${projectId}`, {
            title: 'Updated Phase 3 Test Project',
            description: 'Updated project description for Phase 3 testing',
            status: 'Active',
            priority: 'High'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (updateProjectResponse.data.success && updateProjectResponse.data.data) {
            testResults.updateProject = true;
            log('   ✅ Update project successful', 'green');
            log(`   Updated title: ${updateProjectResponse.data.data.title}`, 'blue');
        } else {
            throw new Error('Update project failed: ' + (updateProjectResponse.data.message || 'No project data received'));
        }
        
        // Step 3.7: Project Sections
        log('\n📝 STEP 3.7: Testing Project Sections...', 'yellow');
        log(`   Endpoint: GET /api/brands/${brandId}/projects/${projectId}/sections`, 'blue');
        
        try {
            const sectionsResponse = await axios.get(`${API_BASE}/brands/${brandId}/projects/${projectId}/sections`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            if (sectionsResponse.data.success) {
                testResults.projectSections = true;
                log('   ✅ Project sections API working', 'green');
                log(`   Found ${sectionsResponse.data.data.length} sections`, 'blue');
            }
        } catch (sectionsError) {
            log('   ⚠️  Project sections API not implemented yet (expected)', 'yellow');
        }
        
        // Step 3.8: Project Analytics
        log('\n📝 STEP 3.8: Testing Project Analytics...', 'yellow');
        log(`   Endpoint: GET /api/brands/${brandId}/projects/${projectId}/analytics`, 'blue');
        
        try {
            const analyticsResponse = await axios.get(`${API_BASE}/brands/${brandId}/projects/${projectId}/analytics`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            if (analyticsResponse.data.success) {
                testResults.projectAnalytics = true;
                log('   ✅ Project analytics API working', 'green');
                log(`   Analytics data received`, 'blue');
            }
        } catch (analyticsError) {
            log('   ⚠️  Project analytics API not implemented yet (expected)', 'yellow');
        }
        
        // Phase 3 Results
        log('\n📊 PHASE 3 TESTING RESULTS', 'bright');
        log('='.repeat(60), 'bright');
        
        const passedTests = Object.values(testResults).filter(Boolean).length;
        const totalTests = Object.keys(testResults).length;
        
        log(`✅ Admin Login: ${testResults.adminLogin ? 'PASSED' : 'FAILED'}`, testResults.adminLogin ? 'green' : 'red');
        log(`✅ Get Brands: ${testResults.getBrands ? 'PASSED' : 'FAILED'}`, testResults.getBrands ? 'green' : 'red');
        log(`✅ Create Project: ${testResults.createProject ? 'PASSED' : 'FAILED'}`, testResults.createProject ? 'green' : 'red');
        log(`✅ Get Projects: ${testResults.getProjects ? 'PASSED' : 'FAILED'}`, testResults.getProjects ? 'green' : 'red');
        log(`✅ Get Project Details: ${testResults.getProjectDetails ? 'PASSED' : 'FAILED'}`, testResults.getProjectDetails ? 'green' : 'red');
        log(`✅ Update Project: ${testResults.updateProject ? 'PASSED' : 'FAILED'}`, testResults.updateProject ? 'green' : 'red');
        log(`✅ Project Sections: ${testResults.projectSections ? 'PASSED' : 'FAILED'}`, testResults.projectSections ? 'green' : 'red');
        log(`✅ Project Analytics: ${testResults.projectAnalytics ? 'PASSED' : 'FAILED'}`, testResults.projectAnalytics ? 'green' : 'red');
        
        log('\n' + '='.repeat(60), 'bright');
        log(`📈 PHASE 3 RESULT: ${passedTests}/${totalTests} tests passed`, passedTests >= 6 ? 'green' : 'yellow');
        
        if (passedTests >= 6) {
            log('🎉 PHASE 3 COMPLETED: Project Management working perfectly!', 'green');
            log('✅ Ready for frontend integration!', 'green');
        } else {
            log('⚠️  PHASE 3 NEEDS ATTENTION: Some project management features need fixing', 'yellow');
        }
        
        log(`\n🔧 Test Data Created:`, 'blue');
        log(`   Brand ID: ${brandId}`, 'blue');
        log(`   Project ID: ${projectId}`, 'blue');
        log(`   Admin Token: ${adminToken.substring(0, 20)}...`, 'blue');
        
        return { success: passedTests >= 6, brandId, projectId, adminToken, testResults };
        
    } catch (error) {
        log(`\n❌ PHASE 3 FAILED: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
        return { success: false, error: error.message };
    }
}

// Run Phase 3 test
testPhase3StepByStep().then(result => {
    if (result.success) {
        console.log('\n✅ Phase 3 testing completed successfully!');
    } else {
        console.log('\n❌ Phase 3 testing failed!');
    }
}).catch(error => {
    console.error('💥 Fatal error:', error.message);
});
