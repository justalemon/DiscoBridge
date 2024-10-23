import { Discord } from "./discord/client";
import { Deferrals, SetKickReason } from "./fxserver/types";

const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));
let discord: Discord | null = null;

const whitelist = GetConvarInt("discord_whitelist", 0) != 0;

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

function init() {
    const token = GetConvar("discord_token", "");

    if (token === null) {
        console.error("Convar discord_token is not set, unable to start the bot.");
        StopResource(GetCurrentResourceName());
        return;
    }

    discord = new Discord(token);

    on("playerConnecting", handleJoinWhitelist);
}
init();
