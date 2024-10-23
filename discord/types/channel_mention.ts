import { DiscordChannelType } from "./channel";

export interface DiscordChannelMention {
    id: string,
    guild_id: string,
    type: DiscordChannelType
}
