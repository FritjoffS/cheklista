# 📤 Guide: Så här fungerar delning i Cheklista

## 🚀 Snabbguide för delning

### 1. Dela en checklist
1. Öppna den checklist du vill dela
2. Klicka på "🔗 Dela" knappen
3. Ange e-postadressen till personen du vill dela med
4. Markera "Skicka notifikation" om du vill att de ska få besked
5. Klicka "Dela checklist"

### 2. Vad händer när du delar?
- ✅ Mottagaren får en notifikation (om vald)
- ✅ Checklistan dyker upp automatiskt hos mottagaren
- ✅ Märkt som "Delad av [din e-post]"
- ✅ Blå vänsterkant indikerar delad lista

### 3. Samarbeta i realtid
- 👥 Flera personer kan redigera samtidigt
- ⚡ Ändringar synkroniseras direkt
- 📝 Alla kan lägga till, markera och ta bort objekt
- 👀 Se vem som lade till eller ändrade objekt

## 🔧 Tekniska detaljer

### Firebase-struktur för delning
```
shared/
  checklistId/
    owner: "userId"
    ownerEmail: "owner@example.com"
    title: "Checklist-titel"
    sharedWith/
      "user_at_example_com":
        email: "user@example.com"
        permissions: "edit"
        sharedAt: timestamp
```

### E-post konvertering
Firebase-nycklar kan inte innehålla `@` och `.`, så:
- `user@example.com` → `user_at_example_com`
- Automatisk konvertering fram och tillbaka

### Säkerhet
- Endast inloggade användare kan dela
- Endast ägaren kan dela en checklist
- Mottagaren ser listan som "Delad"
- Data lagras säkert under ägarens konto

## ❓ Felsökning

### "Delning fungerar inte"
1. Kontrollera Firebase Authentication är aktiverat
2. Verifiera database-reglerna är korrekt inställda
3. Se till att både användare är inloggade

### "Mottagaren ser inte listan"
1. Kontrollera att rätt e-postadress användes
2. Mottagaren måste ha ett konto och vara inloggad
3. Uppdatera sidan hos mottagaren

### "Ändringar synkroniseras inte"
1. Kontrollera internetanslutning
2. Verifiera Firebase realtid-databas fungerar
3. Kontrollera browser-konsolen för fel

## 💡 Tips för bästa användarupplevelse

✅ **Gör så här:**
- Använd beskrivande namn på checklistor
- Dela endast med personer du litar på
- Kom ihåg att alla med tillgång kan ändra allt

❌ **Undvik:**
- Att dela känslig information
- Att dela med okända e-postadresser
- Att ta bort objekt som andra arbetar med

## 🔄 Uppdateringar och förbättringar

**Planerat:**
- Olika behörighetsnivåer (läs-endast, redigering)
- Kommentarer på objekt
- Versionshistorik
- Export av delade listor

---

**Har du problem?** Kontrollera `FIREBASE_SETUP.md` för konfigurationsinstruktioner!