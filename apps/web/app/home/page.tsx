"use client"

import { useEffect, useState, Suspense } from "react"
import Image from "next/image"
import { Home, Compass, User, BookOpen, X, Minus, Square, Folder, Settings, Heart, CheckCircle2, LogIn, LogOut } from "lucide-react"
import { ProjectsContent } from "@/app/projects/page"
import { WallpapersGrid } from "@/app/wallpapers/WallpapersGrid"
import AccountPage from "@/app/account/page"
import { SettingsTabs } from "@/components/settings-tabs"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { readText, remove } from "@/lib/fs"
import { useDiscordPresence } from "@/hooks/use-discord-presence"

export default function DesktopHome() {
    const [activeTab, setActiveTab] = useState<"home" | "projects" | "community" | "docs" | "account" | "settings">("home")
    const [platform, setPlatform] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return (window as any).__electrobun?.platform || "unknown";
        }
        return "unknown";
    });
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    const presenceDetails = {
        home: "Browsing home",
        projects: "Browsing projects",
        community: "Browsing community wallpapers",
        docs: "Reading documentation",
        account: "Managing account",
        settings: "Adjusting settings"
    }[activeTab]
    
    useDiscordPresence(presenceDetails, undefined)

    const restoreSession = async () => {
        const supabase = getSupabaseBrowserClient();
        const { data: existing } = await supabase.auth.getSession();
        if (existing.session) {
            setIsSignedIn(true);
            const { data: user } = await supabase.auth.getUser();
            setUsername((user.user as any)?.user_metadata?.username || user.user?.email || null);
            return;
        }
        try {
            const raw = await readText('session.json');
            if (raw) {
                const session = JSON.parse(raw);
                if (session?.access_token && session?.refresh_token) {
                    const { data, error } = await supabase.auth.setSession({
                        access_token: session.access_token,
                        refresh_token: session.refresh_token,
                    });
                    if (!error && data.session) {
                        setIsSignedIn(true);
                        const { data: user } = await supabase.auth.getUser();
                        try {
                            const { data: profile } = await supabase
                                .from("profiles").select("username").eq("id", user.user!.id).maybeSingle();
                            setUsername(profile?.username || user.user?.email || null);
                        } catch {
                            setUsername(user.user?.email || null);
                        }
                    }
                }
            }
        } catch { }
    };

    useEffect(() => {
        document.title = "CAPlayground";

        if (typeof window !== "undefined") {
            const p = (window as any).__electrobun?.platform || "unknown";
            setPlatform(p);
        }

        restoreSession();

        const handleFocus = () => restoreSession();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    const handleWindowControl = (action: "close" | "minimize" | "maximize") => {
        const bridge = (window as any).__electrobunBunBridge;
        if (bridge) {
            bridge.postMessage(JSON.stringify({ type: 'message', id: action + 'Window' }));
        }
    }

    const handleDocsClick = () => openExternal("https://docs.enkei64.xyz")

    const openExternal = (url: string) => {
        if (typeof window === "undefined") return;
        const eb = (window as any).__electrobun;
        const bridge = (window as any).__electrobunBunBridge;
        if (eb?.messages?.openExternal) eb.messages.openExternal(url);
        else if (eb?.openExternal) eb.openExternal(url);
        else if (bridge) bridge.postMessage(JSON.stringify({ type: 'message', id: 'openExternal', payload: url }));
        else window.open(url, "_blank");
    }

    const handleSignIn = () => {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://caplayground.vercel.app";
        openExternal(`${baseUrl}/auth/desktop-authorize`);
    }

    const handleSignOut = async () => {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
        try {
            await remove('session.json');
        } catch { }

        setIsSignedIn(false);
        setUsername(null);

        window.location.reload();
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-accent/30">
            {/* Top drag handle */}
            <div
                className="fixed top-0 left-0 right-0 h-10 select-none z-50 pointer-events-none"
                style={{ WebkitAppRegion: "drag", appRegion: "drag" } as any}
            />

            {platform !== "darwin" && platform !== "mac" && (
                <div className="fixed top-0 right-0 z-[60] flex items-center h-16 px-4 gap-1 drag-none" style={{ WebkitAppRegion: "no-drag", appRegion: "no-drag" } as any}>
                    <button
                        onClick={() => handleWindowControl("minimize")}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted text-muted-foreground/40 hover:text-foreground transition-all rounded-md"
                        title="Minimize"
                    >
                        <Minus className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleWindowControl("maximize")}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted text-muted-foreground/40 hover:text-foreground transition-all rounded-md"
                        title="Maximize"
                    >
                        <Square className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => handleWindowControl("close")}
                        className="w-10 h-10 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/40 transition-all rounded-md"
                        title="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 border-r border-border bg-card/50 flex flex-col z-40 relative">


                {/* Header with Logo */}
                <div className="h-16 flex items-center px-4">
                    <div className="flex items-center gap-2 group/logo flex-shrink-0">
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-sm">
                            <Image
                                src="/icon-light.png"
                                alt="CAPlayground"
                                fill
                                className="object-cover dark:hidden"
                            />
                            <Image
                                src="/icon-dark.png"
                                alt="CAPlayground"
                                fill
                                className="object-cover hidden dark:block"
                            />
                        </div>
                        <span className="font-heading font-bold text-lg tracking-tight">CAPlayground</span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" style={{ WebkitAppRegion: "no-drag", appRegion: "no-drag" } as any}>
                    <button
                        onClick={() => setActiveTab("home")}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            activeTab === "home"
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <Home className="h-4 w-4" />
                        Home
                    </button>
                    <button
                        onClick={() => setActiveTab("projects")}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            activeTab === "projects"
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <Folder className="h-4 w-4" />
                        Projects
                    </button>
                    <button
                        onClick={() => setActiveTab("community")}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            activeTab === "community"
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <Compass className="h-4 w-4" />
                        Community
                    </button>
                </div>

                {/* Bottom Nav */}
                <div className="p-3 space-y-1 mb-2" style={{ WebkitAppRegion: "no-drag", appRegion: "no-drag" } as any}>
                    <button
                        onClick={handleDocsClick}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        Documentation
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            activeTab === "settings"
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </button>
                    {isSignedIn ? (
                        <button
                            onClick={() => setActiveTab("account")}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                                activeTab === "account"
                                    ? "bg-accent text-accent-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{username || "Account"}</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSignIn}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-accent hover:bg-accent/10"
                        >
                            <LogIn className="h-4 w-4 flex-shrink-0" />
                            Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-background relative z-10" style={{ WebkitAppRegion: "no-drag", appRegion: "no-drag" } as any}>
                <div className="h-10 shrink-0" />

                <div className="flex-1 overflow-y-auto px-6 pb-6 relative">
                    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
                        {activeTab === "home" && (
                            <div className="animate-in fade-in duration-700 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[75vh] relative px-6 group mt-12">
                                {/* Large Faded Logo Background */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                                    <div className="relative w-[120%] h-[120%] opacity-[0.03] dark:opacity-[0.05] transition-opacity duration-1000 group-hover:opacity-[0.05] dark:group-hover:opacity-[0.07] top-12">
                                        <Image
                                            src="/icon-light.png"
                                            alt=""
                                            fill
                                            className="object-contain dark:hidden"
                                            style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 90%)' } as any}
                                        />
                                        <Image
                                            src="/icon-dark.png"
                                            alt=""
                                            fill
                                            className="object-contain hidden dark:block"
                                            style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 90%)' } as any}
                                        />
                                    </div>
                                </div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-center bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                        Welcome back!
                                    </h1>
                                    <p className="text-muted-foreground text-center mb-12 text-lg max-w-md">
                                        Your creative space is ready. Pick up where you left off or explore new inspirations.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                                        <button
                                            onClick={() => setActiveTab("projects")}
                                            className="group/btn relative flex flex-col items-center justify-center p-10 bg-card/40 backdrop-blur-md border border-border/50 hover:border-accent/40 rounded-3xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500"
                                        >
                                            <div className="bg-accent/10 p-5 rounded-2xl mb-5 group-hover/btn:scale-110 group-hover/btn:bg-accent/20 transition-all duration-300">
                                                <Folder className="h-10 w-10 text-accent" />
                                            </div>
                                            <h3 className="font-bold text-2xl mb-2">Projects</h3>
                                            <p className="text-sm text-muted-foreground text-center">Manage, create, and edit your local and cloud wallpapers.</p>
                                        </button>

                                        <button
                                            onClick={() => setActiveTab("community")}
                                            className="group/btn relative flex flex-col items-center justify-center p-10 bg-card/40 backdrop-blur-md border border-border/50 hover:border-accent/40 rounded-3xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500"
                                        >
                                            <div className="bg-accent/10 p-5 rounded-2xl mb-5 group-hover/btn:scale-110 group-hover/btn:bg-accent/20 transition-all duration-300">
                                                <Compass className="h-10 w-10 text-accent" />
                                            </div>
                                            <h3 className="font-bold text-2xl mb-2">Community</h3>
                                            <p className="text-sm text-muted-foreground text-center">Browse and download wallpapers created by others.</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "projects" && (
                            <div className="animate-in fade-in duration-300">
                                <div className="pt-4 [&>main>div:first-child>div:first-child]:hidden [&>main]:min-h-0 [&>main]:px-0 [&>main]:py-0">
                                    <ProjectsContent hideBackButton={true} />
                                </div>
                            </div>
                        )}

                        {activeTab === "community" && (
                            <div className="animate-in fade-in duration-300 max-w-6xl mx-auto pt-8">
                                <div className="mb-10 text-center">
                                    <h1 className="font-heading text-4xl md:text-5xl font-bold">Wallpaper Gallery</h1>
                                    <p className="text-muted-foreground mt-3">
                                        Browse wallpapers made by the CAPlayground community.
                                    </p>
                                </div>
                                <WallpapersGrid
                                    data={{ base_url: "https://raw.githubusercontent.com/CAPlayground/wallpapers/main/", wallpapers: [] }}
                                    disableUrlSync={true}
                                />
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="animate-in fade-in duration-300 max-w-4xl mx-auto pt-8">
                                <div className="mb-10">
                                    <h1 className="font-sfpro text-3xl md:text-4xl font-bold">Settings</h1>
                                    <p className="text-muted-foreground mt-2">Manage your app preferences and view credits.</p>
                                </div>

                                <SettingsTabs />
                            </div>
                        )}

                        {activeTab === "account" && (
                            <div className="animate-in fade-in duration-300 relative h-full">
                                <div className="h-full [&>div:first-child>div:first-child]:hidden [&>div]:min-h-0 [&>div]:pt-2">
                                    <AccountPage onBack={() => setActiveTab("home")} />
                                </div>
                            </div>
                        )}
                    </Suspense>
                </div>
            </div>
        </div >
    )
}
