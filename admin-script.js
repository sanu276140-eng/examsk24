// DOM Elements
const loginPage = document.getElementById('login-page');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginAlert = document.getElementById('login-alert');
const logoutBtn = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        showAdminDashboard(user);
        loadDashboardData();
    } else {
        // No user is signed in
        showLoginPage();
    }
});

// Login Form Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loginAlert.style.display = 'none';
    
    // Simple validation
    if (!email || !password) {
        showAlert('Please enter both email and password', 'danger');
        return;
    }
    
    // Firebase authentication
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Check if user is admin
            const user = userCredential.user;
            checkAdminRole(user.uid);
        })
        .catch((error) => {
            console.error('Login error:', error);
            showAlert(error.message, 'danger');
        });
});

// Logout Function
logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            showLoginPage();
            showAlert('Logged out successfully', 'success');
        })
        .catch((error) => {
            console.error('Logout error:', error);
            showAlert('Error logging out', 'danger');
        });
});

// Check if user has admin role
function checkAdminRole(userId) {
    db.collection('admins').doc(userId).get()
        .then((doc) => {
            if (doc.exists && doc.data().role === 'admin') {
                // User is admin
                const user = auth.currentUser;
                showAdminDashboard(user);
                loadDashboardData();
            } else {
                // User is not admin
                auth.signOut();
                showAlert('Access denied. Admin privileges required.', 'danger');
            }
        })
        .catch((error) => {
            console.error('Error checking admin role:', error);
            showAlert('Error verifying admin access', 'danger');
        });
}

// Show/Hide Pages
function showAdminDashboard(user) {
    loginPage.style.display = 'none';
    adminDashboard.style.display = 'flex';
    
    // Update user info
    userName.textContent = user.displayName || 'Admin User';
    userEmail.textContent = user.email;
    userAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A';
}

function showLoginPage() {
    loginPage.style.display = 'flex';
    adminDashboard.style.display = 'none';
    loginForm.reset();
}

// Show Alert Function
function showAlert(message, type) {
    loginAlert.textContent = message;
    loginAlert.className = `alert alert-${type}`;
    loginAlert.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        loginAlert.style.display = 'none';
    }, 5000);
}

// Load Dashboard Data
function loadDashboardData() {
    // Load total users
    db.collection('users').get().then((snapshot) => {
        document.getElementById('total-users').textContent = snapshot.size;
    });
    
    // Load active tests
    db.collection('exams').where('status', '==', 'active').get().then((snapshot) => {
        document.getElementById('active-tests').textContent = snapshot.size;
    });
    
    // Load total questions
    db.collection('questions').get().then((snapshot) => {
        document.getElementById('total-questions').textContent = snapshot.size;
    });
    
    // Load today's visitors (simulated)
    const todayVisitors = Math.floor(Math.random() * 1000) + 500;
    document.getElementById('today-visitors').textContent = todayVisitors.toLocaleString();
    
    // Load recent activity
    loadRecentActivity();
    
    // Load users table
    loadUsersTable();
    
    // Load exams table
    loadExamsTable();
    
    // Load exam dropdowns
    loadExamDropdowns();
    
    // Load questions table
    loadQuestionsTable();
}

// Recent Activity
function loadRecentActivity() {
    const activities = [
        { time: '10:30 AM', user: 'John Doe', activity: 'Completed SSC CGL Mock Test', details: 'Score: 85%' },
        { time: '09:45 AM', user: 'Jane Smith', activity: 'Registered for CCC Course', details: 'Paid: ₹500' },
        { time: 'Yesterday', user: 'Admin', activity: 'Added new questions', details: '50 questions added' },
        { time: '2 days ago', user: 'Robert Johnson', activity: 'Downloaded study material', details: 'GK PDF' },
        { time: '3 days ago', user: 'Admin', activity: 'Created new exam', details: 'Banking PO Mock Test' }
    ];
    
    const tbody = document.getElementById('recent-activity');
    tbody.innerHTML = '';
    
    activities.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.time}</td>
            <td>${activity.user}</td>
            <td>${activity.activity}</td>
            <td>${activity.details}</td>
        `;
        tbody.appendChild(row);
    });
}

// Users Management
function loadUsersTable() {
    db.collection('users').get().then((snapshot) => {
        const tbody = document.getElementById('users-table');
        tbody.innerHTML = '';
        
        snapshot.forEach((doc, index) => {
            const user = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.name || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${user.role || 'user'}</td>
                <td><span class="status status-active">Active</span></td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editUser('${doc.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${doc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

// Exams Management
function loadExamsTable() {
    db.collection('exams').get().then((snapshot) => {
        const tbody = document.getElementById('exams-table');
        tbody.innerHTML = '';
        
        snapshot.forEach((doc, index) => {
            const exam = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${exam.name}</td>
                <td>${exam.category}</td>
                <td>${exam.totalQuestions || 0}</td>
                <td>${exam.duration || 60} mins</td>
                <td><span class="status status-active">Active</span></td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editExam('${doc.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteExam('${doc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

// Load Exam Dropdowns
function loadExamDropdowns() {
    const examSelect = document.getElementById('exam-select');
    const questionExam = document.getElementById('question-exam');
    
    db.collection('exams').get().then((snapshot) => {
        examSelect.innerHTML = '<option value="">All Exams</option>';
        questionExam.innerHTML = '<option value="">Select Exam</option>';
        
        snapshot.forEach((doc) => {
            const exam = doc.data();
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            
            option1.value = doc.id;
            option1.textContent = exam.name;
            
            option2.value = doc.id;
            option2.textContent = exam.name;
            
            examSelect.appendChild(option1);
            questionExam.appendChild(option2);
        });
    });
}

// Questions Management
function loadQuestionsTable() {
    db.collection('questions').get().then((snapshot) => {
        const tbody = document.getElementById('questions-table');
        tbody.innerHTML = '';
        
        snapshot.forEach((doc, index) => {
            const question = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${question.text.substring(0, 50)}...</td>
                <td>${question.examName || 'N/A'}</td>
                <td>${question.category || 'General'}</td>
                <td><span class="status ${question.difficulty === 'easy' ? 'status-active' : question.difficulty === 'medium' ? 'status-inactive' : ''}">
                    ${question.difficulty || 'medium'}
                </span></td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editQuestion('${doc.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteQuestion('${doc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

// Filter Questions
function filterQuestions() {
    const examId = document.getElementById('exam-select').value;
    const category = document.getElementById('category-select').value;
    
    let query = db.collection('questions');
    
    if (examId) {
        query = query.where('examId', '==', examId);
    }
    
    if (category) {
        query = query.where('category', '==', category);
    }
    
    query.get().then((snapshot) => {
        const tbody = document.getElementById('questions-table');
        tbody.innerHTML = '';
        
        snapshot.forEach((doc, index) => {
            const question = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${question.text.substring(0, 50)}...</td>
                <td>${question.examName || 'N/A'}</td>
                <td>${question.category || 'General'}</td>
                <td><span class="status ${question.difficulty === 'easy' ? 'status-active' : question.difficulty === 'medium' ? 'status-inactive' : ''}">
                    ${question.difficulty || 'medium'}
                </span></td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

// Modal Functions
function openAddUserModal() {
    document.getElementById('add-user-modal').classList.add('active');
}

function openAddExamModal() {
    document.getElementById('add-exam-modal').classList.add('active');
}

function openAddQuestionModal() {
    document.getElementById('add-question-modal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Form Submissions
document.getElementById('add-user-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('new-user-name').value,
        email: document.getElementById('new-user-email').value,
        role: document.getElementById('new-user-role').value,
        createdAt: new Date().toISOString()
    };
    
    // Create user in Firebase Auth
    auth.createUserWithEmailAndPassword(userData.email, document.getElementById('new-user-password').value)
        .then((userCredential) => {
            const userId = userCredential.user.uid;
            
            // Add to users collection
            return db.collection('users').doc(userId).set(userData);
        })
        .then(() => {
            // Add to admins collection if role is admin
            if (userData.role === 'admin') {
                return db.collection('admins').doc(userCredential.user.uid).set({
                    role: 'admin',
                    email: userData.email
                });
            }
        })
        .then(() => {
            showAlert('User created successfully!', 'success');
            closeModal('add-user-modal');
            document.getElementById('add-user-form').reset();
            loadUsersTable();
        })
        .catch((error) => {
            console.error('Error creating user:', error);
            showAlert('Error creating user: ' + error.message, 'danger');
        });
});

document.getElementById('add-exam-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const examData = {
        name: document.getElementById('new-exam-name').value,
        category: document.getElementById('new-exam-category').value,
        description: document.getElementById('new-exam-description').value,
        duration: parseInt(document.getElementById('new-exam-duration').value),
        totalQuestions: parseInt(document.getElementById('new-exam-questions').value),
        passingPercentage: parseInt(document.getElementById('new-exam-passing').value),
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.uid
    };
    
    db.collection('exams').add(examData)
        .then(() => {
            showAlert('Exam created successfully!', 'success');
            closeModal('add-exam-modal');
            document.getElementById('add-exam-form').reset();
            loadExamsTable();
            loadExamDropdowns();
        })
        .catch((error) => {
            console.error('Error creating exam:', error);
            showAlert('Error creating exam: ' + error.message, 'danger');
        });
});

document.getElementById('add-question-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const questionData = {
        examId: document.getElementById('question-exam').value,
        text: document.getElementById('question-text').value,
        options: {
            a: document.getElementById('option-a').value,
            b: document.getElementById('option-b').value,
            c: document.getElementById('option-c').value,
            d: document.getElementById('option-d').value
        },
        correctAnswer: document.getElementById('correct-answer').value,
        difficulty: document.getElementById('question-difficulty').value,
        explanation: document.getElementById('question-explanation').value,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.uid
    };
    
    // Get exam name for display
    const examId = questionData.examId;
    db.collection('exams').doc(examId).get()
        .then((doc) => {
            if (doc.exists) {
                questionData.examName = doc.data().name;
            }
            
            return db.collection('questions').add(questionData);
        })
        .then(() => {
            showAlert('Question added successfully!', 'success');
            closeModal('add-question-modal');
            document.getElementById('add-question-form').reset();
            loadQuestionsTable();
        })
        .catch((error) => {
            console.error('Error adding question:', error);
            showAlert('Error adding question: ' + error.message, 'danger');
        });
});

// Tab Navigation
document.querySelectorAll('.menu-item').forEach(item => {
    if (item.dataset.tab) {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            item.classList.add('active');
            document.getElementById(item.dataset.tab).classList.add('active');
            
            // Load tab data if needed
            if (item.dataset.tab === 'users') {
                loadUsersTable();
            } else if (item.dataset.tab === 'exams') {
                loadExamsTable();
            } else if (item.dataset.tab === 'questions') {
                loadQuestionsTable();
            }
        });
    }
});

// Exam Tab Navigation
document.querySelectorAll('[data-exam-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('[data-exam-tab]').forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Filter exams by category
        const category = tab.dataset.examTab;
        filterExamsByCategory(category);
    });
});

function filterExamsByCategory(category) {
    let query = db.collection('exams');
    
    if (category !== 'all') {
        query = query.where('category', '==', category);
    }
    
    query.get().then((snapshot) => {
        const tbody = document.getElementById('exams-table');
        tbody.innerHTML = '';
        
        snapshot.forEach((doc, index) => {
            const exam = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${exam.name}</td>
                <td>${exam.category}</td>
                <td>${exam.totalQuestions || 0}</td>
                <td>${exam.duration || 60} mins</td>
                <td><span class="status status-active">Active</span></td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

// Sidebar Toggle for Mobile
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 992 && 
        !e.target.closest('.sidebar') && 
        !e.target.closest('.menu-toggle') && 
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add sample data if collections are empty
    initializeSampleData();
});

// Initialize Sample Data
function initializeSampleData() {
    // Check if collections exist and add sample data
    const collections = ['exams', 'questions', 'users'];
    
    collections.forEach(collection => {
        db.collection(collection).get().then((snapshot) => {
            if (snapshot.empty && collection === 'exams') {
                // Add sample exams
                const sampleExams = [
                    {
                        name: 'SSC CGL Tier 1',
                        category: 'ssc',
                        description: 'Combined Graduate Level Preliminary Exam',
                        duration: 60,
                        totalQuestions: 100,
                        passingPercentage: 50,
                        status: 'active',
                        createdAt: new Date().toISOString()
                    },
                    {
                        name: 'CCC NIELIT',
                        category: 'ccc',
                        description: 'Course on Computer Concepts',
                        duration: 60,
                        totalQuestions: 100,
                        passingPercentage: 40,
                        status: 'active',
                        createdAt: new Date().toISOString()
                    },
                    {
                        name: 'IBPS PO Prelims',
                        category: 'banking',
                        description: 'Probationary Officer Preliminary Exam',
                        duration: 60,
                        totalQuestions: 100,
                        passingPercentage: 60,
                        status: 'active',
                        createdAt: new Date().toISOString()
                    }
                ];
                
                sampleExams.forEach(exam => {
                    db.collection('exams').add(exam);
                });
            }
        });
    });
}