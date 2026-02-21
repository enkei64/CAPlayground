
import { Electroview } from "electrobun/view";

const rpc = Electroview.defineRPC<any>({
    handlers: {
        requests: {},
        messages: {}
    }
});

const electrobun = new Electroview({ rpc });

(window as any).__electrobun = {
    close: () => rpc.send("closeWindow"),
    minimize: () => rpc.send("minimizeWindow"),
    maximize: () => rpc.send("maximizeWindow"),
    platform: "unknown",
    updatePresence: (details: string, state?: string) =>
        (rpc.send as any)("discord_updatePresence", { details, state }),
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
