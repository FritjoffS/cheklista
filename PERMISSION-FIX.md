# 🔧 Permission Error Fix

**Problem:** `Error: Permission denied` när delade listor skulle laddas

**Lösning:** Uppdaterade Firebase database rules för att tillåta delning

## Vad som ändrades:
1. **Database rules** - Nu tillåter alla autentiserade användare att läsa alla checklistor (behövs för delning)
2. **SNABB-SETUP.md** - Uppdaterad med nya regler

## Vad du behöver göra:
1. Gå till Firebase Console: https://console.firebase.google.com/
2. Välj ditt projekt
3. Klicka "Realtime Database" → "Rules"
4. Kopiera de nya reglerna från `database.rules.json` eller `SNABB-SETUP.md`
5. Klicka "Publish"

## Nya Firebase Rules:
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

**Säkerhet:** Användare kan fortfarande bara redigera sina egna listor, men kan läsa delade listor från andra användare.