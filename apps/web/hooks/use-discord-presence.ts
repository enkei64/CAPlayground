import { useEffect } from "react";

export function useDiscordPresence(details: string, state?: string) {
    useEffect(() => {
        if (typeof window === "undefined") return;
        const bridge = (window as any).__electrobun;
        if (!bridge?.updatePresence) return;
        bridge.updatePresence(details, state);
    }, [details, state]);
}
