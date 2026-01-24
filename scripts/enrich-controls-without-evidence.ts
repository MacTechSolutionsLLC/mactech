/**
 * Enrich Controls Without Evidence Files
 * 
 * For controls without MAC-RPT evidence files, extract code from source files
 * based on SCTM references and add implementation details.
 */

import * as fs from 'fs';
import * as path from 'path';

interface SCTMControl {
  id: string;
  evidence: string;
  implementation: string;
}

function parseSCTM(sctmPath: string): Map<string, SCTMControl> {
  const controls = new Map<string, SCTMControl>();
  const content = fs.readFileSync(sctmPath, 'utf8');
  
  // Parse table rows: | 3.X.Y | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
  const tableRowRegex = /^\| (3\.\d+\.\d+) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$/gm;
  
  let match;
  while ((match = tableRowRegex.exec(content)) !== null) {
    const [, id, , , , , evidence, implementation] = match;
    controls.set(id.trim(), {
      id: id.trim(),
      evidence: evidence.trim(),
      implementation: implementation.trim(),
    });
  }
  
  return controls;
}

function extractCodeFromSourceFile(filePath: string, maxLines: number = 80): string | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (lines.length <= maxLines) {
      return content;
    }
    
    return lines.slice(0, maxLines).join('\n') + '\n// ... (truncated)';
  } catch (err) {
    return null;
  }
}

function extractFilePaths(text: string): string[] {
  const files: string[] = [];
  // Look for file references like lib/auth.ts, middleware.ts, etc.
  const patterns = [
    /([a-zA-Z0-9_/.-]+\.(ts|tsx|js|prisma|jsx))/g,
    /`([a-zA-Z0-9_/.-]+\.(ts|tsx|js|prisma|jsx))`/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const filePath = match[1] || match[0];
      if (!files.includes(filePath) && !filePath.includes('MAC-RPT')) {
        files.push(filePath);
      }
    }
  }
  
  return files;
}

function enrichControlWithoutEvidence(
  controlFilePath: string,
  controlId: string,
  sctmControl: SCTMControl,
  baseDir: string
): void {
  let content = fs.readFileSync(controlFilePath, 'utf8');
  
  // Check if already has evidence files
  if (content.includes('MAC-RPT') && !content.includes('No dedicated MAC-RPT evidence file')) {
    return; // Already has evidence
  }
  
  // Extract file references from SCTM
  const fileRefs = [
    ...extractFilePaths(sctmControl.evidence),
    ...extractFilePaths(sctmControl.implementation),
  ];
  
  const uniqueFileRefs = Array.from(new Set(fileRefs));
  
  if (uniqueFileRefs.length === 0) {
    return; // No code files to extract
  }
  
  // Build code implementation section
  let codeSection = '';
  
  if (sctmControl.implementation !== '-') {
    codeSection += `**Implementation Details:**  
${sctmControl.implementation}

`;
  }
  
  if (uniqueFileRefs.length > 0) {
    codeSection += `**Source Code Files:**\n\n`;
    for (const fileRef of uniqueFileRefs.slice(0, 3)) {
      const fullPath = path.join(baseDir, fileRef);
      const code = extractCodeFromSourceFile(fullPath, 60);
      if (code) {
        const lang = fileRef.endsWith('.prisma') ? 'prisma' : 
                    fileRef.endsWith('.js') ? 'javascript' : 'typescript';
        codeSection += `**File:** \`${fileRef}\`\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
      } else {
        codeSection += `**File:** \`${fileRef}\` (see codebase for implementation)\n\n`;
      }
    }
  }
  
  // Update Section 4.1 if it's minimal
  const section41Match = content.match(/### 4\.1 Code Implementation[\s\S]*?(?=### 4\.2|##)/);
  if (section41Match && section41Match[0].length < 200) {
    // Replace minimal section with enriched content
    const newSection41 = `### 4.1 Code Implementation

${codeSection}`;
    content = content.replace(/### 4\.1 Code Implementation[\s\S]*?(?=### 4\.2|##)/, newSection41);
    
    // Update change history
    if (content.includes('**Change History:**')) {
      content = content.replace(
        /(\*\*Change History:\*\*\n- Version \d+\.\d+ \([\d-]+\): [^\n]+)/,
        '$1\n- Version 1.2 (2026-01-24): Added code snippets from source files'
      );
    }
    
    fs.writeFileSync(controlFilePath, content, 'utf8');
    console.log(`Enriched code for: ${path.basename(controlFilePath)}`);
  }
}

function main() {
  const baseDir = path.join(__dirname, '..');
  const sctmPath = path.join(baseDir, 'compliance/cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md');
  const controlsDir = path.join(baseDir, 'compliance/cmmc/level2/07-nist-controls');
  
  console.log('Parsing SCTM...');
  const sctmControls = parseSCTM(sctmPath);
  console.log(`Parsed ${sctmControls.size} controls from SCTM`);
  
  console.log('Enriching controls without evidence files...');
  const controlFiles = fs.readdirSync(controlsDir)
    .filter(f => f.startsWith('NIST-3.') && f.endsWith('.md'))
    .map(f => path.join(controlsDir, f));
  
  let enrichedCount = 0;
  for (const controlFile of controlFiles) {
    const match = path.basename(controlFile).match(/NIST-(3\.\d+\.\d+)_/);
    if (match) {
      const controlId = match[1];
      const sctmControl = sctmControls.get(controlId);
      if (sctmControl) {
        const content = fs.readFileSync(controlFile, 'utf8');
        // Only enrich if no evidence files
        if (content.includes('No dedicated MAC-RPT evidence file')) {
          enrichControlWithoutEvidence(controlFile, controlId, sctmControl, baseDir);
          enrichedCount++;
        }
      }
    }
  }
  
  console.log(`\nEnriched ${enrichedCount} controls with code from source files`);
}

main();
