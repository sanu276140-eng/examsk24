// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const userEmail = document.getElementById('userEmail');
const contentSections = document.querySelectorAll('.content-section');
const sidebarLinks = document.querySelectorAll('.sidebar-menu a');

// Firebase Collections
const questionsRef = db.collection('questions');
const testsRef = db.collection('tests');
const usersRef = db.collection('users');
const attemptsRef = db.collection('attempts');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    initEventListeners();
});

function initEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', toggleSidebar);
    
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Add question button
    document.getElementById('addQuestionBtn').addEventListener('click', () => {
        showQuestionModal();
    });
    
    // Question form
    document.getElementById('questionForm').addEventListener('submit', saveQuestion);
}

// Authentication handlers
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    adminLogin(email, password)
        .then(user => {
            console.log('Admin logged in:', user.email);
        })
        .catch(error => {
            document.getElementById('loginError').textContent = error.message;
        });
}

function handleLogout() {
    adminLogout()
        .then(() => {
            console.log('Admin logged out');
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
}

// Navigation
function toggleSidebar() {
    sidebar.classList.toggle('active');
}

function showSection(sectionId) {
    // Hide all sections
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all links
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Set active link
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    // Load section data
    loadSectionData(sectionId);
}

// Firebase Operations
async function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            await loadDashboardStats();
            await loadRecentActivity();
            break;
        case 'questions':
            await loadQuestions();
            break;
        case 'tests':
            await loadTests();
            break;
    }
}

async function loadDashboardStats() {
    try {
        // Get total questions
        const questionsSnapshot = await questionsRef.get();
        document.getElementById('totalQuestions').textContent = questionsSnapshot.size;
        
        // Get total tests
        const testsSnapshot = await testsRef.get();
        document.getElementById('totalTests').textContent = testsSnapshot.size;
        
        // Get total users
        const usersSnapshot = await usersRef.get();
        document.getElementById('totalUsers').textContent = usersSnapshot.size;
        
        // Get today's attempts
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAttempts = await attemptsRef
            .where('timestamp', '>=', today)
            .get();
        document.getElementById('todayAttempts').textContent = todayAttempts.size;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadRecentActivity() {
    try {
        const activityList = document.getElementById('recentActivity');
        activityList.innerHTML = '';
        
        // Get recent attempts
        const recentAttempts = await attemptsRef
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        
        recentAttempts.forEach(doc => {
            const attempt = doc.data();
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="activity-content">
                    <h4>Test Attempted</h4>
                    <p>${attempt.userEmail} completed ${attempt.testName}</p>
                    <span class="activity-time">${formatTime(attempt.timestamp)}</span>
                </div>
            `;
            activityList.appendChild(item);
        });
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

async function loadQuestions() {
    try {
        const questionsList = document.getElementById('questionsList');
        questionsList.innerHTML = '<div class="loading">Loading questions...</div>';
        
        const snapshot = await questionsRef.orderBy('createdAt', 'desc').get();
        
        questionsList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const question = doc.data();
            const item = document.createElement('div');
            item.className = 'question-item';
            item.innerHTML = `
                <div class="question-content">
                    <h4>${question.question}</h4>
                    <div class="question-meta">
                        <span>Category: ${question.category}</span>
                        <span>Type: ${question.type || 'MCQ'}</span>
                    </div>
                </div>
                <div class="question-actions">
                    <button class="btn-edit" data-id="${doc.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" data-id="${doc.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            questionsList.appendChild(item);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editQuestion(btn.dataset.id));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteQuestion(btn.dataset.id));
        });
        
    } catch (error) {
        console.error('Error loading questions:', error);
        questionsList.innerHTML = '<div class="error">Error loading questions</div>';
    }
}

// Question Management
function showQuestionModal(questionId = null) {
    const modal = document.getElementById('questionModal');
    const form = document.getElementById('questionForm');
    
    if (questionId) {
        // Edit mode
        form.querySelector('h3').textContent = 'Edit Question';
        loadQuestionData(questionId);
    } else {
        // Add mode
        form.querySelector('h3').textContent = 'Add Question';
        form.reset();
        document.getElementById('questionId').value = '';
    }
    
    modal.style.display = 'flex';
}

async function loadQuestionData(questionId) {
    try {
        const doc = await questionsRef.doc(questionId).get();
        if (doc.exists) {
            const question = doc.data();
            document.getElementById('questionId').value = questionId;
            document.getElementById('questionCategory').value = question.category;
            document.getElementById('questionText').value = question.question;
            document.getElementById('optionA').value = question.options?.A || '';
            document.getElementById('optionB').value = question.options?.B || '';
            document.getElementById('optionC').value = question.options?.C || '';
            document.getElementById('optionD').value = question.options?.D || '';
            document.getElementById('correctAnswer').value = question.answer;
            document.getElementById('explanation').value = question.explanation || '';
        }
    } catch (error) {
        console.error('Error loading question:', error);
    }
}

async function saveQuestion(e) {
    e.preventDefault();
    
    const questionId = document.getElementById('questionId').value;
    const questionData = {
        category: document.getElementById('questionCategory').value,
        question: document.getElementById('questionText').value,
        options: {
            A: document.getElementById('optionA').value,
            B: document.getElementById('optionB').value,
            C: document.getElementById('optionC').value,
            D: document.getElementById('optionD').value
        },
        answer: document.getElementById('correctAnswer').value,
        explanation: document.getElementById('explanation').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (questionId) {
            // Update existing question
            await questionsRef.doc(questionId).update(questionData);
        } else {
            // Add new question
            questionData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await questionsRef.add(questionData);
        }
        
        // Close modal and refresh list
        document.getElementById('questionModal').style.display = 'none';
        loadQuestions();
        
    } catch (error) {
        console.error('Error saving question:', error);
        alert('Error saving question: ' + error.message);
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
        await questionsRef.doc(questionId).delete();
        loadQuestions();
    } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question: ' + error.message);
    }
}

// Utility Functions
function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
}

// Admin Panel Show/Hide
function showLoginForm() {
    loginScreen.style.display = 'flex';
    adminPanel.style.display = 'none';
}

function showAdminPanel() {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    userEmail.textContent = auth.currentUser?.email;
    showSection('dashboard');
}