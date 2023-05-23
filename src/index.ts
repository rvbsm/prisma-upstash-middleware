import type { Redis } from "@upstash/redis";
import type { SetCommandOptions } from "@upstash/redis/types/pkg/commands/set";
import type { Prisma } from "@prisma/client";

export interface MiddlewareOptions {
	upstash: Redis;
	models: Prisma.ModelName[];
	actions: Prisma.PrismaAction[];
	opts?: SetCommandOptions;
}

type JSONType = string | number | object | [] | boolean | null;

const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function dateReviver(_: string, value: JSONType): JSONType | Date {
	return typeof value === "string" && datePattern.test(value)
		? new Date(value)
		: value;
}

function upstashMiddleware(options: MiddlewareOptions): Prisma.Middleware {
	const { upstash, models, actions, opts } = options;

	return async (params, next) => {
		if (
			params.model &&
			models.includes(params.model) &&
			actions.includes(params.action)
		) {
			const key = `${params.model}:${params.action}:${params.args[0]}`;

			const cache = await upstash.get<string | object>(key);
			if (cache !== null) {
				if (typeof cache === "string") return JSON.parse(cache, dateReviver);
				else return JSON.parse(JSON.stringify(cache), dateReviver);
			}

			const result = await next(params);
			upstash.set(key, result, opts);

			return result;
		}

		return next(params);
	};
}

export default upstashMiddleware;
