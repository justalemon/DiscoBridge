import { DiscordAttachment } from "./attachment";
import { DiscordChannelMention } from "./channel_mention";
import { DiscordEmbed } from "./embed";
import { DiscordRole } from "./role";
import { DiscordUser } from "./user";

export enum DiscordMessageType {
    Default = 0,
    RecipientAdd = 1,
    RecipientRemove = 2,
    Call = 3,
    ChannelNameChange = 4,
    ChannelIconChange = 5,
    ChannelPinnedMessage = 6,
    UserJoin = 7,
    GuildBoost = 8,
    GuildBoostTier1 = 9,
    GuildBoostTier2 = 10,
    GuildBoostTier3 = 11,
    ChannelFollowAdd = 12,
    GuildDiscoveryDisqualified = 14,
    GuildDiscoveryRequalified = 15,
    GuildDiscoveryGracePeriodInitialWarning = 16,
    GuildDiscoveryGracePeriodFinalWarning = 17,
    ThreadCreated = 18,
    Reply = 19,
    ChatInputCommand = 20,
    ThreadStarterMessage = 21,
    GuildInviteReminder = 22,
    ContextMenuCommand = 23,
    AutoModerationAction = 24,
    RoleSubscriptionPurchase = 25,
    InteractionPremiumUpsell = 26,
    StageStart = 27,
    StageEnd = 28,
    StageSpeaker = 29,
    StageTopic = 31,
    GuildApplicationPremiumSubscription = 32,
    GuildIncidentAlertModeEnabled = 36,
    GuildIncidentAlertModeDisabled = 37,
    GuildIncidentReportRaid = 38,
    GuildIncidentReportFalseAlarm = 39,
    PurchaseNotification = 44,
    PollResult = 46
}

export interface DiscordMessage {
    id: string,
    channel_id: string,
    author: DiscordUser,
    content: string | null,
    timestamp: string,
    edited_timestamp: string | null,
    tts: boolean,
    mention_everyone: boolean,
    mentions: DiscordUser[],
    mention_roles: DiscordRole[],
    mention_channels: DiscordChannelMention[],
    attachments: DiscordAttachment[],
    embeds: DiscordEmbed[],
    nonce: number | string | null | undefined,
    pinned: boolean,
    webhook_id: string,
    type: DiscordMessageType
}
