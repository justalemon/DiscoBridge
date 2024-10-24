import { GatewayData } from "./data";
import { DiscordUser } from "../types/user";
import { DiscordGuildBasic } from "../types/guild_basic";
import { DiscordApplicationBasic } from "../types/application_basic";

export interface GatewayReady extends GatewayData {
    v: 10 | 9 | 8 | 7 | 6;
    user_settings: any,
    user: DiscordUser,
    session_type: "normal",
    session_id: string,
    resume_gateway_url: string,
    relationships: any[],
    private_channels: any[],
    presences: any[],
    guilds: DiscordGuildBasic,
    guild_join_requests: any,
    geo_ordered_rtc_regions: string[],
    auth: any,
    application: DiscordApplicationBasic
}
