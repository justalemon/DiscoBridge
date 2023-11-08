import { ActivityTypes, ApplicationCommandTypes, ChannelTypes, Client, CommandInteraction, Guild, InteractionTypes, Member, Message, TextableChannel } from "oceanic.js";
import { commands } from "./commands";

const client = new Client({
    auth: "Bot " + GetConvar("discord_token", ""),
    gateway: {
        intents: ["GUILD_MESSAGES", "MESSAGE_CONTENT"]
    }
});
const consoleChannels: string[] = JSON.parse(GetConvar("discord_consolechannels", `["resources", "svadhesive", "citizen-server-impl", "c-scripting-core", "script:citric"]`));
let guild: Guild = undefined;
let chatChannel: TextableChannel = undefined;
let consoleChannel: TextableChannel = undefined;

async function getChannelFromConvar(convar: string, purpose: string) {
    const channelId = GetConvar(convar, "0");

    if (channelId == "0") {
        return undefined;
    }

    try {
        const channel = await client.rest.channels.get(channelId);

        // TODO: Make sure that the channel is part of the guild

        if (channel.type == ChannelTypes.GUILD_TEXT) {
            chatChannel = channel;
            console.log(`Using channel ${channel.name} (${channel.id}) as the ${purpose} channel`);
            return channel;
        } else {
            console.error(`Channel ${channel.id} is not a guild text channel!`);
        }
    } catch (error) {
        console.error(`Unable get channel ${channelId}: ${error}}`);
    }

    return undefined;
}

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

    const guildId = GetConvar("discord_guild", "0");
    try {
        guild = await client.rest.guilds.get(guildId);
        console.log(`Using guild "${guild.name}" (${guild.id})`);
    } catch (error) {
        console.error(`Unable get guild ${guildId}: ${error}}`);
        StopResource(GetCurrentResourceName());
        return;
    }

    setImmediate(() => {
        client.editStatus("online", [
            {
                name: GetConvar("sv_hostname", "a server"),
                type: ActivityTypes.WATCHING,
            }
        ]);
    });

    chatChannel = await getChannelFromConvar("discord_chat", "chat");
    consoleChannel = await getChannelFromConvar("discord_console", "console");

    if (typeof consoleChannel != "undefined" && consoleChannels.length > 0) {
        const channels = consoleChannels.join(", ");
        console.log(`Allowing ${channels} for the console channel`);
    }
});

client.on("messageCreate", async (message: Message) => {
    if (typeof chatChannel == "undefined" || message.author.bot) {
        return;
    }

    const author = await guild.getMember(message.author.id);

    let color = [255, 255, 255];

    if (author.roles.length > 0) {
        const roleId = author.roles[0];
        const role = guild.roles.get(roleId);
        const r = (role.color & 0xFF);
        const g = (role.color & 0xFF00) >>> 8;
        const b = (role.color & 0xFF0000) >>> 16;
        color = [r, g, b];
    }

    TriggerClientEvent("chat:addMessage", -1, {
        color: color,
        args: [message.author.username, message.content]
    });

    console.log(`${message.author.username}: ${message.content}`);
});

async function init() {
    console.log("Logging into Discord...");

    try {
        await client.connect();
    } catch (error) {
        console.error(`Unable to log into Discord: ${error}`);
        StopResource(GetCurrentResourceName());
        return;
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

async function handleConsoleMessage(channel: string, message: string) {
    if (typeof consoleChannel == "undefined" || consoleChannels.indexOf(channel) == -1 || channel.length == 0 || message.length == 0) {
        return;
    }

    await chatChannel.createMessage({
        content: `${channel}: ${message}`,
    });
}
RegisterConsoleListener(handleConsoleMessage);

setImmediate(init);
