export function debug(...objs: any[]) {
    if (GetConvarInt("lemon_debug", 0) !== 0 || GetConvarInt("lemon_" + GetCurrentResourceName() + "_debug", 0) !== 0) {
        console.log(...objs);
    }
}
