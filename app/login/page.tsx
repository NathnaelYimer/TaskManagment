"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useAuthStore, useUIStore } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const { language } = useUIStore()
  const t = useTranslation(language)

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t.loginFailed)
      }

      // Login user with data from API
      login(data.user, data.role)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loginFailed)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.appName}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t.appDescription}</p>
        </div>
        <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{t.demoCredentials}</p>
          <p>Admin: nathnaelyimer@gmail.com | Password: Nati@20409545</p>
          <p>User: user@example.com | Password: password123</p>
        </div>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
          </span>
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  )
}
