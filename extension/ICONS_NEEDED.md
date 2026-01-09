# Extension Icons Needed

The extension manifest references icon files that need to be created:

- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

## Quick Solution

You can create simple placeholder icons or use a MacTech logo. The extension will work without icons, but Chrome will show a default icon.

## Creating Icons

1. Create a simple icon with text "MT" or use the MacTech logo
2. Export at the three sizes: 16x16, 48x48, 128x128
3. Save as PNG files in the `extension/` folder

Alternatively, you can remove the icons section from `manifest.json` temporarily:

```json
// Remove this section from manifest.json:
"icons": {
  "16": "icon16.png",
  "48": "icon48.png",
  "128": "icon128.png"
}
```

The extension will still function without icons.

