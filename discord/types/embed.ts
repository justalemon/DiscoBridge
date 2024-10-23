export interface DiscordEmbedFooter {
    text: string,
    icon_url?: string,
    proxy_icon_url?: string
}

export interface DiscordEmbedImage {
    url?: string,
    proxy_url?: string,
    height?: number,
    width?: number
}

export interface DiscordEmbedThumbnail {
    url: string,
    proxy_url?: string,
    height?: number,
    width?: number
}

export interface DiscordEmbedVideo {
    url?: string,
    proxy_url?: string,
    height?: number,
    width?: number
}

export interface DiscordEmbedProvider {
    name?: string,
    url?: string
}

export interface DiscordEmbedAuthor {
    name: string,
    url?: string,
    icon_url?: string,
    proxy_icon_url?: string
}

export interface DiscordEmbedField {
    name: string,
    value: string,
    inline?: boolean
}

export interface Embed {
    title?: string,
    type?: "rich" | "image" | "video" | "gifv" | "article" | "link" | "poll_results",
    description?: string,
    url?: string,
    timestamp?: string,
    color?: number,
    footer?: DiscordEmbedFooter,
    image?: DiscordEmbedImage,
    thumbnail?: DiscordEmbedThumbnail,
    video?: DiscordEmbedVideo,
    provider?: DiscordEmbedProvider,
    author?: DiscordEmbedAuthor,
    fields?: DiscordEmbedField[]
}
