export function debug(...objs: any[]) {
    if (GetConvarInt("lemon_debug", 0) !== 0 || GetConvarInt("lemon_" + GetCurrentResourceName() + "_debug", 0) !== 0) {
        console.log("Debug: ", ...objs);
    }
}

export const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));
