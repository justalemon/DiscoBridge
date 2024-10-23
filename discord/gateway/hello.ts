import { GatewayData } from "./data";

export interface GatewayHello extends GatewayData {
    heartbeat_interval: number;
}
