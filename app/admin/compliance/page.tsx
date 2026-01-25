import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminNavigation from "@/components/admin/AdminNavigation"
import ComplianceDashboardClient from "./ComplianceDashboardClient"

export default async function ComplianceDashboardPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Compliance Dashboard</h1>
          <p className="mt-2 text-neutral-600">
            CMMC Level 2 (FCI and CUI) Compliance Overview
          </p>
        </div>

        <ComplianceDashboardClient />
      </div>
    </div>
  )
}
