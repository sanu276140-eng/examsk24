// ============================================
// ADMIN PANEL JAVASCRIPT - ExamsK24
// ============================================

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
        // User is signed in - check if admin
        checkAdminRole(user.uid);
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
    
    // Validation
    if (!email || !password) {
        showAlert('Please enter both email and password', 'danger');
        return;
    }
    
    // Show loading
    showAlert('Logging in...', 'success');
    
    // Firebase authentication
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            checkAdminRole(user.uid);
        })
        .catch((error) => {
            console.error('Login error:', error);
            showAlert('Login failed: ' + error.message, 'danger');
        });
});

// Check if user has admin role
function checkAdminRole(userId) {
    db.collection('admins').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
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
    userName.textContent = user.displayName || user.email.split('@')[0];
    userEmail.textContent = user.email;
    userAvatar.textContent = userName.textContent.charAt(0).toUpperCase();
    
    showAlert('Login successful!', 'success');
    setTimeout(() => {
        loginAlert.style.display = 'none';
    }, 2000);
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
}

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

// Load Dashboard Data
function loadDashboardData() {
    console.log("Loading dashboard data...");
    
    // Simulate data for demo
    document.getElementById('total-users').textContent = "1,250";
    document.getElementById('active-tests').textContent = "24";
    document.getElementById('total-questions').textContent = "5,430";
    document.getElementById('today-visitors').textContent = "342";
    
    // Load recent activity
    loadRecentActivity();
    
    // Note: Real data would come from Firestore
    // Uncomment when Firestore is set up:
    /*
    db.collection('users').get().then((snapshot) => {
        document.getElementById('total-users').textContent = snapshot.size;
    });
    */
}

// Recent Activity
function loadRecentActivity() {
    const activities = [
        { time: '10:30 AM', user: 'John Doe', activity: 'Completed SSC CGL Mock Test', details: 'Score: 85%' },
        { time: '09:45 AM', user: 'Jane Smith', activity: 'Registered for CCC Course', details: 'Course: CCC NIELIT' },
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
        });
    }
});

// Sidebar Toggle for Mobile
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Initialize dummy data for forms
document.addEventListener('DOMContentLoaded', () => {
    // Add sample exams to dropdown
    const examSelect = document.getElementById('exam-select');
    const questionExam = document.getElementById('question-exam');
    
    const sampleExams = [
        { id: '1', name: 'SSC CGL Tier 1' },
        { id: '2', name: 'CCC NIELIT' },
        { id: '3', name: 'IBPS PO Prelims' },
        { id: '4', name: 'SSC CHSL' },
        { id: '5', name: 'UPSC Prelims' }
    ];
    
    sampleExams.forEach(exam => {
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        
        option1.value = exam.id;
        option1.textContent = exam.name;
        
        option2.value = exam.id;
        option2.textContent = exam.name;
        
        if (examSelect) examSelect.appendChild(option1);
        if (questionExam) questionExam.appendChild(option2);
    });
    
    console.log("Admin panel initialized");
});