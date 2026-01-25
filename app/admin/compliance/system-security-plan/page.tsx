import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { readFile } from "fs/promises"
import { join } from "path"
import AdminNavigation from "@/components/admin/AdminNavigation"
import Link from "next/link"
import SSPMarkdownRenderer from "@/components/compliance/SSPMarkdownRenderer"
import DownloadButton from "./DownloadButton"

export default async function SystemSecurityPlanPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  try {
    const filePath = join(process.cwd(), "compliance", "cmmc", "level2", "01-system-scope", "MAC-IT-304_System_Security_Plan.md")
    const content = await readFile(filePath, "utf-8")
    
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/admin/compliance"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Compliance Dashboard
            </Link>
            <DownloadButton />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-12 print:p-8">
            <SSPMarkdownRenderer content={content} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-900 mb-2">Error Loading Document</h1>
            <p className="text-red-700">
              The System Security Plan document could not be loaded. Please check the file location.
            </p>
            <Link
              href="/admin/compliance"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Compliance Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
