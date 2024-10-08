import { ActivityTypes, ApplicationCommandTypes, ChannelTypes, Client, CommandInteraction, Guild, InteractionTypes, JSONMember, Member, Message, TextableChannel } from "oceanic.js";
import { commands } from "./commands";

const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const reColor = new RegExp("\^[0-9]", "g");
const reEmoji = new RegExp("<(a?):([A-Za-z0-9]+):([0-9]+)>", "g");

const client = new Client({
    auth: "Bot " + GetConvar("discord_token", ""),
    gateway: {
        intents: ["GUILD_MESSAGES", "MESSAGE_CONTENT", "GUILD_MEMBERS"]
    }
});

const roles: Map<string, string> = new Map<string, string>(Object.entries(JSON.parse(GetConvar("discord_roles", "{}"))));
const consoleChannels: string[] = JSON.parse(GetConvar("discord_consolechannels", `["resources", "svadhesive", "citizen-server-impl", "c-scripting-core", "script:citric"]`));
const consoleShowAssets = GetConvarInt("discord_consoleassets", 0) != 0;
const whitelist = GetConvarInt("discord_whitelist", 0) != 0;
const sendReady = GetConvarInt("discord_sendready", 1) != 0;

let canChangePrincipals = true;
let guild: Guild = undefined;
let chatChannel: TextableChannel = undefined;
let consoleChannel: TextableChannel = undefined;

type DeferralsCallback = (data: object, rawData: string) => void;
type Deferrals = {
    defer(): void,
    update(message: string): void,
    presentCard(card: object | string, cb?: DeferralsCallback): void,
    done(failureReason?: string): void,
}

function getPlayerByDiscordIdentifier(id: string) {
    for (let i = 0; i < GetNumPlayerIndices(); i++) {
        const player = GetPlayerFromIndex(i);
        const discord = GetPlayerIdentifierByType(player, "discord").replace("discord:", "");
        
        if (id == discord) {
            return player;
        }
    }

    return undefined;
}

function formatMessageWithEmojis(message: string, namesOnly: boolean) {
    const matches = message.matchAll(reEmoji);

    for (const match of matches) {
        const raw = match[0];
        const isAnimated = match[1] == "a";
        const name = match[2];
        const id = match[3];

        if (namesOnly) {
            message = message.replace(raw, `:${name}:`);
        } else {
            const ext = isAnimated ? "gif" : "png";
            const url = `https://cdn.discordapp.com/emojis/${id}.${ext}`;
            const html = `<img class="discordbridge-emoji discord-emoji emoji" src="${url}" />`
            message = message.replace(raw, html);
        }
    }

    return message;
}

async function getChannelFromConvar(convar: string, purpose: string) {
    const channelId = GetConvar(convar, "0");

    if (channelId == "0") {
        return undefined;
    }

    try {
        const channel = await client.rest.channels.get(channelId);

        // TODO: Make sure that the channel is part of the guild

        if (channel.type == ChannelTypes.GUILD_TEXT) {
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

    if (sendReady) {
        chatChannel?.createMessage({
            content: "Chat is ready!"
        });
        consoleChannel?.createMessage({
            content: "Console is ready!"
        });
    }
});

client.on("messageCreate", async (message: Message) => {
    if (typeof chatChannel == "undefined" || message.author.bot || message.channelID != chatChannel.id) {
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
        args: [message.author.username, formatMessageWithEmojis(message.content, false)]
    });

    console.log(`${message.author.username}: ${formatMessageWithEmojis(message.content, true)}`);
});

client.on("guildMemberUpdate", async (member: Member, oldMember: null | JSONMember) => {
    if (!canChangePrincipals) {
        return;
    }

    setImmediate(() => {
        const player = getPlayerByDiscordIdentifier(member.id);

        if (typeof player == "undefined") {
            return;
        }

        for (const role of member.roles) {
            const principal = roles.get(role);

            if (typeof principal == "undefined") {
                continue;
            }

            // remove principals just in case
            ExecuteCommand(`remove_principal identifier.discord:${member.id} ${principal}`);

            if (IsPlayerAceAllowed(player, principal)) {
                ExecuteCommand(`add_principal identifier.discord:${member.id} ${principal}`);
                console.log(`Added principal ${principal} to player ${player}`);
            }
        }
    });
});

async function handleChatMessage(source: number, author: string, message: string) {
    if (chatChannel == null) {
        const channel = guild.channels.get(GetConvar("discord_chat", "0"));

        if (typeof channel == "undefined" || channel.type != ChannelTypes.GUILD_TEXT) {
            return;
        }

        chatChannel = channel;
    }

    await chatChannel.createMessage({
        content: `${author}: ` + message.replaceAll(reColor, ""),
    });
}

async function handleJoinWhitelist(playerName: string, setKickReason: (reason: string) => void, deferrals: Deferrals) {
    const player = source;

    if (!whitelist) {
        return;
    }

    deferrals.defer();
    deferrals.update("Fetching your Discord ID...");

    await Delay(1);

    const discord = GetPlayerIdentifierByType(player.toString(), "discord");

    if (discord == null) {
        deferrals.done("Your Discord ID is not available. Please open the Discord app and restart the game.");
        return;
    }
    
    deferrals.update("Fetching your Discord details...");

    const member = await guild.getMember(discord.replace("discord:", ""));

    if (member == null) {
        deferrals.done("Please join our Discord server so you can play online.");
        return;
    }

    deferrals.done();
}

async function handleConsoleMessage(channel: string, message: string) {
    // invalidate the messages from our own resource to avoid "RangeError: Maximum call stack size exceeded"
    if (typeof consoleChannel == "undefined" || channel == "script:discordbridge" || channel.length == 0 || message.length == 0) {
        return;
    }

    if (consoleChannels.indexOf(channel) != -1 || (channel.endsWith(":stream") && consoleShowAssets) ) {
        await consoleChannel.createMessage({
            content: `${channel}: ` + message.replaceAll(reColor, ""),
        });
    }
}

async function init() {
    const principal = `resource.${GetCurrentResourceName()}`;

    if (!IsPrincipalAceAllowed(principal, "command.add_principal")) {
        canChangePrincipals = false;
        console.log(`Unable to use add_principal, please run "add_ace ${principal} command.add_principal allow" to allow the resource to change permissions`);
    }
    if (!IsPrincipalAceAllowed(principal, "command.remove_principal")) {
        canChangePrincipals = false;
        console.log(`Unable to use remove_principal, please run "add_ace ${principal} command.remove_principal allow" to allow the resource to change permissions`);
    }

    onNet("chatMessage", handleChatMessage);
    on("playerConnecting", handleJoinWhitelist);

    RegisterConsoleListener(handleConsoleMessage);

    console.log("Logging into Discord...");

    try {
        await client.connect();
    } catch (error) {
        console.error(`Unable to log into Discord: ${error}`);
        StopResource(GetCurrentResourceName());
        return;
    }
}
setImmediate(init);
