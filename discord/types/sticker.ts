import { DiscordUser } from "./user"

export enum DiscordStickerType {
    STANDARD = 1,
    GUILD = 2
}

export enum DiscordStickerFormat {
    PNG = 1,
    APNG = 2,
    LOTTIE = 3,
    GIF = 4
}

export interface DiscordSticker {
    id: string,
    pack_id: string | null,
    name: string,
    description: string | null,
    tags: string,
    type: DiscordStickerType,
    format_type: DiscordStickerFormat,
    available: boolean,
    guild_id: string,
    user: DiscordUser,
}
