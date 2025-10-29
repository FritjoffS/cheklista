# Changelog - Cheklista PWA

Alla viktiga ändringar i detta projekt dokumenteras i denna fil.

## [3.1.0] - 25-10-29

### Lade till hamburgermeny
 - Installera appen i menyn
 - Sluta dela listor
 - Visa vem listan är delad med

## [3.0.0] - 25-10-29

### Fixade cache-problemet:
 - Uppdaterade Service Worker strategin:
   Network First för HTML, CSS och JS-filer - alltid försöker hämta från nätverket först
   Cache First för ikoner och andra statiska resurser
   Automatisk cache-uppdatering när nätverket svarar
 - Förbättrade Service Worker livscykeln:
   skipWaiting() - ny service worker aktiveras omedelbart
   clients.claim() - tar över alla öppna flikar direkt
   Automatisk uppdateringsdetektering
 - Lade till smart uppdateringsnotifikation:
   Visar notifikation när ny version finns tillgänglig
   Användaren kan välja att uppdatera nu eller senare
   Automatisk omladdning när service worker uppdateras

## [2.0.1] - 25-10-29

### test av version-update.bat

## [2.0.0] - 2025-10-29

### Tillagt
- PWA-funktionalitet med installbar app
- Manifest.json för app-metadata
- Service Worker för offline-funktionalitet
- App-ikoner och tema-färger

### Ändrat
- Uppdaterade HTML-filer med PWA Meta Tags
- Förbättrad mobilanpassning

### Borttaget
- PWA Meta Tags från login- och admin-sidor

---

## [1.0.0] - 2025-XX-XX

### Tillagt
- Grundläggande länksida struktur
- Firebase-integration
- Mobilinventeringsapp med streckkodsskanning
- Verkstad-sektion med dynamiska knappar
- Användarautentisering

---

## Format
- **[Tillagt]** för nya funktioner
- **[Ändrat]** för ändringar i befintlig funktionalitet  
- **[Borttaget]** för borttagna funktioner
- **[Fixat]** för buggfixar
- **[Säkerhet]** för säkerhetsuppdateringar
