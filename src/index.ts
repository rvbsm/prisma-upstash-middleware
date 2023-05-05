import type { Redis } from "@upstash/redis";
import type { SetCommandOptions } from "@upstash/redis/types/pkg/commands/set";
import type { Prisma } from "@prisma/client";

export interface MiddlewareOptions {
	upstash: Redis;
	instances: {
		model: Prisma.ModelName;
		actions: Prisma.PrismaAction[] | string[];
		args?: SetCommandOptions;
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
	const { upstash, args, instances } = options;

	return async (params, next) => {
		for (const instance of instances) {
			if (
				params.model === instance.model &&
				instance.actions.includes(params.action)
			) {
				const key = `${params.model}:${params.action}:${JSON.stringify(
					params.args,
				)}`;

				const cache = await upstash.get<string | object>(key);
				if (cache !== null) {
					if (typeof cache === "string") return JSON.parse(cache, castDates);
					else return JSON.parse(JSON.stringify(cache), castDates);
				}

				const result = await next(params);
				upstash.set(key, result, instance.args ?? args);

				return result;
			}
		}

		return next(params);
	};
}

export default upstashMiddleware;
