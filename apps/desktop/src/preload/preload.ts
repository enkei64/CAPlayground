/**
 * Preload script for the CAPlayground desktop webview.
 * 
 * Initializes Electrobun's Electroview class which:
 * - Enables drag regions via `electrobun-webkit-app-region-drag` CSS class
 * - Provides RPC to communicate with the main bun process
 * 
 * Exposes window control functions on window.__electrobun for the React app to use.
 */
import { Electroview } from "electrobun/view";

const electrobun = new Electroview();

// Expose window control RPC calls globally so the React app can call them
(window as any).__electrobun = {
    close: () => electrobun.rpc.send.closeWindow(),
    minimize: () => electrobun.rpc.send.minimizeWindow(),
    maximize: () => electrobun.rpc.send.maximizeWindow(),
    platform: "unknown", // Will be overridden by env detection
};

// Detect platform from user agent for CSS adjustments
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

// Mark that we're in desktop mode
document.documentElement.setAttribute("data-desktop", "true");
