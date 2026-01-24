/**
 * Verify NIST Control Files Enrichment
 * 
 * Checks that all control files have been properly enriched with evidence.
 */

import * as fs from 'fs';
import * as path from 'path';

interface EnrichmentStats {
  total: number;
  withCodeBlocks: number;
  withEvidenceFiles: number;
  withImplementationDetails: number;
  minimalContent: number;
  averageLength: number;
}

function verifyEnrichment(controlsDir: string): EnrichmentStats {
  const controlFiles = fs.readdirSync(controlsDir)
    .filter(f => f.startsWith('NIST-3.') && f.endsWith('.md'))
    .map(f => path.join(controlsDir, f));
  
  const stats: EnrichmentStats = {
    total: controlFiles.length,
    withCodeBlocks: 0,
    withEvidenceFiles: 0,
    withImplementationDetails: 0,
    minimalContent: 0,
    averageLength: 0,
  };
  
  let totalLength = 0;
  
  for (const controlFile of controlFiles) {
    const content = fs.readFileSync(controlFile, 'utf8');
    totalLength += content.length;
    
    if (content.includes('```')) {
      stats.withCodeBlocks++;
    }
    
    if (content.includes('MAC-RPT') && !content.includes('No dedicated MAC-RPT evidence file')) {
      stats.withEvidenceFiles++;
    }
    
    if (content.length > 2000) {
      stats.withImplementationDetails++;
    }
    
    if (content.length < 500) {
      stats.minimalContent++;
    }
  }
  
  stats.averageLength = Math.round(totalLength / controlFiles.length);
  
  return stats;
}

function findControlsNeedingEnrichment(controlsDir: string): string[] {
  const controlFiles = fs.readdirSync(controlsDir)
    .filter(f => f.startsWith('NIST-3.') && f.endsWith('.md'))
    .map(f => path.join(controlsDir, f));
  
  const needsEnrichment: string[] = [];
  
  for (const controlFile of controlFiles) {
    const content = fs.readFileSync(controlFile, 'utf8');
    const filename = path.basename(controlFile);
    
    // Check if file needs more enrichment
    const hasMinimalContent = content.length < 1000;
    const hasNoCode = !content.includes('```');
    const hasNoEvidence = content.includes('No dedicated MAC-RPT evidence file');
    const hasEmptySections = content.includes('### 4.1 Code Implementation\n\n\n') ||
                            content.includes('### 4.2 System/Configuration Evidence\n\n\n');
    
    if (hasMinimalContent || (hasNoCode && hasNoEvidence) || hasEmptySections) {
      needsEnrichment.push(filename);
    }
  }
  
  return needsEnrichment;
}

function main() {
  const baseDir = path.join(__dirname, '..');
  const controlsDir = path.join(baseDir, 'compliance/cmmc/level2/07-nist-controls');
  
  console.log('Verifying enrichment of control files...\n');
  
  const stats = verifyEnrichment(controlsDir);
  
  console.log('Enrichment Statistics:');
  console.log(`Total control files: ${stats.total}`);
  console.log(`Files with code blocks: ${stats.withCodeBlocks} (${Math.round(stats.withCodeBlocks/stats.total*100)}%)`);
  console.log(`Files with evidence file links: ${stats.withEvidenceFiles} (${Math.round(stats.withEvidenceFiles/stats.total*100)}%)`);
  console.log(`Files with substantial content (>2000 chars): ${stats.withImplementationDetails} (${Math.round(stats.withImplementationDetails/stats.total*100)}%)`);
  console.log(`Files with minimal content (<500 chars): ${stats.minimalContent}`);
  console.log(`Average file length: ${stats.averageLength} characters\n`);
  
  const needsEnrichment = findControlsNeedingEnrichment(controlsDir);
  
  if (needsEnrichment.length > 0) {
    console.log(`Controls that may need additional enrichment: ${needsEnrichment.length}`);
    console.log('Sample files:', needsEnrichment.slice(0, 10).join(', '));
    if (needsEnrichment.length > 10) {
      console.log(`... and ${needsEnrichment.length - 10} more`);
    }
  } else {
    console.log('✅ All control files appear to be adequately enriched');
  }
}

main();
