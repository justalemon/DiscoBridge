import { ApplicationCommandTypes, ChannelTypes, Client, CommandInteraction, Guild, InteractionTypes, TextableChannel } from "oceanic.js";
import { commands } from "./commands";

const client = new Client({auth: "Bot " + GetConvar("discord_token", "")});
let guild: Guild = null;
let chatChannel: TextableChannel = null;

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

    guild = client.guilds.get(GetConvar("discord_guild", "0"));
});

async function init() {
    console.log("Logging into Discord...");

    try {
        await client.connect();
    } catch (error) {
        console.error(`Unable to log into Discord: ${error}`);
    }
}

async function handleChatMessage(source: number, author: string, message: string) {
    if (chatChannel == null) {
        const channel = guild.channels.get(GetConvar("discord_chat", "0"));

        if (typeof channel == "undefined" || channel.type != ChannelTypes.GUILD_TEXT) {
            return;
        }

        chatChannel = channel;
    }

    await chatChannel.createMessage({
        content: `${author}: ${message}`,
    });
}

onNet("chatMessage", handleChatMessage);

setImmediate(init);
