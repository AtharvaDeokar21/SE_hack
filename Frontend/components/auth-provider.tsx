"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "superadmin" | "warden" | "watchman"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Super Admin",
    email: "admin@example.com",
    role: "superadmin",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: "2",
    name: "Hostel Warden",
    email: "warden@example.com",
    role: "warden",
    avatar: "/homework-study.png",
  },
  {
    id: "3",
    name: "Security Guard",
    email: "guard@example.com",
    role: "watchman",
    avatar: "/abstract-sg.png",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("securewatch_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Redirect unauthenticated users from protected routes
  useEffect(() => {
    if (!isLoading) {
      const protectedRoutes = ["/dashboard"]
      const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

      if (!user && isProtectedRoute) {
        router.push("/login")
      } else if (user && pathname === "/login") {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user by email (in a real app, this would be a server request)
      const foundUser = MOCK_USERS.find((u) => u.email === email)

      if (foundUser && password === "password") {
        // Simple password check for demo
        setUser(foundUser)
        localStorage.setItem("securewatch_user", JSON.stringify(foundUser))
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("securewatch_user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
