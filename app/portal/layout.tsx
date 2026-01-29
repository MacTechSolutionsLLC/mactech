import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import PortalNavigation from "@/components/portal/PortalNavigation"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/portal")
  }
  if (session.user.role !== "GUEST") {
    if (session.user.role === "ADMIN") redirect("/admin")
    redirect("/user/contract-discovery")
  }
  return (
    <div className="min-h-screen bg-neutral-50">
      <PortalNavigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
