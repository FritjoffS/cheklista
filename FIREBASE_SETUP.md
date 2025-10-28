# Firebase Setup Guide - VIKTIGT!

⚠️ **Appen kommer inte fungera utan att följa denna setup-guide!** ⚠️

## 🔥 1. Firebase Authentication Setup (KRÄVS!)

**Felet du ser:** `POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=... 400 (Bad Request)`

**Orsak:** Authentication är inte aktiverat i Firebase Console.

### Steg för att fixa:
1. **Gå till [Firebase Console](https://console.firebase.google.com/)**
2. **Välj ditt projekt: `checklista-61c12`**
3. **Klicka på "Authentication" i vänster meny**
4. **Klicka på "Get started" om du ser det**
5. **Gå till fliken "Sign-in method"**
6. **Aktivera "Email/Password" provider:**
   - Klicka på "Email/Password"
   - Aktivera "Enable" (första alternativet)
   - Klicka "Save"

✅ **Efter detta steg ska du kunna skapa konton och logga in!**

## 🔒 2. Realtime Database Setup (KRÄVS!)

**Felet du ser:** `FIREBASE WARNING: set at /shared/-OceBRnNLFyG7ALbFX-u failed: permission_denied`

### Steg för att fixa:
1. **Gå till "Realtime Database" i Firebase Console**
2. **Klicka på fliken "Rules"**
3. **Ersätt allt innehåll med:**
   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "$uid === auth.uid",
           ".write": "$uid === auth.uid"
         }
       },
       "shared": {
         "$checklistId": {
           ".read": "auth != null",
           ".write": "auth != null"
         }
       },
       "notifications": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   ```
4. **Klicka "Publish"**

✅ **Efter detta steg ska delning av checklistor fungera!**

## 3. Push Notifications (Valfritt)

För att aktivera push notifications:

1. Gå till "Cloud Messaging" i Firebase Console
2. Generera en VAPID-nyckel:
   - Klicka på "Generate key pair" under "Web configuration"
   - Kopiera nyckeln
3. Uppdatera koden i `index.html`:
   - Ersätt `'YOUR_VAPID_KEY_HERE'` med din VAPID-nyckel
   - Ta bort kommentarerna runt FCM-token koden

## 4. Hosting (Valfritt)

För att deploya appen:

1. Installera Firebase CLI: `npm install -g firebase-tools`
2. Logga in: `firebase login`
3. Initiera projektet: `firebase init hosting`
4. Välj ditt Firebase-projekt
5. Ange `public` som deploy-mapp
6. Välj "No" för SPA-konfiguration
7. Kopiera alla filer till `public`-mappen
8. Deploya: `firebase deploy`

## 5. Testning

Efter att ha aktiverat Authentication bör du kunna:

- Skapa ett nytt konto med e-post/lösenord
- Logga in med det skapade kontot
- Skapa och hantera checklistor
- Se realtidsuppdateringar

## Vanliga problem

### Authentication Error 400
- Kontrollera att Email/Password är aktiverat i Firebase Console
- Verifiera att projektkonfigurationen är korrekt

### CORS-fel
- Använd en lokal server istället för att öppna HTML-filen direkt
- Exempel: `python -m http.server 8000` eller Live Server i VS Code

### Push Notifications fungerar inte
- VAPID-nyckeln måste vara konfigurerad
- HTTPS krävs för push notifications i produktion
- Service Worker måste vara registrerad

## Support

Om du stöter på problem:
1. Kontrollera browser-konsolen för felmeddelanden
2. Verifiera Firebase-konfigurationen
3. Se till att alla nödvändiga tjänster är aktiverade i Firebase Console