import { Discord } from "./discord/client";

const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));
let discord: Discord | null = null;

function init() {
    const token = GetConvar("discord_token", "");

    if (token === null) {
        console.error("Convar discord_token is not set, unable to start the bot.");
        StopResource(GetCurrentResourceName());
        return;
    }

    discord = new Discord(token);
}
init();
