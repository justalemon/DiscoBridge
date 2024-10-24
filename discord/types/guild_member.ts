import { DiscordAvatarDecorationData } from "./avatar_decoration_data";
import { DiscordUser } from "./user";

export interface DiscordGuildMember {
    user?: DiscordUser,
    nick?: string | null,
    avatar?: string | null,
    banner?: string | null,
    roles: string[],
    joined_at: string,
    premium_since?: string | null,
    deaf: boolean,
    mute: boolean,
    flags: number,
    pending?: boolean,
    permissions?: string,
    communication_disabled_until?: string | null,
    avatar_decoration_data?: DiscordAvatarDecorationData,

    // Found in Gateway messages, not documented somehow
    guild_id?: string
}
