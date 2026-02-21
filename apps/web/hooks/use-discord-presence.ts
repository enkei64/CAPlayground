import { useEffect } from "react";
import { bunMessage } from "@/lib/fs";

export function useDiscordPresence(details: string, state?: string) {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const bridge = (window as any).__electrobunBunBridge;
        if (!bridge) return;

        bunMessage("discord_updatePresence", { details, state });
    }, [details, state]);
}
