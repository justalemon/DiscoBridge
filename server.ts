import { ApplicationCommandTypes, Client, CommandInteraction, InteractionTypes } from "oceanic.js";
import { commands } from "./commands";

const client = new Client({auth: "Bot " + GetConvar("discord_token", "")});

async function handleCommands(interaction: CommandInteraction) {
    const command = commands.get(interaction.data.name);

    if (typeof command == "undefined") {
        return;
    }

    command.handler(interaction);
}

client.on("interactionCreate", async (interaction) => {
    switch (interaction.type) {
        case InteractionTypes.APPLICATION_COMMAND:
            switch (interaction.data.type) {
                case ApplicationCommandTypes.CHAT_INPUT:
                    await handleCommands(interaction);
                    break;
            }

            break;
    }
});

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await client.application.bulkEditGlobalCommands([...commands.values()]);
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
