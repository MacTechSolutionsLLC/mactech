Attribute VB_Name = "MacTechPowerPointGenerator"
' MacTech Solutions PowerPoint Presentation Generator
' This VBA module creates a comprehensive presentation showcasing
' MacTech Solutions, its services, leadership, offerings, and CMMC Level 2 compliance
'
' Usage: Run CreateMacTechPresentation() subroutine
' Requirements: Microsoft PowerPoint must be installed

Option Explicit

' ============================================================================
' DESIGN CONSTANTS
' ============================================================================

' Color Scheme - RGB Values
Const COLOR_PRIMARY_DARK As Long = RGB(0, 51, 102)      ' Dark Blue/Navy
Const COLOR_SECURITY_RED As Long = RGB(185, 28, 28)     ' Red for Security Pillar
Const COLOR_INFRASTRUCTURE_BLUE As Long = RGB(29, 78, 216) ' Blue for Infrastructure
Const COLOR_QUALITY_GREEN As Long = RGB(22, 101, 52)     ' Green for Quality
Const COLOR_GOVERNANCE_PURPLE As Long = RGB(126, 34, 206) ' Purple for Governance
Const COLOR_TEXT_DARK As Long = RGB(38, 38, 38)         ' Dark Gray for text
Const COLOR_TEXT_LIGHT As Long = RGB(115, 115, 115)     ' Light Gray for secondary text
Const COLOR_BACKGROUND As Long = RGB(255, 255, 255)     ' White background
Const COLOR_ACCENT As Long = RGB(59, 130, 246)          ' Accent Blue

' Font Settings
Const FONT_TITLE As String = "Calibri"
Const FONT_BODY As String = "Calibri"
Const FONT_SIZE_TITLE As Single = 44
Const FONT_SIZE_SUBTITLE As Single = 28
Const FONT_SIZE_HEADING As Single = 24
Const FONT_SIZE_BODY As Single = 16
Const FONT_SIZE_BULLET As Single = 14

' ============================================================================
' MAIN SUBROUTINE
' ============================================================================

Sub CreateMacTechPresentation()
    ' Main subroutine to create the complete MacTech presentation
    ' This orchestrates the creation of all slides
    
    Dim ppApp As Object
    Dim ppPres As Object
    Dim ppSlide As Object
    Dim savePath As String
    Dim fileName As String
    
    On Error GoTo ErrorHandler
    
    ' Initialize PowerPoint
    Set ppApp = CreateObject("PowerPoint.Application")
    ppApp.Visible = True
    
    ' Create new presentation (blank template)
    Set ppPres = ppApp.Presentations.Add
    
    ' Create all slides in sequence
    Call CreateTitleSlide(ppPres)
    Call CreateCompanyOverviewSlide(ppPres)
    Call CreatePillarsIntroductionSlide(ppPres)
    Call CreateSecurityPillarSlide(ppPres)
    Call CreateInfrastructurePillarSlide(ppPres)
    Call CreateQualityPillarSlide(ppPres)
    Call CreateGovernancePillarSlide(ppPres)
    Call CreateLeadershipTeamSlide(ppPres)
    Call CreateServicesSummarySlide(ppPres)
    Call CreateAutomationPlatformsSlide(ppPres)
    Call CreateCMMCComplianceSlide(ppPres)
    Call CreateCMMCControlBreakdownSlide(ppPres)
    Call CreateContactSlide(ppPres)
    
    ' Save presentation
    fileName = "MacTech_Presentation_" & Format(Now, "yyyymmdd_hhmmss") & ".pptx"
    ' Try Windows path first, then Mac path
    If Environ("USERPROFILE") <> "" Then
        savePath = Environ("USERPROFILE") & "\Documents\" & fileName
    ElseIf Environ("HOME") <> "" Then
        savePath = Environ("HOME") & "/Documents/" & fileName
    Else
        savePath = fileName ' Save in current directory
    End If
    
    ppPres.SaveAs savePath
    MsgBox "Presentation created successfully!" & vbCrLf & "Saved to: " & savePath, vbInformation, "Success"
    
    Exit Sub
    
ErrorHandler:
    MsgBox "Error creating presentation: " & Err.Description, vbCritical, "Error"
    If Not ppPres Is Nothing Then ppPres.Close
    If Not ppApp Is Nothing Then ppApp.Quit
End Sub

' ============================================================================
' SLIDE CREATION FUNCTIONS
' ============================================================================

Sub CreateTitleSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    
    ' Add title slide
    Set ppSlide = ppPres.Slides.Add(1, 1) ' ppLayoutTitle
    
    ' Title
    Set shp = ppSlide.Shapes(1)
    shp.TextFrame.TextRange.Text = "MacTech Solutions"
    With shp.TextFrame.TextRange.Font
        .Name = FONT_TITLE
        .Size = 60
        .Bold = True
        .Color.RGB = COLOR_PRIMARY_DARK
    End With
    shp.Left = (ppPres.PageSetup.SlideWidth - shp.Width) / 2
    shp.Top = ppPres.PageSetup.SlideHeight * 0.3
    
    ' Subtitle
    Set shp = ppSlide.Shapes(2)
    shp.TextFrame.TextRange.Text = "Cyber, Infrastructure, and Compliance" & vbCrLf & "Built for Mission-Critical Programs"
    With shp.TextFrame.TextRange.Font
        .Name = FONT_BODY
        .Size = FONT_SIZE_SUBTITLE
        .Color.RGB = COLOR_TEXT_DARK
    End With
    shp.Left = (ppPres.PageSetup.SlideWidth - shp.Width) / 2
    shp.Top = ppPres.PageSetup.SlideHeight * 0.5
    
    ' Add decorative line
    Set shp = ppSlide.Shapes.AddLine(ppPres.PageSetup.SlideWidth * 0.2, ppPres.PageSetup.SlideHeight * 0.65, _
                                     ppPres.PageSetup.SlideWidth * 0.8, ppPres.PageSetup.SlideHeight * 0.65)
    shp.Line.ForeColor.RGB = COLOR_ACCENT
    shp.Line.Weight = 3
End Sub

Sub CreateCompanyOverviewSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2) ' ppLayoutBlank
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "Company Overview", leftMargin, topMargin, 800, 60)
    FormatTitle shp
    
    ' Company Type
    Set shp = AddTextShape(ppSlide, "Veteran-Owned / SDVOSB (Pending)", leftMargin, topMargin + 100, 800, 40)
    FormatHeading shp, COLOR_ACCENT
    
    ' Mission Statement
    Set shp = AddTextShape(ppSlide, "Mission", leftMargin, topMargin + 180, 800, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Set shp = AddTextShape(ppSlide, "MacTech Solutions helps federal programs and defense contractors achieve authorization, audit readiness, and operational confidence through integrated technical and risk-aware delivery.", _
                          leftMargin, topMargin + 230, 800, 80)
    FormatBodyText shp
    
    ' Value Proposition
    Set shp = AddTextShape(ppSlide, "Our Value", leftMargin, topMargin + 350, 800, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim valueText As String
    valueText = "• Specialized in DoD Cybersecurity, Infrastructure Engineering, and Compliance" & vbCrLf & _
                "• Four pillars of expertise led by senior practitioners" & vbCrLf & _
                "• Automation-enhanced delivery for faster, consistent results" & vbCrLf & _
                "• CMMC Level 2 compliant organization (97% readiness)"
    
    Set shp = AddTextShape(ppSlide, valueText, leftMargin, topMargin + 400, 800, 150)
    FormatBulletText shp
End Sub

Sub CreatePillarsIntroductionSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    Dim pillarWidth As Single, pillarHeight As Single
    Dim i As Integer
    Dim pillarNames As Variant
    Dim pillarColors As Variant
    Dim pillarLeaders As Variant
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2) ' ppLayoutBlank
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "Our Four Pillars of Expertise", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    
    ' Introduction text
    Set shp = AddTextShape(ppSlide, "MacTech's leadership is organized into four pillars, each representing a core domain of expertise and led by a senior practitioner with deep experience in that area.", _
                          leftMargin, topMargin + 80, 900, 60)
    FormatBodyText shp
    
    ' Pillar boxes
    pillarNames = Array("Security", "Infrastructure", "Quality", "Governance")
    pillarColors = Array(COLOR_SECURITY_RED, COLOR_INFRASTRUCTURE_BLUE, COLOR_QUALITY_GREEN, COLOR_GOVERNANCE_PURPLE)
    pillarLeaders = Array("Patrick Caruso", "James Adams", "Brian MacDonald", "John Milso")
    
    pillarWidth = 200
    pillarHeight = 120
    topMargin = topMargin + 180
    
    For i = 0 To 3
        Dim xPos As Single, yPos As Single
        xPos = leftMargin + (i Mod 2) * (pillarWidth + 50)
        yPos = topMargin + Int(i / 2) * (pillarHeight + 50)
        
        ' Pillar box
        Set shp = ppSlide.Shapes.AddShape(1, xPos, yPos, pillarWidth, pillarHeight) ' msoShapeRectangle
        shp.Fill.ForeColor.RGB = pillarColors(i)
        shp.Line.Visible = False
        
        ' Pillar name
        Set shp = AddTextShape(ppSlide, pillarNames(i), xPos + 10, yPos + 10, pillarWidth - 20, 30)
        With shp.TextFrame.TextRange.Font
            .Name = FONT_BODY
            .Size = 20
            .Bold = True
            .Color.RGB = RGB(255, 255, 255)
        End With
        
        ' Leader name
        Set shp = AddTextShape(ppSlide, pillarLeaders(i), xPos + 10, yPos + 50, pillarWidth - 20, 25)
        With shp.TextFrame.TextRange.Font
            .Name = FONT_BODY
            .Size = 14
            .Color.RGB = RGB(255, 255, 255)
        End With
    Next i
End Sub

Sub CreateSecurityPillarSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title with color accent
    Set shp = AddTextShape(ppSlide, "Security Pillar", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    shp.TextFrame.TextRange.Font.Color.RGB = COLOR_SECURITY_RED
    
    ' Leader info
    Set shp = AddTextShape(ppSlide, "Led by Patrick Caruso • Director of Cyber Assurance", leftMargin, topMargin + 70, 900, 30)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 14
    shp.TextFrame.TextRange.Font.Italic = True
    
    ' Services
    Set shp = AddTextShape(ppSlide, "Cybersecurity & RMF Services", leftMargin, topMargin + 120, 450, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim servicesText As String
    servicesText = "• RMF Step 1-6 implementation and documentation" & vbCrLf & _
                   "• Authorization to Operate (ATO) package development" & vbCrLf & _
                   "• Continuous Monitoring (ConMon) program design" & vbCrLf & _
                   "• STIG compliance assessment and remediation" & vbCrLf & _
                   "• Security Control Assessment (SCA) support" & vbCrLf & _
                   "• Plan of Action & Milestones (POA&M) development" & vbCrLf & _
                   "• System Security Plan (SSP) authoring" & vbCrLf & _
                   "• Risk Assessment Report (RAR) development"
    
    Set shp = AddTextShape(ppSlide, servicesText, leftMargin, topMargin + 170, 450, 300)
    FormatBulletText shp
    
    ' When You Need It
    Set shp = AddTextShape(ppSlide, "When You Need It", leftMargin + 500, topMargin + 120, 450, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim whenText As String
    whenText = "• New system requiring initial authorization" & vbCrLf & _
               "• ATO renewal approaching" & vbCrLf & _
               "• Failed security assessment or audit" & vbCrLf & _
               "• Major system changes requiring re-authorization" & vbCrLf & _
               "• Cloud migration or infrastructure modernization" & vbCrLf & _
               "• Compliance gaps identified" & vbCrLf & _
               "• Need for continuous monitoring program"
    
    Set shp = AddTextShape(ppSlide, whenText, leftMargin + 500, topMargin + 170, 450, 300)
    FormatBulletText shp
End Sub

Sub CreateInfrastructurePillarSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "Infrastructure Pillar", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    shp.TextFrame.TextRange.Font.Color.RGB = COLOR_INFRASTRUCTURE_BLUE
    
    ' Leader info
    Set shp = AddTextShape(ppSlide, "Led by James Adams • Director of Infrastructure & Systems Engineering", leftMargin, topMargin + 70, 900, 30)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 14
    shp.TextFrame.TextRange.Font.Italic = True
    
    ' Services
    Set shp = AddTextShape(ppSlide, "Infrastructure & Platform Engineering", leftMargin, topMargin + 120, 450, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim servicesText As String
    servicesText = "• Data center architecture and design" & vbCrLf & _
                   "• Virtualization platform implementation" & vbCrLf & _
                   "• Storage and backup solutions" & vbCrLf & _
                   "• Network architecture and security" & vbCrLf & _
                   "• Cloud migration planning and execution" & vbCrLf & _
                   "• Infrastructure as Code (IaC) development" & vbCrLf & _
                   "• Performance optimization and capacity planning" & vbCrLf & _
                   "• Disaster recovery and business continuity"
    
    Set shp = AddTextShape(ppSlide, servicesText, leftMargin, topMargin + 170, 450, 300)
    FormatBulletText shp
    
    ' When You Need It
    Set shp = AddTextShape(ppSlide, "When You Need It", leftMargin + 500, topMargin + 120, 450, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim whenText As String
    whenText = "• New system deployment" & vbCrLf & _
               "• Infrastructure modernization" & vbCrLf & _
               "• Cloud migration initiative" & vbCrLf & _
               "• Performance or capacity issues" & vbCrLf & _
               "• Need for better documentation" & vbCrLf & _
               "• Infrastructure not aligned with security requirements" & vbCrLf & _
               "• Preparing for authorization"
    
    Set shp = AddTextShape(ppSlide, whenText, leftMargin + 500, topMargin + 170, 450, 300)
    FormatBulletText shp
End Sub

Sub CreateQualityPillarSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "Quality Pillar", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    shp.TextFrame.TextRange.Font.Color.RGB = COLOR_QUALITY_GREEN
    
    ' Leader info
    Set shp = AddTextShape(ppSlide, "Led by Brian MacDonald • Managing Member, Compliance & Operations", leftMargin, topMargin + 70, 900, 30)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 14
    shp.TextFrame.TextRange.Font.Italic = True
    
    ' Services
    Set shp = AddTextShape(ppSlide, "Quality & Compliance Consulting", leftMargin, topMargin + 120, 450, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim servicesText As String
    servicesText = "• ISO 9001, 27001, and other standard implementation" & vbCrLf & _
                   "• Laboratory accreditation support (ISO 17025)" & vbCrLf & _
                   "• Audit readiness assessments" & vbCrLf & _
                   "• Quality management system development" & vbCrLf & _
                   "• Process documentation and standardization" & vbCrLf & _
                   "• Regulatory compliance programs" & vbCrLf & _
                   "• Metrology and calibration management"
    
    Set shp = AddTextShape(ppSlide, servicesText, leftMargin, topMargin + 170, 450, 300)
    FormatBulletText shp
    
    ' When You Need It
    Set shp = AddTextShape(ppSlide, "When You Need It", leftMargin + 500, topMargin + 120, 450, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim whenText As String
    whenText = "• Preparing for ISO certification" & vbCrLf & _
               "• Upcoming audit or inspection" & vbCrLf & _
               "• Need for quality management system" & vbCrLf & _
               "• Process improvement initiatives" & vbCrLf & _
               "• Regulatory compliance requirements" & vbCrLf & _
               "• Laboratory accreditation needs"
    
    Set shp = AddTextShape(ppSlide, whenText, leftMargin + 500, topMargin + 170, 450, 300)
    FormatBulletText shp
End Sub

Sub CreateGovernancePillarSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "Governance Pillar", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    shp.TextFrame.TextRange.Font.Color.RGB = COLOR_GOVERNANCE_PURPLE
    
    ' Leader info
    Set shp = AddTextShape(ppSlide, "Led by John Milso • Director of Legal, Contracts & Risk Advisory", leftMargin, topMargin + 70, 900, 30)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 14
    shp.TextFrame.TextRange.Font.Italic = True
    
    ' Services
    Set shp = AddTextShape(ppSlide, "Contracts & Risk Alignment", leftMargin, topMargin + 120, 450, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim servicesText As String
    servicesText = "• Commercial contracts (Software, Services, Vendors)" & vbCrLf & _
                   "• Corporate governance" & vbCrLf & _
                   "• M&A due diligence" & vbCrLf & _
                   "• Risk identification and mitigation" & vbCrLf & _
                   "• Vendor and subcontractor agreement alignment" & vbCrLf & _
                   "• Contractual readiness for cyber and compliance obligations" & vbCrLf & _
                   "• Legal document generation and review"
    
    Set shp = AddTextShape(ppSlide, servicesText, leftMargin, topMargin + 170, 450, 300)
    FormatBulletText shp
    
    ' When You Need It
    Set shp = AddTextShape(ppSlide, "When You Need It", leftMargin + 500, topMargin + 120, 450, 35)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim whenText As String
    whenText = "• Contract negotiation and review" & vbCrLf & _
               "• Vendor relationship management" & vbCrLf & _
               "• M&A activities" & vbCrLf & _
               "• Risk management initiatives" & vbCrLf & _
               "• Corporate governance needs" & vbCrLf & _
               "• Compliance alignment requirements"
    
    Set shp = AddTextShape(ppSlide, whenText, leftMargin + 500, topMargin + 170, 450, 300)
    FormatBulletText shp
End Sub

Sub CreateLeadershipTeamSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "Leadership Team", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    
    ' Patrick Caruso
    topMargin = topMargin + 100
    Set shp = AddTextShape(ppSlide, "Patrick Caruso", leftMargin, topMargin, 400, 30)
    FormatHeading shp, COLOR_SECURITY_RED
    Set shp = AddTextShape(ppSlide, "Director of Cyber Assurance (Key Personnel)" & vbCrLf & _
                          "Expertise: RMF Implementation, ATO Development, STIG Compliance, Continuous Monitoring", _
                          leftMargin, topMargin + 35, 400, 80)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 12
    
    ' James Adams
    Set shp = AddTextShape(ppSlide, "James Adams", leftMargin + 500, topMargin, 400, 30)
    FormatHeading shp, COLOR_INFRASTRUCTURE_BLUE
    Set shp = AddTextShape(ppSlide, "Director of Infrastructure & Systems Engineering (Key Personnel)" & vbCrLf & _
                          "Expertise: Data Center Architecture, Virtualization, Storage Solutions, Cloud Migration", _
                          leftMargin + 500, topMargin + 35, 400, 80)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 12
    
    ' Brian MacDonald
    topMargin = topMargin + 150
    Set shp = AddTextShape(ppSlide, "Brian MacDonald", leftMargin, topMargin, 400, 30)
    FormatHeading shp, COLOR_QUALITY_GREEN
    Set shp = AddTextShape(ppSlide, "Managing Member, Compliance & Operations" & vbCrLf & _
                          "Expertise: ISO Compliance, Laboratory Accreditation, Audit Readiness, Quality Management", _
                          leftMargin, topMargin + 35, 400, 80)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 12
    
    ' John Milso
    Set shp = AddTextShape(ppSlide, "John Milso", leftMargin + 500, topMargin, 400, 30)
    FormatHeading shp, COLOR_GOVERNANCE_PURPLE
    Set shp = AddTextShape(ppSlide, "Director of Legal, Contracts & Risk Advisory (Key Personnel)" & vbCrLf & _
                          "Expertise: Commercial Contracts, Corporate Governance, M&A Due Diligence, Risk Management" & vbCrLf & _
                          "Licensed in Massachusetts and Rhode Island", _
                          leftMargin + 500, topMargin + 35, 400, 100)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 12
    
    ' Note
    topMargin = topMargin + 160
    Set shp = AddTextShape(ppSlide, "All leadership team members are available for proposals as key personnel.", _
                          leftMargin, topMargin, 900, 30)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 12
    shp.TextFrame.TextRange.Font.Italic = True
    shp.TextFrame.TextRange.Font.Color.RGB = COLOR_TEXT_LIGHT
End Sub

Sub CreateServicesSummarySlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "Comprehensive Service Offerings", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    
    ' Services organized by pillar
    topMargin = topMargin + 100
    
    Dim servicesText As String
    servicesText = "SECURITY PILLAR" & vbCrLf & _
                   "• RMF Implementation & ATO Support" & vbCrLf & _
                   "• STIG Compliance & Remediation" & vbCrLf & _
                   "• Continuous Monitoring Programs" & vbCrLf & _
                   "• Security Control Assessment" & vbCrLf & vbCrLf & _
                   "INFRASTRUCTURE PILLAR" & vbCrLf & _
                   "• Data Center Design & Deployment" & vbCrLf & _
                   "• Virtualization & Cloud Migration" & vbCrLf & _
                   "• Storage & Backup Solutions" & vbCrLf & _
                   "• Infrastructure as Code (IaC)" & vbCrLf & vbCrLf & _
                   "QUALITY PILLAR" & vbCrLf & _
                   "• ISO Compliance (9001, 17025, 27001)" & vbCrLf & _
                   "• Laboratory Accreditation" & vbCrLf & _
                   "• Audit Readiness Programs" & vbCrLf & _
                   "• Quality Management Systems" & vbCrLf & vbCrLf & _
                   "GOVERNANCE PILLAR" & vbCrLf & _
                   "• Contract Management & Analysis" & vbCrLf & _
                   "• Legal Document Generation" & vbCrLf & _
                   "• Risk Analysis & Mitigation" & vbCrLf & _
                   "• Corporate Governance"
    
    Set shp = AddTextShape(ppSlide, servicesText, leftMargin, topMargin, 900, 500)
    FormatBulletText shp
    
    ' Highlight automation
    Set shp = AddTextShape(ppSlide, "Many services are supported by proprietary automation tools that accelerate delivery and ensure consistency.", _
                          leftMargin, topMargin + 520, 900, 40)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 14
    shp.TextFrame.TextRange.Font.Color.RGB = COLOR_ACCENT
    shp.TextFrame.TextRange.Font.Bold = True
End Sub

Sub CreateAutomationPlatformsSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "Automation Platforms & Tools", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    
    ' Introduction
    Set shp = AddTextShape(ppSlide, "Our services are enhanced by proprietary automation tools organized by expertise domains:", _
                          leftMargin, topMargin + 80, 900, 40)
    FormatBodyText shp
    
    ' Platforms by pillar
    topMargin = topMargin + 140
    
    Dim platformsText As String
    platformsText = "SECURITY DOMAIN (5 modules)" & vbCrLf & _
                   "• RMF Requirements Management & Traceability Platform" & vbCrLf & _
                   "• Security Architecture & Baseline Controls Platform" & vbCrLf & _
                   "• Vulnerability Management & Compliance Scanning Platform" & vbCrLf & _
                   "• Security Documentation & CDRL Automation Platform" & vbCrLf & _
                   "• Cybersecurity Team Leadership & Performance Platform" & vbCrLf & vbCrLf & _
                   "INFRASTRUCTURE DOMAIN (7 modules)" & vbCrLf & _
                   "• Data Center Deployment Automation Module" & vbCrLf & _
                   "• Infrastructure Health Monitoring & Predictive Analytics" & vbCrLf & _
                   "• Network Configuration Automation Module" & vbCrLf & _
                   "• Change Management & Impact Analysis Module" & vbCrLf & vbCrLf & _
                   "QUALITY DOMAIN (7 modules)" & vbCrLf & _
                   "• ISO 17025/9001 Compliance Automation Platform" & vbCrLf & _
                   "• Laboratory & Metrology Management Platform" & vbCrLf & _
                   "• Regulatory Audit Readiness & Documentation Platform" & vbCrLf & vbCrLf & _
                   "GOVERNANCE DOMAIN (7 modules)" & vbCrLf & _
                   "• Contract Management & Analysis Automation Platform" & vbCrLf & _
                   "• Legal Document Generation & Review Platform" & vbCrLf & _
                   "• Contract Risk Analysis & Mitigation Module"
    
    Set shp = AddTextShape(ppSlide, platformsText, leftMargin, topMargin, 900, 450)
    FormatBulletText shp
    shp.TextFrame.TextRange.Font.Size = 12
End Sub

Sub CreateCMMCComplianceSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "CMMC Level 2 Compliance", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    
    ' Status
    topMargin = topMargin + 100
    Set shp = AddTextShape(ppSlide, "Current Status: ✅ CMMC Level 2 Implementation Complete", leftMargin, topMargin, 900, 40)
    FormatHeading shp, COLOR_QUALITY_GREEN
    
    ' Overview
    topMargin = topMargin + 60
    Dim overviewText As String
    overviewText = "MacTech Solutions maintains CMMC Level 2 compliance for systems processing Federal Contract Information (FCI) and Controlled Unclassified Information (CUI)." & vbCrLf & vbCrLf & _
                   "Compliance Framework: CMMC 2.0 Level 2 (Advanced)" & vbCrLf & _
                   "Reference Standard: NIST SP 800-171 Rev. 2" & vbCrLf & _
                   "Total Controls: 110 NIST SP 800-171 Rev. 2 requirements"
    
    Set shp = AddTextShape(ppSlide, overviewText, leftMargin, topMargin, 900, 120)
    FormatBodyText shp
    
    ' Key Features
    topMargin = topMargin + 200
    Set shp = AddTextShape(ppSlide, "Key Features Implemented:", leftMargin, topMargin, 900, 30)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim featuresText As String
    featuresText = "• Multi-Factor Authentication (MFA) for privileged accounts" & vbCrLf & _
                   "• Account lockout after failed login attempts" & vbCrLf & _
                   "• Comprehensive audit logging with 90-day retention" & vbCrLf & _
                   "• CUI file storage and protection with password protection" & vbCrLf & _
                   "• Separation of duties with role-based access control" & vbCrLf & _
                   "• POA&M tracking and management system" & vbCrLf & _
                   "• Automated compliance audit system with control verification"
    
    Set shp = AddTextShape(ppSlide, featuresText, leftMargin, topMargin + 40, 900, 200)
    FormatBulletText shp
End Sub

Sub CreateCMMCControlBreakdownSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim tbl As Object
    Dim leftMargin As Single, topMargin As Single
    Dim i As Integer
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "CMMC Level 2 Control Implementation Status", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    
    ' Overall Readiness
    topMargin = topMargin + 100
    Set shp = AddTextShape(ppSlide, "Overall Readiness: 97% (Implemented + Inherited)", leftMargin, topMargin, 900, 40)
    FormatHeading shp, COLOR_QUALITY_GREEN
    
    ' Create table
    topMargin = topMargin + 60
    Set tbl = ppSlide.Shapes.AddTable(5, 3, leftMargin, topMargin, 900, 300).Table
    
    ' Header row
    tbl.Cell(1, 1).Shape.TextFrame.TextRange.Text = "Status"
    tbl.Cell(1, 2).Shape.TextFrame.TextRange.Text = "Count"
    tbl.Cell(1, 3).Shape.TextFrame.TextRange.Text = "Percentage"
    
    ' Format header
    For i = 1 To 3
        With tbl.Cell(1, i).Shape.TextFrame.TextRange.Font
            .Bold = True
            .Size = 14
            .Color.RGB = RGB(255, 255, 255)
        End With
        tbl.Cell(1, i).Shape.Fill.ForeColor.RGB = COLOR_PRIMARY_DARK
    Next i
    
    ' Data rows
    tbl.Cell(2, 1).Shape.TextFrame.TextRange.Text = "Implemented"
    tbl.Cell(2, 2).Shape.TextFrame.TextRange.Text = "81 controls"
    tbl.Cell(2, 3).Shape.TextFrame.TextRange.Text = "74%"
    
    tbl.Cell(3, 1).Shape.TextFrame.TextRange.Text = "Inherited"
    tbl.Cell(3, 2).Shape.TextFrame.TextRange.Text = "12 controls"
    tbl.Cell(3, 3).Shape.TextFrame.TextRange.Text = "11%"
    
    tbl.Cell(4, 1).Shape.TextFrame.TextRange.Text = "Not Implemented (POA&M)"
    tbl.Cell(4, 2).Shape.TextFrame.TextRange.Text = "3 controls"
    tbl.Cell(4, 3).Shape.TextFrame.TextRange.Text = "3%"
    
    tbl.Cell(5, 1).Shape.TextFrame.TextRange.Text = "Not Applicable"
    tbl.Cell(5, 2).Shape.TextFrame.TextRange.Text = "14 controls"
    tbl.Cell(5, 3).Shape.TextFrame.TextRange.Text = "13%"
    
    ' Format data rows
    Dim j As Integer
    For i = 2 To 5
        For j = 1 To 3
            With tbl.Cell(i, j).Shape.TextFrame.TextRange.Font
                .Size = 12
                .Color.RGB = COLOR_TEXT_DARK
            End With
            tbl.Cell(i, j).Shape.Fill.ForeColor.RGB = RGB(255, 255, 255)
        Next j
    Next i
    
    ' Control Family Readiness
    topMargin = topMargin + 320
    Set shp = AddTextShape(ppSlide, "Control Family Readiness (100% = Fully Ready):", leftMargin, topMargin, 900, 30)
    FormatHeading shp, COLOR_TEXT_DARK
    
    Dim readinessText As String
    readinessText = "• Access Control (AC): 100% readiness" & vbCrLf & _
                   "• Audit and Accountability (AU): 100% readiness" & vbCrLf & _
                   "• Identification and Authentication (IA): 90% readiness" & vbCrLf & _
                   "• Configuration Management (CM): 100% readiness" & vbCrLf & _
                   "• System and Information Integrity (SI): 100% readiness" & vbCrLf & _
                   "• All other families: 90%+ readiness"
    
    Set shp = AddTextShape(ppSlide, readinessText, leftMargin, topMargin + 40, 900, 150)
    FormatBulletText shp
End Sub

Sub CreateContactSlide(ppPres As Object)
    Dim ppSlide As Object
    Dim shp As Object
    Dim leftMargin As Single, topMargin As Single
    
    Set ppSlide = ppPres.Slides.Add(ppPres.Slides.Count + 1, 2)
    leftMargin = 50
    topMargin = 50
    
    ' Title
    Set shp = AddTextShape(ppSlide, "Ready to Work Together?", leftMargin, topMargin, 900, 60)
    FormatTitle shp
    
    ' Main message
    topMargin = topMargin + 120
    Set shp = AddTextShape(ppSlide, "Our leadership team is available for proposals and can be named as key personnel.", _
                          leftMargin, topMargin, 900, 50)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 18
    
    ' Contact information
    topMargin = topMargin + 100
    Dim contactText As String
    contactText = "Contact Us" & vbCrLf & vbCrLf & _
                  "For proposals, key personnel availability, and service inquiries:" & vbCrLf & vbCrLf & _
                  "Website: www.mactechsolutions.com" & vbCrLf & _
                  "Email: Contact form available on website" & vbCrLf & _
                  "Security Incidents: security@mactechsolutions.com"
    
    Set shp = AddTextShape(ppSlide, contactText, leftMargin, topMargin, 900, 250)
    FormatBodyText shp
    
    ' Call to action
    topMargin = topMargin + 280
    Set shp = AddTextShape(ppSlide, "Let's discuss how MacTech can help you achieve authorization, audit readiness, and operational confidence.", _
                          leftMargin, topMargin, 900, 60)
    FormatBodyText shp
    shp.TextFrame.TextRange.Font.Size = 16
    shp.TextFrame.TextRange.Font.Color.RGB = COLOR_ACCENT
    shp.TextFrame.TextRange.Font.Bold = True
End Sub

' ============================================================================
' HELPER FUNCTIONS
' ============================================================================

Function AddTextShape(ppSlide As Object, text As String, left As Single, top As Single, width As Single, height As Single) As Object
    ' Helper function to add a text shape to a slide
    Dim shp As Object
    Set shp = ppSlide.Shapes.AddTextbox(1, left, top, width, height) ' msoTextOrientationHorizontal
    shp.TextFrame.TextRange.Text = text
    shp.TextFrame.WordWrap = True
    shp.TextFrame.AutoSize = 0 ' ppAutoSizeNone
    Set AddTextShape = shp
End Function

Sub FormatTitle(shp As Object)
    ' Format a shape as a title
    With shp.TextFrame.TextRange.Font
        .Name = FONT_TITLE
        .Size = FONT_SIZE_TITLE
        .Bold = True
        .Color.RGB = COLOR_PRIMARY_DARK
    End With
End Sub

Sub FormatHeading(shp As Object, color As Long)
    ' Format a shape as a heading
    With shp.TextFrame.TextRange.Font
        .Name = FONT_BODY
        .Size = FONT_SIZE_HEADING
        .Bold = True
        .Color.RGB = color
    End With
End Sub

Sub FormatBodyText(shp As Object)
    ' Format a shape as body text
    With shp.TextFrame.TextRange.Font
        .Name = FONT_BODY
        .Size = FONT_SIZE_BODY
        .Color.RGB = COLOR_TEXT_DARK
    End With
End Sub

Sub FormatBulletText(shp As Object)
    ' Format a shape as bullet text
    With shp.TextFrame.TextRange.Font
        .Name = FONT_BODY
        .Size = FONT_SIZE_BULLET
        .Color.RGB = COLOR_TEXT_DARK
    End With
    ' Set bullet formatting
    With shp.TextFrame.TextRange.ParagraphFormat
        .Bullet.Type = 2 ' ppBulletUnnumbered
        .Bullet.Character = 8226 ' Bullet character
        .FirstLineIndent = -20
        .LeftIndent = 20
    End With
End Sub
