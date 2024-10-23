import WebSocket, { Data } from "ws";
import { request } from "./discord/rest";
import { DiscordGuild } from "./discord/types/guild";
import { DiscordUser } from "./discord/types/user";
import { DiscordGuildMember } from "./discord/types/guild_member";

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

interface GatewayDataReady extends GatewayData {
    v: 10 | 9 | 8 | 7 | 6;
    user_settings: any,
    user: DiscordUser,
    session_type: "normal",
    session_id: string,
    resume_gateway_url: string,
    relationships: any[],
    private_channels: any[],
    presences: any[],
    guilds: DiscordGuildBasic,
    guild_join_requests: any,
    geo_ordered_rtc_regions: string[],
    auth: any,
    application: DiscordApplicationBasic
}

interface GatewayResponse {
    t: string | null;
    s: number | null;
    op: number;
    d: GatewayDataHello | GatewayDataReady;
}

export class Discord {
    #ws: WebSocket | null = null;
    #token: string;
    #interval: NodeJS.Timeout | null = null;
    #heartbeat: number = -1;
    #ready: boolean = false;

    #guilds: DiscordGuild[] = [];

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
            "op": 1,
            "d": null
        }));
    }

    #startHeartbeat() {
        if (this.#interval !== null) {
            clearInterval(this.#interval);
        }

        this.#interval = setInterval(this.#performHeartbeat.bind(this), this.#heartbeat);
    }

    #handleDispatch(type: string | null, payload: GatewayData | DiscordGuild) {
        if (type == "READY") {
            console.log("Bot is ready!");
            this.#ready = true;
        } else if (type == "GUILD_CREATE") {
            const guild = payload as DiscordGuild;
            this.#addGuildToCache(guild);
            return;
        } else {
            console.log("Unknown payload type: %s", type);
            console.log(payload);
        }
    }

    #handleMessage(data: Data) {
        const asString = data.toString();
        const payload: GatewayResponse = JSON.parse(asString);

        switch (payload.op) {
            // dispatch
            case 0:
                this.#handleDispatch(payload.t, payload.d);
                break;
            // Hello
            case 10:
                const data = payload.d as GatewayDataHello;
                console.log("Received hello, heartbeat is %d", data.heartbeat_interval);
                this.#heartbeat = data.heartbeat_interval;
                this.#startHeartbeat();
                this.#identify();
                break;
            // Heartbeat ACK
            case 11:
                break;
        }
    }

    #handleOpen() {
        console.log("Discord Websocket Connection is Open");
    }

    #ensureReady() {
        if (!this.#ready) {
            throw new Error("The bot is not ready to perform operations.");
        }
    }

    #addGuildToCache(guild: DiscordGuild) {
        const current = this.#guilds.filter(x => x.id == guild.id)[0];

        if (typeof(current) !== "undefined") {
            const index = this.#guilds.indexOf(current);
            this.#guilds.splice(index, 1);
        }

        this.#guilds.push(guild);
        console.log("Added guild %s", guild.name);
    }

    async getMember(guildId: string, memberId: string) {
        this.#ensureReady();

        const guild = this.#guilds.find(x => x.id == guildId);

        if (typeof(guild) === "undefined") {
            return null;
        }

        const foundMember = guild.members.find(x => x.user.id == memberId);

        if (typeof(foundMember) !== "undefined") {
            return foundMember;
        }

        const member = await request<DiscordGuildMember>("GET", this.#token, `/guilds/${guildId}/members/${memberId}`);

        if (member === null) {
            return null;
        }

        guild.members.push(member);
        return member;
    }
}
