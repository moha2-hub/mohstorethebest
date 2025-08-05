"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function AfterGoogleLogin() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return
    if (!session || !session.userData) {
      // Not logged in or missing user data, go to login
      router.replace("/login")
      return
    }
    // Redirect based on role
    const role = session.userData.role
    if (role === "admin") {
      router.replace("/admin")
    } else if (role === "customer") {
      router.replace("/customer")
    } else if (role === "seller") {
      router.replace("/seller")
    } else {
      router.replace("/")
    }
  }, [session, status, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="text-lg font-semibold">Loading your dashboard...</span>
    </div>
  )
}
