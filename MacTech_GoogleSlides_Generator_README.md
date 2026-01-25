# MacTech Google Slides Presentation Generator

This Google Apps Script creates a comprehensive, professional Google Slides presentation showcasing MacTech Solutions, including company overview, services, leadership team, offerings, and CMMC Level 2 compliance.

## Features

- **13 Professional Slides** covering all aspects of MacTech Solutions
- **Consistent Design** with pillar-specific color coding (Red/Security, Blue/Infrastructure, Green/Quality, Purple/Governance)
- **Comprehensive Content** based on your codebase information
- **Professional Formatting** with proper fonts, sizes, and spacing
- **Automated Generation** - creates the entire presentation with one click
- **Cloud-Based** - Works entirely in Google Drive, no desktop software needed

## Presentation Structure

1. Title Slide - MacTech Solutions with tagline
2. Company Overview - Veteran-Owned/SDVOSB, mission, value proposition
3. Four Pillars Introduction - Overview of the pillar system
4. Security Pillar - Cybersecurity & RMF services (Patrick Caruso)
5. Infrastructure Pillar - Infrastructure & Platform Engineering (James Adams)
6. Quality Pillar - Quality & Compliance Consulting (Brian MacDonald)
7. Governance Pillar - Contracts & Risk Alignment (John Milso)
8. Leadership Team - Detailed profiles of all four leaders
9. Service Offerings Summary - Comprehensive service catalog
10. Automation Platforms - Tools and capabilities overview
11. CMMC Level 2 Compliance - Compliance status and achievements
12. CMMC Control Breakdown - Detailed compliance metrics
13. Contact & Next Steps - Call to action

## How to Use

### Step 1: Open Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **"New Project"** (or use an existing project)
3. You'll see a blank script editor

### Step 2: Copy the Script

1. Open the file `MacTech_GoogleSlides_Generator.gs`
2. Copy **all** the contents (Ctrl+A, Ctrl+C or Cmd+A, Cmd+C)
3. Paste it into the Google Apps Script editor, replacing any default code

### Step 3: Enable Required APIs

1. In the Apps Script editor, click on **"Services"** (left sidebar) or go to **Resources** → **Libraries**
2. Make sure **Google Slides API** is enabled (it should be enabled by default)
3. If you see a warning about permissions, you'll authorize them when you run the script

### Step 4: Run the Script

1. In the Apps Script editor, select the function `createMacTechPresentation` from the dropdown at the top
2. Click the **Run** button (▶️) or press `Ctrl+R` (Windows) / `Cmd+R` (Mac)
3. **First time only**: You'll be prompted to authorize the script:
   - Click **"Review Permissions"**
   - Select your Google account
   - Click **"Advanced"** → **"Go to [Project Name] (unsafe)"** (if shown)
   - Click **"Allow"** to grant permissions

### Step 5: Access Your Presentation

1. The script will create a new Google Slides presentation
2. A dialog box will appear with the presentation URL
3. The presentation will automatically open in a new tab
4. The presentation is saved in your Google Drive

## Alternative: Run from Google Sheets

You can also run this script from Google Sheets:

1. Open or create a Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Paste the script code
4. Save the project
5. Run `createMacTechPresentation` from the Apps Script editor

## Requirements

- Google account
- Google Drive access
- Google Slides API (enabled automatically)
- Internet connection

## Output

The presentation will be:
- Created in your Google Drive
- Named: `MacTech Presentation - YYYYMMDD_HHMMSS`
- Automatically opened in a new browser tab
- Fully editable in Google Slides

## Customization

The script includes clearly marked constants at the top that you can modify:

### Colors
Colors are defined as RGB values from 0-1 (Google Slides format):
```javascript
const COLOR_PRIMARY_DARK = {red: 0, green: 0.2, blue: 0.4};
const COLOR_SECURITY_RED = {red: 0.725, green: 0.11, blue: 0.11};
// etc.
```

### Fonts
```javascript
const FONT_TITLE = 'Calibri';
const FONT_BODY = 'Calibri';
const FONT_SIZE_TITLE = 44;
// etc.
```

### Content
Each slide creation function can be modified to update content. Look for functions like:
- `createTitleSlide`
- `createCompanyOverviewSlide`
- `createSecurityPillarSlide`
- etc.

## Design Specifications

- **Title Slides**: 44pt, bold, dark blue
- **Section Headers**: 24pt, semi-bold
- **Body Text**: 16pt, regular
- **Bullet Points**: 14pt, with proper indentation
- **Color Scheme**: Professional, government-contracting appropriate

## Troubleshooting

### "Authorization required" error
- Make sure you've authorized the script when prompted
- Go to script editor → **Run** → **Review Permissions**

### "SlidesApp is not defined" error
- Make sure you're running the script in Google Apps Script (not a local JavaScript environment)
- The script must run in the Google Apps Script environment

### Script runs but no presentation appears
- Check the **Execution log** (View → Execution log) for errors
- The presentation URL will be logged - check the log for the link
- Look in your Google Drive for a new presentation

### Permission errors
- Make sure you're signed into the correct Google account
- Check that Google Slides API is enabled in your project
- Try running the script again and authorize all requested permissions

### Presentation looks different than expected
- Google Slides may render some elements slightly differently than PowerPoint
- You can manually adjust formatting in Google Slides after generation
- Some advanced formatting may need manual adjustment

## Differences from PowerPoint Version

- **Colors**: Uses 0-1 RGB scale instead of 0-255
- **Shapes**: Some shape types may differ
- **Tables**: Uses text boxes to simulate tables (Google Slides API limitations)
- **Bullets**: Bullet formatting handled differently
- **File Location**: Saves to Google Drive instead of local Documents folder

## Sharing the Presentation

After creation, you can:
1. Click **Share** in Google Slides to collaborate
2. Download as PowerPoint (.pptx) if needed: **File** → **Download** → **Microsoft PowerPoint**
3. Export as PDF: **File** → **Download** → **PDF Document**

## Notes

- The script creates a new presentation each time it runs
- Previous presentations are not overwritten (timestamped names)
- All content is based on information from your codebase
- The code includes error handling to gracefully handle issues
- You can add a company logo by modifying the title slide function

## Support

For questions or issues with the Google Apps Script:
- Check the **Execution log** in Apps Script editor for error messages
- Review Google Apps Script documentation: [developers.google.com/apps-script](https://developers.google.com/apps-script)
- Google Slides API reference: [developers.google.com/slides/api](https://developers.google.com/slides/api)

## Comparison: Google Slides vs PowerPoint Version

| Feature | Google Slides | PowerPoint |
|---------|---------------|------------|
| Platform | Cloud-based | Desktop app required |
| Access | Any device with browser | Windows/Mac with Office |
| Collaboration | Built-in real-time | Requires OneDrive/SharePoint |
| Cost | Free with Google account | Requires Office license |
| File Location | Google Drive | Local Documents folder |
| Sharing | Easy link sharing | File transfer needed |

Both versions create the same content and structure - choose based on your needs!
