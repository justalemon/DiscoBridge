export async function request<T>(method: "GET" | "POST" | "PUT" | "DELETE", token: string, endpoint: string) {
    const resp = await fetch(`https://discord.com/api/v10${endpoint}`, {
        method: method,
        headers: {
            "User-Agent": "DiscoBridge for fxserver (https://github.com/justalemon/DiscoBridge)",
            "Authorization": `Bot ${token}`
        }
    });

    if (resp.status == 404) {
        return null;
    }

    if (resp.ok) {
        return await resp.json() as T;
    }

    throw new Error(`HTTP Returned non 200 code: ${resp.status}`);
}
