// lib/rate-limit.ts
import { LRUCache } from "next/dist/server/lib/lru-cache";

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
  tokensPerInterval: number;
}

export default function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number>({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: async (token: string) => {
      const tokenCount = tokenCache.get(token) || 0;
      if (tokenCount >= options.tokensPerInterval) {
        return true;
      }
      tokenCache.set(token, tokenCount + 1);
      return false;
    },
  };
}