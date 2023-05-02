import type { Redis } from "@upstash/redis";
import type { SetCommandOptions } from "@upstash/redis/types/pkg/commands/set";
// @ts-expect-error `prisma generate`
import type { Prisma } from "@prisma/client";

interface MiddlewareOptions {
	redis: Redis;
	instances: {
		model: Prisma.ModelName;
		actions: Prisma.PrismaAction[] | string[];
	}[];
	args?: SetCommandOptions;
}

type JSONType = string | number | object | [] | boolean | null;

const datePattern =
	/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

function castDates<T extends JSONType>(_: string, value: T): T | Date {
	const isDate = typeof value === "string" && datePattern.test(value);
	return isDate ? new Date(value) : value;
}
function upstashMiddleware(options: MiddlewareOptions): Prisma.Middleware {
	const { redis, args, instances } = options;

	// @ts-expect-error Prisma Middleware
	return async (params, next) => {
		const key = `${params.model}:${params.action}:${JSON.stringify(
			params.args,
		)}`;

		for (const instance of instances) {
			if (
				params.model === instance.model &&
				instance.actions.includes(params.action)
			) {
				const cache = await redis.get(key);
				if (cache) return JSON.parse(JSON.stringify(cache), castDates);

				const result = await next(params);
				redis.set(key, result, args);

				return result;
			}
		}

		return next(params);
	};
}

export default upstashMiddleware;
