import WebSocket, { Data } from "ws";
import { request } from "./rest";
import { DiscordGuild } from "./types/guild";
import { DiscordGuildMember } from "./types/guild_member";
import { DiscordMessage } from "./types/message";
import { GatewayData } from "./gateway/data";
import { GatewayHello } from "./gateway/hello";
import { GatewayReady } from "./gateway/ready";
import { GatewayResponse } from "./gateway/response";
import { DiscordChannel } from "./types/channel";
import { debug } from "../tools";

export class Discord {
    #ws: WebSocket | null = null;
    #token: string;
    #interval: NodeJS.Timeout | null = null;
    #heartbeat: number = -1;
    #session_id: string | null = null;
    #resume_gateway_url: string | null = null;
    #last_sequence: number | null = null;
    #ready: boolean = false;

    #guilds: DiscordGuild[] = [];

    constructor(token: string) {
        this.#token = token;
        this.#connect();
    }

    get isReady() : boolean {
        return this.#ready;
    }

    #connect() {
        if (this.#ws !== null) {

        }

        let reconnect = false;

        if (this.#session_id !== null && this.#resume_gateway_url) {
            reconnect = true;
            this.#ws = new WebSocket(this.#resume_gateway_url + "/?v=10&encoding=json");
        } else {
            this.#ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
        }

        this.#ws.on("message", (d) => this.#handleMessage(d));
        this.#ws.on("open", this.#handleOpen);

        if (reconnect) {
            this.#ws?.send(JSON.stringify({
                "op": 6,
                "d": {
                    token: this.#token,
                    session_id: this.#session_id,
                    seq: this.#last_sequence
                }
            }));
            this.#session_id = null;
            this.#last_sequence = null;
        }
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
        debug("Sending identification payload");
    }

    #performHeartbeat() {
        debug("Performing heartbeat");
        this.#ws?.send(JSON.stringify({
            "op": 1,
            "d": this.#last_sequence
        }));
    }

    #startHeartbeat() {
        if (this.#interval !== null) {
            clearInterval(this.#interval);
        }

        this.#interval = setInterval(this.#performHeartbeat.bind(this), this.#heartbeat);
    }

    #handleDispatch(type: string | null, payload: GatewayData | DiscordGuild, sequence: number | null) {
        this.#last_sequence = sequence ?? 0;

        if (type == "READY") {
            console.log("Bot is ready!");
            const data = payload as GatewayReady;
            this.#session_id = data.session_id;
            this.#resume_gateway_url = data.resume_gateway_url;
            this.#ready = true;
        } else if (type == "GUILD_CREATE") {
            const guild = payload as DiscordGuild;
            this.#addGuildToCache(guild);
            return;
        } else {
            debug("Unknown payload type: %s", type);
            debug(payload);
        }
    }

    #handleMessage(data: Data) {
        const asString = data.toString();
        const payload: GatewayResponse = JSON.parse(asString);

        switch (payload.op) {
            // Dispatch
            case 0:
                this.#handleDispatch(payload.t, payload.d, payload.s);
                break;
            // Heartbeat
            case 1:
                this.#performHeartbeat();
                break;
            // Reconnect
            case 7:
                this.#connect();
                break;
            // Hello
            case 10:
                const data = payload.d as GatewayHello;
                console.log("Received hello, heartbeat is %d", data.heartbeat_interval);
                this.#heartbeat = data.heartbeat_interval;
                this.#startHeartbeat();
                this.#identify();
                break;
            // Heartbeat ACK
            case 11:
                break;
            // Anything Else
            default:
                debug(`Received opcode ${payload.op}`);
                break;
        }
    }

    #handleOpen() {
        debug("Discord Websocket Connection is Open");
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

    async getGuild(guildId: string) {
        this.#ensureReady();

        const foundGuild = this.#guilds.find(x => x.id == guildId);

        if (typeof(foundGuild) !== "undefined") {
            return foundGuild;
        }

        const fetchedGuild = await request<DiscordGuild>("GET", this.#token, `/guilds/${guildId}`);

        if (fetchedGuild === null) {
            return null; 
        }

        this.#guilds.push(fetchedGuild);
        return fetchedGuild;
    }

    async getChannel(guildId: string, channelId: string) {
        const guild = await this.getGuild(guildId);

        if (guild === null) {
            return null;
        }

        const foundChannel = guild.channels.find(x => x.id == channelId) ?? null;

        // sometimes we might get missing guild ids
        // because we are looking for a channel in a guild, make the it required
        if (foundChannel !== null && typeof(foundChannel.guild_id) !== "undefined") {
            return foundChannel;
        }

        if (foundChannel !== null) {
            const index = guild.channels.indexOf(foundChannel);
            guild.channels.splice(index, 1);
        }

        const channel = await request<DiscordChannel>("GET", this.#token, `/channels/${channelId}`);

        if (channel === null || channel.guild_id !== guildId) {
            return null;
        }

        guild.channels.push(channel);
        return channel;
    }

    async getMember(guildId: string, memberId: string) {
        this.#ensureReady();

        const guild = await this.getGuild(guildId);

        if (guild === null) {
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

    async sendMessage(channelId: string, message: string) {
        // TODO: More options (https://discord.com/developers/docs/resources/message#create-message)
        return await request<DiscordMessage>("POST", this.#token, `/channels/${channelId}/messages`, {
            content: message
        });
    }
}
