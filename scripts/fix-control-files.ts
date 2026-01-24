/**
 * Fix Control Files - Clean up duplicates and formatting issues
 */

import * as fs from 'fs';
import * as path from 'path';

function fixControlFile(filePath: string): void {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix duplicate change history entries
  const changeHistoryRegex = /(\*\*Change History:\*\*\n)(- Version [^\n]+\n)+/g;
  const match = content.match(changeHistoryRegex);
  if (match) {
    const lines = match[0].split('\n');
    const uniqueLines = Array.from(new Set(lines.filter(l => l.trim())));
    const newHistory = uniqueLines.join('\n') + '\n';
    content = content.replace(changeHistoryRegex, newHistory);
    modified = true;
  }
  
  // Fix duplicate "Last Verification Date" entries
  const lastVerifyRegex = /\*\*Last Verification Date:\*\*[\s\S]*?(?=\n\n|##|$)/g;
  const verifyMatches = content.match(/\*\*Last Verification Date:\*\*/g);
  if (verifyMatches && verifyMatches.length > 1) {
    // Keep only the first one
    let firstFound = false;
    content = content.replace(/\*\*Last Verification Date:\*\*[\s\S]*?(?=\n\n|##|$)/g, (match) => {
      if (!firstFound) {
        firstFound = true;
        return match;
      }
      return '';
    });
    modified = true;
  }
  
  // Fix empty sections
  content = content.replace(/### 4\.1 Code Implementation\n\n\n+/g, '### 4.1 Code Implementation\n\n');
  content = content.replace(/### 4\.2 System\/Configuration Evidence\n\n\n+/g, '### 4.2 System/Configuration Evidence\n\n');
  content = content.replace(/### 4\.3 Operational Procedures\n\n\n+/g, '### 4.3 Operational Procedures\n\n');
  
  // Fix malformed section headers (remove extra #)
  content = content.replace(/^###Implementation/gm, '### 4.1 Code Implementation');
  content = content.replace(/^##\s*2\.\s*Implementation Evidence/gm, '### 4.1 Code Implementation');
  content = content.replace(/^##\s*3\.\s*Implementation Details/gm, '### 4.1 Code Implementation');
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function main() {
  const baseDir = path.join(__dirname, '..');
  const controlsDir = path.join(baseDir, 'compliance/cmmc/level2/07-nist-controls');
  
  console.log('Fixing control files...');
  const controlFiles = fs.readdirSync(controlsDir)
    .filter(f => f.startsWith('NIST-3.') && f.endsWith('.md'))
    .map(f => path.join(controlsDir, f));
  
  let fixedCount = 0;
  for (const controlFile of controlFiles) {
    try {
      fixControlFile(controlFile);
      fixedCount++;
    } catch (err) {
      console.error(`Error fixing ${path.basename(controlFile)}:`, err);
    }
  }
  
  console.log(`Fixed ${fixedCount} control files`);
}

main();
