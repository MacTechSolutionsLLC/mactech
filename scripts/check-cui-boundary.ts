/**
 * CUI Boundary Guardrail
 * Fails if code contains patterns that would allow CUI bytes to be handled on Railway.
 * Run in CI to prevent regression.
 */

import * as fs from 'fs'
import * as path from 'path'

const APP_API = path.join(process.cwd(), 'app', 'api')
const LIB = path.join(process.cwd(), 'lib')

interface Finding {
  file: string
  line: number
  pattern: string
  message: string
}

const findings: Finding[] = []

function scanFile(filePath: string, content: string, relativePath: string) {
  const lines = content.split('\n')
  lines.forEach((line, i) => {
    const lineNum = i + 1
    // CUI routes must not read file bytes from formData
    if (relativePath.includes('cui') && relativePath.includes('route')) {
      if (/\bformData\.get\s*\(\s*['\"]file['\"]\s*\)/.test(line) && !line.trim().startsWith('//')) {
        findings.push({
          file: relativePath,
          line: lineNum,
          pattern: 'formData.get("file")',
          message: 'CUI routes must not read file from formData; use upload-session + direct-to-vault',
        })
      }
      if (/Buffer\.from\s*\([^)]*arrayBuffer/.test(line) && !line.trim().startsWith('//')) {
        findings.push({
          file: relativePath,
          line: lineNum,
          pattern: 'Buffer.from(.*arrayBuffer',
          message: 'CUI routes must not buffer file bytes on Railway',
        })
      }
      if (/\.arrayBuffer\s*\(\s*\)/.test(line) && !line.trim().startsWith('//')) {
        findings.push({
          file: relativePath,
          line: lineNum,
          pattern: '.arrayBuffer()',
          message: 'CUI routes must not read file bytes via arrayBuffer',
        })
      }
      if (/getCUIFromVault|storeCUIInVault/.test(line) && !line.trim().startsWith('//')) {
        findings.push({
          file: relativePath,
          line: lineNum,
          pattern: 'getCUIFromVault|storeCUIInVault',
          message: 'Byte-handling vault APIs are removed; use token/session APIs only',
        })
      }
      if (/base64Data|\.toString\s*\(\s*['\"]base64['\"]\s*\)/.test(line) && /file\.data|response\.data/.test(line) && !line.trim().startsWith('//')) {
        findings.push({
          file: relativePath,
          line: lineNum,
          pattern: 'base64 encode/decode of file data',
          message: 'CUI routes must not encode/decode CUI payloads on Railway',
        })
      }
    }
    // file-storage: must not have storeCUIInVault or getCUIFromVault that handle bytes
    if (relativePath.includes('file-storage') && (/\bstoreCUIInVault\b|\bgetCUIFromVault\b/.test(line)) && !line.trim().startsWith('//')) {
      findings.push({
        file: relativePath,
        line: lineNum,
        pattern: 'storeCUIInVault|getCUIFromVault',
        message: 'lib/file-storage must not call byte-handling vault APIs',
      })
    }
  })
}

function walkDir(dir: string, baseDir: string) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    const rel = path.relative(baseDir, full)
    if (ent.isDirectory()) {
      if (ent.name !== 'node_modules' && ent.name !== '.git') walkDir(full, baseDir)
    } else if (ent.name.endsWith('.ts') || ent.name.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8')
      scanFile(full, content, rel)
    }
  }
}

walkDir(APP_API, process.cwd())
const fileStoragePath = path.join(LIB, 'file-storage.ts')
const vaultClientPath = path.join(LIB, 'cui-vault-client.ts')
if (fs.existsSync(fileStoragePath)) {
  const content = fs.readFileSync(fileStoragePath, 'utf8')
  scanFile(fileStoragePath, content, path.relative(process.cwd(), fileStoragePath))
}
if (fs.existsSync(vaultClientPath)) {
  const content = fs.readFileSync(vaultClientPath, 'utf8')
  scanFile(vaultClientPath, content, path.relative(process.cwd(), vaultClientPath))
}

if (findings.length > 0) {
  console.error('CUI boundary check FAILED. The following patterns may allow CUI bytes on Railway:\n')
  findings.forEach((f) => {
    console.error(`  ${f.file}:${f.line}  ${f.pattern}`)
    console.error(`    ${f.message}\n`)
  })
  process.exit(1)
}

console.log('CUI boundary check passed: no forbidden patterns found.')
process.exit(0)
