"use client"
import Link from "next/link"
import { ComponentProps } from "react"

export function ExternalLink(props: ComponentProps<typeof Link>) {
    const { href, onClick, ...rest } = props

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (typeof window !== "undefined") {
            const eb = (window as any).__electrobun;
            const bridge = (window as any).__electrobunBunBridge;

            const isDesktop = !!eb || !!bridge || process.env.NEXT_PUBLIC_DESKTOP === "true";

            if (isDesktop) {
                e.preventDefault();

                let fullUrl = href.toString();
                if (fullUrl.startsWith("/")) {
                    fullUrl = "https://caplayground.vercel.app" + fullUrl;
                }

                if (eb?.messages?.openExternal) {
                    eb.messages.openExternal(fullUrl);
                } else if (eb?.openExternal) {
                    eb.openExternal(fullUrl);
                } else if (bridge) {
                    bridge.postMessage(JSON.stringify({
                        type: 'message',
                        id: 'openExternal',
                        payload: fullUrl
                    }));
                } else {
                    window.open(fullUrl, "_blank");
                }

                return;
            }
        }

        if (onClick) onClick(e);
    }

    return <Link href={href} onClick={handleClick} {...rest} />
}
