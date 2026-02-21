
import { Electroview } from "electrobun/view";

const rpc = Electroview.defineRPC<any>({
    handlers: {
        requests: {},
        messages: {}
    }
});

const electrobun = new Electroview({ rpc });

(window as any).__electrobun = {
    close: () => {
        const b = (window as any).__electrobunBunBridge;
        if (b) b.postMessage(JSON.stringify({ type: 'message', id: 'closeWindow' }));
    },
    minimize: () => {
        const b = (window as any).__electrobunBunBridge;
        if (b) b.postMessage(JSON.stringify({ type: 'message', id: 'minimizeWindow' }));
    },
    maximize: () => {
        const b = (window as any).__electrobunBunBridge;
        if (b) b.postMessage(JSON.stringify({ type: 'message', id: 'maximizeWindow' }));
    },
    platform: "unknown",
    updatePresence: (details: string, state?: string) => {
        const b = (window as any).__electrobunBunBridge;
        if (b) {
            b.postMessage(JSON.stringify({
                type: 'message',
                id: 'discord_updatePresence',
                payload: { details, state }
            }));
        }
    },
};

const ua = navigator.userAgent.toLowerCase();
if (ua.includes("mac") || ua.includes("darwin")) {
    (window as any).__electrobun.platform = "darwin";
    document.documentElement.setAttribute("data-desktop-platform", "darwin");
} else if (ua.includes("win")) {
    (window as any).__electrobun.platform = "win32";
    document.documentElement.setAttribute("data-desktop-platform", "win32");
} else {
    (window as any).__electrobun.platform = "linux";
    document.documentElement.setAttribute("data-desktop-platform", "linux");
}

document.documentElement.setAttribute("data-desktop", "true");
