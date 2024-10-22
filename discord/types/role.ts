import { DiscordRoleTags } from "./role_tags";

export interface DiscordRole {
    id: string,
    name: string,
    color: number,
    hoist: boolean,
    icon: string | null,
    unicode_emoji: string | null,
    position: number,
    permissions: string,
    managed: boolean,
    mentionable: boolean,
    tags: DiscordRoleTags,
    flags: number
}
