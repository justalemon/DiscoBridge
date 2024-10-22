import WebSocket, { Data } from "ws";

interface GatewayData {
    _trace: string[]
}

interface GatewayDataHello extends GatewayData {
    heartbeat_interval: number;
}

interface GatewayResponse {
    t: string | null;
    s: number | null;
    op: number;
    d: GatewayDataHello;
}

class DiscordWebSocket {
    #ws: WebSocket;

    constructor() {
        this.#connect();
    }

    #connect() {
        this.#ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
        this.#ws.on("message", this.#handleMessage);
        this.#ws.on("open", this.#handleOpen);
    }

    #handleMessage(data: Data) {
        const asString = data.toString();
        const payload: GatewayResponse = JSON.parse(asString);
        
        if (payload.op == 10) {
            console.log("Received hello, heartbeat is %d", payload.d.heartbeat_interval);


        }
    }

    #handleOpen() {
        console.log("Discord Websocket Connection is Open");
    }
}

export class Discord {
    #ws = new DiscordWebSocket();
}
