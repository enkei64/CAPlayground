#!/usr/bin/env bun
import { $ } from "bun";
import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { resolve, dirname } from "path";

const DESKTOP_ROOT = resolve(import.meta.dirname, "..");
const WEB_ROOT = resolve(DESKTOP_ROOT, "..", "web");
const WEB_OUT = resolve(WEB_ROOT, "out");
const VIEWS_APP = resolve(DESKTOP_ROOT, "views", "app");

const WEB_API = resolve(WEB_ROOT, "app", "api");
const WEB_API_HIDDEN = resolve(WEB_ROOT, "app", "_api");

console.log("[preBuild] Building Next.js static export...");

let apiHidden = false;
if (existsSync(WEB_API)) {
    console.log("[preBuild] Temporarily hiding API routes...");
    rmSync(WEB_API_HIDDEN, { recursive: true, ce: true });
    require('fs').renameSync(WEB_API, WEB_API_HIDDEN);
    apiHidden = true;
}

const pathsToHide = [
    resolve(WEB_ROOT, "app", "page.tsx"),
    resolve(WEB_ROOT, "app", "contributors"),
    resolve(WEB_ROOT, "app", "roadmap"),
    resolve(WEB_ROOT, "app", "docs"),
    resolve(WEB_ROOT, "app", "privacy"),
    resolve(WEB_ROOT, "app", "tos"),
    resolve(WEB_ROOT, "app", "tendies-check"),
    resolve(WEB_ROOT, "public", "featured.mp4"),
    resolve(WEB_ROOT, "public", "app-dark.png"),
    resolve(WEB_ROOT, "public", "app-light.png"),
];

const hiddenPaths: { original: string, hidden: string }[] = [];
for (const p of pathsToHide) {
    if (existsSync(p)) {
        const hiddenPath = p + ".hidden_for_desktop";
        require('fs').renameSync(p, hiddenPath);
        hiddenPaths.push({ original: p, hidden: hiddenPath });
        console.log(`[preBuild] Temporarily hid ${p.replace(WEB_ROOT, "")}`);
    }
}

try {
    console.log(`  WEB_ROOT: ${WEB_ROOT}`);
    console.log(`  Output:   ${WEB_OUT}`);

    await $`bun run --cwd ${WEB_ROOT} build:desktop`;
} finally {
    if (apiHidden) {
        console.log("[preBuild] Restoring API routes...");
        require('fs').renameSync(WEB_API_HIDDEN, WEB_API);
    }

    for (const hp of hiddenPaths) {
        if (existsSync(hp.hidden)) {
            require('fs').renameSync(hp.hidden, hp.original);
            console.log(`[preBuild] Restored ${hp.original.replace(WEB_ROOT, "")}`);
        }
    }
}

if (!existsSync(WEB_OUT)) {
    console.error("[preBuild] ERROR: Next.js static export not found at", WEB_OUT);
    console.error("  Make sure next.config.mjs has output: 'export' when NEXT_PUBLIC_DESKTOP is set.");
    process.exit(1);
}

if (existsSync(VIEWS_APP)) {
    rmSync(VIEWS_APP, { recursive: true });
}
mkdirSync(VIEWS_APP, { recursive: true });
cpSync(WEB_OUT, VIEWS_APP, { recursive: true });

const glob = new Bun.Glob("**/*.html");
const htmlFiles = Array.from(glob.scanSync(VIEWS_APP));

for (const relativeHtml of htmlFiles) {
    const htmlPath = resolve(VIEWS_APP, relativeHtml);
    const txtPath = htmlPath.replace(/\.html$/, ".txt");
    const shadowPath = htmlPath + ".txt";

    if (existsSync(txtPath)) {
        console.log(`[preBuild] Found RSC for ${htmlPath}: ${txtPath}`);
        if (!existsSync(shadowPath)) {
            console.log(`[preBuild] Creating shadow RSC file: ${shadowPath}`);
            cpSync(txtPath, shadowPath);
        }
    } else {
        console.log(`[preBuild] WARNING: No RSC (.txt) found for ${htmlPath}`);
    }
}

const apiMocks = [
    'api/wallpapers/stats',
    'api/analytics/project-created'
];

for (const mock of apiMocks) {
    const mockPath = resolve(VIEWS_APP, mock);
    if (!existsSync(mockPath)) {
        mkdirSync(dirname(mockPath), { recursive: true });
        require('fs').writeFileSync(mockPath, JSON.stringify({ success: true, mocked: true }));
        console.log(`[preBuild] Created mock API file: ${mockPath}`);
    }
}

console.log("[preBuild] Done! Static export copied to views/app/");

const BUILD_ROOT = resolve(DESKTOP_ROOT, "build");
if (existsSync(BUILD_ROOT)) {
    const globLocales = new Bun.Glob("**/locales/*.pak");
    const localeFiles = Array.from(globLocales.scanSync(BUILD_ROOT));
    let removedCount = 0;
    for (const localePath of localeFiles) {
        if (!localePath.endsWith("en-US.pak")) {
            rmSync(resolve(BUILD_ROOT, localePath));
            removedCount++;
        }
    }
    if (removedCount > 0) {
        console.log(`[preBuild] Stripped ${removedCount} unused CEF locales from build directory.`);
    }
}
