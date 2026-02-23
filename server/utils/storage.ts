import { Redis } from '@upstash/redis'

// Global in-memory store for development/demo
const memoryStore = new Map<string, any>()

// Check if we have Upstash Redis configured
const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

let redis: Redis | null = null
if (hasRedis) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

export async function getUrl(code: string) {
  if (redis) {
    return await redis.get<any>(`url:${code}`)
  }
  return memoryStore.get(`url:${code}`)
}

export async function setUrl(code: string, data: any) {
  if (redis) {
    await redis.set(`url:${code}`, data)
  } else {
    memoryStore.set(`url:${code}`, data)
  }
}

export async function getAllUrls() {
  if (redis) {
    const keys = await redis.keys('url:*')
    const urls = []
    for (const key of keys) {
      const data = await redis.get<any>(key)
      if (data) urls.push(data)
    }
    return urls
  }
  
  return Array.from(memoryStore.values())
    .filter(v => v?.code)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
}
