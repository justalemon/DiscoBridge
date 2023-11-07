import { ApplicationCommandTypes, CommandInteraction, CreateApplicationCommandOptions } from "oceanic.js";

type Command = CreateApplicationCommandOptions & {
    handler: (interaction: CommandInteraction) => void,
};

const commands: Map<string, Command> = new Map<string, Command>();

export { commands };
