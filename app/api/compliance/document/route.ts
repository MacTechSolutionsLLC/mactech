import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join, normalize, resolve, relative } from "path"
import { requireAdmin } from "@/lib/authz"

/**
 * GET /api/compliance/document
 * Returns document content from the compliance directory
 * Path should be relative to compliance/cmmc/ or absolute path within allowed directories
 */
export async function GET(req: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin()

    const searchParams = req.nextUrl.searchParams
    const requestedPath = searchParams.get("path")

    if (!requestedPath) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      )
    }

    // Validate and resolve the path (similar to document page validation)
    const baseDirs = [
      resolve(process.cwd(), "compliance", "cmmc", "level1"),
      resolve(process.cwd(), "compliance", "cmmc", "level2"),
      resolve(process.cwd(), "compliance", "cmmc", "system"),
      resolve(process.cwd(), "compliance", "cmmc", "fci"),
    ]

    // Also allow code files from project root
    const codeDirs = [
      resolve(process.cwd(), "lib"),
      resolve(process.cwd(), "app"),
      resolve(process.cwd(), "components"),
      resolve(process.cwd(), "middleware.ts"),
    ]

    const normalizedRequested = normalize(requestedPath)
    let fullPath: string | null = null

    // Try compliance directories first
    for (const baseDir of baseDirs) {
      const resolvedPath = resolve(baseDir, normalizedRequested)
      const relativePath = relative(baseDir, resolvedPath)

      if (!relativePath.startsWith('..') && !relativePath.includes('..')) {
        try {
          await readFile(resolvedPath, 'utf-8')
          fullPath = resolvedPath
          break
        } catch {
          // File doesn't exist in this directory, try next
        }
      }
    }

    // If not found in compliance, try code directories
    if (!fullPath) {
      // If path starts with compliance/cmmc, try resolving from project root
      if (normalizedRequested.startsWith('compliance/cmmc/')) {
        const resolvedPath = resolve(process.cwd(), normalizedRequested)
        const relativePath = relative(resolve(process.cwd(), 'compliance', 'cmmc'), resolvedPath)

        if (!relativePath.startsWith('..') && !relativePath.includes('..')) {
          try {
            await readFile(resolvedPath, 'utf-8')
            fullPath = resolvedPath
          } catch {
            // File doesn't exist
          }
        }
      } else {
        // Try code files (lib/, app/, components/, middleware.ts)
        for (const codeDir of codeDirs) {
          try {
            let resolvedPath: string
            if (codeDir.endsWith('.ts')) {
              // It's middleware.ts
              resolvedPath = codeDir
            } else {
              resolvedPath = resolve(codeDir, normalizedRequested)
            }

            const relativePath = relative(codeDir, resolvedPath)
            if (!relativePath.startsWith('..') && !relativePath.includes('..')) {
              await readFile(resolvedPath, 'utf-8')
              fullPath = resolvedPath
              break
            }
          } catch {
            // File doesn't exist in this directory, try next
          }
        }
      }
    }

    if (!fullPath) {
      return NextResponse.json(
        { error: "File not found or path is invalid" },
        { status: 404 }
      )
    }

    // Read the file
    const content = await readFile(fullPath, 'utf-8')

    // Return as plain text
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error("Error reading document file:", error)

    // If it's an auth error, let it propagate
    if (error.status === 401 || error.status === 403) {
      throw error
    }

    // File not found
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to read document file" },
      { status: 500 }
    )
  }
}
