import { DiscordDefaultReaction } from "./default_reaction";
import { DiscordForumTag } from "./forum_tag";
import { DiscordPermissionOverwrite } from "./permission_overwrite";
import { DiscordThreadMember } from "./thread_member";
import { DiscordThreadMetadata } from "./thread_metadata";
import { DiscordUser } from "./user";

export enum DiscordChannelType {
    GuildText = 0,
    DM = 1,
    GuildVoice = 2,
    GroupDM = 3,
    GuildCategory = 4,
    GuildAnnouncement = 5,
    AnnouncementThread = 10,
    PublicThread = 11,
    PrivateThread = 12,
    GuildStageVoice = 13,
    GuildDirectory = 14,
    GuildForum = 15,
    GuildMedia = 16
}

export interface DiscordChannel {
    id: string,
    type: DiscordChannelType,
    guild_id: string | null,
    position: number,
    permission_overwrites: DiscordPermissionOverwrite[],
    name: string | null,
    topic: string | null,
    nsfw: boolean,
    last_message_id: string | null,
    bitrate: number,
    user_limit: number,
    rate_limit_per_user: number,
    recipients: DiscordUser[],
    icon: string | null,
    owner_id: string,
    application_id: string,
    managed: boolean,
    parent_id: string | null,
    last_pin_timestamp: string | null,
    rtc_region: string | null,
    video_quality_mode: number,
    message_count: number,
    member_count: number,
    thread_metadata: DiscordThreadMetadata,
    member: DiscordThreadMember,
    default_auto_archive_duration: number,
    permissions: string,
    flags: number,
    total_message_sent: number,
    available_tags: DiscordForumTag[],
    applied_tags: string[],
    default_reaction_emoji: DiscordDefaultReaction | null,
    default_thread_rate_limit_per_user: number,
    default_sort_order: number | null,
    default_forum_layout: number
}
