const datePattern = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
function castDates(_, value) {
    const isDate = typeof value === "string" && datePattern.test(value);
    return isDate ? new Date(value) : value;
}
function upstashMiddleware(options) {
    const { upstash, args, instances } = options;
    return async (params, next) => {
        const instance = instances.find((instance) => instance.model === params.model &&
            instance.actions.includes(params.action));
        if (!instance)
            return next(params);
        const key = `${params.model}:${params.action}:${JSON.stringify(params.args)}`;
        const cache = await upstash.get(key);
        if (cache !== null) {
            if (typeof cache === "string")
                return JSON.parse(cache, castDates);
            else
                return JSON.parse(JSON.stringify(cache), castDates);
        }
        const result = await next(params);
        upstash.set(key, result, instance.args ?? args);
        return result;
    };
}
export default upstashMiddleware;
