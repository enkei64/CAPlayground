import { BrowserWindow, BrowserView, ApplicationMenu } from "electrobun/bun";
import net from "net";
import os from "os";
import fs from "fs";
import path from "path";

// ── Discord Rich Presence
const DISCORD_CLIENT_ID = "1415226166607876157";

const OP_HANDSHAKE = 0;
const OP_FRAME = 1;

const discordStartTime = Math.floor(Date.now() / 1000);

let discordSock: net.Socket | null = null;
let discordReady = false;
let pendingPresence: { details: string; state?: string } | null = null;

function encodeDiscord(op: number, data: object): Buffer {
    const json = JSON.stringify(data);
    const len = Buffer.byteLength(json);
    const buf = Buffer.alloc(8 + len);
    buf.writeInt32LE(op, 0);
    buf.writeInt32LE(len, 4);
    buf.write(json, 8, len);
    return buf;
}

function setDiscordPresence(details: string, state?: string) {
    if (!discordReady || !discordSock) {
        pendingPresence = { details, state };
        return;
    }
    console.log(`[Discord RPC] Setting presence: ${details} | ${state}`);
    (discordSock as any).write(encodeDiscord(OP_FRAME, {
        cmd: "SET_ACTIVITY",
        args: {
            pid: process.pid,
            activity: {
                details,
                state,
                assets: {
                    large_image: "caplayground_logo",
                    large_text: "CAPlayground",
                },
                timestamps: { start: discordStartTime },
                instance: false,
            },
        },
        nonce: Math.random().toString(36).slice(2),
    }));
}

let isScanningDiscord = false;
function connectDiscord(socketIndex = 0) {
    if (socketIndex === 0) {
        if (isScanningDiscord || discordSock) return;
        isScanningDiscord = true;
    }

    if (socketIndex > 9) {
        console.warn("[Discord RPC] Could not find Discord IPC socket (is Discord running?)");
        isScanningDiscord = false;
        setTimeout(() => connectDiscord(0), 15000);
        return;
    }

    const getFolder = () => {
        const { env } = process;
        if (process.platform === "win32") return "";
        return env.XDG_RUNTIME_DIR || env.TMPDIR || env.TMPSDIR || env.TMP || env.TEMP || "/tmp";
    }

    const socketPath = process.platform === "win32"
        ? `\\\\?\\pipe\\discord-ipc-${socketIndex}`
        : path.join(getFolder(), `discord-ipc-${socketIndex}`);

    const sock = net.createConnection(socketPath, () => {
        discordSock = sock;
        isScanningDiscord = false;
        (sock as any).write(encodeDiscord(OP_HANDSHAKE, { v: 1, client_id: DISCORD_CLIENT_ID }));
        console.log(`[Discord RPC] Connected to ${socketPath}, sending handshake...`);
    });

    let buf = Buffer.alloc(0);
    sock.on("data", (chunk: Buffer) => {
        buf = Buffer.concat([buf, chunk] as any);
        while (buf.length >= 8) {
            const len = buf.readInt32LE(4);
            if (buf.length < 8 + len) break;
            const body = buf.subarray(8, 8 + len).toString("utf8");
            buf = buf.subarray(8 + len);
            try {
                const msg = JSON.parse(body);
                if (msg.evt === "READY") {
                    discordReady = true;
                    console.log("[Discord RPC] Ready! Logged in as:", msg.data?.user?.username);
                    if (pendingPresence) {
                        setDiscordPresence(pendingPresence.details, pendingPresence.state);
                        pendingPresence = null;
                    } else {
                        setDiscordPresence("Browsing projects");
                    }
                }
            } catch { }
        }
    });

    sock.on("error", () => {
    });

    sock.on("close", () => {
        const wasConnected = discordSock === sock;
        if (wasConnected) {
            discordReady = false;
            discordSock = null;
            console.log("[Discord RPC] Connection closed, retrying in 15s...");
            setTimeout(() => connectDiscord(0), 15000);
        } else if (isScanningDiscord) {
            // We were scanning and this index failed, try next
            connectDiscord(socketIndex + 1);
        }
    });
}

connectDiscord();

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
            fs_readText: ({ path: p }: { path: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                if (!fs.existsSync(fullPath)) return null;
                return fs.readFileSync(fullPath, 'utf8');
            },
            fs_readBlob: ({ path: p }: { path: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                if (!fs.existsSync(fullPath)) return null;
                return fs.readFileSync(fullPath).toString('base64');
            },
            fs_listDir: ({ path: p }: { path: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                if (!fs.existsSync(fullPath)) return [];
                return fs.readdirSync(fullPath, { withFileTypes: true }).map((d: any) => ({
                    name: d.name,
                    kind: d.isDirectory() ? 'directory' : 'file'
                }));
            },
            fs_exists: ({ path: p }: { path: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
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
            fs_writeText: ({ path: p, text }: { path: string, text: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, text);
            },
            fs_writeBlob: ({ path: p, base64 }: { path: string, base64: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, Buffer.from(base64, 'base64') as any);
            },
            fs_mkdir: ({ path: p }: { path: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                fs.mkdirSync(fullPath, { recursive: true });
            },
            fs_remove: ({ path: p, recursive }: { path: string, recursive: boolean }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                if (fs.existsSync(fullPath)) {
                    fs.rmSync(fullPath, { recursive });
                }
            },
            discord_updatePresence: (payload: { details: string; state?: string }) => {
                console.log(`[Electrobun Bridge] Received discord_updatePresence:`, payload);
                setDiscordPresence(payload.details, payload.state);
            },
            openExternal: (url: string) => {
                const { spawn } = require('child_process');
                let command;
                if (process.platform === 'darwin') command = 'open';
                else if (process.platform === 'win32') command = 'start';
                else command = 'xdg-open';

                console.log(`[Electrobun] Opening external URL: ${url} using ${command}`);
                spawn(command, [url], { detached: true, stdio: 'ignore' }).unref();
            }
        },
    },
});

// main window
win = new BrowserWindow<any>({
    title: "CAPlayground",
    url: "views://app/home.html",
    frame: {
        width: 1400,
        height: 900,
        x: 100,
        y: 100,
    },
    titleBarStyle: process.platform === "darwin" ? "default" : "hidden",
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
