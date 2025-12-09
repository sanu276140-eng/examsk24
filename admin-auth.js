// DOM Elements
// Admin authentication
const adminEmails = [
  "admin@examsk24.online",
  "superadmin@examsk24.online"
];

// Check if user is admin
function checkAdminAuth() {
  auth.onAuthStateChanged(user => {
    if (user && adminEmails.includes(user.email)) {
      showAdminPanel();
    } else {
      showLoginForm();
    }
  });
}

// Admin login
function adminLogin(email, password) {
  return auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      if (adminEmails.includes(userCredential.user.email)) {
        return userCredential.user;
      } else {
        throw new Error("Not an admin user");
      }
    });
}

// Logout
function adminLogout() {
  return auth.signOut();
}