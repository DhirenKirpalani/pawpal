# Favicon Generation Instructions

## Files Created

1. **icon.svg** - Vector favicon (already created in `/public/icon.svg`)
2. **manifest.json** - PWA manifest (already created in `/public/manifest.json`)

## Generate PNG Favicons

You need to generate PNG versions of the favicon for better browser compatibility.

### Option 1: Using Online Tool (Easiest)
1. Go to https://realfavicongenerator.net/
2. Upload `/public/icon.svg`
3. Download the generated package
4. Extract these files to `/public/`:
   - `favicon.ico`
   - `apple-touch-icon.png`
   - `icon-192.png`
   - `icon-512.png`

### Option 2: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
cd public

# Generate favicon.ico (16x16, 32x32, 48x48)
convert icon.svg -resize 16x16 favicon-16.png
convert icon.svg -resize 32x32 favicon-32.png
convert icon.svg -resize 48x48 favicon-48.png
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
rm favicon-16.png favicon-32.png favicon-48.png

# Generate Apple Touch Icon (180x180)
convert icon.svg -resize 180x180 apple-touch-icon.png

# Generate PWA icons
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
```

### Option 3: Using Node.js Sharp Library

Install sharp:
```bash
npm install sharp
```

Then run the generation script (see below).

## Current Status

✅ SVG favicon created
✅ Manifest.json created
✅ Favicon links added to layout.tsx
⏳ PNG favicons need to be generated (use one of the options above)

## Favicon Design

The favicon features:
- Purple gradient background (#8b5cf6 to #d946ef)
- White paw print icon
- Clean, modern design
- Recognizable at small sizes
