"use client";

import { useDiscordPresence } from "@/hooks/use-discord-presence";

export function DiscordPresence({ details, state }: { details: string; state?: string }) {
    useDiscordPresence(details, state);
    return null;
}
