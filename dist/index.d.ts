import type { Redis } from "@upstash/redis";
import type { SetCommandOptions } from "@upstash/redis/types/pkg/commands/set";
import type { Prisma } from "@prisma/client";
interface MiddlewareOptions {
    redis: Redis;
    instances: {
        model: Prisma.ModelName;
        actions: Prisma.PrismaAction[] | string[];
    }[];
    args?: SetCommandOptions;
}
declare function upstashMiddleware(options: MiddlewareOptions): Prisma.Middleware;
export default upstashMiddleware;
