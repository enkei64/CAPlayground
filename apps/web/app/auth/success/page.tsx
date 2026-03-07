"use client"

import { useEffect, useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

const DESKTOP_SCHEME = "caplayground"

function isValidUsername(u: string) {
  return /^[A-Za-z0-9!._-]{3,20}$/.test(u)
}

function ProviderIcon({ provider, className }: { provider: string | null; className?: string }) {
  switch ((provider || "email").toLowerCase()) {
    case "google": return <GoogleColorIcon className={className} />
    case "github": return <GithubIcon className={className} />
    case "discord": return <DiscordIcon className={className} />
    default: return <EmailIcon className={className} />
  }
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16v16H4z" fill="none" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  )
}

function GoogleColorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
      <path fill="#5865F2" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  )
}

function redirectToDesktop(session: { access_token: string; refresh_token: string; expires_in: number }) {
  const params = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: String(session.expires_in),
    token_type: "bearer",
  })
  window.location.href = `${DESKTOP_SCHEME}://auth#${params.toString()}`
}

function AuthSuccessInner() {
  const supabase = getSupabaseBrowserClient()
  const searchParams = useSearchParams()
  const isDesktop = searchParams.get("desktop") === "1"

  const [status, setStatus] = useState<"checking" | "need_username" | "ready" | "not_signed_in">("checking")
  const [username, setUsername] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [accountEmail, setAccountEmail] = useState<string>("")
  const [profileUsername, setProfileUsername] = useState<string>("")

  useEffect(() => {
    let mounted = true
    async function check() {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      const user = data.user
      if (!user) {
        setStatus("not_signed_in")
        return
      }

      try {
        const appProv = (user as any).app_metadata?.provider as string | undefined
        const identities: any[] = Array.isArray((user as any).identities) ? (user as any).identities : []
        const idProv = identities.find((i: any) => i?.provider)?.provider as string | undefined
        setProvider(appProv || idProv || "email")
      } catch { }
      setAccountEmail(user.email ?? "")

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle()
        if (profile?.username) {
          setProfileUsername(profile.username)
          if (isDesktop) {
            const { data: sessionData } = await supabase.auth.getSession()
            if (sessionData.session) {
              redirectToDesktop(sessionData.session)
              return
            }
          }
          setStatus("ready")
        } else {
          try {
            const meta: any = (user as any).user_metadata || {}
            const identities: any[] = Array.isArray((user as any).identities) ? (user as any).identities : []
            const ghIdentity: any = identities.find((i: any) => i?.provider === "github")?.identity_data || {}
            const dcIdentity: any = identities.find((i: any) => i?.provider === "discord")?.identity_data || {}
            const candidates = [
              meta.user_name, meta.preferred_username,
              ghIdentity.user_name, ghIdentity.login,
              dcIdentity.username, dcIdentity.global_name,
              meta.name, meta.full_name,
            ].filter(Boolean) as string[]

            if (candidates.length > 0) {
              const raw = candidates[0] as string
              const suggested = raw.replace(/[^A-Za-z0-9!._-]/g, "").slice(0, 20)
              if (/^[A-Za-z0-9!._-]{3,20}$/.test(suggested)) {
                setUsername(suggested)
              }
            }
          } catch { }
          setStatus("need_username")
        }
      } catch {
        setStatus("ready")
      }
    }
    check()
    return () => { mounted = false }
  }, [supabase, isDesktop])

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="border-border/80 shadow-none w-full max-w-md">
          <CardHeader>
            <CardTitle>Completing sign-in…</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Verifying session
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="border-border/80 shadow-none w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className={status === "ready" ? "text-2xl md:text-3xl" : undefined}>
            {status === "need_username"
              ? "Choose a username"
              : status === "ready"
                ? "You're signed in"
                : "Sign-in failed or expired"}
          </CardTitle>
          {isDesktop && status === "ready" && (
            <p className="text-sm text-muted-foreground mt-1">You can now close this tab and return to the app.</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "need_username" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Pick a username" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">3–20 chars. Letters, numbers, and ! - _ . only.</p>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 justify-center">
                <Button
                  disabled={saving}
                  onClick={async () => {
                    setError(null)
                    if (!isValidUsername(username)) {
                      setError("Username must be 3-20 chars and only letters, numbers, and ! - _ .")
                      return
                    }
                    setSaving(true)
                    try {
                      const { data: userRes } = await supabase.auth.getUser()
                      const uid = userRes.user?.id
                      if (!uid) throw new Error("No user session")
                      const { error } = await supabase.from("profiles").upsert({ id: uid, username })
                      if (error) throw error
                      setProfileUsername(username)

                      if (isDesktop) {
                        const { data: sessionData } = await supabase.auth.getSession()
                        if (sessionData.session) {
                          redirectToDesktop(sessionData.session)
                          return
                        }
                      }
                      setStatus("ready")
                    } catch (e: any) {
                      setError(e.message ?? "Failed to save username")
                    } finally {
                      setSaving(false)
                    }
                  }}
                >
                  {saving ? "Saving…" : "Save username"}
                </Button>
              </div>
            </div>
          ) : status === "ready" ? (
            <div className="space-y-4">
              <div className="w-full border rounded-md p-4 flex items-center gap-4">
                <div className="min-w-[56px] flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full ring-2 ring-border flex items-center justify-center">
                    <ProviderIcon provider={provider} className="h-7 w-7" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base md:text-lg font-semibold leading-tight">{profileUsername || "(no username)"}</p>
                  <p className="text-sm text-muted-foreground break-all">{accountEmail || "(no email)"}</p>
                </div>
              </div>
              {!isDesktop && (
                <div className="flex flex-col gap-2">
                  <Button className="w-full" onClick={() => (window.location.href = "/")}>Continue</Button>
                  <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/projects")}>Create a Project</Button>
                  <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/dashboard")}>Account Dashboard</Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await fetch('/api/auth/signout', { method: 'POST' })
                        await supabase.auth.signOut()
                      } finally {
                        window.location.href = "/signin"
                      }
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              )}
              {isDesktop && (
                <p className="text-center text-sm text-muted-foreground">
                  You may close this browser tab and return to CAPlayground.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Please try again.</p>
              <Button variant="outline" onClick={() => (window.location.href = `/signin${isDesktop ? "?desktop=1" : ""}`)}>
                Back to sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="border-border/80 shadow-none w-full max-w-md">
          <CardContent className="flex items-center gap-2 py-10 justify-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </CardContent>
        </Card>
      </div>
    }>
      <AuthSuccessInner />
    </Suspense>
  )
}
