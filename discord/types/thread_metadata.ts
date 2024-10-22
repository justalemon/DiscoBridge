export interface DiscordThreadMetadata {
    archived: boolean,
    auto_archive_duration: 60 | 1440 | 4320 | 10080,
    archive_timestamp: string,
    locked: boolean,
    invitable: boolean,
    create_timestamp: string | null
}
