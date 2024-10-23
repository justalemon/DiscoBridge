import axios, { AxiosError, AxiosRequestConfig } from "axios";

export async function request<T>(method: "GET" | "POST" | "PUT" | "DELETE", token: string, endpoint: string, data?: any) {
    try {
        const options: AxiosRequestConfig = {
            baseURL: `https://discord.com/api/v10`,
            url: endpoint,
            method: method,
            headers: {
                "User-Agent": "DiscoBridge for fxserver (https://github.com/justalemon/DiscoBridge)",
                "Authorization": `Bot ${token}`
            }
        }
        if (typeof(data) !== "undefined") {
            options.data = data == null ? null : JSON.stringify(data);
            options.headers = options.headers ?? {};
            options.headers["Content-Type"] = "application/json";
        }
        const resp = await axios.request<T>(options);
        return resp.data;
    } catch (e) {
        if (e instanceof AxiosError) {
            console.error(`Error while requesting ${endpoint}`, e.response?.data);
        } else {
            throw e;
        }
        return null;
    }
}
