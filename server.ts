import { Client, Intents } from "discord.js";

const client = new Client({intents: [Intents.FLAGS.GUILDS]});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

function login() {
    console.log("Logging into Discord...");
    client.login(GetConvar("discord_token", ""));
}

function init() {
    login();
}

setImmediate(init);
