"use client"

import { useEffect, useState, Suspense } from "react"
import Image from "next/image"
import { Home, Compass, User, BookOpen, X, Minus, Square, Folder, Settings, Heart, CheckCircle2 } from "lucide-react"
import { ProjectsContent } from "@/app/projects/page"
import { WallpapersGrid } from "@/app/wallpapers/WallpapersGrid"
import AccountPage from "@/app/account/page"
import { cn } from "@/lib/utils"

export default function DesktopHome() {
    const [activeTab, setActiveTab] = useState<"home" | "projects" | "community" | "docs" | "account" | "settings">("home")
    const [platform, setPlatform] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return (window as any).__electrobun?.platform || "unknown";
        }
        return "unknown";
    });

    useEffect(() => {
        document.title = "CAPlayground";

        if (typeof window !== "undefined") {
            const p = (window as any).__electrobun?.platform || "unknown";
            setPlatform(p);
        }
    }, [])

    const handleWindowControl = (action: "close" | "minimize" | "maximize") => {
        const bridge = (window as any).__electrobunBunBridge;
        if (bridge) {
            bridge.postMessage(JSON.stringify({ type: 'message', id: action + 'Window' }));
        }
    }

    const handleDocsClick = () => {
        if (typeof window !== "undefined") {
            const eb = (window as any).__electrobun;
            if (eb?.openExternal) {
                eb.openExternal("https://docs.enkei64.xyz");
            } else {
                window.open("https://docs.enkei64.xyz", "_blank");
            }
        }
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-accent/30">
            {/* Top drag handle */}
            <div
                className="fixed top-0 left-0 right-0 h-10 select-none z-50 pointer-events-none"
                style={{ WebkitAppRegion: "drag", appRegion: "drag" } as any}
            />

            {/* Desktop window controls */}
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
                    <button
                        onClick={() => setActiveTab("account")}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            activeTab === "account"
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <User className="h-4 w-4" />
                        Account
                    </button>
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

                                <div className="space-y-6 flex flex-col pb-12">
                                    {/* RPC Settings */}
                                    <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Discord Rich Presence</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-foreground">Share activity</p>
                                                <p className="text-sm text-muted-foreground">Show what you're doing in CAPlayground on Discord.</p>
                                            </div>
                                            <div className="flex py-1 px-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium items-center gap-1.5 border border-green-500/20">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Always Active
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                                            Currently, Discord integrations are baked directly into the desktop client.
                                            Future updates will implement dynamic toggle controls!
                                        </div>
                                    </div>

                                    {/* Credits Settings */}
                                    <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                                        <h3 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                                            <Heart className="h-5 w-5 text-red-500" />
                                            Credits & Contributors
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            CAPlayground is made possible by an incredible open-source community. Special thanks to the following contributors for their work on the underlying technologies:
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="p-4 border rounded-lg bg-background">
                                                <h4 className="font-bold flex items-center gap-2 mb-1">
                                                    enkei64
                                                </h4>
                                                <p className="text-xs text-muted-foreground">Creator and Lead Maintainer of CAPlayground</p>
                                            </div>
                                            <div className="p-4 border rounded-lg bg-background">
                                                <h4 className="font-bold mb-1">TattoistDev</h4>
                                                <p className="text-xs text-muted-foreground">Developer of CAPlayground, Wallpapers Maintainer</p>
                                            </div>
                                            <div className="p-4 border rounded-lg bg-background">
                                                <h4 className="font-bold mb-1">blackboardsh</h4>
                                                <p className="text-xs text-muted-foreground">Creator of Electrobun framework used for desktop platform builds</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-center">
                                            <button
                                                onClick={() => {
                                                    const url = 'https://caplayground.vercel.app/contributors';
                                                    if (typeof window !== "undefined") {
                                                        const eb = (window as any).__electrobun;
                                                        if (eb?.openExternal) {
                                                            eb.openExternal(url);
                                                        } else {
                                                            window.open(url, '_blank');
                                                        }
                                                    }
                                                }}
                                                className="text-sm font-medium text-accent hover:underline flex items-center gap-1 group/more"
                                            >
                                                View more contributors <Compass className="h-3 w-3 transition-transform group-hover/more:rotate-45" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
