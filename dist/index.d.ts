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
declare function upstashMiddleware(options: MiddlewareOptions): Prisma.Middleware;
export default upstashMiddleware;
