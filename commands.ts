import { ApplicationCommandTypes, CommandInteraction, CreateApplicationCommandOptions } from "oceanic.js";

type Command = CreateApplicationCommandOptions & {
    handler: (interaction: CommandInteraction) => void,
};

const commands: Map<string, Command> = new Map<string, Command>();

async function commandPlayer(interaction: CommandInteraction) {
    setImmediate(async () => {
        const count = GetNumPlayerIndices();
        const total = GetConvarInt("sv_maxclients", -1);
    
        await interaction.createMessage({
            content: `There are ${count} players connected (max ${total})`,
        });
    });
}
commands.set("players", {
    type: ApplicationCommandTypes.CHAT_INPUT,
    name: "players",
    description: "Lists the players on the server",
    handler: commandPlayer,
});

export { commands };
