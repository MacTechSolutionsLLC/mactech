/**
 * Comprehensive Fix for Control Files
 * Fixes duplicates, formatting issues, and broken links
 */

import * as fs from 'fs';
import * as path from 'path';

function fixControlFile(filePath: string): void {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix duplicate change history entries - keep only unique ones
  if (content.includes('**Change History:**')) {
    const historyMatch = content.match(/(\*\*Change History:\*\*\n)((?:- Version [^\n]+\n)+)/);
    if (historyMatch) {
      const lines = historyMatch[2].split('\n').filter(l => l.trim());
      const uniqueLines = Array.from(new Set(lines));
      const newHistory = '**Change History:**\n' + uniqueLines.join('\n') + '\n';
      content = content.replace(/(\*\*Change History:\*\*\n)((?:- Version [^\n]+\n)+)/, newHistory);
      modified = true;
    }
  }
  
  // Fix duplicate "Last Verification Date" - keep only the first one in Section 6
  const section6Match = content.match(/## 6\. Testing and Verification[\s\S]*?(?=## 7\.|$)/);
  if (section6Match) {
    const section6 = section6Match[0];
    const verifyMatches = section6.match(/\*\*Last Verification Date:\*\*/g);
    if (verifyMatches && verifyMatches.length > 1) {
      // Replace the section with only one verification date
      let firstFound = false;
      const fixedSection6 = section6.replace(/\*\*Last Verification Date:\*\*[\s\S]*?(?=\n\n|##|$)/g, (match) => {
        if (!firstFound) {
          firstFound = true;
          return match;
        }
        return '';
      });
      content = content.replace(/## 6\. Testing and Verification[\s\S]*?(?=## 7\.|$)/, fixedSection6);
      modified = true;
    }
  }
  
  // Fix malformed section headers
  content = content.replace(/^####([A-Z])/gm, '#### $1'); // Fix "####Database" -> "#### Database"
  content = content.replace(/^###([A-Z])/gm, '### $1'); // Fix "###Implementation" -> "### Implementation"
  content = content.replace(/^##\s*2\.\s*Implementation Evidence/gm, '### 4.1 Code Implementation');
  content = content.replace(/^##\s*3\.\s*Implementation Details/gm, '### 4.1 Code Implementation');
  
  // Fix empty sections - add placeholder text
  if (content.includes('### 4.1 Code Implementation\n\n\n')) {
    content = content.replace(/### 4\.1 Code Implementation\n\n\n+/g, '### 4.1 Code Implementation\n\n**Implementation Details:**\nSee evidence files and source code for implementation details.\n\n');
    modified = true;
  }
  
  // Fix Section 5 formatting (missing newline before Section 6)
  content = content.replace(/- No dedicated MAC-RPT evidence file for this control\n## 6\./g, '- No dedicated MAC-RPT evidence file for this control\n\n---\n\n## 6.');
  content = content.replace(/- `[^\n]+`\n## 6\./g, (match) => {
    return match.replace('## 6.', '\n\n---\n\n## 6.');
  });
  
  // Ensure proper spacing between sections
  content = content.replace(/\n\n\n{3,}/g, '\n\n');
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function verifyEvidenceLinks(controlsDir: string, evidenceDir: string): void {
  const evidenceFiles = new Set(
    fs.readdirSync(evidenceDir)
      .filter(f => f.startsWith('MAC-RPT-') && f.endsWith('.md'))
      .map(f => f)
  );
  
  const controlFiles = fs.readdirSync(controlsDir)
    .filter(f => f.startsWith('NIST-3.') && f.endsWith('.md'))
    .map(f => path.join(controlsDir, f));
  
  let brokenLinks = 0;
  let fixedLinks = 0;
  
  for (const controlFile of controlFiles) {
    let content = fs.readFileSync(controlFile, 'utf8');
    let modified = false;
    
    // Find all MAC-RPT references
    const linkRegex = /`\.\.\/05-evidence\/(MAC-RPT-[^`]+)`/g;
    let match;
    const links: string[] = [];
    
    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[1]);
    }
    
    // Check if links exist
    for (const link of links) {
      if (!evidenceFiles.has(link)) {
        // Try to find the actual file
        const actualFile = Array.from(evidenceFiles).find(f => 
          f.includes(link.replace('.md', '').replace('MAC-RPT-', ''))
        );
        if (actualFile) {
          content = content.replace(
            new RegExp(`\`\\.\\./05-evidence/${link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\``, 'g'),
            `\`../05-evidence/${actualFile}\``
          );
          modified = true;
          fixedLinks++;
        } else {
          brokenLinks++;
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(controlFile, content, 'utf8');
    }
  }
  
  console.log(`Fixed ${fixedLinks} broken links, ${brokenLinks} links still need attention`);
}

function main() {
  const baseDir = path.join(__dirname, '..');
  const controlsDir = path.join(baseDir, 'compliance/cmmc/level2/07-nist-controls');
  const evidenceDir = path.join(baseDir, 'compliance/cmmc/level2/05-evidence');
  
  console.log('Fixing control files...');
  const controlFiles = fs.readdirSync(controlsDir)
    .filter(f => f.startsWith('NIST-3.') && f.endsWith('.md'))
    .map(f => path.join(controlsDir, f));
  
  let fixedCount = 0;
  for (const controlFile of controlFiles) {
    try {
      const before = fs.readFileSync(controlFile, 'utf8');
      fixControlFile(controlFile);
      const after = fs.readFileSync(controlFile, 'utf8');
      if (before !== after) {
        fixedCount++;
      }
    } catch (err) {
      console.error(`Error fixing ${path.basename(controlFile)}:`, err);
    }
  }
  
  console.log(`Fixed ${fixedCount} control files`);
  
  console.log('\nVerifying evidence file links...');
  verifyEvidenceLinks(controlsDir, evidenceDir);
}

main();
