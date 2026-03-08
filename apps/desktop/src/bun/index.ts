import { BrowserWindow, BrowserView, ApplicationMenu } from "electrobun/bun";
import net from "net";
import os from "os";
import fs from "fs";
import path from "path";
import { execSync, spawn } from "child_process";


const APP_DATA_DIR = path.join(os.homedir(), ".caplayground");
const SESSION_FILE = path.join(APP_DATA_DIR, "session.json");
const PROTOCOL_SCHEME = "caplayground";

function getAppExecutablePath(): string {
    const bunExe = process.execPath;
    const binDir = path.dirname(bunExe);

    const candidates = [
        path.join(binDir, "launcher"),
        path.join(binDir, "CAPlayground"),
        path.join(binDir, "CAPlayground-dev"),
        path.join(binDir, "..", "CAPlayground"),
        path.join(binDir, "..", "CAPlayground-dev"),
    ];

    for (const c of candidates) {
        if (fs.existsSync(c)) return path.resolve(c);
    }

    return bunExe;
}

function registerProtocolHandlerLinux() {
    try {
        const bunExe = process.execPath;
        const binDir = path.dirname(bunExe);
        const scriptPath = process.argv[1];
        const appDir = path.join(os.homedir(), ".local", "share", "applications");
        const capBinDir = path.join(APP_DATA_DIR, "bin");

        fs.mkdirSync(appDir, { recursive: true });
        fs.mkdirSync(capBinDir, { recursive: true });

        const wrapperPath = path.join(capBinDir, "caplayground-handler");
        const wrapperContent = [
            "#!/bin/bash",
            `cd "${binDir}"`,
            `export LD_PRELOAD="./libcef.so:./libvk_swiftshader.so:$LD_PRELOAD"`,
            `exec "./bun" "${scriptPath}" "$@"`
        ].join("\n");

        fs.writeFileSync(wrapperPath, wrapperContent, { mode: 0o755 });
        logDebug(`Created Linux protocol wrapper at ${wrapperPath}`);

        const desktopContent = [
            "[Desktop Entry]",
            "Name=CAPlayground",
            "Type=Application",
            `Exec="${wrapperPath}" %u`,
            "Icon=caplayground",
            "Terminal=false",
            "Categories=Graphics;",
            `MimeType=x-scheme-handler/${PROTOCOL_SCHEME};`,
            "NoDisplay=true",
        ].join("\n");

        const desktopFile = path.join(appDir, "caplayground-handler.desktop");
        fs.writeFileSync(desktopFile, desktopContent);

        try { execSync(`xdg-mime default caplayground-handler.desktop x-scheme-handler/${PROTOCOL_SCHEME}`, { stdio: "ignore" }); } catch { }
        try { execSync(`update-desktop-database "${appDir}"`, { stdio: "ignore" }); } catch { }
        logDebug(`Registered protocol handler on Linux (${desktopFile})`);
    } catch (e) {
        logDebug(`ERROR: Could not register protocol handler on Linux: ${e}`);
        console.warn("[DeepLink] Could not register protocol handler on Linux:", e);
    }
}

function registerProtocolHandlerWindows() {
    try {
        const execPath = getAppExecutablePath();
        const regKey = `HKCU\\Software\\Classes\\${PROTOCOL_SCHEME}`;
        execSync(`reg add "${regKey}" /ve /d "URL:${PROTOCOL_SCHEME} Protocol" /f`, { stdio: "ignore" });
        execSync(`reg add "${regKey}" /v "URL Protocol" /d "" /f`, { stdio: "ignore" });
        execSync(`reg add "${regKey}\\shell\\open\\command" /ve /d "\\"${execPath}\\" \\"%1\\"" /f`, { stdio: "ignore" });
        console.log("[DeepLink] Registered protocol handler on Windows");
    } catch (e) {
        console.warn("[DeepLink] Could not register protocol handler on Windows:", e);
    }
}

function ensureProtocolHandlerRegistered() {
    const flagFile = path.join(APP_DATA_DIR, ".protocol_registered");
    const execPath = getAppExecutablePath();
    let alreadyDone = false;
    try {
        const flag = JSON.parse(fs.readFileSync(flagFile, "utf8"));
        alreadyDone = flag.execPath === execPath;
    } catch { }

    if (alreadyDone) return;

    if (process.platform === "linux") registerProtocolHandlerLinux();
    else if (process.platform === "win32") registerProtocolHandlerWindows();

    fs.mkdirSync(APP_DATA_DIR, { recursive: true });
    fs.writeFileSync(flagFile, JSON.stringify({ execPath, registeredAt: Date.now() }));
}

function parseDeepLinkArg(arg: string): { access_token: string; refresh_token: string; expires_in: number } | null {
    try {
        if (!arg.startsWith(`${PROTOCOL_SCHEME}://auth`)) return null;
        const normalised = arg.replace("#", "?").replace(`${PROTOCOL_SCHEME}://auth`, "https://x.invalid/auth");
        const u = new URL(normalised);
        const access_token = u.searchParams.get("access_token");
        const refresh_token = u.searchParams.get("refresh_token");
        const expires_in = parseInt(u.searchParams.get("expires_in") ?? "3600", 10);
        if (!access_token || !refresh_token) return null;
        return { access_token, refresh_token, expires_in };
    } catch {
        return null;
    }
}

function saveSession(tokens: { access_token: string; refresh_token: string; expires_in: number }) {
    fs.mkdirSync(APP_DATA_DIR, { recursive: true });
    fs.writeFileSync(SESSION_FILE, JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        saved_at: Date.now(),
    }));
    console.log("[DeepLink] Session saved to", SESSION_FILE);
}

let pendingDeepLinkSession: { access_token: string; refresh_token: string; expires_in: number } | null = null;
let isDeepLinkLaunch = false;

const DEBUG_LOG = "/tmp/cap_auth.log";
function logDebug(msg: string) {
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(DEBUG_LOG, `[${timestamp}] ${msg}\n`);
    } catch { }
}

logDebug(`App started with argv: ${JSON.stringify(process.argv)}`);

for (const arg of process.argv) {
    const parsed = parseDeepLinkArg(arg);
    if (parsed) {
        logDebug(`Detected deep link: ${arg}`);
        saveSession(parsed);
        logDebug(`Session saved to ${SESSION_FILE}`);
        pendingDeepLinkSession = parsed;
        isDeepLinkLaunch = true;
        break;
    }
}

try {
    fs.mkdirSync(APP_DATA_DIR, { recursive: true });
    const cefCachePath = path.join(os.homedir(), ".cache", "com.caplayground.desktop");
    fs.mkdirSync(cefCachePath, { recursive: true });
} catch (e) {
    console.warn("[Init] Failed to ensure directories exist:", e);
}

ensureProtocolHandlerRegistered();

let otherInstanceRunning = false;
const INSTANCE_LOCK_FILE = path.join(APP_DATA_DIR, ".instance_lock");

try {
    const lockFd = fs.openSync(INSTANCE_LOCK_FILE, 'wx');
    fs.writeFileSync(lockFd, String(process.pid));
    fs.closeSync(lockFd);
    
    process.on('exit', () => {
        try { fs.unlinkSync(INSTANCE_LOCK_FILE); } catch { }
    });
} catch (e) {
    otherInstanceRunning = true;
}

if (isDeepLinkLaunch && otherInstanceRunning) {
    console.log("[DeepLink] Another instance is running, helper exiting after saving session.");
    process.exit(0);
}



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
            connectDiscord(socketIndex + 1);
        }
    });
}

connectDiscord();

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
            fs_readSession: () => {
                if (!fs.existsSync(SESSION_FILE)) return null;
                try {
                    return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
                } catch {
                    return null;
                }
            },
            fs_writeText: ({ path: p, text }: { path: string, text: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, text);
                return { success: true };
            },
            fs_writeBlob: ({ path: p, base64 }: { path: string, base64: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, Buffer.from(base64, 'base64') as any);
                return { success: true };
            },
            fs_mkdir: ({ path: p }: { path: string }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                fs.mkdirSync(fullPath, { recursive: true });
                return { success: true };
            },
            fs_remove: ({ path: p, recursive }: { path: string, recursive: boolean }) => {
                const fullPath = path.resolve(os.homedir(), '.caplayground', p);
                if (fs.existsSync(fullPath)) {
                    fs.rmSync(fullPath, { recursive });
                }
                return { success: true };
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

if (process.platform === "darwin") {
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
} else {
    ApplicationMenu.setApplicationMenu([]);
}

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
