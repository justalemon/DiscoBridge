import { GatewayData } from "./data";

export interface GatewayResponse {
    t: string | null;
    s: number | null;
    op: number;
    d: GatewayData;
}
