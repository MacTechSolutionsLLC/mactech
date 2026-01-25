# MacTech PowerPoint Presentation Generator

This VBA module creates a comprehensive, professional PowerPoint presentation showcasing MacTech Solutions, including company overview, services, leadership team, offerings, and CMMC Level 2 compliance.

## Features

- **13 Professional Slides** covering all aspects of MacTech Solutions
- **Consistent Design** with pillar-specific color coding (Red/Security, Blue/Infrastructure, Green/Quality, Purple/Governance)
- **Comprehensive Content** based on your codebase information
- **Professional Formatting** with proper fonts, sizes, and spacing
- **Automated Generation** - creates the entire presentation with one click

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
12. CMMC Control Breakdown - Detailed compliance metrics with table
13. Contact & Next Steps - Call to action

## How to Use

### Option 1: Import into PowerPoint (Recommended)

1. Open Microsoft PowerPoint
2. Press `Alt + F11` (Windows) or `Option + F11` (Mac) to open the VBA editor
3. In the VBA editor, go to `Insert` → `Module`
4. Copy and paste the entire contents of `MacTech_PowerPoint_Generator.bas` into the new module
5. Close the VBA editor
6. Press `Alt + F8` (Windows) or `Option + F8` (Mac) to open the Macro dialog
7. Select `CreateMacTechPresentation` and click `Run`

### Option 2: Import into Excel

1. Open Microsoft Excel
2. Press `Alt + F11` (Windows) or `Option + F11` (Mac) to open the VBA editor
3. In the VBA editor, go to `File` → `Import File...`
4. Select `MacTech_PowerPoint_Generator.bas`
5. Close the VBA editor
6. Press `Alt + F8` to open the Macro dialog
7. Select `CreateMacTechPresentation` and click `Run`

### Option 3: Direct VBA Editor

1. Open PowerPoint or Excel
2. Open VBA editor (`Alt + F11` or `Option + F11`)
3. Create a new module
4. Copy the entire `.bas` file content into the module
5. Run the `CreateMacTechPresentation` subroutine

## Requirements

- Microsoft PowerPoint installed (the code will create PowerPoint even if run from Excel)
- VBA enabled in your Office application
- PowerPoint object library reference (usually included by default)

## Output

The presentation will be automatically saved to:
- **Windows**: `C:\Users\[YourUsername]\Documents\MacTech_Presentation_YYYYMMDD_HHMMSS.pptx`
- **Mac**: `/Users/[YourUsername]/Documents/MacTech_Presentation_YYYYMMDD_HHMMSS.pptx`

The filename includes a timestamp to prevent overwriting existing presentations.

## Customization

The VBA code includes clearly marked constants at the top that you can modify:

### Colors
- `COLOR_PRIMARY_DARK` - Main header color
- `COLOR_SECURITY_RED` - Security pillar color
- `COLOR_INFRASTRUCTURE_BLUE` - Infrastructure pillar color
- `COLOR_QUALITY_GREEN` - Quality pillar color
- `COLOR_GOVERNANCE_PURPLE` - Governance pillar color

### Fonts
- `FONT_TITLE` - Title font name
- `FONT_BODY` - Body text font name
- Font sizes are defined as constants and can be adjusted

### Content
Each slide creation function can be modified to update content. Look for functions like:
- `CreateTitleSlide`
- `CreateCompanyOverviewSlide`
- `CreateSecurityPillarSlide`
- etc.

## Design Specifications

- **Title Slides**: 44pt, bold, dark blue
- **Section Headers**: 24pt, semi-bold
- **Body Text**: 16pt, regular
- **Bullet Points**: 14pt, with proper indentation
- **Color Scheme**: Professional, government-contracting appropriate

## Troubleshooting

### "Object library not found" error
- Ensure PowerPoint is installed
- In VBA editor, go to `Tools` → `References` and check "Microsoft PowerPoint [version] Object Library"

### "Permission denied" error
- Enable macros in your Office application settings
- Trust the VBA project

### Presentation not saving
- Check that you have write permissions to the Documents folder
- The code will attempt to save to Documents folder, or current directory if that fails

### Template path errors
- The code uses a blank template by default, so this should not be an issue
- If you see template-related errors, they can be safely ignored

## Notes

- The presentation uses a blank template and applies custom formatting
- All content is based on information from your codebase
- The code includes error handling to gracefully handle issues
- You can add a company logo by modifying the title slide function

## Support

For questions or issues with the VBA code, refer to the inline comments in the code file. Each function is documented with its purpose and usage.
