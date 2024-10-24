import { Discord } from "./discord/client";
import { DiscordChannel, DiscordChannelType } from "./discord/types/channel";
import { DiscordGuild } from "./discord/types/guild";
import { Deferrals, SetKickReason } from "./fxserver/types";

const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const reColor = new RegExp("\^[0-9]", "g");
const whitelist = GetConvarInt("discord_whitelist", 0) != 0;

let discord: Discord | null = null;
let guild: DiscordGuild | null = null;
let chatChannel: DiscordChannel | null = null;

async function getChannelFromConvar(convar: string, purpose: string) {
    const channelId = GetConvarInt(convar, 0);

    if (discord === null || channelId === 0 || guild === null) {
        return null;
    }

    if (guild === null) {
        return null;
    }

    const channel = await discord.getChannel(guild.id, channelId.toString());

    if (channel === null || channel.type !== DiscordChannelType.GuildText) {
        return null;
    }

    console.log(`Using channel ${channel.name} (${channel.id}) as the ${purpose} channel`);
    return channel;
}

async function handleChatMessage(source: number, author: string, message: string) {
    if (discord === null || chatChannel === null) {
        return;
    }

    await discord.sendMessage(chatChannel.id, `${author} ${source}: ` + message.replaceAll(reColor, ""));
}

async function handleJoinWhitelist(playerName: string, _: SetKickReason, deferrals: Deferrals) {
    const src = source;

    if (!whitelist) {
        return;
    }

    deferrals.defer();
    deferrals.update(`Hi ${playerName}! We are fetching your Discord ID...`);

    await Delay(1);

    const snowflake = GetPlayerIdentifierByType(src.toString(), "discord");

    if (snowflake == null) {
        deferrals.done(`Hey ${playerName}! Looks like you didn't opened Discord before starting the game. Please open Discord and restart your game.`);
        return;
    }

    deferrals.update("Fetching your Discord details...");

    if (guild == null) {
        deferrals.done(`Hey ${playerName}! Looks like the Discord server is not available, please contact a staff member.`);
        return;
    }

    const member = await discord?.getMember(guild.id, snowflake.replace("discord:", ""));

    if (member == null) {
        deferrals.done("Hey ${playerName}! Looks like yoou are not in our Discord Server. Please join so you can play.");
        return;
    }

    deferrals.done();
}

async function init() {
    const token = GetConvar("discord_token", "");

    if (token === null) {
        console.error("Convar discord_token is not set, unable to start the bot.");
        StopResource(GetCurrentResourceName());
        return;
    }

    const principal = `resource.${GetCurrentResourceName()}`;

    if (!IsPrincipalAceAllowed(principal, "command.add_principal")) {
        console.log(`Unable to use add_principal, please run "add_ace ${principal} command.add_principal allow" to allow the resource to change permissions`);
    }
    if (!IsPrincipalAceAllowed(principal, "command.remove_principal")) {
        console.log(`Unable to use remove_principal, please run "add_ace ${principal} command.remove_principal allow" to allow the resource to change permissions`);
    }

    discord = new Discord(token);

    while (!discord.isReady) {
        await Delay(0);
    }

    guild = await discord.getGuild(GetConvar("discord_guild", "0"));
    if (guild === null) {
        console.error("Unable to find guild with id " + GetConvar("discord_guild", "0"));
        StopResource(GetCurrentResourceName());
        return;
    }

    chatChannel = await getChannelFromConvar("discord_chat", "chat");
    if (chatChannel === null) {
        console.warn("No channel found for Chat with ID " + GetConvar("discord_chat", "0") + ", Chat Redirection is unavailable");
        return;
    }

    on("playerConnecting", handleJoinWhitelist);
    onNet("chatMessage", handleChatMessage);
}
init();
