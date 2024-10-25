import { Discord } from "./discord/client";
import { ConnectionState } from "./discord/state";
import { DiscordChannel, DiscordChannelType } from "./discord/types/channel";
import { DiscordGuild } from "./discord/types/guild";
import { Deferrals, SetKickReason } from "./fxserver/types";
import { debug } from "./tools";

const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const reColor = new RegExp("\^[0-9]", "g");
const consoleChannels: string[] = JSON.parse(GetConvar("discord_console_channels", `[]`));
const consoleShowAssets = GetConvarInt("discord_console_assets", 0) != 0;

let discord: Discord | null = null;
let guild: DiscordGuild | null = null;
let chatChannel: DiscordChannel | null = null;
let consoleChannel: DiscordChannel | null = null;

async function getChannelFromConvar(convar: string) {
    if (discord === null) {
        throw new Error("Discord Client is not available, unable to obtain channel.");
    }

    if (guild === null) {
        throw new Error("Discord Guild is not available or found, unable to obtain channel.");
    }

    const channelId = GetConvar(convar, "");

    if (channelId.length === 0) {
        return null;
    }

    const channel = await discord.getChannel(guild.id, channelId);

    if (channel === null || channel.type !== DiscordChannelType.GuildText) {
        return null;
    }

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

async function handleConsoleMessage(channel: string, message: string) {
    // invalidate the messages from our own resource to avoid "RangeError: Maximum call stack size exceeded"
    if (discord === null || consoleChannel === null || channel == "script:discordbridge" || channel.length == 0 || message.length == 0) {
        return;
    }

    if (consoleChannels.indexOf(channel) != -1 || (channel.endsWith(":stream") && consoleShowAssets)) {
        await discord.sendMessage(consoleChannel.id, `${channel}: ` + message.replaceAll(reColor, ""));
    }
}

async function init() {
    const token = GetConvar("discord_token", "");

    if (token === null) {
        console.error("The Discord Token is not set. Please set discord_token and start the bot again.");
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

    while (discord.state !== ConnectionState.Ready) {
        if (discord.state === ConnectionState.Terminated){
            debug("Discord connection terminated, stopping resource");
            return;
        }

        await Delay(0);
    }

    guild = await discord.getGuild(GetConvar("discord_guild", "0"));
    if (guild === null) {
        console.error("Unable to find guild with id " + GetConvar("discord_guild", "0"));
        StopResource(GetCurrentResourceName());
        return;
    }

    chatChannel = await getChannelFromConvar("discord_channel_chat");
    if (chatChannel === null) {
        console.warn("No channel found for Chat with ID " + GetConvar("discord_channel_chat", "0") + ", Chat Redirection is unavailable");
    } else {
        console.log("Using channel " + GetConvar("discord_channel_chat", "") + " for the Chat");
        onNet("chatMessage", handleChatMessage);
    }

    consoleChannel = await getChannelFromConvar("discord_channel_console");
    if (consoleChannel === null) {
        console.warn("No channel found for Console with ID " + GetConvar("discord_channel_console", "0") + ", Console Redirection is unavailable");
    } else {
        console.log("Using channel " + GetConvar("discord_channel_console", "") + " for the Console");
        RegisterConsoleListener(handleConsoleMessage);
    }

    if (GetConvarInt("discord_whitelist_enabled", 0) != 0) {
        console.log("Enabling Discord Join Whitelist");
        on("playerConnecting", handleJoinWhitelist);
    }
}
init();
