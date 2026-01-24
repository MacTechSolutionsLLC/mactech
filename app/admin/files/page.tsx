import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import FileManager from "@/components/admin/FileManager"
import AdminNavigation from "@/components/admin/AdminNavigation"
import { Prisma } from "@prisma/client"

type FileWithUploader = Prisma.StoredFileGetPayload<{
  include: {
    uploader: {
      select: {
        id: true
        email: true
        name: true
      }
    }
  }
}>

export default async function FilesPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  let files: FileWithUploader[] = []
  try {
    files = await prisma.storedFile.findMany({
      where: {
        deletedAt: null, // Only show non-deleted files
        isFCI: false, // Exclude FCI files (they're shown in FCI tab)
      },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
      take: 100, // Limit to recent 100 files
    })
  } catch (error) {
    console.error('Error loading files:', error)
    // Continue with empty array if query fails
    files = []
  }

  // Serialize dates to strings for client component
  // Filter out any files with missing required data
  const serializedFiles = files
    .filter(file => file && file.uploadedAt)
    .map(file => ({
      ...file,
      uploadedAt: file.uploadedAt instanceof Date 
        ? file.uploadedAt.toISOString() 
        : new Date(file.uploadedAt).toISOString(),
    }))

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">File Management</h1>
          <p className="mt-2 text-neutral-600">
            Manage stored files and browse compliance documents
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <FileManager files={serializedFiles} />
        </div>
      </div>
    </div>
  )
}
