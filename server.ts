import { Discord } from "./discord/client";
import { DiscordChannel, DiscordChannelType } from "./discord/types/channel";
import { Deferrals, SetKickReason } from "./fxserver/types";

const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const reColor = new RegExp("\^[0-9]", "g");
const whitelist = GetConvarInt("discord_whitelist", 0) != 0;

let discord: Discord | null = null;
let chatChannel: DiscordChannel | null = null;

async function getChannelFromConvar(convar: string, purpose: string) {
    const channelId = GetConvarInt(convar, 0);
    const guildId = GetConvarInt("discord_guild", 0);

    if (discord === null || channelId === 0 || guildId === 0) {
        return null;
    }

    const guild = await discord.getGuild(guildId.toString());

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
    if (discord == null || chatChannel === null) {
        return;
    }

    await discord.sendMessage(chatChannel.id, `${author}: ` + message.replaceAll(reColor, ""));
}

async function handleJoinWhitelist(playerName: string, setKickReason: SetKickReason, deferrals: Deferrals) {
    const src = source;

    if (!whitelist) {
        return;
    }

    deferrals.defer();
    deferrals.update("Fetching your Discord ID...");

    await Delay(1);

    const snowflake = GetPlayerIdentifierByType(src.toString(), "discord");

    if (snowflake == null) {
        deferrals.done("Your Discord ID is not available. Please open the Discord app and restart the game.");
        return;
    }
    
    deferrals.update("Fetching your Discord details...");

    const guild = await discord?.getGuild(GetConvar("discord_guild", ""));

    if (guild == null) {
        deferrals.done("The Discord server is not available, please contact a staff member.");
        return;
    }

    const member = await discord?.getMember(guild.id, snowflake.replace("discord:", ""));

    if (member == null) {
        deferrals.done("Please join our Discord server so you can play online.");
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

    chatChannel = await getChannelFromConvar("discord_chat", "chat");

    on("playerConnecting", handleJoinWhitelist);
    onNet("chatMessage", handleChatMessage);
}
init();
