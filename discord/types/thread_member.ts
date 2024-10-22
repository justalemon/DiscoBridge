import { DiscordGuildMember } from "./guild_member";

export interface DiscordThreadMember {
    id: string,
    user_id: string,
    join_timestamp: string,
    flags: number,
    member: DiscordGuildMember | null
}
