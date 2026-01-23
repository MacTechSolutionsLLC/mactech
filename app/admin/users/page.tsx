import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import UserTable from "@/components/admin/UserTable"
import AdminNavigation from "@/components/admin/AdminNavigation"
import CreateUserForm from "@/components/admin/CreateUserForm"
import Link from "next/link"

export default async function UsersPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      disabled: true,
      lastLoginAt: true,
      createdAt: true,
      securityAcknowledgmentAcceptedAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">User Management</h1>
            <p className="mt-2 text-neutral-600">
              Manage user accounts, roles, and access. Create new users, reset passwords, and manage roles.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/api/admin/users/export"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Export CSV (Quarterly Review)
            </a>
          </div>
        </div>

        <CreateUserForm />

        <div className="bg-white rounded-lg shadow">
          <UserTable users={users} />
        </div>
      </div>
    </div>
  )
}
