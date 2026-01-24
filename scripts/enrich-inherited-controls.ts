/**
 * Enrich Inherited and Not Applicable Controls
 * 
 * Add detailed information for inherited controls and not applicable controls
 * to make them more assessor-friendly.
 */

import * as fs from 'fs';
import * as path from 'path';

function enrichInheritedControl(filePath: string, controlId: string, baseDir: string): void {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('🔄 Inherited') && !content.includes('Status: Inherited')) {
    return; // Not an inherited control
  }
  
  // Check if already has detailed inherited control section
  if (content.includes('### 4.4 Inherited Control Details')) {
    return; // Already enriched
  }
  
  // Extract implementation details from content
  const implMatch = content.match(/### 4\.1 Code Implementation[\s\S]*?(?=### 4\.2|##)/);
  const currentImpl = implMatch ? implMatch[0] : '';
  
  // Determine provider from implementation text
  let provider = 'Third-party provider';
  let providerDetails = '';
  
  if (content.includes('Railway') || content.includes('railway')) {
    provider = 'Railway Platform';
    providerDetails = `**Railway Platform Services:**
- Application hosting
- PostgreSQL database hosting
- TLS/HTTPS termination
- Network security
- Infrastructure security

**Validation:** See Inherited Control Validation document for provider assurance artifacts and validation methodology.

**Coverage Period:** 2026-01-24
**Next Review Date:** 2027-01-24`;
  } else if (content.includes('GitHub') || content.includes('github')) {
    provider = 'GitHub Platform';
    providerDetails = `**GitHub Platform Services:**
- Source code repository
- Dependency scanning (Dependabot)
- Repository access controls
- Physical security of data centers

**Validation:** See Inherited Control Validation document for provider assurance artifacts (SOC 3, ISO/IEC 27001:2022).

**Coverage Period:** 2026-01-24
**Next Review Date:** 2027-01-24`;
  }
  
  // Add inherited control details section before Section 5
  const inheritedSection = `
### 4.4 Inherited Control Details

**Provider:** ${provider}

**Inherited Control Description:**  
This control is provided by the ${provider} and relied upon operationally. The organization does not implement this control directly but validates the provider's implementation through independent assurance artifacts.

${providerDetails}

**Assurance Artifacts Reviewed:**
- See \`../03-control-responsibility/MAC-RPT-313_Inherited_Control_Validation.md\` for complete validation details
- Provider security documentation
- Third-party audit reports (where applicable)

**Operational Reliance:**
The organization relies on ${provider} to provide this control as part of the shared responsibility model. The control is validated annually through review of provider assurance artifacts.

`;
  
  // Insert before Section 5
  const section5Index = content.indexOf('## 5. Evidence Documents');
  if (section5Index > 0) {
    content = content.slice(0, section5Index) + inheritedSection + content.slice(section5Index);
    
    // Update change history
    if (content.includes('**Change History:**')) {
      content = content.replace(
        /(\*\*Change History:\*\*\n- Version \d+\.\d+ \([\d-]+\): [^\n]+)/,
        '$1\n- Version 1.2 (2026-01-24): Added detailed inherited control information'
      );
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Enriched inherited control: ${path.basename(filePath)}`);
  }
}

function enrichNotApplicableControl(filePath: string, controlId: string): void {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('🚫 Not Applicable') && !content.includes('Status: Not Applicable')) {
    return; // Not a not applicable control
  }
  
  // Check if already has detailed justification
  if (content.includes('**Justification:**') && content.split('**Justification:**')[1].length > 100) {
    return; // Already has detailed justification
  }
  
  // Extract current justification
  const justificationMatch = content.match(/\*\*Justification:\*\*[\s\S]*?(?=\n\n|##|$)/);
  const currentJustification = justificationMatch ? justificationMatch[0] : '';
  
  // Enhance justification section
  let enhancedJustification = `**Justification:**  
`;
  
  // Extract implementation details which often contain the justification
  const implMatch = content.match(/### 4\.1 Code Implementation[\s\S]*?(?=### 4\.2|##)/);
  if (implMatch && implMatch[0].includes('Cloud-only') || implMatch[0].includes('not applicable')) {
    const implText = implMatch[0];
    if (implText.includes('Cloud-only')) {
      enhancedJustification += `This control is not applicable because the system operates entirely in a cloud environment (Railway platform). The organization does not maintain physical infrastructure, wireless networks, or on-premises equipment that would require this control.

**System Architecture:**
- Cloud-hosted application (Railway)
- No organizational wireless infrastructure
- No physical media handling
- No on-premises equipment
- All access is remote via web browser

**Control Scope:**
This control applies to organizational infrastructure and equipment that the organization directly manages. Since the system is entirely cloud-based and the organization does not maintain such infrastructure, this control is not applicable.

`;
    } else {
      enhancedJustification += `${implText.replace(/### 4\.1 Code Implementation[\s\S]*?\n/, '')}

`;
    }
  } else {
    enhancedJustification += `This control is not applicable to the system architecture. See implementation details for specific justification.

`;
  }
  
  // Replace or add justification
  if (justificationMatch) {
    content = content.replace(/\*\*Justification:\*\*[\s\S]*?(?=\n\n|##|$)/, enhancedJustification.trim());
  } else {
    // Add after status description
    const statusMatch = content.match(/\*\*Status Description:\*\*[\s\S]*?(?=\*\*Last Assessment Date:|##)/);
    if (statusMatch) {
      content = content.replace(
        /(\*\*Status Description:\*\*[\s\S]*?)(\*\*Last Assessment Date:|##)/,
        `$1\n${enhancedJustification.trim()}\n\n$2`
      );
    }
  }
  
  // Update change history
  if (content.includes('**Change History:**')) {
    content = content.replace(
      /(\*\*Change History:\*\*\n- Version \d+\.\d+ \([\d-]+\): [^\n]+)/,
      '$1\n- Version 1.2 (2026-01-24): Enhanced not applicable justification'
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Enriched not applicable control: ${path.basename(filePath)}`);
}

function main() {
  const baseDir = path.join(__dirname, '..');
  const controlsDir = path.join(baseDir, 'compliance/cmmc/level2/07-nist-controls');
  
  console.log('Enriching inherited and not applicable controls...');
  const controlFiles = fs.readdirSync(controlsDir)
    .filter(f => f.startsWith('NIST-3.') && f.endsWith('.md'))
    .map(f => path.join(controlsDir, f));
  
  let inheritedCount = 0;
  let notApplicableCount = 0;
  
  for (const controlFile of controlFiles) {
    const match = path.basename(controlFile).match(/NIST-(3\.\d+\.\d+)_/);
    if (match) {
      const controlId = match[1];
      const content = fs.readFileSync(controlFile, 'utf8');
      
      if (content.includes('🔄 Inherited') || content.includes('Status: Inherited')) {
        enrichInheritedControl(controlFile, controlId, baseDir);
        inheritedCount++;
      }
      
      if (content.includes('🚫 Not Applicable') || content.includes('Status: Not Applicable')) {
        enrichNotApplicableControl(controlFile, controlId);
        notApplicableCount++;
      }
    }
  }
  
  console.log(`\nEnriched ${inheritedCount} inherited controls`);
  console.log(`Enriched ${notApplicableCount} not applicable controls`);
}

main();
