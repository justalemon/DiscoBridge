import { DiscordActivity } from "./activity";

export interface DiscordPresence {
    since: number | null,
    activities: DiscordActivity[],
    status: string,
    afk: boolean
}
