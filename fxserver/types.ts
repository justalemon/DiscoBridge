export interface SetKickReason { 
    (reason: string): void
};

export interface Deferrals {
    defer(): void,
    update(message: string): void,
    presentCard(card: object | string, cb?: (data: object, rawData: string) => void): void,
    done(failureReason?: string): void,
}
