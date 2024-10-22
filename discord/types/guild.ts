import { DiscordChannel } from "./channel";
import { DiscordGuildMember } from "./guild_member";
import { DiscordRole } from "./role";
import { DiscordSticker } from "./sticker";

export interface DiscordGuild {
    guild_scheduled_events: any[], // TODO: Implement this
    icon: any | null, // TODO: Implement this
    soundboard_sounds: any[], // TODO: Implement this
    vanity_url_code: string | null,
    inventory_settings: any | null, // TODO: Implement this
    max_stage_video_channel_users: number,
    presences: any[], // TODO: Implement this
    emojis: any[], // TODO: Implement this
    lazy: boolean, // TODO: Implement this
    default_message_notifications: number,
    explicit_content_filter: number,
    public_updates_channel_id: string | null,
    voice_states: any[], // TODO: Implement this
    owner_id: string,
    premium_progress_bar_enabled: boolean,
    system_channel_flags: number,
    rules_channel_id: string | null,
    id: string,
    joined_at: string,
    verification_level: number,
    splash: any | null, // TODO: Implement this
    safety_alerts_channel_id: string | null,
    embedded_activities: any[], // TODO: Implement this
    afk_timeout: number,
    name: string,
    afk_channel_id: string | null,
    nsfw: boolean,
    hub_type: any | null, // TODO: Implement this
    application_id: string | null,
    unavailable: boolean,
    threads: any[], // TODO: Implement this
    premium_subscription_count: number,
    stage_instances: any[], // TODO: Implement this
    activity_instances: any[], // TODO: Implement this
    description: string | null,
    channels: DiscordChannel[],
    member_count: number,
    latest_onboarding_question_id: any | null, // TODO: Implement this
    application_command_counts: any, // TODO: Implement this
    banner: any, // TODO: Implement this
    clan: any, // TODO: Implement this
    premium_tier: number,
    max_video_channel_users: number,
    discovery_splash: any | null, // TODO: Implement this
    system_channel_id: string,
    mfa_level: number,
    features: any[], // TODO: Implement this
    incident_data: any | null, // TODO: Implement this
    region: string,
    preferred_locale: string, // TODO: Implement locales
    members: DiscordGuildMember[],
    roles: DiscordRole[],
    version: string,
    nsfw_level: number,
    max_members: number,
    stickers: DiscordSticker,
    home_header: any | null, // TODO: Implement this
    large: boolean
}
