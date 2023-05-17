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
