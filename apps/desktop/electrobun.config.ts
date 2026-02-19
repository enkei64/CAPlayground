import type { ElectrobunConfig } from "electrobun";

export default {
    app: {
        name: "CAPlayground",
        identifier: "com.caplayground.desktop",
        version: "1.0.0",
    },
    runtime: {
        exitOnLastWindowClosed: true,
    },
    build: {
        bun: {
            entrypoint: "src/bun/index.ts",
        },
        views: {
            preload: {
                entrypoint: "src/preload/preload.ts",
            },
        },
        // The Next.js static export output gets copied here by the preBuild script
        // After `next build` produces apps/web/out/, we copy it into views/app/
        copy: {
            // Next.js static export
            "views/app": "views/app",
            // Preload HTML that bootstraps the Next.js static app
            "src/preload/index.html": "views/preload/index.html",
        },
        mac: {
            bundleCEF: true,
            defaultRenderer: "cef",
        },
        linux: {
            bundleCEF: true,
            defaultRenderer: "cef",
        },
        win: {
            bundleCEF: true,
            defaultRenderer: "cef",
        },
    },
    scripts: {
        preBuild: "./scripts/preBuild.ts",
    },
} satisfies ElectrobunConfig;
