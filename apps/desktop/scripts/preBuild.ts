#!/usr/bin/env bun
import { $ } from "bun";
import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from "fs";
import { resolve, dirname } from "path";

const DESKTOP_ROOT = resolve(import.meta.dirname, "..");
const WEB_ROOT = resolve(DESKTOP_ROOT, "..", "web");
const VIEWS_APP = resolve(DESKTOP_ROOT, "views", "app");
const SHADOW_ROOT = resolve(DESKTOP_ROOT, ".shadow-web");

console.log("[preBuild] Preparing Shadow Web environment for safe build...");

if (existsSync(SHADOW_ROOT)) {
    rmSync(SHADOW_ROOT, { recursive: true, force: true });
}
mkdirSync(SHADOW_ROOT, { recursive: true });

try {
    console.log("[preBuild] Syncing source files to shadow...");
    await $`rsync -a --exclude=".next" --exclude="node_modules" --exclude="out" --exclude=".git" ${WEB_ROOT}/ ${SHADOW_ROOT}/`;

    const webModules = resolve(WEB_ROOT, "node_modules");
    const shadowModules = resolve(SHADOW_ROOT, "node_modules");
    if (existsSync(webModules)) {
        symlinkSync(webModules, shadowModules, "dir");
    }
} catch (e) {
    console.error("[preBuild] Failed to prepare shadow environment:", e);
    process.exit(1);
}

console.log("[preBuild] Applying desktop-specific modifications to shadow...");

const SHADOW_API = resolve(SHADOW_ROOT, "app", "api");
if (existsSync(SHADOW_API)) {
    rmSync(SHADOW_API, { recursive: true, force: true });
}

const shadowPathsToHide = [
    resolve(SHADOW_ROOT, "app", "page.tsx"),
    resolve(SHADOW_ROOT, "app", "contributors"),
    resolve(SHADOW_ROOT, "app", "roadmap"),
    resolve(SHADOW_ROOT, "app", "docs"),
    resolve(SHADOW_ROOT, "app", "privacy"),
    resolve(SHADOW_ROOT, "app", "tos"),
    resolve(SHADOW_ROOT, "app", "tendies-check"),
    resolve(SHADOW_ROOT, "app", "signin"),
    resolve(SHADOW_ROOT, "app", "forgot-password"),
    resolve(SHADOW_ROOT, "app", "reset-password"),
    resolve(SHADOW_ROOT, "public", "featured.mp4"),
    resolve(SHADOW_ROOT, "public", "app-dark.png"),
    resolve(SHADOW_ROOT, "public", "app-light.png"),
];

for (const p of shadowPathsToHide) {
    if (existsSync(p)) {
        rmSync(p, { recursive: true, force: true });
        console.log(`[preBuild] Removed ${p.replace(SHADOW_ROOT, "")} in shadow`);
    }
}

try {
    console.log("[preBuild] Building Next.js static export in shadow...");
    const shadowOut = resolve(SHADOW_ROOT, "out");

    await $`NEXT_PUBLIC_DESKTOP=true bun x next build`.cwd(SHADOW_ROOT);

    if (!existsSync(shadowOut)) {
        throw new Error("Build output 'out' not found in shadow.");
    }


    console.log("[preBuild] Copying build results to desktop views...");
    if (existsSync(VIEWS_APP)) {
        rmSync(VIEWS_APP, { recursive: true, force: true });
    }
    mkdirSync(VIEWS_APP, { recursive: true });
    cpSync(shadowOut, VIEWS_APP, { recursive: true });

} catch (e) {
    console.error("[preBuild] Build failed in shadow environment:", e);
    process.exit(1);
} finally {

    console.log("[preBuild] Cleaning up shadow environment...");
}

const glob = new Bun.Glob("**/*.html");
const htmlFiles = Array.from(glob.scanSync(VIEWS_APP));

for (const relativeHtml of htmlFiles) {
    const htmlPath = resolve(VIEWS_APP, relativeHtml);
    const txtPath = htmlPath.replace(/\.html$/, ".txt");
    const shadowPath = htmlPath + ".txt";

    if (existsSync(txtPath)) {
        console.log(`[preBuild] Found RSC for ${htmlPath}: ${txtPath}`);
        if (!existsSync(shadowPath)) {
            cpSync(txtPath, shadowPath);
        }
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
    }
}

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
        console.log(`[preBuild] Stripped ${removedCount} unused CEF locales.`);
    }
}

console.log("[preBuild] Done! Desktop build assets updated safely.");
