"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Loader2, ShieldCheck, LogIn, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

// The deep link scheme the desktop app registers as its protocol handler
const DESKTOP_SCHEME = "caplayground"

export default function DesktopAuthorizePage() {
    const [status, setStatus] = useState<"checking" | "signed_in" | "not_signed_in" | "success">("checking")
    const [username, setUsername] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [authorizing, setAuthorizing] = useState(false)

    const supabase = getSupabaseBrowserClient()

    useEffect(() => {
        async function check() {
            const { data } = await supabase.auth.getUser()
            const user = data.user
            if (!user) {
                setStatus("not_signed_in")
                return
            }
            setEmail(user.email ?? null)
            // Try to get their profile username
            try {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("username")
                    .eq("id", user.id)
                    .maybeSingle()
                setUsername(profile?.username ?? user.email ?? null)
            } catch {
                setUsername(user.email ?? null)
            }
            setStatus("signed_in")
        }
        check()
    }, [supabase])

    const handleAuthorize = async () => {
        setAuthorizing(true)
        try {
            const { data, error } = await supabase.auth.getSession()
            if (error || !data.session) {
                setStatus("not_signed_in")
                return
            }
            const { access_token, refresh_token, expires_in } = data.session
            // Build the deep link. Tokens go in the fragment (#) so they are
            // never sent to any server and don't appear in server logs.
            const params = new URLSearchParams({
                access_token,
                refresh_token,
                expires_in: String(expires_in),
                token_type: "bearer",
            })
            const deepLink = `${DESKTOP_SCHEME}://auth#${params.toString()}`
            // Redirect the browser to the deep link — the OS will hand it to the app
            window.location.href = deepLink
            // Show success message after a short delay
            setTimeout(() => setStatus("success"), 1000)
        } catch {
            setAuthorizing(false)
        }
    }

    if (status === "checking") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="border-border/80 shadow-none w-full max-w-md">
                    <CardContent className="flex items-center gap-3 py-10 justify-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Checking your session…
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (status === "not_signed_in") {
        // Redirect to regular sign-in with desktop=1 so it returns here via deep link
        if (typeof window !== "undefined") {
            window.location.href = "/signin?desktop=1"
        }
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="border-border/80 shadow-none w-full max-w-md">
                    <CardContent className="flex items-center gap-3 py-10 justify-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Redirecting to sign in…
                    </CardContent>
                </Card>
            </div>
        )
    }
    if (status === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="border-border/80 shadow-none w-full max-w-md">
                    <CardHeader className="text-center pt-8">
                        <div className="mx-auto h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-6 w-6 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Authorized!</CardTitle>
                        <CardDescription>
                            You have successfully authorized the desktop app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-6">
                            You can now safely close this browser tab and return to the CAPlayground app.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => window.close()}>
                            Close Tab
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="border-border/80 shadow-none w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                        <ShieldCheck className="h-7 w-7 text-accent" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Authorize CAPlayground</CardTitle>
                    <CardDescription>
                        The desktop app is requesting access to your account.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Account info card */}
                    <div className="border border-border rounded-lg p-4 flex items-center gap-4 bg-muted/30">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{username || "(no username)"}</p>
                            <p className="text-xs text-muted-foreground truncate">{email}</p>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-2 bg-muted/30 rounded-lg p-3">
                        <p className="font-medium text-foreground">CAPlayground Desktop will be able to:</p>
                        <ul className="space-y-1">
                            <li className="flex items-start gap-2">
                                <span className="text-accent font-bold mt-px">✓</span>
                                View your profile and username
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent font-bold mt-px">✓</span>
                                Submit wallpapers on your behalf
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-accent font-bold mt-px">✓</span>
                                Manage your account preferences
                            </li>
                        </ul>
                    </div>

                    <Button
                        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold h-11"
                        onClick={handleAuthorize}
                        disabled={authorizing}
                    >
                        {authorizing ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Authorizing…</>
                        ) : (
                            <><ShieldCheck className="h-4 w-4 mr-2" /> Authorize Desktop App</>
                        )}
                    </Button>

                    <div className="text-center space-y-2">
                        <p className="text-xs text-muted-foreground">Not you?</p>
                        <Link
                            href="/signin?desktop=1"
                            className="text-xs text-accent hover:underline flex items-center justify-center gap-1"
                        >
                            <LogIn className="h-3 w-3" />
                            Sign in as a different account
                        </Link>
                    </div>

                    <p className="text-center text-xs text-muted-foreground border-t pt-4">
                        Once authorized, you can close this browser tab and return to the app.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
