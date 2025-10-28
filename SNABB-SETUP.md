🔥 **SNABB-SETUP FÖR CHEKLISTA** 🔥

❌ **Appen fungerar inte?** 
✅ **Följ dessa 2 enkla steg:**

## Steg 1: Aktivera Firebase Authentication
1. Gå till: https://console.firebase.google.com/
2. Välj projekt: `checklista-61c12`  
3. Klicka "Authentication" → "Get started" → "Sign-in method"
4. Klicka "Email/Password" → Aktivera första alternativet → "Save"

## Steg 2: Fixa Database-regler
1. Klicka "Realtime Database" → "Rules"
2. Ersätt allt med:
```json
{
  "rules": {
    "users": {
      "$uid": {
        "checklists": {
          "$checklistId": {
            ".read": "auth != null",
            ".write": "$uid === auth.uid || root.child('shared').child($checklistId).child('sharedWith').hasChildren()"
          }
        },
        ".read": "auth != null",
        ".write": "$uid === auth.uid"
      }
    },
    "shared": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "notifications": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```
3. Klicka "Publish"

## 🎉 Klart! 
Nu ska appen fungera perfekt - testa att skapa ett konto!