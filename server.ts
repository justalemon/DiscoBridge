import { Client } from "oceanic.js";

let client = new Client({auth: "Bot " + GetConvar("discord_token", "")});

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
});

async function init() {
    console.log("Logging into Discord...");

    try {
        await client.connect();
    } catch (error) {
        console.error(`Unable to log into Discord: ${error}`);
    }
}

setImmediate(init);
