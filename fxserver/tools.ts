export function getPlayerByDiscordIdentifier(id: string) {
    for (let i = 0; i < GetNumPlayerIndices(); i++) {
        const player = GetPlayerFromIndex(i);
        const discord = GetPlayerIdentifierByType(player, "discord").replace("discord:", "");
        
        if (id === discord) {
            return player;
        }
    }

    return null;
}
