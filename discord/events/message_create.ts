import { DiscordMessage } from "../types/message";

export interface MessageCreate {
    (message: DiscordMessage): void
}
