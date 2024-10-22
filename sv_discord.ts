import WebSocket, { Data } from "ws";

interface DiscordUser {
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

interface DiscordGuildBasic {
    unavailable: boolean,
    id: string
}

interface DiscordApplicationBasic {
    id: string,
    flags: number
}

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

export class Discord {
    #ws: WebSocket | null = null;
    #token: string;
    #interval: NodeJS.Timeout | null = null;
    #heartbeat: number = -1;

    constructor(token: string) {
        this.#token = token;
        this.#connect();
    }

    #connect() {
        this.#ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json", {
            headers: {
                "authorization": `Bearer ${this.#token}`
            }
        });
        this.#ws.on("message", (d) => this.#handleMessage(d));
        this.#ws.on("open", this.#handleOpen);
    }

    #identify() {
        if (this.#ws == null || this.#ws.readyState !== WebSocket.OPEN) {
            console.error("Unable to log in, websocket is closed");
            return;
        }

        const data = {
            op: 2,
            d: {
                token: this.#token,
                properties: {
                    os: process.platform,
                    browser: `DiscoSync for fxserver`,
                    device: `DiscoSync for fxserver`
                },
                intents: 3
            }
        }

        this.#ws.send(JSON.stringify(data));
        console.log("Sending identification payload");
    }

    #performHeartbeat() {
        console.log("Performing heartbeat");
        this.#ws?.send(JSON.stringify({
            "op": 1
        }));
    }

    #startHeartbeat() {
        if (this.#interval !== null) {
            clearInterval(this.#interval);
        }

        this.#interval = setInterval(this.#performHeartbeat.bind(this), this.#heartbeat + 1);
    }

    #handleMessage(data: Data) {
        const asString = data.toString();
        const payload: GatewayResponse = JSON.parse(asString);
        
        if (payload.op == 10) {
            console.log("Received hello, heartbeat is %d", payload.d.heartbeat_interval);
            this.#heartbeat = payload.d.heartbeat_interval;
            this.#startHeartbeat();
            this.#identify();
        }
    }

    #handleOpen() {
        console.log("Discord Websocket Connection is Open");
    }
}
