import { DiscordGuildMember } from "../types/guild_member";

export interface GuildMemberUpdate {
    (before: DiscordGuildMember, after: DiscordGuildMember): void
}
