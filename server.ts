import { Discord } from "./discord/client";
import { ConnectionState } from "./discord/state";
import { DiscordChannel, DiscordChannelType } from "./discord/types/channel";
import { DiscordGuild } from "./discord/types/guild";
import { DiscordGuildMember } from "./discord/types/guild_member";
import { Deferrals, SetKickReason } from "./fxserver/types";
import { debug, Delay } from "./tools";

const reColor = new RegExp("\^[0-9]", "g");
const roles: Map<string, string> = new Map<string, string>(Object.entries(JSON.parse(GetConvar("discobridge_roles", "{}"))));
const consoleChannels: string[] = JSON.parse(GetConvar("discobridge_console_channels", `[]`));
const consoleShowAssets = GetConvarInt("discobridge_console_assets", 0) != 0;

let discord: Discord | null = null;
let guild: DiscordGuild | null = null;
let chatChannel: DiscordChannel | null = null;
let consoleChannel: DiscordChannel | null = null;

function getPlayerByDiscordIdentifier(id: string) {
    for (let i = 0; i < GetNumPlayerIndices(); i++) {
        const player = GetPlayerFromIndex(i);
        const discord = GetPlayerIdentifierByType(player, "discord").replace("discord:", "");
        
        if (id === discord) {
            return player;
        }
    }

    return null;
}

async function updateRolesOfMember(_: DiscordGuildMember, member: DiscordGuildMember) {
    setImmediate(() => {
        if (typeof(member.user) === "undefined") {
            console.warn("Unable to process");
            return;
        }

        const player = getPlayerByDiscordIdentifier(member.user.id);

        if (player === null) {
            return;
        }

        for (const role of member.roles) {
            const principal = roles.get(role);

            if (typeof principal == "undefined") {
                continue;
            }

            // remove principals just in case
            ExecuteCommand(`remove_principal identifier.discord:${member.user.id} ${principal}`);

            if (IsPlayerAceAllowed(player, principal)) {
                ExecuteCommand(`add_principal identifier.discord:${member.user.id} ${principal}`);
                debug(`Added principal ${principal} to player ${player}`);
            }
        }
    });
}

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
    const token = GetConvar("discobridge_token", "");

    if (token === null || token.length === 0) {
        console.error("The Discord Token is not set. Please set discobridge_token and start the bot again.");
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

    guild = await discord.getGuild(GetConvar("discobridge_guild", "0"));
    if (guild === null) {
        console.error("Unable to find guild with id " + GetConvar("discobridge_guild", "0"));
        StopResource(GetCurrentResourceName());
        return;
    }

    await discord.requestMembers(guild.id);

    if (roles.size > 0) {
        discord.on("guildMemberUpdate", updateRolesOfMember)
    }

    chatChannel = await getChannelFromConvar("discobridge_channel_chat");
    if (chatChannel === null) {
        console.warn("No channel found for Chat with ID " + GetConvar("discobridge_channel_chat", "0") + ", Chat Redirection is unavailable");
    } else {
        console.log("Using channel " + GetConvar("discobridge_channel_chat", "") + " for the Chat");
        onNet("chatMessage", handleChatMessage);
    }

    consoleChannel = await getChannelFromConvar("discobridge_channel_console");
    if (consoleChannel === null) {
        console.warn("No channel found for Console with ID " + GetConvar("discobridge_channel_console", "0") + ", Console Redirection is unavailable");
    } else {
        console.log("Using channel " + GetConvar("discobridge_channel_console", "") + " for the Console");
        RegisterConsoleListener(handleConsoleMessage);
    }

    if (GetConvarInt("discobridge_whitelist_enabled", 0) != 0) {
        console.log("Enabling Discord Join Whitelist");
        on("playerConnecting", handleJoinWhitelist);
    }
}
init();
