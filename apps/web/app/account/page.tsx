"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { ArrowLeft, Link as LinkIcon, Unlink } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { DiscordPresence } from "@/components/discord-presence"

function GoogleColorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path fill="#5865F2" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

export default function AccountPage() {
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const [newEmail, setNewEmail] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"view" | "email" | "username" | "password">("view")
  const [canChangeEmail, setCanChangeEmail] = useState<boolean>(true)
  const [linkedIdentities, setLinkedIdentities] = useState<any[]>([])
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)

  useEffect(() => {
    document.title = "CAPlayground - Account";
  }, []);

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      const u = data.user
      if (!u) {
        window.location.href = "/signin"
        return
      }
      setUserId(u.id)
      setEmail(u.email ?? "")
      const isGoogleProvider = (u as any).app_metadata?.provider === "google" ||
        Array.isArray((u as any).identities) && (u as any).identities.some((i: any) => i?.provider === "google")
      setCanChangeEmail(!isGoogleProvider)
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", u.id)
          .maybeSingle()
        if (profile?.username) setUsername(profile.username)
      } catch { }
      await loadIdentities()
      setLoading(false)
    }
    load()
  }, [supabase])

  async function loadIdentities() {
    try {
      const { data, error } = await supabase.auth.getUserIdentities()
      if (!error && data?.identities) {
        setLinkedIdentities(data.identities)
      }
    } catch (e) {
      console.error('Failed to load identities:', e)
    }
  }

  async function linkProvider(provider: 'google' | 'github' | 'discord') {
    setMessage(null)
    setError(null)
    setLinkingProvider(provider)
    try {
      const origin = window.location.origin
      const { data, error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${origin}/account?linked=${provider}`
        }
      })
      if (error) throw error
    } catch (e: any) {
      setError(e.message ?? `Failed to link ${provider} account`)
      setLinkingProvider(null)
    }
  }

  async function unlinkProvider(identity: any) {
    const providerName = identity.provider
    const confirmed = window.confirm(`Are you sure you want to unlink your ${providerName} account?`)
    if (!confirmed) return

    setMessage(null)
    setError(null)

    if (linkedIdentities.length <= 1) {
      setError("You cannot unlink your only authentication method. Please link another provider first.")
      return
    }

    try {
      const { error } = await supabase.auth.unlinkIdentity(identity)
      if (error) throw error
      setMessage(`Successfully unlinked ${providerName} account`)
      await loadIdentities()
    } catch (e: any) {
      setError(e.message ?? `Failed to unlink ${providerName} account`)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const linked = params.get('linked')
    if (linked) {
      setMessage(`Successfully linked ${linked} account!`)
      loadIdentities()
      window.history.replaceState({}, '', '/account')
    }
  }, [])

  async function saveUsername() {
    if (!userId) return
    setMessage(null)
    setError(null)
    try {
      const { error } = await supabase.from("profiles").upsert({ id: userId, username })
      if (error) throw error
      setMessage("Username saved")
    } catch (e: any) {
      setError(e.message ?? "Failed to save username. Ensure a 'profiles' table exists with columns: id uuid primary key, username text.")
    }
  }

  async function updateEmail() {
    setMessage(null)
    setError(null)
    if (!canChangeEmail) {
      setError("Email is managed by your Google account. To change it, update your Google Account email.")
      return
    }
    const next = newEmail.trim()
    if (!next || !next.includes("@")) {
      setError("Please enter a valid email")
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ email: next })
      if (error) throw error
      setMessage("Verification email sent to update your email. You'll be signed out now; please sign back in after verifying.")
      await fetch('/api/auth/signout', { method: 'POST' })
      await supabase.auth.signOut()
      window.location.href = "/signin"
    } catch (e: any) {
      setError(e.message ?? "Failed to update email")
    }
  }

  async function sendResetEmail() {
    setMessage(null)
    setError(null)
    try {
      const origin = window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` })
      if (error) throw error
      setMessage("Password reset email sent (if the email exists)")
    } catch (e: any) {
      setError(e.message ?? "Failed to send reset email")
    }
  }

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  async function deleteAccount() {
    const confirmed = window.confirm("This will delete your account permanently. Continue?")
    if (!confirmed) return
    setMessage(null)
    setError(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error("No session token. Please sign in again.")

      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Delete failed with status ${res.status}`)
      }
      await fetch('/api/auth/signout', { method: 'POST' })
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (e: any) {
      setError(e.message ?? "Failed to delete account (ensure server is configured with SUPABASE_SERVICE_ROLE_KEY)")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading account…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12 relative flex items-start justify-center">
      <DiscordPresence details="Managing account" />
      {/* Back to dashboard */}
      <div className="absolute left-4 top-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Manage Account</h1>
          <p className="text-muted-foreground">Update your account settings and linked providers</p>
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {mode === "view" && (
          <>
            <Card className="border-border/80 shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Account Information</CardTitle>
                  <Button variant="outline" onClick={signOut}>Sign out</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">{email || "(loading)"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-sm text-muted-foreground mt-1">{username || "Not set"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-none">
              <CardHeader>
                <CardTitle>Linked Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sign in with any of these providers to access your account.
                </p>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Currently Linked</h3>
                  {linkedIdentities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No linked accounts found.</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedIdentities.map((identity) => (
                        <div key={identity.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center">
                              {identity.provider === 'google' && <GoogleColorIcon className="h-6 w-6" />}
                              {identity.provider === 'github' && <GithubIcon className="h-6 w-6" />}
                              {identity.provider === 'discord' && <DiscordIcon className="h-6 w-6" />}
                              {!['google', 'github', 'discord'].includes(identity.provider) && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-semibold uppercase">
                                    {identity.provider.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium capitalize">{identity.provider}</p>
                              <p className="text-xs text-muted-foreground">
                                {identity.identity_data?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                          {linkedIdentities.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unlinkProvider(identity)}
                            >
                              <Unlink className="h-4 w-4 mr-1" />
                              Unlink
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Link New Provider</h3>
                  <div className="grid gap-2">
                    {!linkedIdentities.some(i => i.provider === 'google') && (
                      <Button
                        variant="outline"
                        onClick={() => linkProvider('google')}
                        disabled={linkingProvider === 'google'}
                        className="justify-start"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {linkingProvider === 'google' ? 'Linking...' : 'Link Google Account'}
                      </Button>
                    )}
                    {!linkedIdentities.some(i => i.provider === 'github') && (
                      <Button
                        variant="outline"
                        onClick={() => linkProvider('github')}
                        disabled={linkingProvider === 'github'}
                        className="justify-start"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {linkingProvider === 'github' ? 'Linking...' : 'Link GitHub Account'}
                      </Button>
                    )}
                    {!linkedIdentities.some(i => i.provider === 'discord') && (
                      <Button
                        variant="outline"
                        onClick={() => linkProvider('discord')}
                        disabled={linkingProvider === 'discord'}
                        className="justify-start"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {linkingProvider === 'discord' ? 'Linking...' : 'Link Discord Account'}
                      </Button>
                    )}
                  </div>
                  {linkedIdentities.some(i => i.provider === 'google') &&
                    linkedIdentities.some(i => i.provider === 'github') &&
                    linkedIdentities.some(i => i.provider === 'discord') && (
                      <p className="text-sm text-muted-foreground">All available providers are linked.</p>
                    )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-none">
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {canChangeEmail ? (
                    <Button variant="outline" onClick={() => { setMode("email"); setMessage(null); setError(null); setNewEmail(""); }}>
                      Update Email
                    </Button>
                  ) : (
                    <Button variant="outline" disabled title="Email is managed by OAuth provider">
                      Update Email (OAuth-managed)
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { setMode("username"); setMessage(null); setError(null); }}>
                    Change Username
                  </Button>
                  <Button variant="outline" onClick={() => { setMode("password"); setMessage(null); setError(null); }}>
                    Change Password
                  </Button>
                  <Button variant="destructive" onClick={deleteAccount}>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {mode === "email" && (
          <Card className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle>Update Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canChangeEmail ? (
                <>
                  <p className="text-sm text-muted-foreground">This account uses Google sign-in. You can't change your email.</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setMode("view")}>Back</Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Current Email</Label>
                    <Input value={email} readOnly className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="new-email">New Email</Label>
                    <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1" placeholder="you@example.com" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={updateEmail}>Send Verification & Sign Out</Button>
                    <Button variant="ghost" onClick={() => setMode("view")}>Back</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">We’ll email a verification link to your new address. After confirming, sign back in.</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {mode === "username" && (
          <Card className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle>Change Username</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Pick a username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveUsername}>Save Username</Button>
                <Button variant="ghost" onClick={() => setMode("view")}>Back</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === "password" && (
          <Card className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">For security, password changes are done via email. We’ll send a reset link to your current address.</p>
              <div className="flex gap-2">
                <Button onClick={sendResetEmail}>Send Reset Email</Button>
                <Button variant="ghost" onClick={() => setMode("view")}>Back</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
