import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { requireAuth } from "@/lib/authz"

/**
 * GET /api/policies/[path]
 * Returns policy content from the compliance directory
 * Path should be relative to compliance/cmmc/level2/02-policies-and-procedures/
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string }> | { path: string } }
) {
  try {
    // Require authentication
    await requireAuth()

    const resolvedParams = await Promise.resolve(params)
    const policyPath = decodeURIComponent(resolvedParams.path)

    // Security: Prevent path traversal attacks
    if (policyPath.includes('..') || policyPath.includes('/') || policyPath.includes('\\')) {
      return NextResponse.json(
        { error: "Invalid policy path" },
        { status: 400 }
      )
    }

    // Map policy names to actual file paths
    const policyMap: Record<string, string> = {
      'acceptable-use-policy': 'MAC-POL-210_Access_Control_Policy.md',
      'cui-handling-policy': 'MAC-POL-213_Media_Handling_Policy.md',
      'incident-reporting-policy': 'MAC-POL-215_Incident_Response_Policy.md',
    }

    const fileName = policyMap[policyPath] || policyPath

    // Construct full path to policy file
    const fullPath = join(
      process.cwd(),
      'compliance',
      'cmmc',
      'level2',
      '02-policies-and-procedures',
      fileName
    )

    // Read the policy file
    const content = await readFile(fullPath, 'utf-8')

    // Return as plain text (will be rendered as markdown in the frontend)
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error("Error reading policy file:", error)

    // If it's an auth error, let it propagate
    if (error.status === 401 || error.status === 403) {
      throw error
    }

    // File not found
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: "Policy file not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to read policy file" },
      { status: 500 }
    )
  }
}
