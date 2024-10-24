import { DiscordActivityParty } from "./activity_party";
import { DiscordActivityTimestamps } from "./activity_timestamps";
import { DiscordActivityEmoji } from "./activity_emoji";
import { DiscordActivityAssets } from "./activity_assets";
import { DiscordActivitySecrets } from "./activity_secrets";
import { DiscordActivityButton } from "./activity_button";

export enum DiscordActivityType {
    Playing = 0,
    Streaming = 1,
    Listening = 2,
    Watching = 3,
    Custom = 4,
    Competing = 5
}

export enum DiscordActivityFlags {
    Instance = 1 << 0,
    Join = 1 << 1,
    Spectate = 1 << 2,
    JoinRequest = 1 << 3,
    Sync = 1 << 4,
    Play = 1 << 5,
    PartyPrivacyFriends = 1 << 6,
    PartyPrivacyVoiceChannel = 1 << 7,
    Embedded = 1 << 8
}

export interface DiscordActivity {
    name: string,
    type: DiscordActivityType,
    url?: string | null,
    created_at?: number | null,
    timestamps?: DiscordActivityTimestamps,
    application_id?: string,
    details?: string | null,
    state?: string | null,
    emoji?: DiscordActivityEmoji
    party?: DiscordActivityParty,
    assets?: DiscordActivityAssets,
    secrets?: DiscordActivitySecrets,
    instance?: boolean,
    flags?: DiscordActivityFlags,
    buttons?: DiscordActivityButton[]
}
