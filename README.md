# Cheklista - Smart Checklist App

En modern, responsiv webb-app för att skapa och dela checklistor med realtidsuppdateringar via Firebase.

## Funktioner

### ✅ Grundfunktioner
- **Skapa checklistor**: Inköpslistor, TODO-listor, etc.
- **Hantera objekt**: Lägg till, markera som klar, ta bort objekt
- **Realtidsuppdateringar**: Se ändringar direkt via Firebase Realtime Database
- **Responsiv design**: Fungerar perfekt på mobil och tablet

### 🎨 Användarupplevelse
- **4 olika teman**: Ljus, mörkt, natur och solnedgång
- **Modern design**: Clean, användarvänligt gränssnitt
- **PWA-stöd**: Installera som app på mobilen
- **Offline-funktion**: Fungerar utan internetanslutning

### 👥 Delning och samarbete
- **Dela checklistor**: Skicka till andra användare via e-post
- **Realtidssamarbete**: Flera personer kan redigera samma lista
- **Push-notifikationer**: Få meddelanden när andra gör ändringar

### 🔐 Säkerhet
- **Firebase Authentication**: Säker inloggning med e-post/lösenord
- **Användarspecifik data**: Varje användare ser bara sina egna listor
- **Delningsbehörigheter**: Kontrollera vem som kan redigera

## Teknisk specifikation

### Frontend
- **HTML5**: Semantisk markup och tillgänglighet
- **CSS3**: Moderna CSS-funktioner, CSS Grid, Flexbox
- **Vanilla JavaScript**: ES6+ modules, async/await
- **PWA**: Service Worker, Web App Manifest

### Backend (Firebase)
- **Realtime Database**: Snabba uppdateringar i realtid
- **Authentication**: Säker användarhantering
- **Cloud Messaging**: Push-notifikationer
- **Analytics**: Användningsstatistik

### Responsiv design
- **Mobile-first**: Optimerad för mobila enheter
- **Tablet-anpassad**: Använder större skärmar effektivt
- **Touch-vänlig**: Stora klickbara ytor

## Installation och användning

### Förutsättningar
- Modern webbläsare (Chrome, Firefox, Safari, Edge)
- Internetanslutning för första inställningen
- Firebase-projekt konfigurerat

### Snabbstart
1. Öppna `index.html` i en webbläsare
2. Registrera ett konto eller logga in
3. Skapa din första checklist
4. Börja lägga till objekt!

### PWA-installation
1. Öppna appen i Chrome/Edge på mobilen
2. Tryck på "Lägg till på startskärmen"
3. Appen installeras som en native app

## Firebase-konfiguration

Appen är redan konfigurerad med följande Firebase-projekt:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDMhOCALyIYv9UtNdSMFg2VHsS_8jyuWpU",
  authDomain: "checklista-f9bbf.firebaseapp.com",
  databaseURL: "https://checklista-f9bbf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "checklista-f9bbf",
  storageBucket: "checklista-f9bbf.firebasestorage.app",
  messagingSenderId: "376058394469",
  appId: "1:376058394469:web:0b1b1b8946ec4ab666938c"
};
```

## Datastruktur

### Användare
```json
{
  "users": {
    "userId": {
      "email": "user@example.com",
      "fcmToken": "notification-token",
      "checklists": {
        "checklistId": {
          "title": "Min inköpslista",
          "description": "Handla till helgen",
          "createdAt": "timestamp",
          "items": {
            "itemId": {
              "text": "Mjölk",
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

### Delade checklistor
```json
{
  "shared": {
    "checklistId": {
      "owner": "userId",
      "ownerEmail": "owner@example.com",
      "title": "Delad lista",
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

**Obs!** E-postadresser konverteras till Firebase-säkra nycklar genom att ersätta:
- `@` med `_at_`
- `.` med `_`
- Andra ogiltiga tecken (`#`, `$`, `[`, `]`) med `_`
```

## Användning

### Skapa en checklist
1. Klicka på "Skapa ny checklist"
2. Ange titel och beskrivning
3. Klicka "Skapa checklist"

### Lägga till objekt
1. Öppna en checklist
2. Skriv i "Lägg till nytt objekt" fältet
3. Tryck Enter eller klicka "Lägg till"

### Dela en checklist
1. Öppna checklistan du vill dela
2. Klicka på "Dela" knappen
3. Ange e-postadressen till personen
4. Välj om de ska få en notifikation
5. Klicka "Dela checklist"

### Byta tema
1. Klicka på 🎨 ikonen i headern
2. Välj önskat tema från dropdown-menyn
3. Temat sparas automatiskt

## Browser-kompatibilitet

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Samsung Internet 14+

## Säkerhet

- All data krypteras under transport (HTTPS)
- Firebase säkerhetsregler skyddar användardata
- Ingen känslig data lagras lokalt
- Regelbundna säkerhetsuppdateringar

## Utveckling

### Föreslagna förbättringar
- [ ] Offline-synkronisering
- [ ] Bilagor och bilder
- [ ] Kategorisering av checklistor
- [ ] Export till PDF/Excel
- [ ] Påminnelser och deadlines
- [ ] Röstinmatning
- [ ] Återkommande checklistor

### Bidrag
Förslag och förbättringar välkomnas! Skapa gärna issues eller pull requests.

## Licens

Detta projekt är open source och tillgängligt under MIT-licensen.

## Support

För support och frågor, kontakta utvecklaren eller skapa ett issue på GitHub.

---

**Cheklista** - Din smarta följeslagare för att hålla ordning på allt! 📋✨