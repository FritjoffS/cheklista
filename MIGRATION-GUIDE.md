# 🔄 Firebase Migration Guide

## Ny Firebase-konfiguration implementerad!

Din Cheklista-app har nu flyttats till det nya Firebase-kontot med följande konfiguration:

### ✅ Vad som uppdaterats:
- **index.html** - Ny Firebase-konfiguration
- **firebase-messaging-sw.js** - Uppdaterad service worker  
- **README.md** - Ny projektinformation
- **FIREBASE_SETUP.md** - Uppdaterad setup-guide
- **SNABB-SETUP.md** - Ny projektinformation

### 🆕 Ny Firebase-konfiguration:
```javascript
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
```

### 🔧 Vad du behöver göra nu:

1. **Gå till det nya Firebase-projektet:**
   - https://console.firebase.google.com/
   - Välj projekt: **checklista-61c12**

2. **Aktivera Authentication:**
   - Klicka "Authentication" → "Get started" 
   - Klicka "Sign-in method"
   - Aktivera "Email/Password" (första alternativet)
   - Klicka "Save"

3. **Uppdatera Database Rules:**
   - Klicka "Realtime Database" → "Rules"
   - Ersätt med reglerna från `database.rules.json` eller `SNABB-SETUP.md`
   - Klicka "Publish"

4. **För Push Notifications (valfritt):**
   - Klicka "Cloud Messaging" → "Web configuration"
   - Generera VAPID-nycklar om du vill ha push-notiser

### ⚠️ Viktigt:
- **All gammal data** från det gamla kontot finns inte längre
- **Nya användare** måste registrera sig igen
- **Delningsfunktioner** fungerar bara mellan användare på samma Firebase-projekt

### 🎉 Fördelar:
- ✅ Fullständig kontroll över Firebase-projektet
- ✅ Inga konflikter med tidigare inställningar  
- ✅ Kan konfigurera push-notiser efter dina behov
- ✅ Alla funktioner fungerar perfekt från start

**Appen är nu redo att köras med din nya Firebase-konfiguration!**