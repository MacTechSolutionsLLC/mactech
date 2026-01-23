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

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => !u.disabled).length,
    disabled: users.filter(u => u.disabled).length,
    admins: users.filter(u => u.role === "ADMIN" && !u.disabled).length,
    users: users.filter(u => u.role === "USER" && !u.disabled).length,
  }

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
              className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 font-medium transition-colors"
            >
              Export CSV (Quarterly Review)
            </a>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-neutral-200">
            <div className="text-sm font-medium text-neutral-500">Total Users</div>
            <div className="text-2xl font-bold text-neutral-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-neutral-200">
            <div className="text-sm font-medium text-neutral-500">Active</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-neutral-200">
            <div className="text-sm font-medium text-neutral-500">Disabled</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{stats.disabled}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-neutral-200">
            <div className="text-sm font-medium text-neutral-500">Admins</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">{stats.admins}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-neutral-200">
            <div className="text-sm font-medium text-neutral-500">Standard Users</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{stats.users}</div>
          </div>
        </div>

        {/* Create User Form - Always visible button, form appears below when opened */}
        <div className="mb-6">
          <CreateUserForm />
        </div>

        <div className="bg-white rounded-lg shadow">
          <UserTable users={users} />
        </div>
      </div>
    </div>
  )
}
