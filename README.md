# Prisma Upstash Middleware

Prisma query caching middleware to Upstash Redis with automatic date-strings conversion

## Install

```sh
pnpm add prisma-upstash-middleware
```

## Usage

```typescript
import { PrismaClient } from "@prisma/client";
import { Redis } from "@upstash/redis";
import upstashMiddleware from "prisma-upstash-middleware";

const prisma = new PrismaClient();
const redis = Redis.fromEnv();

prisma.$use(
 upstashMiddleware({
  redis: redis,
  models: ["User", "Post"],
  actions: ["findUnique", "findMany"],
  args: { ex: 300 },
 }),
);
```

## Contributing

Pull requests are welcome.
For major changes, please open an issue first to discuss what you would like to change.

### Prerequisite before building

There will be errors like `error TS2305: Module '"@prisma/client"' has no exported member 'Prisma'.` if this not done:

1. Run `pnpm install`
2. Run `pnpm exec prisma init`
3. Add Prisma model to [prisma/schema.prisma][prisma-schema]
4. Run `pnpm exec prisma generate`
5. Run `pnpm build`

Not necessarily pnpm, you are free to use any other Package Manager

#### Prisma model example

```prisma
model User {
  id String @id @default(cuid())
}
```

## License

This project is licensed under the [MIT License][license].

[license]: ./LICENSE
[prisma-schema]: ./prisma/schema.prisma
