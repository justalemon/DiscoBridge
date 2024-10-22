export interface DiscordUser {
    verified: boolean,
    username: string,
    mfa_enabled: boolean,
    id: string,
    global_name: string | null,
    flags: number,
    email: string | null,
    discriminator: string
    clan: null // TODO: Implement Clans
    bot: boolean,
    avatar: string
}
