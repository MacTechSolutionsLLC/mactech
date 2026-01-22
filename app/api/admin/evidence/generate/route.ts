import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

/**
 * POST /api/admin/evidence/generate
 * Generate all CMMC evidence exports
 * Requires admin
 * 
 * Body:
 *   - startDate?: string (ISO date, default: 30 days ago)
 *   - endDate?: string (ISO date, default: today)
 *   - exportedBy?: string (email, default: session user)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await req.json().catch(() => ({}))
    
    const endDate = body.endDate ? new Date(body.endDate) : new Date()
    const startDate = body.startDate 
      ? new Date(body.startDate)
      : (() => {
          const date = new Date()
          date.setDate(date.getDate() - 30)
          return date
        })()
    const exportedBy = body.exportedBy || session.user.email || session.user.id

    // Output directory (in public folder for downloads)
    const outputDir = join(process.cwd(), "public", "output")
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
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

    function generateMetadataHeader(exportType: string, exportedBy: string): string[] {
      return [
        "# Evidence Export",
        `# Generated: ${new Date().toISOString()}`,
        "# System: MacTech Solutions Application",
        `# Exported By: ${exportedBy}`,
        `# Export Type: ${exportType}`,
        "",
      ]
    }

    const files: Array<{ filename: string; path: string }> = []

    // 1. Export Users
    console.log("Exporting users...")
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        disabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const userHeaders = ["ID", "Email", "Name", "Role", "Disabled", "Last Login", "Created At"]
    const userRows = users.map((user) => [
      user.id,
      user.email,
      user.name || "",
      user.role,
      user.disabled ? "Yes" : "No",
      formatDate(user.lastLoginAt),
      formatDate(user.createdAt),
    ])

    const userCsv = [
      ...generateMetadataHeader("Users", exportedBy),
      userHeaders.join(","),
      ...userRows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n")

    const userFilename = `users-export-${new Date().toISOString().split("T")[0]}.csv`
    const userPath = join(outputDir, userFilename)
    await writeFile(userPath, userCsv, "utf-8")
    files.push({ filename: userFilename, path: userPath })

    // 2. Export Physical Access Logs
    console.log("Exporting physical access logs...")
    const logs = await prisma.physicalAccessLog.findMany({
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

    const logHeaders = [
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

    const logRows = logs.map((log) => [
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

    const logCsv = [
      ...generateMetadataHeader("Physical Access Logs", exportedBy),
      logHeaders.join(","),
      ...logRows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n")

    const logFilename = `physical-access-logs-${formatDate(startDate)}-to-${formatDate(endDate)}.csv`
    const logPath = join(outputDir, logFilename)
    await writeFile(logPath, logCsv, "utf-8")
    files.push({ filename: logFilename, path: logPath })

    // 3. Export Audit Log
    console.log("Exporting audit log...")
    const events = await prisma.appEvent.findMany({
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

    const eventHeaders = [
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

    const eventRows = events.map((event) => [
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

    const eventCsv = [
      ...generateMetadataHeader("Audit Log", exportedBy),
      eventHeaders.join(","),
      ...eventRows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n")

    const eventFilename = `audit-log-${formatDate(startDate)}-to-${formatDate(endDate)}.csv`
    const eventPath = join(outputDir, eventFilename)
    await writeFile(eventPath, eventCsv, "utf-8")
    files.push({ filename: eventFilename, path: eventPath })

    // 4. Export Endpoint Inventory
    console.log("Exporting endpoint inventory...")
    const endpoints = await prisma.endpointInventory.findMany({
      orderBy: { lastVerifiedDate: "desc" },
    })

    const endpointHeaders = [
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

    const endpointRows = endpoints.map((endpoint) => [
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

    const endpointCsv = [
      ...generateMetadataHeader("Endpoint Inventory", exportedBy),
      endpointHeaders.join(","),
      ...endpointRows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n")

    const endpointFilename = `endpoint-inventory-${new Date().toISOString().split("T")[0]}.csv`
    const endpointPath = join(outputDir, endpointFilename)
    await writeFile(endpointPath, endpointCsv, "utf-8")
    files.push({ filename: endpointFilename, path: endpointPath })

    // Log the action
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      "generate_evidence",
      undefined,
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        fileCount: files.length,
      }
    )

    return NextResponse.json({
      success: true,
      message: `Generated ${files.length} evidence files`,
      files: files.map((f) => ({
        filename: f.filename,
        url: `/output/${f.filename}`,
      })),
      metadata: {
        generated: new Date().toISOString(),
        exportedBy,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Error generating evidence:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate evidence" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}
