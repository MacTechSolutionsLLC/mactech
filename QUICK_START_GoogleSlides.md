# Quick Start: Running the Google Slides Generator

## The Issue
If you see "Menu creation skipped" in the execution log, it means only the `onOpen()` function ran. You need to explicitly run the `createMacTechPresentation()` function.

## How to Run the Script

### Method 1: From Apps Script Editor (Recommended)

1. **Open the Apps Script editor** (script.google.com or Extensions → Apps Script from Sheets)

2. **Select the function** from the dropdown at the top:
   - Look for the dropdown that says "Select function"
   - Choose `createMacTechPresentation` from the list

3. **Click the Run button** (▶️) or press `Ctrl+R` (Windows) / `Cmd+R` (Mac)

4. **Authorize permissions** (first time only):
   - Click "Review Permissions"
   - Select your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)" if shown
   - Click "Allow"

5. **Check the execution log**:
   - View → Execution log (or click the clock icon)
   - You should see logs like:
     ```
     Starting presentation creation...
     Creating new presentation...
     Slide 1: Title
     Slide 2: Company Overview
     ...
     Presentation created successfully!
     URL: https://docs.google.com/presentation/d/...
     ```

6. **Open the presentation**:
   - Click the URL in the execution log, OR
   - Check your Google Drive for "MacTech Presentation - [timestamp]"

### Method 2: From Google Sheets Menu

1. **Open or create a Google Sheet**

2. **Go to Extensions → Apps Script**

3. **Paste the script code** (if not already there)

4. **Save the project** (Ctrl+S or Cmd+S)

5. **Refresh the Google Sheet** (F5 or reload the page)

6. **Look for the menu** "MacTech Presentation" in the menu bar

7. **Click MacTech Presentation → Create MacTech Presentation**

### Method 3: Direct Function Call

If you're in the Apps Script editor:

1. Type this in the console (if available) or create a test function:
   ```javascript
   function test() {
     createMacTechPresentation();
   }
   ```
2. Run the `test` function

## Troubleshooting

### "Execution completed" but no presentation created
- Make sure you selected `createMacTechPresentation` from the function dropdown
- Check the execution log for errors
- Make sure you authorized all permissions

### "SlidesApp is not defined" error
- You're not running in Google Apps Script environment
- Make sure you're at script.google.com or in Apps Script from Sheets

### "Authorization required" error
- Click "Review Permissions" and authorize
- Make sure you're signed into the correct Google account

### No errors but no presentation
- Check your Google Drive
- Look in the execution log for the URL
- The presentation might have been created with a different name

## What You Should See

When the script runs successfully, you'll see in the execution log:
```
Starting presentation creation...
Creating new presentation...
Presentation created. ID: [presentation-id]
Removed default slide
Creating slides...
Slide 1: Title
Slide 2: Company Overview
...
Slide 13: Contact
========================================
Presentation created successfully!
Total slides: 13
URL: https://docs.google.com/presentation/d/...
========================================
```

## Next Steps

Once the presentation is created:
1. Open it from Google Drive or the URL in the log
2. Review and customize as needed
3. Share with your team using the Share button
4. Download as PowerPoint if needed: File → Download → Microsoft PowerPoint
