import { Client, Intents } from "discord.js";

const client = new Client({intents: [Intents.FLAGS.GUILDS]});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

function reconnect() {
    console.log("Logging into Discord...");
    client.login(GetConvar("discord_token", ""));
}

function reconnectCommand(source: number, args: string[], raw: string) {
    reconnect();
}

function init() {
    RegisterCommand("dreconnect", reconnectCommand, true);
    reconnect();
}

setImmediate(init);
