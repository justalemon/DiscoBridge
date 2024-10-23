export function getPlayerByDiscordIdentifier(discordId: string) {
    for (let i = 0; i < GetNumPlayerIndices(); i++) {
        const player = GetPlayerFromIndex(i);
        const discord = GetPlayerIdentifierByType(player, "discord").replace("discord:", "");
        
        if (discordId == discord) {
            return player;
        }
    }

    return null;
}
