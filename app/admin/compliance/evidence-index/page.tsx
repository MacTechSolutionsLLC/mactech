import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { readFile } from "fs/promises"
import { join } from "path"
import AdminNavigation from "@/components/admin/AdminNavigation"
import Link from "next/link"

export default async function EvidenceIndexPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  try {
    const filePath = join(process.cwd(), "compliance", "Evidence-Index.md")
    const content = await readFile(filePath, "utf-8")
    
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              href="/admin/compliance"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Compliance Dashboard
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="prose prose-neutral max-w-none">
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-900">
                {content.split('\n').map((line, i) => {
                  // Basic markdown rendering
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-3xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-2xl font-semibold mt-6 mb-3">{line.replace('## ', '')}</h2>
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-xl font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>
                  }
                  if (line.startsWith('|') && line.includes('|')) {
                    return <div key={i} className="font-mono text-xs my-2">{line}</div>
                  }
                  if (line.trim() === '') {
                    return <br key={i} />
                  }
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <div key={i} className="ml-4 my-1">• {line.substring(2)}</div>
                  }
                  return <div key={i} className="my-2">{line}</div>
                })}
              </div>
            </div>
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
              The Evidence Index document could not be loaded. Please check the file location.
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
