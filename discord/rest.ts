import axios from "axios";

export async function request<T>(method: "GET" | "POST" | "PUT" | "DELETE", token: string, endpoint: string) {
    const resp = await axios.request<T>({
        baseURL: `https://discord.com/api/v10`,
        url: endpoint,
        method: method,
        headers: {
            "User-Agent": "DiscoBridge for fxserver (https://github.com/justalemon/DiscoBridge)",
            "Authorization": `Bot ${token}`
        }
    });

    if (resp.status == 404) {
        return null;
    }

    if (resp.status < 400) {
        return resp.data;
    }

    throw new Error(`HTTP Returned non 200 code: ${resp.status}`);
}
