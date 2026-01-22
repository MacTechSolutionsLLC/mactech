#!/usr/bin/env tsx

/**
 * CMMC Evidence Generation Script
 * 
 * Generates operational evidence exports for CMMC Level 1 compliance.
 * All exports include metadata headers (timestamp, system identifier, exporting admin).
 * Evidence is generated on demand directly from the production system at the time of assessment.
 * 
 * Generates CSV exports for:
 * - Users list
 * - Physical access logs (date range)
 * - Audit log (date range)
 * - Endpoint inventory
 * 
 * Usage:
 *   tsx scripts/generate-evidence.ts [options]
 * 
 * Options:
 *   --start-date YYYY-MM-DD    Start date for logs (default: 30 days ago)
 *   --end-date YYYY-MM-DD      End date for logs (default: today)
 *   --output-dir PATH          Output directory (default: compliance/cmmc/level1/05-evidence/sample-exports)
 *   --exported-by EMAIL        Email of admin generating export (default: system)
 * 
 * Example:
 *   tsx scripts/generate-evidence.ts --start-date 2026-01-01 --end-date 2026-01-31 --exported-by admin@mactechsolutions.com
 * 
 * Note: Requires DATABASE_URL environment variable to be set (from .env file or environment)
 */

// Load environment variables from .env files
// Note: When running via Railway CLI, Railway's environment variables take precedence
import { config } from "dotenv"
import { resolve } from "path"

// Only load .env files if DATABASE_URL is not already set (Railway sets it)
if (!process.env.DATABASE_URL) {
  // Try loading .env.local first (highest priority), then .env
  config({ path: resolve(process.cwd(), ".env.local") })
  config({ path: resolve(process.cwd(), ".env") })
}

import { PrismaClient } from "@prisma/client"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const prisma = new PrismaClient()

interface Options {
  startDate?: Date
  endDate?: Date
  outputDir: string
  exportedBy?: string
}

function parseArgs(): Options {
  const args = process.argv.slice(2)
  const options: Options = {
    outputDir: "compliance/cmmc/level1/05-evidence/sample-exports",
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--start-date" && args[i + 1]) {
      options.startDate = new Date(args[i + 1])
      i++
    } else if (args[i] === "--end-date" && args[i + 1]) {
      options.endDate = new Date(args[i + 1])
      i++
    } else if (args[i] === "--output-dir" && args[i + 1]) {
      options.outputDir = args[i + 1]
      i++
    } else if (args[i] === "--exported-by" && args[i + 1]) {
      options.exportedBy = args[i + 1]
      i++
    }
  }

  // Default to last 30 days if not specified
  if (!options.endDate) {
    options.endDate = new Date()
  }
  if (!options.startDate) {
    options.startDate = new Date()
    options.startDate.setDate(options.startDate.getDate() - 30)
  }

  return options
}

function escapeCsv(value: any): string {
  if (value === null || value === undefined) {
    return ""
  }
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDate(date: Date | null): string {
  if (!date) return ""
  return date.toISOString().split("T")[0]
}

function generateMetadataHeader(exportType: string, exportedBy?: string): string[] {
  return [
    "# Evidence Export",
    `# Generated: ${new Date().toISOString()}`,
    "# System: MacTech Solutions Application",
    exportedBy ? `# Exported By: ${exportedBy}` : "# Exported By: [System]",
    `# Export Type: ${exportType}`,
    "",
  ]
}

async function exportUsers(outputDir: string, exportedBy?: string) {
  console.log("Exporting users list...")

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      disabled: true,
      lastLoginAt: true,
      createdAt: true,
      // Exclude password hash
    },
    orderBy: { createdAt: "desc" },
  })

  const headers = [
    "ID",
    "Email",
    "Name",
    "Role",
    "Disabled",
    "Last Login",
    "Created At",
  ]

  const rows = users.map((user) => [
    user.id,
    user.email,
    user.name || "",
    user.role,
    user.disabled ? "Yes" : "No",
    formatDate(user.lastLoginAt),
    formatDate(user.createdAt),
  ])

  // Metadata headers
  const metadataLines = generateMetadataHeader("Users", exportedBy)

  const csv = [
    ...metadataLines,
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n")

  const filename = `users-export-${new Date().toISOString().split("T")[0]}.csv`
  const filepath = join(outputDir, filename)
  await writeFile(filepath, csv, "utf-8")

  console.log(`✓ Exported ${users.length} users to ${filename}`)
  return filename
}

async function exportPhysicalAccessLogs(
  startDate: Date,
  endDate: Date,
  outputDir: string,
  exportedBy?: string
) {
  console.log("Exporting physical access logs...")

  let logs
  try {
    logs = await prisma.physicalAccessLog.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      createdBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: { date: "desc" },
    })
  } catch (error: any) {
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.log("⚠️  PhysicalAccessLog table does not exist, skipping...")
      return null
    }
    throw error
  }

  const headers = [
    "Date",
    "Time In",
    "Time Out",
    "Person Name",
    "Purpose",
    "Host/Escort",
    "Location",
    "Notes",
    "Created At",
    "Created By",
  ]

  const rows = logs.map((log) => [
    formatDate(log.date),
    log.timeIn,
    log.timeOut || "",
    log.personName,
    log.purpose,
    log.hostEscort || "",
    log.location,
    log.notes || "",
    formatDate(log.createdAt),
    log.createdBy.email || log.createdBy.name || "unknown",
  ])

  // Metadata headers
  const metadataLines = generateMetadataHeader("Physical Access Logs", exportedBy)

  const csv = [
    ...metadataLines,
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n")

  const filename = `physical-access-logs-${formatDate(startDate)}-to-${formatDate(endDate)}.csv`
  const filepath = join(outputDir, filename)
  await writeFile(filepath, csv, "utf-8")

  console.log(`✓ Exported ${logs.length} physical access log entries to ${filename}`)
  return filename
}

async function exportAuditLog(
  startDate: Date,
  endDate: Date,
  outputDir: string,
  exportedBy?: string
) {
  console.log("Exporting audit log...")

  let events
  try {
    events = await prisma.appEvent.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      actor: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: { timestamp: "desc" },
    })
  } catch (error: any) {
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.log("⚠️  AppEvent table does not exist, skipping...")
      return null
    }
    throw error
  }

  const headers = [
    "Timestamp",
    "Action Type",
    "Actor Email",
    "Actor Name",
    "Target Type",
    "Target ID",
    "IP Address",
    "User Agent",
    "Success",
    "Details",
  ]

  const rows = events.map((event) => [
    event.timestamp.toISOString(),
    event.actionType,
    event.actorEmail || "",
    event.actor?.name || "",
    event.targetType || "",
    event.targetId || "",
    event.ip || "",
    event.userAgent || "",
    event.success ? "Yes" : "No",
    event.details || "",
  ])

  // Metadata headers
  const metadataLines = generateMetadataHeader("Audit Log", exportedBy)

  const csv = [
    ...metadataLines,
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n")

  const filename = `audit-log-${formatDate(startDate)}-to-${formatDate(endDate)}.csv`
  const filepath = join(outputDir, filename)
  await writeFile(filepath, csv, "utf-8")

  console.log(`✓ Exported ${events.length} audit log entries to ${filename}`)
  return filename
}

async function exportEndpointInventory(outputDir: string, exportedBy?: string) {
  console.log("Exporting endpoint inventory...")

  let endpoints
  try {
    endpoints = await prisma.endpointInventory.findMany({
    orderBy: { lastVerifiedDate: "desc" },
    })
  } catch (error: any) {
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.log("⚠️  EndpointInventory table does not exist, skipping...")
      return null
    }
    throw error
  }

  const headers = [
    "Device Identifier",
    "Owner",
    "Operating System",
    "AV Enabled",
    "Last Verified Date",
    "Verification Method",
    "Notes",
    "Created At",
    "Updated At",
  ]

  const rows = endpoints.map((endpoint) => [
    endpoint.deviceIdentifier,
    endpoint.owner,
    endpoint.os,
    endpoint.avEnabled ? "Yes" : "No",
    formatDate(endpoint.lastVerifiedDate),
    endpoint.verificationMethod || "",
    endpoint.notes || "",
    formatDate(endpoint.createdAt),
    formatDate(endpoint.updatedAt),
  ])

  // Metadata headers
  const metadataLines = generateMetadataHeader("Endpoint Inventory", exportedBy)

  const csv = [
    ...metadataLines,
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n")

  const filename = `endpoint-inventory-${new Date().toISOString().split("T")[0]}.csv`
  const filepath = join(outputDir, filename)
  await writeFile(filepath, csv, "utf-8")

  console.log(`✓ Exported ${endpoints.length} endpoint inventory entries to ${filename}`)
  return filename
}

async function main() {
  try {
    // Check for DATABASE_URL
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      console.error("❌ Error: DATABASE_URL environment variable is not set")
      console.error("   Please set DATABASE_URL before running this script")
      console.error("   Example: DATABASE_URL=postgresql://... npx tsx scripts/generate-evidence.ts")
      console.error("   Or ensure .env or .env.local file exists with DATABASE_URL")
      process.exit(1)
    }
    
    // Validate DATABASE_URL format
    const isPostgres = dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")
    const isSqlite = dbUrl.startsWith("file:")
    
    if (!isPostgres && !isSqlite) {
      console.error("❌ Error: DATABASE_URL format not recognized")
      console.error(`   Current value starts with: ${dbUrl.substring(0, 30)}...`)
      console.error("   Supported formats: postgresql://, postgres://, or file:")
      process.exit(1)
    }
    
    if (isSqlite) {
      console.error("❌ Error: This script requires PostgreSQL database")
      console.error("   Your DATABASE_URL points to SQLite (local development)")
      console.error("   CMMC evidence must be generated from production database")
      console.error("")
      console.error("   To run this script:")
      console.error("   1. Set DATABASE_URL to your production PostgreSQL connection string")
      console.error("   2. Or run this script in production environment")
      console.error("")
      console.error("   Example:")
      console.error("     DATABASE_URL=postgresql://user:pass@host:port/db npx tsx scripts/generate-evidence.ts")
      process.exit(1)
    }

    const options = parseArgs()

    console.log("Evidence Generation Script")
    console.log("==========================")
    console.log(`Start Date: ${formatDate(options.startDate!)}`)
    console.log(`End Date: ${formatDate(options.endDate!)}`)
    console.log(`Output Directory: ${options.outputDir}`)
    console.log(`Exported By: ${options.exportedBy || "[System]"}`)
    console.log("")

    // Ensure output directory exists
    if (!existsSync(options.outputDir)) {
      await mkdir(options.outputDir, { recursive: true })
      console.log(`Created output directory: ${options.outputDir}`)
    }

    // Export all evidence types
    const files: string[] = []

    const userFile = await exportUsers(options.outputDir, options.exportedBy)
    if (userFile) files.push(userFile)

    const logFile = await exportPhysicalAccessLogs(
      options.startDate!,
      options.endDate!,
      options.outputDir,
      options.exportedBy
    )
    if (logFile) files.push(logFile)

    const auditFile = await exportAuditLog(options.startDate!, options.endDate!, options.outputDir, options.exportedBy)
    if (auditFile) files.push(auditFile)

    const endpointFile = await exportEndpointInventory(options.outputDir, options.exportedBy)
    if (endpointFile) files.push(endpointFile)

    console.log("")
    console.log("Evidence generation complete!")
    console.log("")
    console.log("Generated files:")
    files.forEach((file) => console.log(`  - ${file}`))
    console.log("")
    console.log("Evidence generation complete!")
    console.log("")
    console.log("All exports include metadata headers:")
    console.log("  - Generated timestamp")
    console.log("  - System identifier")
    console.log(`  - Exported by: ${options.exportedBy || "[System]"}`)
    console.log("")
    console.log(
      "⚠️  IMPORTANT: Review and redact personal data before sharing externally."
    )
    console.log(
      "    See compliance/cmmc/level1/05-evidence/sample-exports/README.md for instructions."
    )
    console.log("")
    console.log("Note: Evidence is generated on demand directly from the production system")
    console.log("      at the time of assessment. All exports are immutable once generated.")
  } catch (error) {
    console.error("Error generating evidence:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
