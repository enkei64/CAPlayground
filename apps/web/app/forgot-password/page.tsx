"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AtSign, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { AUTH_ENABLED, getSupabaseBrowserClient } from "@/lib/supabase"
import { DiscordPresence } from "@/components/discord-presence"

export default function ForgotPasswordPage() {
  const { theme, setTheme } = useTheme()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  async function handleSend() {
    setMsg(null)
    setError(null)
    setLoading(true)
    try {
      const origin = window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      })
      if (error) throw error
      setMsg("If the email exists, a reset link has been sent.")
    } catch (e: any) {
      setError(e.message ?? "Failed to send reset link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <DiscordPresence details="Recovering password" />
      {/* Theme toggle (top-right) */}
      <div className="absolute right-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="rounded-full h-9 w-9 p-0"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-border/80 shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold">Reset your password</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {!AUTH_ENABLED && (
                <p className="text-sm text-muted-foreground">
                  Password reset is disabled because authentication is not configured for this environment.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {msg && <p className="text-sm text-green-600">{msg}</p>}
              <Button disabled={loading || !AUTH_ENABLED} onClick={handleSend} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link href="/signin" className="text-accent hover:underline font-medium">
                  Back to sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

