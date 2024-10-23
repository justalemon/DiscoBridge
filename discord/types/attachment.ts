export interface DiscordAttachment {
    id: string,
    filename: string,
    title: string,
    description: string,
    content_type: string,
    size: number,
    url: string,
    proxy_url: string,
    height: number | null,
    width: number | null
    ephemeral: boolean,
    duration_secs: number,
    waveform: string,
    flags: number
}
