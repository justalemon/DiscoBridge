import { DiscordGuildMember } from "./guild_member";

export interface DiscordGuildMemberChunk {
    members: DiscordGuildMember[],
    guild_id: string,
    chunk_index: number,
    chunk_count: number
}
