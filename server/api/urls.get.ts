interface UrlData {
  code: string
  originalUrl: string
  alias?: string
  createdAt: string
  clicks: number
}

export default defineEventHandler(async () => {
  // Get all URLs from storage
  // Note: In production, you'd use a proper database with pagination
  const keys = await storage.getKeys('urls:')
  
  const urls: UrlData[] = []
  
  for (const key of keys) {
    const data = await storage.getItem<UrlData>(key)
    if (data) {
      urls.push(data)
    }
  }

  // Sort by creation date (newest first) and limit to 10
  return urls
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
})
