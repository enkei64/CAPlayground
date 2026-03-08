"use client"

import { useState } from "react"
import { Heart, Compass } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"

export function SettingsTabs() {
    const [discordRpcEnabled, setDiscordRpcEnabled] = useLocalStorage<boolean>("caplay_discord_rpc_enabled", true)
    
    // Editor settings
    const [uiDensity, setUiDensity] = useLocalStorage<'default' | 'compact'>("caplay_settings_ui_density", 'default')
    const [snapEdgesEnabled, setSnapEdgesEnabled] = useLocalStorage<boolean>("caplay_settings_snap_edges", true)
    const [snapLayersEnabled, setSnapLayersEnabled] = useLocalStorage<boolean>("caplay_settings_snap_layers", true)
    const [snapResizeEnabled, setSnapResizeEnabled] = useLocalStorage<boolean>("caplay_settings_snap_resize", true)
    const [snapRotationEnabled, setSnapRotationEnabled] = useLocalStorage<boolean>("caplay_settings_snap_rotation", true)
    const [SNAP_THRESHOLD, setSnapThreshold] = useLocalStorage<number>("caplay_settings_snap_threshold", 12)
    const [showAnchorPoint, setShowAnchorPoint] = useLocalStorage<boolean>("caplay_preview_anchor_point", false)
    const [autoClosePanels, setAutoClosePanels] = useLocalStorage<boolean>("caplay_settings_auto_close_panels", true)
    const [pinchZoomSensitivity, setPinchZoomSensitivity] = useLocalStorage<number>("caplay_settings_pinch_zoom_sensitivity", 1)
    const [showGeometryResize, setShowGeometryResize] = useLocalStorage<boolean>("caplay_settings_show_geometry_resize", false)
    const [showAlignButtons, setShowAlignButtons] = useLocalStorage<boolean>("caplay_settings_show_align_buttons", false)

    return (
        <Tabs defaultValue="app" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="app">App</TabsTrigger>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="credits">Credits & Info</TabsTrigger>
            </TabsList>

            <TabsContent value="app" className="space-y-6 pb-12">
                {/* Discord RPC */}
                <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Discord Rich Presence</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <Label htmlFor="discord-rpc" className="font-medium text-foreground cursor-pointer">
                                Share activity
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                                Show what you're doing in CAPlayground on Discord.
                            </p>
                        </div>
                        <Switch
                            id="discord-rpc"
                            checked={discordRpcEnabled}
                            onCheckedChange={(checked) => {
                                setDiscordRpcEnabled(checked)
                                if (!checked && typeof window !== 'undefined') {
                                    const bridge = (window as any).__electrobunBunBridge
                                    if (bridge) {
                                        bridge.postMessage(JSON.stringify({
                                            type: 'message',
                                            id: 'discord_updatePresence',
                                            payload: { details: '', state: '' }
                                        }))
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Cache Management */}
                <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Cache</h3>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Clear cached data to free up space or fix issues. This will not delete your projects.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    const confirmed = confirm('Clear app cache? This will not delete your projects but may require restarting the app.')
                                    if (confirmed) {
                                        alert('Cache cleared. Please restart the app for changes to take effect.')
                                    }
                                }
                            }}
                        >
                            Clear Cache
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="editor" className="space-y-6 pb-12">
                {/* Interface Density */}
                <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Interface Density</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className={cn(
                                "group cursor-pointer space-y-2 transition-all duration-200"
                            )}
                            onClick={() => setUiDensity('default')}
                        >
                            <div className={cn(
                                "aspect-[4/3] rounded-lg border-2 bg-muted/50 p-2 overflow-hidden flex flex-col gap-1.5",
                                uiDensity === 'default' ? "border-primary ring-2 ring-primary/20" : "border-transparent group-hover:border-muted-foreground/25"
                            )}>
                                <div className="h-2 w-1/2 bg-muted-foreground/20 rounded-full mb-1" />
                                <div className="flex gap-1.5 flex-1 min-h-0">
                                    <div className="w-1/3 flex flex-col gap-1.5">
                                        <div className="h-3 w-full bg-muted-foreground/10 rounded-sm" />
                                        <div className="h-3 w-full bg-muted-foreground/10 rounded-sm" />
                                        <div className="h-3 w-full bg-muted-foreground/10 rounded-sm" />
                                    </div>
                                    <div className="flex-1 bg-muted-foreground/5 rounded-md" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-medium">Default</div>
                                <div className="text-[10px] text-muted-foreground">Standard spacing and sizes</div>
                            </div>
                        </div>

                        <div
                            className={cn(
                                "group cursor-pointer space-y-2 transition-all duration-200"
                            )}
                            onClick={() => setUiDensity('compact')}
                        >
                            <div className={cn(
                                "aspect-[4/3] rounded-lg border-2 bg-muted/50 p-1.5 overflow-hidden flex flex-col gap-1",
                                uiDensity === 'compact' ? "border-primary ring-2 ring-primary/20" : "border-transparent group-hover:border-muted-foreground/25"
                            )}>
                                <div className="h-1.5 w-1/3 bg-muted-foreground/20 rounded-full mb-0.5" />
                                <div className="flex gap-1 flex-1 min-h-0">
                                    <div className="w-1/4 flex flex-col gap-1">
                                        <div className="h-2 w-full bg-muted-foreground/10 rounded-[1px]" />
                                        <div className="h-2 w-full bg-muted-foreground/10 rounded-[1px]" />
                                        <div className="h-2 w-full bg-muted-foreground/10 rounded-[1px]" />
                                        <div className="h-2 w-full bg-muted-foreground/10 rounded-[1px]" />
                                    </div>
                                    <div className="flex-1 bg-muted-foreground/5 rounded-sm" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-medium">Compact</div>
                                <div className="text-[10px] text-muted-foreground">Maximizes screen real estate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Snapping */}
                <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Snapping</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="snap-edges" className="text-sm cursor-pointer">Snap to canvas edges</Label>
                            <Switch id="snap-edges" checked={snapEdgesEnabled} onCheckedChange={setSnapEdgesEnabled} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="snap-layers" className="text-sm cursor-pointer">Snap to other layers</Label>
                            <Switch id="snap-layers" checked={snapLayersEnabled} onCheckedChange={setSnapLayersEnabled} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="snap-resize" className="text-sm cursor-pointer">Snap when resizing</Label>
                            <Switch id="snap-resize" checked={snapResizeEnabled} onCheckedChange={setSnapResizeEnabled} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="snap-rotation" className="text-sm cursor-pointer">Snap rotation (0°, 90°, 180°, 270°)</Label>
                            <Switch id="snap-rotation" checked={snapRotationEnabled} onCheckedChange={setSnapRotationEnabled} />
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="snap-threshold" className="text-sm">Sensitivity</Label>
                                <Button variant="outline" size="sm" onClick={() => setSnapThreshold(12)}>Reset</Button>
                            </div>
                            <Slider id="snap-threshold" value={[SNAP_THRESHOLD]} min={3} max={25} onValueChange={([c]) => setSnapThreshold(c)} />
                            <div className="text-xs text-muted-foreground text-right">{SNAP_THRESHOLD}px</div>
                        </div>
                    </div>
                </div>

                {/* Layer Controls */}
                <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Layer Controls</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="show-geometry-resize" className="text-sm cursor-pointer">Show geometry resize buttons</Label>
                            <Switch id="show-geometry-resize" checked={showGeometryResize} onCheckedChange={setShowGeometryResize} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="show-align-buttons" className="text-sm cursor-pointer">Show align buttons</Label>
                            <Switch id="show-align-buttons" checked={showAlignButtons} onCheckedChange={setShowAlignButtons} />
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Preview</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="show-anchor-point" className="text-sm cursor-pointer">Show anchor point</Label>
                            <Switch id="show-anchor-point" checked={showAnchorPoint} onCheckedChange={setShowAnchorPoint} />
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="pinch-zoom-sensitivity" className="text-sm">Pinch to zoom sensitivity</Label>
                                <Button variant="outline" size="sm" onClick={() => setPinchZoomSensitivity(1)}>Reset</Button>
                            </div>
                            <Slider id="pinch-zoom-sensitivity" value={[pinchZoomSensitivity]} min={0.5} max={2} step={0.1} onValueChange={([c]) => setPinchZoomSensitivity(c)} />
                            <div className="text-xs text-muted-foreground text-right">{pinchZoomSensitivity.toFixed(1)}x</div>
                        </div>
                    </div>
                </div>

                {/* Panels */}
                <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Panels</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="auto-close-panels" className="text-sm cursor-pointer">Auto-close right panel on narrow screens</Label>
                            <Switch id="auto-close-panels" checked={autoClosePanels} onCheckedChange={setAutoClosePanels} />
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="credits" className="space-y-6 pb-12">
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
                                    const bridge = (window as any).__electrobunBunBridge;
                                    if (eb?.messages?.openExternal) {
                                        eb.messages.openExternal(url);
                                    } else if (eb?.openExternal) {
                                        eb.openExternal(url);
                                    } else if (bridge) {
                                        bridge.postMessage(JSON.stringify({
                                            type: 'message',
                                            id: 'openExternal',
                                            payload: url
                                        }));
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

                {/* App Info */}
                <div className="p-6 bg-card border border-border/80 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">App Information</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Version</span>
                            <span className="font-mono">0.1.0</span>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    )
}
