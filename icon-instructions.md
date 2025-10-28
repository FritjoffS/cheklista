# Generera ikoner för PWA

För att skapa riktiga PNG-ikoner från SVG-filen, använd följande:

## Online-verktyg
1. Gå till https://www.iloveimg.com/sv/konvertera-till-png/svg-till-png
2. Ladda upp `icon.svg`
3. Ställ in storlek till 192x192 för `icon-192.png`
4. Ställ in storlek till 512x512 för `icon-512.png`

## Kommandorad (om du har ImageMagick installerat)
```bash
# Skapa 192x192 ikon
convert icon.svg -resize 192x192 icon-192.png

# Skapa 512x512 ikon  
convert icon.svg -resize 512x512 icon-512.png
```

## Med Inkscape (gratis)
1. Öppna icon.svg i Inkscape
2. Gå till File → Export PNG Image
3. Ställ in Width: 192, Height: 192
4. Spara som icon-192.png
5. Upprepa för 512x512 och spara som icon-512.png

## Alternativ
Du kan också använda följande emoji som tillfällig ikon genom att skapa PNG-filer:
- 📋 (clipboard emoji)
- ✅ (check mark emoji)

Placera de genererade PNG-filerna i samma mapp som index.html.