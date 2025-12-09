rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read public data
    match /questions/{question} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.email in [
          "admin@examsk24.online",
          "superadmin@examsk24.online"
        ];
    }
    
    match /tests/{test} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.email in [
          "admin@examsk24.online",
          "superadmin@examsk24.online"
        ];
    }
    
    match /users/{user} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in [
          "admin@examsk24.online",
          "superadmin@examsk24.online"
        ];
    }
    
    match /attempts/{attempt} {
      allow read: if request.auth != null && 
        request.auth.token.email in [
          "admin@examsk24.online",
          "superadmin@examsk24.online"
        ];
      allow create: if request.auth != null;
    }
    
    // Admin-only collections
    match /admin/{document} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in [
          "admin@examsk24.online",
          "superadmin@examsk24.online"
        ];
    }
  }
}
