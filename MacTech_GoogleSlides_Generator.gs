/**
 * MacTech Solutions Google Slides Presentation Generator
 * This Google Apps Script creates a comprehensive presentation showcasing
 * MacTech Solutions, its services, leadership, offerings, and CMMC Level 2 compliance
 * 
 * Usage: Run createMacTechPresentation() function from the Apps Script editor
 * Requirements: Google Slides API must be enabled
 */

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

// Color Scheme - RGB Values (0-1 scale for Google Slides)
const COLOR_PRIMARY_DARK = {red: 0, green: 0.2, blue: 0.4};      // Dark Blue/Navy
const COLOR_SECURITY_RED = {red: 0.725, green: 0.11, blue: 0.11};     // Red for Security Pillar
const COLOR_INFRASTRUCTURE_BLUE = {red: 0.114, green: 0.306, blue: 0.847}; // Blue for Infrastructure
const COLOR_QUALITY_GREEN = {red: 0.086, green: 0.396, blue: 0.204};     // Green for Quality
const COLOR_GOVERNANCE_PURPLE = {red: 0.494, green: 0.133, blue: 0.808}; // Purple for Governance
const COLOR_TEXT_DARK = {red: 0.149, green: 0.149, blue: 0.149};         // Dark Gray for text
const COLOR_TEXT_LIGHT = {red: 0.451, green: 0.451, blue: 0.451};     // Light Gray for secondary text
const COLOR_ACCENT = {red: 0.231, green: 0.510, blue: 0.965};          // Accent Blue

// Font Settings
const FONT_TITLE = 'Calibri';
const FONT_BODY = 'Calibri';
const FONT_SIZE_TITLE = 44;
const FONT_SIZE_SUBTITLE = 28;
const FONT_SIZE_HEADING = 24;
const FONT_SIZE_BODY = 16;
const FONT_SIZE_BULLET = 14;

// Slide Dimensions (in points)
const SLIDE_WIDTH = 720;
const SLIDE_HEIGHT = 405;

// ============================================================================
// MENU SETUP (for Google Sheets)
// ============================================================================

/**
 * Creates a custom menu when the spreadsheet is opened
 * This allows easy access to the presentation generator from Google Sheets
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('MacTech Presentation')
      .addItem('Create MacTech Presentation', 'createMacTechPresentation')
      .addToUi();
  } catch (e) {
    // If not running from Sheets, ignore menu creation
    Logger.log('Menu creation skipped (not running from Sheets)');
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Main function to create the complete MacTech presentation
 * This orchestrates the creation of all slides
 * 
 * TO RUN: Select this function from the dropdown and click Run (▶️)
 */
function createMacTechPresentation() {
  Logger.log('Starting presentation creation...');
  
  try {
    // Create new presentation
    Logger.log('Creating new presentation...');
    const presentation = SlidesApp.create('MacTech Presentation - ' + 
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss'));
    
    Logger.log('Presentation created. ID: ' + presentation.getId());
    
    // Remove default slide
    const defaultSlide = presentation.getSlides()[0];
    if (defaultSlide) {
      defaultSlide.remove();
      Logger.log('Removed default slide');
    }
    
    // Create all slides in sequence
    Logger.log('Creating slides...');
    createTitleSlide(presentation);
    Logger.log('Slide 1: Title');
    createCompanyOverviewSlide(presentation);
    Logger.log('Slide 2: Company Overview');
    createPillarsIntroductionSlide(presentation);
    Logger.log('Slide 3: Pillars Introduction');
    createSecurityPillarSlide(presentation);
    Logger.log('Slide 4: Security Pillar');
    createInfrastructurePillarSlide(presentation);
    Logger.log('Slide 5: Infrastructure Pillar');
    createQualityPillarSlide(presentation);
    Logger.log('Slide 6: Quality Pillar');
    createGovernancePillarSlide(presentation);
    Logger.log('Slide 7: Governance Pillar');
    createLeadershipTeamSlide(presentation);
    Logger.log('Slide 8: Leadership Team');
    createServicesSummarySlide(presentation);
    Logger.log('Slide 9: Services Summary');
    createAutomationPlatformsSlide(presentation);
    Logger.log('Slide 10: Automation Platforms');
    createCMMCComplianceSlide(presentation);
    Logger.log('Slide 11: CMMC Compliance');
    createCMMCControlBreakdownSlide(presentation);
    Logger.log('Slide 12: CMMC Control Breakdown');
    createContactSlide(presentation);
    Logger.log('Slide 13: Contact');
    
    // Open the presentation
    const url = presentation.getUrl();
    Logger.log('========================================');
    Logger.log('Presentation created successfully!');
    Logger.log('Total slides: ' + presentation.getSlides().length);
    Logger.log('URL: ' + url);
    Logger.log('========================================');
    
    // Show alert with link (works for both Sheets and standalone)
    try {
      // Try to get UI (works from Sheets)
      const ui = SpreadsheetApp.getUi();
      if (ui) {
        ui.alert(
          'Presentation created successfully!\n\n' +
          'URL: ' + url + '\n\n' +
          'The presentation has been opened in a new tab.'
        );
        
        // Open in new tab
        const html = '<script>window.open("' + url + '", "_blank");google.script.host.close();</script>';
        const htmlOutput = HtmlService.createHtmlOutput(html);
        ui.showModalDialog(htmlOutput, 'Opening Presentation...');
      }
    } catch (e) {
      // If UI is not available (standalone script), just log the URL
      Logger.log('UI not available (running from Apps Script editor)');
      Logger.log('Please check the execution log above for the presentation URL');
    }
    
    return presentation;
    
  } catch (error) {
    Logger.log('Error creating presentation: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    try {
      const ui = SpreadsheetApp.getUi();
      if (ui) {
        ui.alert('Error creating presentation: ' + error.toString());
      }
    } catch (uiError) {
      // UI not available, error already logged
    }
    throw error;
  }
}

// ============================================================================
// SLIDE CREATION FUNCTIONS
// ============================================================================

function createTitleSlide(presentation) {
  const slide = presentation.appendSlide();
  
  // Title
  const title = slide.insertTextBox('MacTech Solutions', 0, 50, SLIDE_WIDTH, 80);
  title.getText().getTextStyle()
    .setFontFamily(FONT_TITLE)
    .setFontSize(60)
    .setBold(true)
    .setForegroundColor(COLOR_PRIMARY_DARK.red, COLOR_PRIMARY_DARK.green, COLOR_PRIMARY_DARK.blue);
  centerShape(title);
  title.setTop(120);
  
  // Subtitle
  const subtitle = slide.insertTextBox(
    'Cyber, Infrastructure, and Compliance\nBuilt for Mission-Critical Programs',
    0, 200, SLIDE_WIDTH, 100
  );
  subtitle.getText().getTextStyle()
    .setFontFamily(FONT_BODY)
    .setFontSize(FONT_SIZE_SUBTITLE)
    .setForegroundColor(COLOR_TEXT_DARK.red, COLOR_TEXT_DARK.green, COLOR_TEXT_DARK.blue);
  centerShape(subtitle);
  subtitle.setTop(220);
  
  // Decorative line (using a thin rectangle as line)
  const lineHeight = 3;
  const line = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 
    SLIDE_WIDTH * 0.2, SLIDE_HEIGHT * 0.65 - lineHeight/2,
    SLIDE_WIDTH * 0.6, lineHeight);
  line.getFill().setSolidFill(COLOR_ACCENT.red, COLOR_ACCENT.green, COLOR_ACCENT.blue);
  // Border will be minimal by default - no need to modify
}

function createCompanyOverviewSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Company Overview', leftMargin, topMargin, 800, 60);
  formatTitle(title);
  
  // Company Type
  topMargin += 100;
  const companyType = addTextShape(slide, 'Veteran-Owned / SDVOSB (Pending)', leftMargin, topMargin, 800, 40);
  formatHeading(companyType, COLOR_ACCENT);
  
  // Mission Statement
  topMargin += 80;
  const missionLabel = addTextShape(slide, 'Mission', leftMargin, topMargin, 800, 35);
  formatHeading(missionLabel, COLOR_TEXT_DARK);
  
  topMargin += 50;
  const mission = addTextShape(slide, 
    'MacTech Solutions helps federal programs and defense contractors achieve authorization, audit readiness, and operational confidence through integrated technical and risk-aware delivery.',
    leftMargin, topMargin, 800, 80);
  formatBodyText(mission);
  
  // Value Proposition
  topMargin += 120;
  const valueLabel = addTextShape(slide, 'Our Value', leftMargin, topMargin, 800, 35);
  formatHeading(valueLabel, COLOR_TEXT_DARK);
  
  topMargin += 50;
  const valueText = '• Specialized in DoD Cybersecurity, Infrastructure Engineering, and Compliance\n' +
    '• Four pillars of expertise led by senior practitioners\n' +
    '• Automation-enhanced delivery for faster, consistent results\n' +
    '• CMMC Level 2 compliant organization (97% readiness)';
  const value = addTextShape(slide, valueText, leftMargin, topMargin, 800, 150);
  formatBulletText(value);
}

function createPillarsIntroductionSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Our Four Pillars of Expertise', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  
  // Introduction text
  topMargin += 80;
  const intro = addTextShape(slide,
    'MacTech\'s leadership is organized into four pillars, each representing a core domain of expertise and led by a senior practitioner with deep experience in that area.',
    leftMargin, topMargin, 900, 60);
  formatBodyText(intro);
  
  // Pillar boxes
  const pillarNames = ['Security', 'Infrastructure', 'Quality', 'Governance'];
  const pillarColors = [COLOR_SECURITY_RED, COLOR_INFRASTRUCTURE_BLUE, COLOR_QUALITY_GREEN, COLOR_GOVERNANCE_PURPLE];
  const pillarLeaders = ['Patrick Caruso', 'James Adams', 'Brian MacDonald', 'John Milso'];
  
  const pillarWidth = 200;
  const pillarHeight = 120;
  topMargin = 180;
  
  for (let i = 0; i < 4; i++) {
    const xPos = leftMargin + (i % 2) * (pillarWidth + 50);
    const yPos = topMargin + Math.floor(i / 2) * (pillarHeight + 50);
    
    // Pillar box
    const box = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, xPos, yPos, pillarWidth, pillarHeight);
    box.getFill().setSolidFill(pillarColors[i].red, pillarColors[i].green, pillarColors[i].blue);
    // Border will be minimal by default - no need to modify
    
    // Pillar name
    const name = slide.insertTextBox(pillarNames[i], xPos + 10, yPos + 10, pillarWidth - 20, 30);
    name.getText().getTextStyle()
      .setFontFamily(FONT_BODY)
      .setFontSize(20)
      .setBold(true)
      .setForegroundColor(1, 1, 1);
    
    // Leader name
    const leader = slide.insertTextBox(pillarLeaders[i], xPos + 10, yPos + 50, pillarWidth - 20, 25);
    leader.getText().getTextStyle()
      .setFontFamily(FONT_BODY)
      .setFontSize(14)
      .setForegroundColor(1, 1, 1);
  }
}

function createSecurityPillarSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Security Pillar', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  title.getText().getTextStyle().setForegroundColor(COLOR_SECURITY_RED.red, COLOR_SECURITY_RED.green, COLOR_SECURITY_RED.blue);
  
  // Leader info
  topMargin += 70;
  const leader = addTextShape(slide, 'Led by Patrick Caruso • Director of Cyber Assurance', leftMargin, topMargin, 900, 30);
  formatBodyText(leader);
  leader.getText().getTextStyle().setFontSize(14).setItalic(true);
  
  // Services
  topMargin += 50;
  const servicesLabel = addTextShape(slide, 'Cybersecurity & RMF Services', leftMargin, topMargin, 450, 35);
  formatHeading(servicesLabel, COLOR_TEXT_DARK);
  
  topMargin += 50;
  const servicesText = '• RMF Step 1-6 implementation and documentation\n' +
    '• Authorization to Operate (ATO) package development\n' +
    '• Continuous Monitoring (ConMon) program design\n' +
    '• STIG compliance assessment and remediation\n' +
    '• Security Control Assessment (SCA) support\n' +
    '• Plan of Action & Milestones (POA&M) development\n' +
    '• System Security Plan (SSP) authoring\n' +
    '• Risk Assessment Report (RAR) development';
  const services = addTextShape(slide, servicesText, leftMargin, topMargin, 450, 300);
  formatBulletText(services);
  
  // When You Need It
  const whenLabel = addTextShape(slide, 'When You Need It', leftMargin + 500, topMargin - 50, 450, 35);
  formatHeading(whenLabel, COLOR_TEXT_DARK);
  
  const whenText = '• New system requiring initial authorization\n' +
    '• ATO renewal approaching\n' +
    '• Failed security assessment or audit\n' +
    '• Major system changes requiring re-authorization\n' +
    '• Cloud migration or infrastructure modernization\n' +
    '• Compliance gaps identified\n' +
    '• Need for continuous monitoring program';
  const when = addTextShape(slide, whenText, leftMargin + 500, topMargin, 450, 300);
  formatBulletText(when);
}

function createInfrastructurePillarSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Infrastructure Pillar', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  title.getText().getTextStyle().setForegroundColor(COLOR_INFRASTRUCTURE_BLUE.red, COLOR_INFRASTRUCTURE_BLUE.green, COLOR_INFRASTRUCTURE_BLUE.blue);
  
  // Leader info
  topMargin += 70;
  const leader = addTextShape(slide, 'Led by James Adams • Director of Infrastructure & Systems Engineering', leftMargin, topMargin, 900, 30);
  formatBodyText(leader);
  leader.getText().getTextStyle().setFontSize(14).setItalic(true);
  
  // Services
  topMargin += 50;
  const servicesLabel = addTextShape(slide, 'Infrastructure & Platform Engineering', leftMargin, topMargin, 450, 35);
  formatHeading(servicesLabel, COLOR_TEXT_DARK);
  
  topMargin += 50;
  const servicesText = '• Data center architecture and design\n' +
    '• Virtualization platform implementation\n' +
    '• Storage and backup solutions\n' +
    '• Network architecture and security\n' +
    '• Cloud migration planning and execution\n' +
    '• Infrastructure as Code (IaC) development\n' +
    '• Performance optimization and capacity planning\n' +
    '• Disaster recovery and business continuity';
  const services = addTextShape(slide, servicesText, leftMargin, topMargin, 450, 300);
  formatBulletText(services);
  
  // When You Need It
  const whenLabel = addTextShape(slide, 'When You Need It', leftMargin + 500, topMargin - 50, 450, 35);
  formatHeading(whenLabel, COLOR_TEXT_DARK);
  
  const whenText = '• New system deployment\n' +
    '• Infrastructure modernization\n' +
    '• Cloud migration initiative\n' +
    '• Performance or capacity issues\n' +
    '• Need for better documentation\n' +
    '• Infrastructure not aligned with security requirements\n' +
    '• Preparing for authorization';
  const when = addTextShape(slide, whenText, leftMargin + 500, topMargin, 450, 300);
  formatBulletText(when);
}

function createQualityPillarSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Quality Pillar', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  title.getText().getTextStyle().setForegroundColor(COLOR_QUALITY_GREEN.red, COLOR_QUALITY_GREEN.green, COLOR_QUALITY_GREEN.blue);
  
  // Leader info
  topMargin += 70;
  const leader = addTextShape(slide, 'Led by Brian MacDonald • Managing Member, Compliance & Operations', leftMargin, topMargin, 900, 30);
  formatBodyText(leader);
  leader.getText().getTextStyle().setFontSize(14).setItalic(true);
  
  // Services
  topMargin += 50;
  const servicesLabel = addTextShape(slide, 'Quality & Compliance Consulting', leftMargin, topMargin, 450, 35);
  formatHeading(servicesLabel, COLOR_TEXT_DARK);
  
  topMargin += 50;
  const servicesText = '• ISO 9001, 27001, and other standard implementation\n' +
    '• Laboratory accreditation support (ISO 17025)\n' +
    '• Audit readiness assessments\n' +
    '• Quality management system development\n' +
    '• Process documentation and standardization\n' +
    '• Regulatory compliance programs\n' +
    '• Metrology and calibration management';
  const services = addTextShape(slide, servicesText, leftMargin, topMargin, 450, 300);
  formatBulletText(services);
  
  // When You Need It
  const whenLabel = addTextShape(slide, 'When You Need It', leftMargin + 500, topMargin - 50, 450, 35);
  formatHeading(whenLabel, COLOR_TEXT_DARK);
  
  const whenText = '• Preparing for ISO certification\n' +
    '• Upcoming audit or inspection\n' +
    '• Need for quality management system\n' +
    '• Process improvement initiatives\n' +
    '• Regulatory compliance requirements\n' +
    '• Laboratory accreditation needs';
  const when = addTextShape(slide, whenText, leftMargin + 500, topMargin, 450, 300);
  formatBulletText(when);
}

function createGovernancePillarSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Governance Pillar', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  title.getText().getTextStyle().setForegroundColor(COLOR_GOVERNANCE_PURPLE.red, COLOR_GOVERNANCE_PURPLE.green, COLOR_GOVERNANCE_PURPLE.blue);
  
  // Leader info
  topMargin += 70;
  const leader = addTextShape(slide, 'Led by John Milso • Director of Legal, Contracts & Risk Advisory', leftMargin, topMargin, 900, 30);
  formatBodyText(leader);
  leader.getText().getTextStyle().setFontSize(14).setItalic(true);
  
  // Services
  topMargin += 50;
  const servicesLabel = addTextShape(slide, 'Contracts & Risk Alignment', leftMargin, topMargin, 450, 35);
  formatHeading(servicesLabel, COLOR_TEXT_DARK);
  
  topMargin += 50;
  const servicesText = '• Commercial contracts (Software, Services, Vendors)\n' +
    '• Corporate governance\n' +
    '• M&A due diligence\n' +
    '• Risk identification and mitigation\n' +
    '• Vendor and subcontractor agreement alignment\n' +
    '• Contractual readiness for cyber and compliance obligations\n' +
    '• Legal document generation and review';
  const services = addTextShape(slide, servicesText, leftMargin, topMargin, 450, 300);
  formatBulletText(services);
  
  // When You Need It
  const whenLabel = addTextShape(slide, 'When You Need It', leftMargin + 500, topMargin - 50, 450, 35);
  formatHeading(whenLabel, COLOR_TEXT_DARK);
  
  const whenText = '• Contract negotiation and review\n' +
    '• Vendor relationship management\n' +
    '• M&A activities\n' +
    '• Risk management initiatives\n' +
    '• Corporate governance needs\n' +
    '• Compliance alignment requirements';
  const when = addTextShape(slide, whenText, leftMargin + 500, topMargin, 450, 300);
  formatBulletText(when);
}

function createLeadershipTeamSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Leadership Team', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  
  // Patrick Caruso
  topMargin = 150;
  const patrickName = addTextShape(slide, 'Patrick Caruso', leftMargin, topMargin, 400, 30);
  formatHeading(patrickName, COLOR_SECURITY_RED);
  
  const patrickDesc = addTextShape(slide,
    'Director of Cyber Assurance (Key Personnel)\nExpertise: RMF Implementation, ATO Development, STIG Compliance, Continuous Monitoring',
    leftMargin, topMargin + 35, 400, 80);
  formatBodyText(patrickDesc);
  patrickDesc.getText().getTextStyle().setFontSize(12);
  
  // James Adams
  const jamesName = addTextShape(slide, 'James Adams', leftMargin + 500, topMargin, 400, 30);
  formatHeading(jamesName, COLOR_INFRASTRUCTURE_BLUE);
  
  const jamesDesc = addTextShape(slide,
    'Director of Infrastructure & Systems Engineering (Key Personnel)\nExpertise: Data Center Architecture, Virtualization, Storage Solutions, Cloud Migration',
    leftMargin + 500, topMargin + 35, 400, 80);
  formatBodyText(jamesDesc);
  jamesDesc.getText().getTextStyle().setFontSize(12);
  
  // Brian MacDonald
  topMargin = 300;
  const brianName = addTextShape(slide, 'Brian MacDonald', leftMargin, topMargin, 400, 30);
  formatHeading(brianName, COLOR_QUALITY_GREEN);
  
  const brianDesc = addTextShape(slide,
    'Managing Member, Compliance & Operations\nExpertise: ISO Compliance, Laboratory Accreditation, Audit Readiness, Quality Management',
    leftMargin, topMargin + 35, 400, 80);
  formatBodyText(brianDesc);
  brianDesc.getText().getTextStyle().setFontSize(12);
  
  // John Milso
  const johnName = addTextShape(slide, 'John Milso', leftMargin + 500, topMargin, 400, 30);
  formatHeading(johnName, COLOR_GOVERNANCE_PURPLE);
  
  const johnDesc = addTextShape(slide,
    'Director of Legal, Contracts & Risk Advisory (Key Personnel)\nExpertise: Commercial Contracts, Corporate Governance, M&A Due Diligence, Risk Management\nLicensed in Massachusetts and Rhode Island',
    leftMargin + 500, topMargin + 35, 400, 100);
  formatBodyText(johnDesc);
  johnDesc.getText().getTextStyle().setFontSize(12);
  
  // Note
  topMargin = 460;
  const note = addTextShape(slide, 'All leadership team members are available for proposals as key personnel.',
    leftMargin, topMargin, 900, 30);
  formatBodyText(note);
  note.getText().getTextStyle().setFontSize(12).setItalic(true);
  note.getText().getTextStyle().setForegroundColor(COLOR_TEXT_LIGHT.red, COLOR_TEXT_LIGHT.green, COLOR_TEXT_LIGHT.blue);
}

function createServicesSummarySlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Comprehensive Service Offerings', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  
  topMargin = 150;
  const servicesText = 'SECURITY PILLAR\n' +
    '• RMF Implementation & ATO Support\n' +
    '• STIG Compliance & Remediation\n' +
    '• Continuous Monitoring Programs\n' +
    '• Security Control Assessment\n\n' +
    'INFRASTRUCTURE PILLAR\n' +
    '• Data Center Design & Deployment\n' +
    '• Virtualization & Cloud Migration\n' +
    '• Storage & Backup Solutions\n' +
    '• Infrastructure as Code (IaC)\n\n' +
    'QUALITY PILLAR\n' +
    '• ISO Compliance (9001, 17025, 27001)\n' +
    '• Laboratory Accreditation\n' +
    '• Audit Readiness Programs\n' +
    '• Quality Management Systems\n\n' +
    'GOVERNANCE PILLAR\n' +
    '• Contract Management & Analysis\n' +
    '• Legal Document Generation\n' +
    '• Risk Analysis & Mitigation\n' +
    '• Corporate Governance';
  
  const services = addTextShape(slide, servicesText, leftMargin, topMargin, 900, 500);
  formatBulletText(services);
  
  // Highlight automation
  const automation = addTextShape(slide,
    'Many services are supported by proprietary automation tools that accelerate delivery and ensure consistency.',
    leftMargin, topMargin + 520, 900, 40);
  formatBodyText(automation);
  automation.getText().getTextStyle().setFontSize(14);
  automation.getText().getTextStyle().setForegroundColor(COLOR_ACCENT.red, COLOR_ACCENT.green, COLOR_ACCENT.blue);
  automation.getText().getTextStyle().setBold(true);
}

function createAutomationPlatformsSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Automation Platforms & Tools', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  
  // Introduction
  topMargin = 130;
  const intro = addTextShape(slide,
    'Our services are enhanced by proprietary automation tools organized by expertise domains:',
    leftMargin, topMargin, 900, 40);
  formatBodyText(intro);
  
  topMargin = 190;
  const platformsText = 'SECURITY DOMAIN (5 modules)\n' +
    '• RMF Requirements Management & Traceability Platform\n' +
    '• Security Architecture & Baseline Controls Platform\n' +
    '• Vulnerability Management & Compliance Scanning Platform\n' +
    '• Security Documentation & CDRL Automation Platform\n' +
    '• Cybersecurity Team Leadership & Performance Platform\n\n' +
    'INFRASTRUCTURE DOMAIN (7 modules)\n' +
    '• Data Center Deployment Automation Module\n' +
    '• Infrastructure Health Monitoring & Predictive Analytics\n' +
    '• Network Configuration Automation Module\n' +
    '• Change Management & Impact Analysis Module\n\n' +
    'QUALITY DOMAIN (7 modules)\n' +
    '• ISO 17025/9001 Compliance Automation Platform\n' +
    '• Laboratory & Metrology Management Platform\n' +
    '• Regulatory Audit Readiness & Documentation Platform\n\n' +
    'GOVERNANCE DOMAIN (7 modules)\n' +
    '• Contract Management & Analysis Automation Platform\n' +
    '• Legal Document Generation & Review Platform\n' +
    '• Contract Risk Analysis & Mitigation Module';
  
  const platforms = addTextShape(slide, platformsText, leftMargin, topMargin, 900, 450);
  formatBulletText(platforms);
  platforms.getText().getTextStyle().setFontSize(12);
}

function createCMMCComplianceSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'CMMC Level 2 Compliance', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  
  // Status
  topMargin = 150;
  const status = addTextShape(slide, 'Current Status: ✅ CMMC Level 2 Implementation Complete',
    leftMargin, topMargin, 900, 40);
  formatHeading(status, COLOR_QUALITY_GREEN);
  
  // Overview
  topMargin = 210;
  const overviewText = 'MacTech Solutions maintains CMMC Level 2 compliance for systems processing Federal Contract Information (FCI) and Controlled Unclassified Information (CUI).\n\n' +
    'Compliance Framework: CMMC 2.0 Level 2 (Advanced)\n' +
    'Reference Standard: NIST SP 800-171 Rev. 2\n' +
    'Total Controls: 110 NIST SP 800-171 Rev. 2 requirements';
  
  const overview = addTextShape(slide, overviewText, leftMargin, topMargin, 900, 120);
  formatBodyText(overview);
  
  // Key Features
  topMargin = 350;
  const featuresLabel = addTextShape(slide, 'Key Features Implemented:', leftMargin, topMargin, 900, 30);
  formatHeading(featuresLabel, COLOR_TEXT_DARK);
  
  topMargin = 390;
  const featuresText = '• Multi-Factor Authentication (MFA) for privileged accounts\n' +
    '• Account lockout after failed login attempts\n' +
    '• Comprehensive audit logging with 90-day retention\n' +
    '• CUI file storage and protection with password protection\n' +
    '• Separation of duties with role-based access control\n' +
    '• POA&M tracking and management system\n' +
    '• Automated compliance audit system with control verification';
  
  const features = addTextShape(slide, featuresText, leftMargin, topMargin, 900, 200);
  formatBulletText(features);
}

function createCMMCControlBreakdownSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'CMMC Level 2 Control Implementation Status', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  
  // Overall Readiness
  topMargin = 150;
  const readiness = addTextShape(slide, 'Overall Readiness: 97% (Implemented + Inherited)',
    leftMargin, topMargin, 900, 40);
  formatHeading(readiness, COLOR_QUALITY_GREEN);
  
  // Create table using text boxes (Google Slides doesn't have easy table API)
  topMargin = 210;
  const tableData = [
    ['Status', 'Count', 'Percentage'],
    ['Implemented', '81 controls', '74%'],
    ['Inherited', '12 controls', '11%'],
    ['Not Implemented (POA&M)', '3 controls', '3%'],
    ['Not Applicable', '14 controls', '13%']
  ];
  
  const colWidth = 280;
  const rowHeight = 50;
  
  for (let row = 0; row < tableData.length; row++) {
    for (let col = 0; col < 3; col++) {
      const xPos = leftMargin + col * colWidth;
      const yPos = topMargin + row * rowHeight;
      const cell = slide.insertTextBox(tableData[row][col], xPos, yPos, colWidth - 10, rowHeight - 5);
      
      if (row === 0) {
        // Header row
        cell.getText().getTextStyle()
          .setFontSize(14)
          .setBold(true)
          .setForegroundColor(1, 1, 1);
        const bg = cell.getFill();
        bg.setSolidFill(COLOR_PRIMARY_DARK.red, COLOR_PRIMARY_DARK.green, COLOR_PRIMARY_DARK.blue);
      } else {
        // Data rows
        cell.getText().getTextStyle()
          .setFontSize(12)
          .setForegroundColor(COLOR_TEXT_DARK.red, COLOR_TEXT_DARK.green, COLOR_TEXT_DARK.blue);
      }
    }
  }
  
  // Control Family Readiness
  topMargin = 470;
  const familyLabel = addTextShape(slide, 'Control Family Readiness (100% = Fully Ready):',
    leftMargin, topMargin, 900, 30);
  formatHeading(familyLabel, COLOR_TEXT_DARK);
  
  topMargin = 510;
  const readinessText = '• Access Control (AC): 100% readiness\n' +
    '• Audit and Accountability (AU): 100% readiness\n' +
    '• Identification and Authentication (IA): 90% readiness\n' +
    '• Configuration Management (CM): 100% readiness\n' +
    '• System and Information Integrity (SI): 100% readiness\n' +
    '• All other families: 90%+ readiness';
  
  const familyReadiness = addTextShape(slide, readinessText, leftMargin, topMargin, 900, 150);
  formatBulletText(familyReadiness);
}

function createContactSlide(presentation) {
  const slide = presentation.appendSlide();
  const leftMargin = 50;
  let topMargin = 50;
  
  // Title
  const title = addTextShape(slide, 'Ready to Work Together?', leftMargin, topMargin, 900, 60);
  formatTitle(title);
  
  // Main message
  topMargin = 170;
  const message = addTextShape(slide,
    'Our leadership team is available for proposals and can be named as key personnel.',
    leftMargin, topMargin, 900, 50);
  formatBodyText(message);
  message.getText().getTextStyle().setFontSize(18);
  
  // Contact information
  topMargin = 250;
  const contactText = 'Contact Us\n\n' +
    'For proposals, key personnel availability, and service inquiries:\n\n' +
    'Website: www.mactechsolutions.com\n' +
    'Email: Contact form available on website\n' +
    'Security Incidents: security@mactechsolutions.com';
  
  const contact = addTextShape(slide, contactText, leftMargin, topMargin, 900, 250);
  formatBodyText(contact);
  
  // Call to action
  topMargin = 530;
  const cta = addTextShape(slide,
    'Let\'s discuss how MacTech can help you achieve authorization, audit readiness, and operational confidence.',
    leftMargin, topMargin, 900, 60);
  formatBodyText(cta);
  cta.getText().getTextStyle().setFontSize(16);
  cta.getText().getTextStyle().setForegroundColor(COLOR_ACCENT.red, COLOR_ACCENT.green, COLOR_ACCENT.blue);
  cta.getText().getTextStyle().setBold(true);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addTextShape(slide, text, left, top, width, height) {
  const shape = slide.insertTextBox(text, left, top, width, height);
  return shape;
}

function formatTitle(shape) {
  shape.getText().getTextStyle()
    .setFontFamily(FONT_TITLE)
    .setFontSize(FONT_SIZE_TITLE)
    .setBold(true)
    .setForegroundColor(COLOR_PRIMARY_DARK.red, COLOR_PRIMARY_DARK.green, COLOR_PRIMARY_DARK.blue);
}

function formatHeading(shape, color) {
  shape.getText().getTextStyle()
    .setFontFamily(FONT_BODY)
    .setFontSize(FONT_SIZE_HEADING)
    .setBold(true)
    .setForegroundColor(color.red, color.green, color.blue);
}

function formatBodyText(shape) {
  shape.getText().getTextStyle()
    .setFontFamily(FONT_BODY)
    .setFontSize(FONT_SIZE_BODY)
    .setForegroundColor(COLOR_TEXT_DARK.red, COLOR_TEXT_DARK.green, COLOR_TEXT_DARK.blue);
}

function formatBulletText(shape) {
  const textStyle = shape.getText().getTextStyle();
  textStyle
    .setFontFamily(FONT_BODY)
    .setFontSize(FONT_SIZE_BULLET)
    .setForegroundColor(COLOR_TEXT_DARK.red, COLOR_TEXT_DARK.green, COLOR_TEXT_DARK.blue);
  
  // Set bullet formatting for lines starting with bullet character
  try {
    const paragraphs = shape.getText().getParagraphs();
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      // Get paragraph text from the range
      const paraRange = para.getRange();
      const paraText = paraRange.asString().trim();
      
      if (paraText.length > 0) {
        try {
          const paraStyle = para.getParagraphStyle();
          // Set bullet for lines that start with bullet character
          if (paraText.startsWith('•')) {
            paraStyle.setBulletGlyph('•');
          }
          paraStyle.setIndentStart(20);
          paraStyle.setIndentFirstLine(-20);
        } catch (e) {
          // If bullet formatting fails, continue without it
          Logger.log('Bullet formatting note for paragraph ' + i + ': ' + e.toString());
        }
      }
    }
  } catch (e) {
    // If paragraph formatting fails entirely, just continue with basic formatting
    Logger.log('Note: Could not apply bullet formatting, using basic text formatting');
  }
}

function centerShape(shape) {
  shape.setLeft((SLIDE_WIDTH - shape.getWidth()) / 2);
}
