import { Collection, CommandInteraction, SlashCommandBuilder } from "discord.js";

const c = new Collection<SlashCommandBuilder, (interaction: CommandInteraction) => Promise<void>>();
c.set(new SlashCommandBuilder().setName("players").setDescription("Lists the players on the server"), execute);

async function execute(interaction: CommandInteraction) {
    setImmediate(async () => {
        const count = GetNumPlayerIndices();
        const total = GetConvarInt("sv_maxclients", -1);
    
        await interaction.reply(`There are ${count} players connected (max ${total})`);
    });
}
export const commands = c;
