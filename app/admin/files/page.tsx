import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import FileManager from "@/components/admin/FileManager"

export default async function FilesPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const files = await prisma.storedFile.findMany({
    where: {
      deletedAt: null, // Only show non-deleted files
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">File Management</h1>
          <p className="mt-2 text-neutral-600">
            Manage stored files (replaces /public/uploads)
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <FileManager files={files} />
        </div>
      </div>
    </div>
  )
}
