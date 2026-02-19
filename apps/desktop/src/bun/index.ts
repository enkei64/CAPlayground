import { BrowserWindow, BrowserView, ApplicationMenu } from "electrobun/bun";

// Define the RPC schema
type MyRPC = {
    bun: {
        messages: {
            closeWindow: () => void;
            minimizeWindow: () => void;
            maximizeWindow: () => void;
        };
    };
    webview: {
        messages: {};
    };
};

let win: BrowserWindow<any>;

// Define RPC handlers
const rpc = BrowserView.defineRPC<any>({
    handlers: {
        requests: {
            fs_readText: ({ path }: { path: string }) => {
                const fs = require('fs');
                const fullPath = require('path').resolve(process.env.HOME || process.env.USERPROFILE, '.caplayground', path);
                if (!fs.existsSync(fullPath)) return null;
                return fs.readFileSync(fullPath, 'utf8');
            },
            fs_readBlob: ({ path }: { path: string }) => {
                const fs = require('fs');
                const fullPath = require('path').resolve(process.env.HOME || process.env.USERPROFILE, '.caplayground', path);
                if (!fs.existsSync(fullPath)) return null;
                return fs.readFileSync(fullPath).toString('base64');
            },
            fs_listDir: ({ path }: { path: string }) => {
                const fs = require('fs');
                const fullPath = require('path').resolve(process.env.HOME || process.env.USERPROFILE, '.caplayground', path);
                if (!fs.existsSync(fullPath)) return [];
                return fs.readdirSync(fullPath, { withFileTypes: true }).map((d: any) => ({
                    name: d.name,
                    kind: d.isDirectory() ? 'directory' : 'file'
                }));
            },
            fs_exists: ({ path }: { path: string }) => {
                const fs = require('fs');
                const fullPath = require('path').resolve(process.env.HOME || process.env.USERPROFILE, '.caplayground', path);
                return fs.existsSync(fullPath);
            },
        },
        messages: {
            closeWindow: () => win.close(),
            minimizeWindow: () => win.minimize(),
            maximizeWindow: () => {
                if (win.isMaximized()) {
                    win.unmaximize();
                } else {
                    win.maximize();
                }
            },
            // FS Bridge for Desktop
            fs_writeText: ({ path, text }: { path: string, text: string }) => {
                const fs = require('fs');
                const { dirname } = require('path');
                const fullPath = require('path').resolve(process.env.HOME || process.env.USERPROFILE, '.caplayground', path);
                fs.mkdirSync(dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, text);
            },
            fs_writeBlob: ({ path, base64 }: { path: string, base64: string }) => {
                const fs = require('fs');
                const { dirname } = require('path');
                const fullPath = require('path').resolve(process.env.HOME || process.env.USERPROFILE, '.caplayground', path);
                fs.mkdirSync(dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, Buffer.from(base64, 'base64'));
            },
            fs_mkdir: ({ path }: { path: string }) => {
                const fs = require('fs');
                const fullPath = require('path').resolve(process.env.HOME || process.env.USERPROFILE, '.caplayground', path);
                fs.mkdirSync(fullPath, { recursive: true });
            },
            fs_remove: ({ path, recursive }: { path: string, recursive: boolean }) => {
                const fs = require('fs');
                const fullPath = require('path').resolve(process.env.HOME || process.env.USERPROFILE, '.caplayground', path);
                if (fs.existsSync(fullPath)) {
                    fs.rmSync(fullPath, { recursive });
                }
            }
        },
    },
});

// main window
win = new BrowserWindow<any>({
    title: "CAPlayground",
    url: "views://app/projects.html",
    frame: {
        width: 1400,
        height: 900,
        x: 100,
        y: 100,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    rpc
});

ApplicationMenu.setApplicationMenu([
    {
        submenu: [
            { label: "About CAPlayground", role: "about" },
            { type: "separator" },
            { label: "Quit", role: "quit" },
        ],
    },
    {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
        ],
    },
    {
        label: "View",
        submenu: [
            { label: "Reload", action: "reload" },
            { type: "separator" },
            { label: "Actual Size", action: "actualSize" },
            { label: "Zoom In", action: "zoomIn" },
            { label: "Zoom Out", action: "zoomOut" },
            { type: "separator" },
            { label: "Toggle Full Screen", action: "toggleFullScreen" },
        ],
    },
    {
        label: "Window",
        submenu: [
            { role: "minimize" },
            { role: "zoom" },
            { type: "separator" },
            { role: "front" },
        ],
    },
]);

ApplicationMenu.on("application-menu-clicked", (event: any) => {
    const action = event as string;
    switch (action) {
        case "reload":
            break;
        case "toggleFullScreen":
            if (win.isFullScreen()) {
                win.setFullScreen(false);
            } else {
                win.setFullScreen(true);
            }
            break;
    }
});
