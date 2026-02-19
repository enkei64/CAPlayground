"use client";
import { useEffect } from "react";

export function DesktopSetup() {
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DESKTOP === 'true') {
            console.log("[DesktopSetup] Initializing fetch monkey-patch for desktop environment...");

            const originalFetch = window.fetch;
            window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
                let url: string = "";

                if (typeof input === 'string') {
                    url = input;
                } else if (input instanceof URL) {
                    url = input.toString();
                } else if (input instanceof Request) {
                    url = input.url;
                }

                if (url.includes('views://') || (!url.startsWith('http') && url.includes('?'))) {
                    const [cleanUrl, queryString] = url.split('?');
                    if (queryString) {
                        if (typeof input === 'string') {
                            input = cleanUrl;
                        } else if (input instanceof URL) {
                            input = new URL(cleanUrl);
                        } else if (input instanceof Request) {
                            input = new Request(cleanUrl, input);
                        }
                    }
                }

                return originalFetch.call(this, input, init);
            };
        }
    }, []);

    return null;
}
