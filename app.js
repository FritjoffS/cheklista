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
let userNotifications = [];

// PWA Installation variables
let deferredPrompt = null;
const installAppBtn = document.getElementById('installAppBtn');

// DOM elements
const authContainer = document.getElementById('authContainer');
const appContent = document.getElementById('appContent');
const userProfile = document.getElementById('userProfile'); // May not exist
const userName = document.getElementById('userName'); // May not exist  
const userAvatar = document.getElementById('userAvatar'); // May not exist
const menuUserProfile = document.getElementById('menuUserProfile');
const menuUserName = document.getElementById('menuUserName');
const menuUserEmail = document.getElementById('menuUserEmail');
const menuUserAvatar = document.getElementById('menuUserAvatar');
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
    setupPWAInstallation();
    handleURLParameters();
});

// Authentication
function setupFirebaseAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            showApp();
            loadUserChecklists();
            loadNotifications();
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
    if (userProfile) userProfile.style.display = 'none';
    if (menuUserProfile) menuUserProfile.style.display = 'none';
    loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

function showApp() {
    authContainer.style.display = 'none';
    appContent.style.display = 'block';
    if (userProfile) userProfile.style.display = 'none'; // Keep old profile hidden
    if (menuUserProfile) menuUserProfile.style.display = 'flex'; // Show new profile in menu
    const notificationBell = document.getElementById('notificationBell');
    if (notificationBell) notificationBell.style.display = 'block';
    loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    
    // Update user info in menu
    const email = currentUser.email;
    const username = email.split('@')[0];
    const firstLetter = email[0].toUpperCase();
    
    // Update old elements (if they exist - for compatibility)
    if (userName) userName.textContent = username;
    if (userAvatar) userAvatar.textContent = firstLetter;
    
    // Update new menu elements
    if (menuUserName) menuUserName.textContent = username;
    if (menuUserEmail) menuUserEmail.textContent = email;
    if (menuUserAvatar) menuUserAvatar.textContent = firstLetter;
    
    showChecklistsView();
}

// Event Listeners
function setupEventListeners() {
    // Authentication
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('loginBtn').addEventListener('click', () => showAuth());
    if (logoutBtn) document.getElementById('logoutBtn').addEventListener('click', handleLogout);

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

    // Notifications
    document.getElementById('notificationsBtn').addEventListener('click', showNotificationsModal);
    document.getElementById('closeNotificationsModal').addEventListener('click', hideNotificationsModal);
    document.getElementById('markAllRead').addEventListener('click', markAllNotificationsRead);
    document.getElementById('clearAllNotifications').addEventListener('click', clearAllNotifications);

    // Hamburger menu - with null checks
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const slideMenuOverlay = document.getElementById('slideMenuOverlay');
    const menuHome = document.getElementById('menuHome');
    const menuTheme = document.getElementById('menuTheme');
    const menuThemeDropdown = document.getElementById('menuThemeDropdown');
    const menuLogout = document.getElementById('menuLogout');

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSlideMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSlideMenu);
    if (slideMenuOverlay) slideMenuOverlay.addEventListener('click', closeSlideMenu);
    if (menuHome) menuHome.addEventListener('click', () => {
        closeSlideMenu();
        showChecklistsView();
    });
    if (menuTheme) menuTheme.addEventListener('click', toggleMenuThemeDropdown);
    if (menuThemeDropdown) menuThemeDropdown.addEventListener('click', handleMenuThemeSelect);
    if (menuLogout) menuLogout.addEventListener('click', () => {
        closeSlideMenu();
        handleLogout();
    });

    // PWA Installation
    if (installAppBtn) installAppBtn.addEventListener('click', handleInstallApp);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Close slide menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSlideMenu();
        }
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

// Theme management
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cheklista-theme', theme);
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

    // Listen to shared checklists for real-time updates
    const sharedRef = ref(database, 'shared');
    onValue(sharedRef, (snapshot) => {
        loadSharedChecklists(); // Reload when sharing info changes
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
            
            // Check all shared checklists to see if current user has access or is owner
            for (const checklistId of Object.keys(shared)) {
                const sharedChecklist = shared[checklistId];
                
                // Check if user is the owner of this shared checklist
                if (sharedChecklist.owner === currentUser.uid) {
                    // This is a checklist the current user has shared with others
                    if (userChecklists[checklistId]) {
                        const sharedWithEmails = Object.keys(sharedChecklist.sharedWith || {})
                            .map(key => sharedChecklist.sharedWith[key].email);
                        
                        userChecklists[checklistId].isOwnerShared = true;
                        userChecklists[checklistId].sharedWithUsers = sharedWithEmails;
                    }
                }
                // Check if user has access to this shared checklist (existing functionality)
                else if (sharedChecklist.sharedWith && sharedChecklist.sharedWith[userEmailKey]) {
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
    card.className = `checklist-card ${checklist.isShared ? 'shared' : ''} ${checklist.isOwnerShared ? 'owner-shared' : ''}`;
    card.addEventListener('click', () => openChecklist(checklistId));

    const items = checklist.items || {};
    const itemsArray = Object.keys(items);
    const completedItems = itemsArray.filter(id => items[id].completed).length;
    const totalItems = itemsArray.length;

    // Different sharing info based on type
    let sharedInfo = '';
    let tooltipData = '';
    
    if (checklist.isShared) {
        // This is a list shared with the current user
        sharedInfo = `<small style="color: var(--secondary-color); font-weight: 500;">📤 Delad av ${checklist.ownerEmail}</small>`;
    } else if (checklist.isOwnerShared && checklist.sharedWithUsers && checklist.sharedWithUsers.length > 0) {
        // This is a list the current user has shared with others
        const sharedWithText = checklist.sharedWithUsers.length === 1 
            ? checklist.sharedWithUsers[0]
            : `${checklist.sharedWithUsers[0]} +${checklist.sharedWithUsers.length - 1} till`;
        sharedInfo = `<small style="color: var(--primary-color); font-weight: 500; cursor: help;" title="Delad med: ${checklist.sharedWithUsers.join(', ')}">👥 Delad med ${sharedWithText}</small>`;
    }

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
    
    // Update sharing info in detail view
    const detailSharingInfo = document.getElementById('detailSharingInfo');
    if (checklist.isShared) {
        detailSharingInfo.innerHTML = `<small style="color: var(--secondary-color);">📤 Delad av ${checklist.ownerEmail}</small>`;
        detailSharingInfo.style.display = 'block';
    } else if (checklist.isOwnerShared && checklist.sharedWithUsers && checklist.sharedWithUsers.length > 0) {
        const usersList = checklist.sharedWithUsers.join(', ');
        detailSharingInfo.innerHTML = `<small style="color: var(--primary-color);">👥 Delad med: ${usersList}</small>`;
        detailSharingInfo.style.display = 'block';
    } else {
        detailSharingInfo.style.display = 'none';
    }
    
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

// Hamburger menu functions
function toggleSlideMenu() {
    const menu = document.getElementById('slideMenu');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    
    if (!menu || !hamburgerBtn) return;
    
    if (menu.classList.contains('active')) {
        closeSlideMenu();
    } else {
        menu.classList.add('active');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }
}

function closeSlideMenu() {
    const menu = document.getElementById('slideMenu');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    
    if (!menu || !hamburgerBtn) return;
    
    menu.classList.remove('active');
    hamburgerBtn.classList.remove('active');
    document.body.style.overflow = ''; // Restore body scroll
}

// Menu theme functions
function toggleMenuThemeDropdown() {
    const themeSelector = document.querySelector('.menu-theme-selector');
    if (themeSelector) {
        themeSelector.classList.toggle('active');
    }
}

function handleMenuThemeSelect(e) {
    const themeOption = e.target.closest('.theme-option');
    if (themeOption) {
        const theme = themeOption.dataset.theme;
        if (theme) {
            setTheme(theme);
            // Close the dropdown
            const themeSelector = document.querySelector('.menu-theme-selector');
            if (themeSelector) {
                themeSelector.classList.remove('active');
            }
        }
    }
}

// Notifications functions
function showNotificationsModal() {
    loadNotifications();
    document.getElementById('notificationsModal').classList.add('active');
}

function hideNotificationsModal() {
    document.getElementById('notificationsModal').classList.remove('active');
}

async function loadNotifications() {
    if (!currentUser) return;

    try {
        const notificationsRef = ref(database, `users/${currentUser.uid}/notifications`);
        const snapshot = await get(notificationsRef);
        
        if (snapshot.exists()) {
            const notifications = snapshot.val();
            userNotifications = Object.keys(notifications).map(key => ({
                id: key,
                ...notifications[key]
            })).sort((a, b) => b.timestamp - a.timestamp);
        } else {
            userNotifications = [];
        }
        
        renderNotifications();
        updateNotificationBadge();
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotification('Fel vid laddning av meddelanden', 'error');
    }
}

function renderNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    const noNotifications = document.getElementById('noNotifications');
    
    if (userNotifications.length === 0) {
        notificationsList.style.display = 'none';
        noNotifications.style.display = 'block';
        return;
    }
    
    notificationsList.style.display = 'block';
    noNotifications.style.display = 'none';
    
    notificationsList.innerHTML = userNotifications.map(notification => `
        <div class="notification-item ${!notification.read ? 'unread' : ''}" data-id="${notification.id}">
            <div class="notification-header">
                <h4 class="notification-title">${notification.title}</h4>
                <span class="notification-time">${formatNotificationTime(notification.timestamp)}</span>
            </div>
            <p class="notification-message">${notification.message}</p>
        </div>
    `).join('');
    
    // Add click listeners to notifications
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => markNotificationAsRead(item.dataset.id));
    });
}

function formatNotificationTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Nu';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
}

async function markNotificationAsRead(notificationId) {
    if (!currentUser) return;
    
    try {
        const notificationRef = ref(database, `users/${currentUser.uid}/notifications/${notificationId}/read`);
        await set(notificationRef, true);
        
        // Update local state
        const notification = userNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            renderNotifications();
            updateNotificationBadge();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function markAllNotificationsRead() {
    if (!currentUser || userNotifications.length === 0) return;
    
    try {
        const updates = {};
        userNotifications.forEach(notification => {
            if (!notification.read) {
                updates[`users/${currentUser.uid}/notifications/${notification.id}/read`] = true;
                notification.read = true;
            }
        });
        
        if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
            renderNotifications();
            updateNotificationBadge();
            showNotification('Alla meddelanden markerade som lästa', 'success');
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showNotification('Fel vid markering av meddelanden', 'error');
    }
}

async function clearAllNotifications() {
    if (!currentUser || userNotifications.length === 0) return;
    
    if (!confirm('Är du säker på att du vill radera alla meddelanden?')) return;
    
    try {
        const notificationsRef = ref(database, `users/${currentUser.uid}/notifications`);
        await set(notificationsRef, null);
        
        userNotifications = [];
        renderNotifications();
        updateNotificationBadge();
        showNotification('Alla meddelanden raderade', 'success');
    } catch (error) {
        console.error('Error clearing notifications:', error);
        showNotification('Fel vid radering av meddelanden', 'error');
    }
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationCount');
    const unreadCount = userNotifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

async function addNotification(title, message, type = 'info') {
    if (!currentUser) return;
    
    const notification = {
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false
    };
    
    try {
        const notificationsRef = ref(database, `users/${currentUser.uid}/notifications`);
        await push(notificationsRef, notification);
        
        // Update local state if user is currently viewing
        userNotifications.unshift({
            id: 'temp-' + Date.now(),
            ...notification
        });
        
        updateNotificationBadge();
    } catch (error) {
        console.error('Error adding notification:', error);
    }
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
        showNotification('Checklista borttagen!', 'success');
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
        
        // Check if shared entry exists, if not create it, otherwise update it
        const sharedRef = ref(database, `shared/${currentChecklistId}`);
        const existingSnapshot = await get(sharedRef);
        
        if (existingSnapshot.exists()) {
            // Update existing shared entry with new user
            const existingData = existingSnapshot.val();
            await update(sharedRef, {
                [`sharedWith/${emailKey}`]: {
                    email: email,
                    sharedAt: serverTimestamp(),
                    permissions: 'edit'
                }
            });
        } else {
            // Create new shared checklist entry
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
        }
        
        if (notify) {
            // Send notification (simplified)
            await sendShareNotification(email, checklist.title);
        }
        
        hideShareModal();
        showNotification(`Checklist delad med ${email}!`, 'success');
        
        // Reload shared checklists to update sharing info
        loadSharedChecklists();
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
    console.log('Message received:', payload);
    
    const title = payload.notification?.title || 'Nytt meddelande';
    const body = payload.notification?.body || 'Du har fått ett nytt meddelande';
    
    // Add to notification history
    addNotification(title, body, 'message');
    
    // Show in-app notification
    showNotification(title + ': ' + body, 'info');
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/favicon.ico'
        });
    }
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

// Handle URL parameters for PWA shortcuts
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'create') {
        // Wait for auth to complete before trying to show create modal
        const checkAuth = () => {
            if (currentUser) {
                showCreateModal();
            } else {
                setTimeout(checkAuth, 100);
            }
        };
        checkAuth();
    }
}

// PWA Installation functionality
function setupPWAInstallation() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        
        // Store the event for later use
        deferredPrompt = e;
        
        // Show the install button
        if (installAppBtn) {
            installAppBtn.style.display = 'block';
        }
    });

    // Listen for the app installed event
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        
        // Hide the install button
        if (installAppBtn) {
            installAppBtn.style.display = 'none';
        }
        
        // Show success notification
        showNotification('Appen har installerats! Du kan nu öppna den från hemskärmen.', 'success');
        
        // Clear the deferredPrompt
        deferredPrompt = null;
    });

    // Check if app is already installed (iOS/Android)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        // App is already installed, hide install button
        if (installAppBtn) {
            installAppBtn.style.display = 'none';
        }
    }
}

async function handleInstallApp() {
    if (!deferredPrompt) {
        // Check if running in standalone mode (already installed)
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            showNotification('Appen är redan installerad!', 'info');
            return;
        }
        
        // Show manual installation instructions
        showInstallInstructions();
        return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        showNotification('Appen installeras...', 'success');
    } else {
        console.log('User dismissed the install prompt');
        showNotification('Installation avbruten', 'info');
    }
    
    // Clear the deferredPrompt since it can only be used once
    deferredPrompt = null;
    
    // Hide the install button
    if (installAppBtn) {
        installAppBtn.style.display = 'none';
    }
}

function showInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
        instructions = `
            <div style="text-align: left;">
                <h3>Installera på iOS:</h3>
                <ol>
                    <li>Tryck på dela-knappen <span style="font-size: 1.2em;">⬆️</span> längst ner</li>
                    <li>Scrolla ner och välj "Lägg till på hemskärmen"</li>
                    <li>Tryck på "Lägg till"</li>
                </ol>
            </div>
        `;
    } else if (isAndroid) {
        instructions = `
            <div style="text-align: left;">
                <h3>Installera på Android:</h3>
                <ol>
                    <li>Tryck på meny-knappen ⋮ i webbläsaren</li>
                    <li>Välj "Lägg till på startskärmen" eller "Installera app"</li>
                    <li>Tryck på "Lägg till" eller "Installera"</li>
                </ol>
            </div>
        `;
    } else {
        instructions = `
            <div style="text-align: left;">
                <h3>Installera på dator:</h3>
                <p>I Chrome, Edge eller liknande webbläsare:</p>
                <ol>
                    <li>Leta efter installera-ikonen i adressfältet</li>
                    <li>Eller gå till menyn och välj "Installera Cheklista"</li>
                    <li>Följ instruktionerna för att installera</li>
                </ol>
            </div>
        `;
    }
    
    // Create and show instruction modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>Installera Cheklista</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                ${instructions}
                <p style="margin-top: 1.5rem; color: var(--text-secondary);">
                    Efter installation kan du använda appen utan internetanslutning och få snabbare åtkomst från hemskärmen.
                </p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Stäng</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close menu after showing instructions
    closeSlideMenu();
}