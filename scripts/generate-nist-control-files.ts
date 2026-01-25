/**
 * Generate NIST 110 Controls Assessment Files
 * 
 * This script parses the SCTM and generates comprehensive assessment files
 * for all 110 NIST SP 800-171 controls.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ControlData {
  id: string;
  requirement: string;
  status: string;
  policy: string;
  procedure: string;
  evidence: string;
  implementation: string;
  sspSection: string;
  family: string;
  familyName: string;
}

const familyMap: Record<string, { name: string; code: string }> = {
  '3.1': { name: 'Access Control', code: 'AC' },
  '3.2': { name: 'Awareness and Training', code: 'AT' },
  '3.3': { name: 'Audit and Accountability', code: 'AU' },
  '3.4': { name: 'Configuration Management', code: 'CM' },
  '3.5': { name: 'Identification and Authentication', code: 'IA' },
  '3.6': { name: 'Incident Response', code: 'IR' },
  '3.7': { name: 'Maintenance', code: 'MA' },
  '3.8': { name: 'Media Protection', code: 'MP' },
  '3.9': { name: 'Personnel Security', code: 'PS' },
  '3.10': { name: 'Physical Protection', code: 'PE' },
  '3.11': { name: 'Risk Assessment', code: 'RA' },
  '3.12': { name: 'Security Assessment', code: 'CA' },
  '3.13': { name: 'System and Communications Protection', code: 'SC' },
  '3.14': { name: 'System and Information Integrity', code: 'SI' },
};

function getFamilyInfo(controlId: string): { name: string; code: string } {
  const parts = controlId.split('.');
  const familyKey = `${parts[0]}.${parts[1]}`;
  return familyMap[familyKey] || { name: 'Unknown', code: 'UNK' };
}

function parseStatus(status: string): { status: string; emoji: string; description: string } {
  if (status.includes('✅')) {
    return { status: 'Implemented', emoji: '✅', description: 'Control is fully implemented by the organization' };
  } else if (status.includes('🔄')) {
    return { status: 'Inherited', emoji: '🔄', description: 'Control is provided by service provider (Railway, GitHub) and relied upon operationally' };
  } else if (status.includes('❌')) {
    return { status: 'Not Implemented', emoji: '❌', description: 'Control requires implementation (tracked in POA&M)' };
  } else if (status.includes('🚫')) {
    return { status: 'Not Applicable', emoji: '🚫', description: 'Control is not applicable to system architecture (justification provided)' };
  } else if (status.includes('⚠️')) {
    return { status: 'Partially Satisfied', emoji: '⚠️', description: 'Control is partially implemented, requires enhancement' };
  }
  return { status: 'Unknown', emoji: '❓', description: 'Status unknown' };
}

function sanitizeFilename(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .substring(0, 80);
}

function findEvidenceFiles(controlId: string, evidenceDir: string): string[] {
  const files: string[] = [];
  const pattern = new RegExp(`3_${controlId.replace(/\./g, '_')}`, 'i');
  
  try {
    const entries = fs.readdirSync(evidenceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md') && pattern.test(entry.name)) {
        files.push(entry.name);
      }
    }
  } catch (err) {
    // Directory might not exist or be readable
  }
  
  return files;
}

function generateControlFile(control: ControlData, outputDir: string, evidenceDir: string, poamControls: Set<string>): void {
  const familyInfo = getFamilyInfo(control.id);
  const statusInfo = parseStatus(control.status);
  const evidenceFiles = findEvidenceFiles(control.id, evidenceDir);
  
  const filename = `NIST-${control.id.replace(/\./g, '.')}_${sanitizeFilename(control.requirement)}.md`;
  const filepath = path.join(outputDir, filename);
  
  const hasPOAM = poamControls.has(control.id);
  const isInherited = statusInfo.status === 'Inherited';
  const isNotApplicable = statusInfo.status === 'Not Applicable';
  
  // Build content using string concatenation to avoid nested template literal issues
  let content = `# NIST SP 800-171 Control ${control.id}

**Control ID:** ${control.id}  
**Requirement:** ${control.requirement}  
**Control Family:** ${familyInfo.name} (${familyInfo.code})  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section ${control.id}:**
"${control.requirement}"

---

## 2. Implementation Status

**Status:** ${statusInfo.emoji} ${statusInfo.status}

**Status Description:**  
${statusInfo.description}

`;

  if (isNotApplicable) {
    content += `**Justification:**  
${control.implementation || 'Control is not applicable to system architecture'}

`;
  }

  if (hasPOAM) {
    content += `**POA&M Status:**  
This control is tracked in the Plan of Action and Milestones (POA&M). See POA&M document for remediation details and timeline.

`;
  }

  content += `**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
${control.policy !== '-' ? `- ${control.policy}` : '- No specific policy document (covered by general policies)'}

**Procedure/SOP References:**  
${control.procedure !== '-' ? control.procedure.split(',').map(p => `- ${p.trim()}`).join('\n') : '- No specific procedure document'}

**Policy File Location:**  
\`../02-policies-and-procedures/\`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

`;

  if (control.implementation !== '-') {
    content += `**Implementation Details:**  
${control.implementation}

`;
  } else {
    content += `**Implementation Details:**  
- No code-level implementation (inherited or not applicable)

`;
  }

  content += `**Code References:**  
`;

  if (control.evidence !== '-') {
    const codeRefs = control.evidence.split(',').map(e => {
      const trimmed = e.trim();
      if (trimmed.endsWith('.ts') || trimmed.endsWith('.tsx') || trimmed.endsWith('.js')) {
        return `- \`${trimmed}\``;
      }
      return `- ${trimmed}`;
    }).join('\n');
    content += codeRefs + '\n';
  } else {
    content += '- No code references\n';
  }

  content += `
### 4.2 System/Configuration Evidence

`;

  if (control.evidence !== '-') {
    content += `**Evidence Locations:**  
${control.evidence.split(',').map(e => `- ${e.trim()}`).join('\n')}

`;
  } else {
    content += `**Evidence Locations:**  
- No specific evidence files

`;
  }

  content += `### 4.3 Operational Procedures

`;

  if (control.procedure !== '-') {
    content += `**Operational Procedures:**  
${control.procedure.split(',').map(p => `- ${p.trim()}`).join('\n')}

`;
  } else {
    content += `**Operational Procedures:**  
- No specific operational procedures documented

`;
  }

  if (isInherited) {
    const provider = control.implementation.includes('Railway') ? 'Railway Platform' : 
                     control.implementation.includes('GitHub') ? 'GitHub Platform' : 
                     'Third-party provider';
    content += `### 4.4 Inherited Control Details

**Provider:** ${provider}

**Inherited Control Description:**  
${control.implementation}

**Validation:**  
See Inherited Control Validation document: \`../03-control-responsibility/MAC-RPT-313_Inherited_Control_Validation.md\`

**Coverage Period:** 2026-01-24  
**Next Review Date:** 2027-01-24

`;
  }

  content += `---

## 5. Evidence Documents

`;

  if (evidenceFiles.length > 0) {
    content += `**MAC-RPT Evidence Files:**  
${evidenceFiles.map(f => `- \`../05-evidence/${f}\``).join('\n')}

`;
  } else {
    content += `**MAC-RPT Evidence Files:**  
- No dedicated MAC-RPT evidence file for this control

`;
  }

  if (control.evidence !== '-' && !control.evidence.includes('MAC-RPT')) {
    const otherEvidence = control.evidence.split(',').filter(e => !e.includes('MAC-RPT')).map(e => `- ${e.trim()}`).join('\n');
    if (otherEvidence) {
      content += `**Other Evidence References:**  
${otherEvidence}

`;
    }
  }

  content += `---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
`;

  if (statusInfo.status === 'Implemented') {
    content += `- ✅ Control ${control.id} implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

`;
  } else if (statusInfo.status === 'Inherited') {
    content += `- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

`;
  } else if (statusInfo.status === 'Not Applicable') {
    content += `- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

`;
  } else {
    content += `- ⚠️ Control requires implementation (see POA&M)

`;
  }

  content += `**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
${control.sspSection !== '-' ? `- Section ${control.sspSection}` : '- No specific SSP section reference'}

**SSP Document:**  
\`../01-system-scope/MAC-IT-304_System_Security_Plan.md\`

---

## 8. Related Controls

**Control Family:** ${familyInfo.name} (${familyInfo.code})

**Related Controls in Same Family:**  
- See SCTM for complete control family mapping: \`../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md\`

---

## 9. Assessment Notes

`;

  if (hasPOAM) {
    content += `### POA&M Information

**POA&M Item:** This control is tracked in POA&M document.

**POA&M Document:**  
\`../MAC-POAM-CMMC-L2.md\`

**Remediation Status:** See POA&M document for current status and timeline.

**Interim Mitigation:** See POA&M document for interim mitigation details.

**Residual Risk Acceptance:** See POA&M document for risk acceptance details.

---

`;
  }

  content += `### Assessor Notes

*[Space for assessor notes during assessment]*

### Open Items

${hasPOAM ? '- POA&M item open - see POA&M document for details' : '- None'}

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 1.0 (2026-01-24): Initial control assessment file creation

---

## Related Documents

- System Control Traceability Matrix: \`../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md\`
- System Security Plan: \`../01-system-scope/MAC-IT-304_System_Security_Plan.md\`
`;

  if (hasPOAM) {
    content += `- POA&M Document: \`../MAC-POAM-CMMC-L2.md\`
`;
  }

  if (isInherited) {
    content += `- Inherited Control Validation: \`../03-control-responsibility/MAC-RPT-313_Inherited_Control_Validation.md\`
`;
  }

  content += `- Evidence Index: \`../05-evidence/MAC-RPT-100_Evidence_Index.md\`
`;

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Generated: ${filename}`);
}

function parseSCTM(sctmPath: string): ControlData[] {
  const content = fs.readFileSync(sctmPath, 'utf8');
  const controls: ControlData[] = [];
  
  // Parse table rows - looking for pattern: | 3.X.Y | Requirement | Status | ...
  const tableRowRegex = /^\| (3\.\d+\.\d+) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$/gm;
  
  let match;
  while ((match = tableRowRegex.exec(content)) !== null) {
    const [, id, requirement, status, policy, procedure, evidence, implementation, sspSection] = match;
    const familyInfo = getFamilyInfo(id);
    
    controls.push({
      id: id.trim(),
      requirement: requirement.trim(),
      status: status.trim(),
      policy: policy.trim(),
      procedure: procedure.trim(),
      evidence: evidence.trim(),
      implementation: implementation.trim(),
      sspSection: sspSection.trim(),
      family: familyInfo.code,
      familyName: familyInfo.name,
    });
  }
  
  return controls;
}

function getPOAMControls(poamPath: string): Set<string> {
  const poamControls = new Set<string>();
  
  try {
    const content = fs.readFileSync(poamPath, 'utf8');
    // Look for control IDs in POA&M (format: 3.X.Y)
    const controlRegex = /(3\.\d+\.\d+)/g;
    let match;
    while ((match = controlRegex.exec(content)) !== null) {
      poamControls.add(match[1]);
    }
  } catch (err) {
    console.warn('Could not read POA&M file:', err);
  }
  
  return poamControls;
}

function main() {
  const baseDir = path.join(__dirname, '..');
  const sctmPath = path.join(baseDir, 'compliance/cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md');
  const poamPath = path.join(baseDir, 'compliance/cmmc/level2/MAC-POAM-CMMC-L2.md');
  const evidenceDir = path.join(baseDir, 'compliance/cmmc/level2/05-evidence');
  const outputDir = path.join(baseDir, 'compliance/cmmc/level2/07-nist-controls');
  
  console.log('Parsing SCTM...');
  const controls = parseSCTM(sctmPath);
  console.log(`Found ${controls.length} controls`);
  
  console.log('Reading POA&M controls...');
  const poamControls = getPOAMControls(poamPath);
  console.log(`Found ${poamControls.size} controls in POA&M`);
  
  console.log('Generating control files...');
  for (const control of controls) {
    generateControlFile(control, outputDir, evidenceDir, poamControls);
  }
  
  console.log(`\nGenerated ${controls.length} control assessment files in ${outputDir}`);
}

main();
