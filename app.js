// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    push, 
    remove, 
    update, 
    onValue, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { 
    getMessaging, 
    getToken, 
    onMessage 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSW8Dw1EK2aj7tFQ7TvFTtHxKL8vPP48E",
    authDomain: "checklista-61c12.firebaseapp.com",
    databaseURL: "https://checklista-61c12-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "checklista-61c12",
    storageBucket: "checklista-61c12.firebasestorage.app",
    messagingSenderId: "963417616606",
    appId: "1:963417616606:web:464768c471264003bf524f",
    measurementId: "G-QE1P6FY7RQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const messaging = getMessaging(app);

// Global variables
let currentUser = null;
let currentChecklistId = null;
let userChecklists = {};

// DOM elements
const authContainer = document.getElementById('authContainer');
const appContent = document.getElementById('appContent');
const userProfile = document.getElementById('userProfile');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const checklistsGrid = document.getElementById('checklistsGrid');
const emptyState = document.getElementById('emptyState');
const checklistsView = document.getElementById('checklistsView');
const checklistDetail = document.getElementById('checklistDetail');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupEventListeners();
    setupFirebaseAuth();
    requestNotificationPermission();
});

// Authentication
function setupFirebaseAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            showApp();
            loadUserChecklists();
            setupRealtimeListeners();
        } else {
            currentUser = null;
            showAuth();
        }
    });
}

function showAuth() {
    authContainer.style.display = 'block';
    appContent.style.display = 'none';
    userProfile.style.display = 'none';
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
}

function showApp() {
    authContainer.style.display = 'none';
    appContent.style.display = 'block';
    userProfile.style.display = 'flex';
    document.getElementById('notificationBell').style.display = 'block';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    
    // Update user info
    userName.textContent = currentUser.email.split('@')[0];
    userAvatar.textContent = currentUser.email[0].toUpperCase();
    
    showChecklistsView();
}

// Event Listeners
function setupEventListeners() {
    // Authentication
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('loginBtn').addEventListener('click', () => showAuth());
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Theme
    document.getElementById('themeBtn').addEventListener('click', toggleThemeDropdown);
    document.getElementById('themeDropdown').addEventListener('click', handleThemeSelect);

    // Checklists
    document.getElementById('createChecklistBtn').addEventListener('click', showCreateModal);
    document.getElementById('closeCreateModal').addEventListener('click', hideCreateModal);
    document.getElementById('createChecklistForm').addEventListener('submit', handleCreateChecklist);

    // Checklist detail
    document.getElementById('backBtn').addEventListener('click', showChecklistsView);
    document.getElementById('addItemBtn').addEventListener('click', addNewItem);
    document.getElementById('newItemInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewItem();
    });
    document.getElementById('shareBtn').addEventListener('click', showShareModal);
    document.getElementById('deleteChecklistBtn').addEventListener('click', deleteCurrentChecklist);

    // Share modal
    document.getElementById('closeShareModal').addEventListener('click', hideShareModal);
    document.getElementById('shareForm').addEventListener('submit', handleShare);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Authentication handlers
async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showNotification('Vänligen fyll i både e-post och lösenord', 'error');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Vänligen ange en giltig e-postadress', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Lösenordet måste vara minst 6 tecken', 'error');
        return;
    }

    try {
        // Try to sign in first
        await signInWithEmailAndPassword(auth, email, password);
        showNotification('Inloggning lyckades!', 'success');
    } catch (error) {
        console.log('Sign in error:', error.code, error.message);
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                // Create new user if not found
                await createUserWithEmailAndPassword(auth, email, password);
                showNotification('Konto skapat! Välkommen!', 'success');
            } catch (createError) {
                console.log('Create user error:', createError.code, createError.message);
                let errorMessage = 'Fel vid registrering';
                
                switch(createError.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'E-postadressen används redan';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Lösenordet är för svagt';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Ogiltig e-postadress';
                        break;
                    default:
                        errorMessage = `Fel vid registrering: ${createError.message}`;
                }
                showNotification(errorMessage, 'error');
            }
        } else {
            let errorMessage = 'Fel vid inloggning';
            
            switch(error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Fel e-post eller lösenord';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'För många inloggningsförsök. Försök igen senare.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Kontot har inaktiverats';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Nätverksfel. Kontrollera din internetanslutning.';
                    break;
                default:
                    errorMessage = `Fel vid inloggning: ${error.message}`;
            }
            showNotification(errorMessage, 'error');
        }
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        showNotification('Du har loggats ut', 'success');
    } catch (error) {
        showNotification('Fel vid utloggning: ' + error.message, 'error');
    }
}

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('cheklista-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleThemeDropdown() {
    const dropdown = document.getElementById('themeDropdown');
    dropdown.classList.toggle('active');
}

function handleThemeSelect(e) {
    const themeOption = e.target.closest('.theme-option');
    if (themeOption) {
        const theme = themeOption.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('cheklista-theme', theme);
        document.getElementById('themeDropdown').classList.remove('active');
    }
}

// Checklists management
async function loadUserChecklists() {
    const checklistsRef = ref(database, `users/${currentUser.uid}/checklists`);
    
    try {
        const snapshot = await get(checklistsRef);
        if (snapshot.exists()) {
            userChecklists = snapshot.val();
            renderChecklists();
        } else {
            userChecklists = {};
            renderChecklists();
        }
    } catch (error) {
        showNotification('Fel vid laddning av checklistor: ' + error.message, 'error');
    }
}

function setupRealtimeListeners() {
    // Listen to user's own checklists
    const checklistsRef = ref(database, `users/${currentUser.uid}/checklists`);
    onValue(checklistsRef, (snapshot) => {
        if (snapshot.exists()) {
            userChecklists = snapshot.val();
        } else {
            userChecklists = {};
        }
        loadSharedChecklists(); // Load shared checklists after own checklists
    });

    // Listen to notifications for current user
    setupNotificationListener();
}

async function loadSharedChecklists() {
    try {
        const sharedRef = ref(database, 'shared');
        const snapshot = await get(sharedRef);
        
        if (snapshot.exists()) {
            const shared = snapshot.val();
            const userEmailKey = emailToFirebaseKey(currentUser.email);
            
            // Check all shared checklists to see if current user has access
            for (const checklistId of Object.keys(shared)) {
                const sharedChecklist = shared[checklistId];
                if (sharedChecklist.sharedWith && sharedChecklist.sharedWith[userEmailKey]) {
                    // Load the actual checklist data from the owner
                    const ownerChecklistRef = ref(database, `users/${sharedChecklist.owner}/checklists/${checklistId}`);
                    const ownerSnapshot = await get(ownerChecklistRef);
                    
                    if (ownerSnapshot.exists()) {
                        const ownerChecklistData = ownerSnapshot.val();
                        
                        // Add shared checklist to user's view (mark as shared)
                        userChecklists[checklistId] = {
                            ...ownerChecklistData,
                            title: ownerChecklistData.title + ' (Delad)',
                            description: `Delad av ${sharedChecklist.ownerEmail}`,
                            isShared: true,
                            originalOwner: sharedChecklist.owner,
                            ownerEmail: sharedChecklist.ownerEmail
                        };
                        
                        // Set up real-time listener for shared checklist items
                        onValue(ownerChecklistRef, (ownerSnapshot) => {
                            if (ownerSnapshot.exists()) {
                                const updatedData = ownerSnapshot.val();
                                userChecklists[checklistId] = {
                                    ...updatedData,
                                    title: updatedData.title + ' (Delad)',
                                    description: `Delad av ${sharedChecklist.ownerEmail}`,
                                    isShared: true,
                                    originalOwner: sharedChecklist.owner,
                                    ownerEmail: sharedChecklist.ownerEmail
                                };
                                renderChecklists();
                                
                                // Update detail view if this checklist is currently open
                                if (currentChecklistId === checklistId) {
                                    renderChecklistItems();
                                }
                            }
                        });
                    }
                }
            }
        }
        
        renderChecklists();
    } catch (error) {
        console.error('Error loading shared checklists:', error);
    }
}

function setupNotificationListener() {
    const userEmailKey = emailToFirebaseKey(currentUser.email);
    const notificationsRef = ref(database, 'notifications');
    
    onValue(notificationsRef, (snapshot) => {
        if (snapshot.exists()) {
            const notifications = snapshot.val();
            
            // Check for unread notifications for current user
            Object.keys(notifications).forEach(notificationId => {
                const notification = notifications[notificationId];
                if (notification.toEmailKey === userEmailKey && !notification.read) {
                    // Show notification
                    showNotification(
                        `${notification.fromEmail} delade "${notification.checklistTitle}" med dig!`,
                        'info'
                    );
                    
                    // Mark as read
                    const notificationRef = ref(database, `notifications/${notificationId}`);
                    update(notificationRef, { read: true });
                    
                    // Reload shared checklists to show the new one
                    loadSharedChecklists();
                }
            });
        }
    });
}

function renderChecklists() {
    const grid = checklistsGrid;
    grid.innerHTML = '';

    const checklistIds = Object.keys(userChecklists);
    
    if (checklistIds.length === 0) {
        emptyState.style.display = 'block';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    checklistIds.forEach(checklistId => {
        const checklist = userChecklists[checklistId];
        const card = createChecklistCard(checklistId, checklist);
        grid.appendChild(card);
    });
}

function createChecklistCard(checklistId, checklist) {
    const card = document.createElement('div');
    card.className = `checklist-card ${checklist.isShared ? 'shared' : ''}`;
    card.addEventListener('click', () => openChecklist(checklistId));

    const items = checklist.items || {};
    const itemsArray = Object.keys(items);
    const completedItems = itemsArray.filter(id => items[id].completed).length;
    const totalItems = itemsArray.length;

    const sharedInfo = checklist.isShared ? 
        `<small style="color: var(--secondary-color); font-weight: 500;">📤 Delad av ${checklist.ownerEmail}</small>` : '';

    card.innerHTML = `
        <div class="checklist-header">
            <div>
                <h3 class="checklist-title">${checklist.title}</h3>
                ${checklist.description ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">${checklist.description}</p>` : ''}
                ${sharedInfo}
            </div>
        </div>
        <div class="checklist-stats">
            <span>${completedItems}/${totalItems} slutförda</span>
            <span>•</span>
            <span>${formatDate(checklist.createdAt)}</span>
        </div>
        <div class="checklist-preview">
            ${itemsArray.slice(0, 3).map(id => `
                <div class="preview-item">
                    <div class="checkbox ${items[id].completed ? 'checked' : ''}"></div>
                    <span>${items[id].text}</span>
                </div>
            `).join('')}
            ${totalItems > 3 ? `<div class="preview-item" style="color: var(--text-secondary); font-style: italic;">+${totalItems - 3} fler objekt</div>` : ''}
        </div>
    `;

    return card;
}

// Checklist detail view
function openChecklist(checklistId) {
    currentChecklistId = checklistId;
    const checklist = userChecklists[checklistId];
    
    document.getElementById('detailTitle').textContent = checklist.title;
    
    checklistsView.style.display = 'none';
    checklistDetail.classList.add('active');
    
    renderChecklistItems();
    setupChecklistRealtimeListener();
}

function showChecklistsView() {
    checklistsView.style.display = 'block';
    checklistDetail.classList.remove('active');
    currentChecklistId = null;
}

function setupChecklistRealtimeListener() {
    if (!currentChecklistId) return;
    
    const checklistRef = ref(database, `users/${currentUser.uid}/checklists/${currentChecklistId}`);
    onValue(checklistRef, (snapshot) => {
        if (snapshot.exists()) {
            const checklist = snapshot.val();
            userChecklists[currentChecklistId] = checklist;
            renderChecklistItems();
        }
    });
}

function renderChecklistItems() {
    if (!currentChecklistId) return;
    
    const checklist = userChecklists[currentChecklistId];
    const items = checklist.items || {};
    const itemsList = document.getElementById('itemsList');
    
    itemsList.innerHTML = '';
    
    const itemIds = Object.keys(items);
    if (itemIds.length === 0) {
        itemsList.innerHTML = '<div class="empty-state"><p>Inga objekt i denna checklist än.</p></div>';
        return;
    }

    itemIds.forEach(itemId => {
        const item = items[itemId];
        const itemElement = createItemElement(itemId, item);
        itemsList.appendChild(itemElement);
    });
}

function createItemElement(itemId, item) {
    const itemElement = document.createElement('div');
    itemElement.className = `item ${item.completed ? 'completed' : ''}`;
    
    itemElement.innerHTML = `
        <div class="item-checkbox ${item.completed ? 'checked' : ''}" onclick="toggleItem('${itemId}')"></div>
        <div class="item-text">${item.text}</div>
        <div class="item-actions">
            <button class="btn btn-small" onclick="deleteItem('${itemId}')" style="background: var(--danger-color); color: white;">🗑️</button>
        </div>
    `;
    
    return itemElement;
}

// Item management
async function addNewItem() {
    const input = document.getElementById('newItemInput');
    const text = input.value.trim();
    
    if (!text || !currentChecklistId) return;
    
    try {
        const checklist = userChecklists[currentChecklistId];
        let ownerId = currentUser.uid;
        
        // If this is a shared checklist, use the original owner's ID
        if (checklist.isShared) {
            ownerId = checklist.originalOwner;
        }
        
        const itemsRef = ref(database, `users/${ownerId}/checklists/${currentChecklistId}/items`);
        const newItemRef = push(itemsRef);
        
        await set(newItemRef, {
            text: text,
            completed: false,
            createdAt: serverTimestamp(),
            addedBy: currentUser.email
        });
        
        input.value = '';
        showNotification('Objekt tillagt!', 'success');
    } catch (error) {
        showNotification('Fel vid tillägg av objekt: ' + error.message, 'error');
    }
}

window.toggleItem = async function(itemId) {
    if (!currentChecklistId) return;
    
    try {
        const checklist = userChecklists[currentChecklistId];
        const item = checklist.items[itemId];
        let ownerId = currentUser.uid;
        
        // If this is a shared checklist, use the original owner's ID
        if (checklist.isShared) {
            ownerId = checklist.originalOwner;
        }
        
        const itemRef = ref(database, `users/${ownerId}/checklists/${currentChecklistId}/items/${itemId}`);
        
        await update(itemRef, {
            completed: !item.completed,
            lastModifiedBy: currentUser.email,
            lastModified: serverTimestamp()
        });
    } catch (error) {
        showNotification('Fel vid uppdatering: ' + error.message, 'error');
    }
};

window.deleteItem = async function(itemId) {
    if (!currentChecklistId || !confirm('Är du säker på att du vill ta bort detta objekt?')) return;
    
    try {
        const checklist = userChecklists[currentChecklistId];
        let ownerId = currentUser.uid;
        
        // If this is a shared checklist, use the original owner's ID
        if (checklist.isShared) {
            ownerId = checklist.originalOwner;
        }
        
        const itemRef = ref(database, `users/${ownerId}/checklists/${currentChecklistId}/items/${itemId}`);
        await remove(itemRef);
        showNotification('Objekt borttaget!', 'success');
    } catch (error) {
        showNotification('Fel vid borttagning: ' + error.message, 'error');
    }
};

// Modal management
function showCreateModal() {
    document.getElementById('createChecklistModal').classList.add('active');
}

function hideCreateModal() {
    document.getElementById('createChecklistModal').classList.remove('active');
    document.getElementById('createChecklistForm').reset();
}

function showShareModal() {
    if (!currentChecklistId) return;
    document.getElementById('shareModal').classList.add('active');
}

function hideShareModal() {
    document.getElementById('shareModal').classList.remove('active');
    document.getElementById('shareForm').reset();
}

// Checklist CRUD operations
async function handleCreateChecklist(e) {
    e.preventDefault();
    
    const title = document.getElementById('checklistTitle').value.trim();
    const description = document.getElementById('checklistDescription').value.trim();
    
    if (!title) return;
    
    try {
        const checklistsRef = ref(database, `users/${currentUser.uid}/checklists`);
        const newChecklistRef = push(checklistsRef);
        
        await set(newChecklistRef, {
            title: title,
            description: description,
            createdAt: serverTimestamp(),
            items: {}
        });
        
        hideCreateModal();
        showNotification('Checklist skapad!', 'success');
    } catch (error) {
        showNotification('Fel vid skapande: ' + error.message, 'error');
    }
}

async function deleteCurrentChecklist() {
    if (!currentChecklistId || !confirm('Är du säker på att du vill ta bort hela checklistan?')) return;
    
    try {
        const checklistRef = ref(database, `users/${currentUser.uid}/checklists/${currentChecklistId}`);
        await remove(checklistRef);
        
        showChecklistsView();
        showNotification('Checklist borttagen!', 'success');
    } catch (error) {
        showNotification('Fel vid borttagning: ' + error.message, 'error');
    }
}

// Sharing functionality
async function handleShare(e) {
    e.preventDefault();
    
    const email = document.getElementById('shareEmail').value.trim();
    const notify = document.getElementById('shareNotify').checked;
    
    if (!email || !currentChecklistId) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Vänligen ange en giltig e-postadress', 'error');
        return;
    }
    
    try {
        const checklist = userChecklists[currentChecklistId];
        const emailKey = emailToFirebaseKey(email);
        
        // Create shared checklist entry
        const sharedRef = ref(database, `shared/${currentChecklistId}`);
        await set(sharedRef, {
            owner: currentUser.uid,
            ownerEmail: currentUser.email,
            title: checklist.title,
            sharedWith: {
                [emailKey]: {
                    email: email,
                    sharedAt: serverTimestamp(),
                    permissions: 'edit'
                }
            }
        });
        
        if (notify) {
            // Send notification (simplified)
            await sendShareNotification(email, checklist.title);
        }
        
        hideShareModal();
        showNotification(`Checklist delad med ${email}!`, 'success');
    } catch (error) {
        console.error('Sharing error:', error);
        showNotification('Fel vid delning: ' + error.message, 'error');
    }
}

async function sendShareNotification(email, checklistTitle) {
    try {
        // In a real app, you'd use Firebase Cloud Functions to send emails/push notifications
        // For now, we'll just create a notification entry in the database
        const notificationsRef = ref(database, 'notifications');
        const newNotificationRef = push(notificationsRef);
        const emailKey = emailToFirebaseKey(email);
        
        await set(newNotificationRef, {
            type: 'checklist_shared',
            toEmail: email,
            toEmailKey: emailKey,
            fromEmail: currentUser.email,
            checklistTitle: checklistTitle,
            checklistId: currentChecklistId,
            createdAt: serverTimestamp(),
            read: false
        });
        
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Push notifications
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            // Note: VAPID key setup would be needed for production
            // For now, we'll skip FCM token generation to avoid errors
            
            const token = await getToken(messaging, {
                vapidKey: 'BCFIgzsleVVCPv7DjArlwRxTdTW1fJ3X6uWrxHwRhf6iSvTC2K2VQZoKm8QOQAbRWR-mzsVVbHuXKUqi75VAHB4' // You'll need to generate this in Firebase Console
            });
            
            if (token && currentUser) {
                // Save token to database for this user
                const tokenRef = ref(database, `users/${currentUser.uid}/fcmToken`);
                await set(tokenRef, token);
            }
            
        }
    } catch (error) {
        console.log('Error requesting notification permission:', error);
        // Don't show error to user for notification permissions
    }
}

// Handle incoming messages
onMessage(messaging, (payload) => {
    showNotification(payload.notification.title + ': ' + payload.notification.body, 'info');
});

// Utility functions
function formatDate(timestamp) {
    if (!timestamp) return 'Okänt datum';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Idag';
    if (diffDays === 2) return 'Igår';
    if (diffDays <= 7) return `${diffDays} dagar sedan`;
    
    return date.toLocaleDateString('sv-SE');
}

function emailToFirebaseKey(email) {
    // Convert email to Firebase-safe key by replacing invalid characters
    return email.replace(/[.#$[\]]/g, '_').replace('@', '_at_');
}

function firebaseKeyToEmail(key) {
    // Convert Firebase key back to email
    return key.replace('_at_', '@').replace(/_/g, '.');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Service Worker Registration with update handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Show update notification
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
            
        // Listen for controller changes (new SW taking over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Reload the page to get the latest content
            window.location.reload();
        });
    });
}

// Show update notification
function showUpdateNotification() {
    // Create update notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-600);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 300px;
        font-size: 14px;
    `;
    
    notification.innerHTML = `
        <div style="margin-bottom: 0.5rem; font-weight: 600;">Uppdatering tillgänglig!</div>
        <div style="margin-bottom: 1rem; opacity: 0.9;">En ny version av appen är tillgänglig.</div>
        <button onclick="window.location.reload()" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 0.5rem;
        ">Uppdatera nu</button>
        <button onclick="this.parentElement.remove()" style="
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
        ">Senare</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}