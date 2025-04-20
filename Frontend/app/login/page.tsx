"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, User, Lock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
    if (!error) {
      router.push(callbackUrl)
    }
  }

  // Demo credentials
  const demoUsers = [
    { role: "Super Admin", email: "admin@example.com", password: "password" },
    { role: "Warden", email: "warden@example.com", password: "password" },
    { role: "Watchman", email: "guard@example.com", password: "password" },
  ]

  const setDemoCredentials = (email: string) => {
    setEmail(email)
    setPassword("password")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-alert-critical mx-auto mb-4" />
          <h1 className="text-3xl font-bold">ThirdEye</h1>
          <p className="text-muted-foreground mt-2">Hostel Security Monitoring System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the security dashboard
              {callbackUrl !== "/dashboard" && (
                <span className="block mt-1 text-alert-medium">You'll be redirected to {callbackUrl} after login</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md">{error}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center w-full">Demo Accounts (click to autofill)</div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {demoUsers.map((user) => (
                <Button
                  key={user.email}
                  variant="outline"
                  size="sm"
                  onClick={() => setDemoCredentials(user.email)}
                  className="text-xs"
                >
                  {user.role}: {user.email}
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
