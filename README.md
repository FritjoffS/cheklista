# Cheklista - Smart Checklist App

A modern, responsive web app for creating and sharing checklists with real-time updates via Firebase.

## Features

### ✅ Core Features
- **Create checklists**: Shopping lists, TODO lists, etc.
- **Manage items**: Add, mark as complete, remove items
- **Real-time updates**: See changes instantly via Firebase Realtime Database
- **Responsive design**: Works perfectly on mobile and tablet

### 🎨 User Experience
- **4 different themes**: Light, dark, nature, and sunset
- **Modern design**: Clean, user-friendly interface
- **PWA support**: Install as an app on your phone
- **Offline functionality**: Works without internet connection

### 👥 Sharing and Collaboration
- **Share checklists**: Send to other users via email
- **Real-time collaboration**: Multiple people can edit the same list simultaneously
- **Push notifications**: Get notified when others make changes
- **Visible shared lists**: Shared checklists appear automatically for recipients
- **Clear marking**: Shared lists are marked with special design and owner info
- **Real-time updates**: Changes sync instantly between all users

### 🔐 Security
- **Firebase Authentication**: Secure login with email/password
- **User-specific data**: Each user sees only their own lists
- **Sharing permissions**: Control who can edit

## Technical Specification

### Frontend
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern CSS features, CSS Grid, Flexbox
- **Vanilla JavaScript**: ES6+ modules, async/await
- **PWA**: Service Worker, Web App Manifest

### Backend (Firebase)
- **Realtime Database**: Fast real-time updates
- **Authentication**: Secure user management
- **Cloud Messaging**: Push notifications
- **Analytics**: Usage statistics

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Tablet-adapted**: Efficiently uses larger screens
- **Touch-friendly**: Large clickable areas

## Installation and Usage

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for initial setup
- Configured Firebase project

### Quick Start
1. Open `index.html` in a web browser
2. Register an account or log in
3. Create your first checklist
4. Start adding items!

### PWA Installation
1. Open the app in Chrome/Edge on your phone
2. Tap "Add to Home Screen"
3. The app installs as a native app

## Firebase Configuration

The app is already configured with the following Firebase project:
```javascript
const firebaseConfig = {
  apiKey: "---------------------------------------",
  authDomain: "checklista-61c12.firebaseapp.com",
  databaseURL: "https://checklista-61c12-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "checklista-61c12",
  storageBucket: "checklista-61c12.firebasestorage.app",
  messagingSenderId: "963417616606",
  appId: "1:963417616606:web:464768c471264003bf524f",
  measurementId: "G-QE1P6FY7RQ"
};
```

## Data Structure

### Users
```json
{
  "users": {
    "userId": {
      "email": "user@example.com",
      "fcmToken": "notification-token",
      "checklists": {
        "checklistId": {
          "title": "My shopping list",
          "description": "Shopping for the weekend",
          "createdAt": "timestamp",
          "items": {
            "itemId": {
              "text": "Milk",
              "completed": false,
              "createdAt": "timestamp"
            }
          }
        }
      }
    }
  }
}
```

### Shared Checklists
```json
{
  "shared": {
    "checklistId": {
      "owner": "userId",
      "ownerEmail": "owner@example.com",
      "title": "Shared list",
      "sharedWith": {
        "user_at_example_com": {
          "email": "user@example.com",
          "permissions": "edit",
          "sharedAt": "timestamp"
        }
      }
    }
  }
}
```

**Note!** Email addresses are converted to Firebase-safe keys by replacing:
- `@` with `_at_`
- `.` with `_`
- Other invalid characters (`#`, `$`, `[`, `]`) with `_`

## Usage

### Create a Checklist
1. Click "Create new checklist"
2. Enter title and description
3. Click "Create checklist"

### Add Items
1. Open a checklist
2. Type in the "Add new item" field
3. Press Enter or click "Add"

### Share a Checklist
1. Open the checklist you want to share
2. Click the "Share" button
3. Enter the email address of the person
4. Choose if they should get a notification
5. Click "Share checklist"

### Change Theme
1. Click the 🎨 icon in the header
2. Select desired theme from dropdown menu
3. Theme is saved automatically

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Samsung Internet 14+

## Security

- All data encrypted in transit (HTTPS)
- Firebase security rules protect user data
- No sensitive data stored locally
- Regular security updates

## Development

### Suggested Improvements
- [ ] Offline synchronization
- [ ] Attachments and images
- [ ] Checklist categorization
- [ ] Export to PDF/Excel
- [ ] Reminders and deadlines
- [ ] Voice input
- [ ] Recurring checklists

### Contributing
Suggestions and improvements are welcome! Feel free to create issues or pull requests.

## License

This project is open source and available under the MIT License.

## Support

For support and questions, contact the developer or create an issue on GitHub.

---

**Cheklista** - Your smart companion for keeping track of everything! 📋✨