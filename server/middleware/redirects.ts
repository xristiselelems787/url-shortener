import { getUrl, setUrl } from '../utils/storage'

interface UrlData {
  code: string
  originalUrl: string
  alias?: string
  createdAt: string
  clicks: number
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Only handle single-segment paths (short codes)
  // e.g., /abc123 but NOT /, /api/xxx, /_nuxt/xxx
  const segments = pathname.split('/').filter(Boolean)
  
  // Skip if not exactly one segment (homepage, nested paths)
  if (segments.length !== 1) {
    return
  }

  const code = segments[0]

  // Skip reserved/system paths
  const reservedPaths = ['_nuxt', '__nuxt', 'api', 'favicon', 'robots', 'sitemap']
  if (reservedPaths.includes(code) || code.startsWith('_')) {
    return
  }

  // Skip static files (contain dots)
  if (code.includes('.')) {
    return
  }

  // Try to find the URL
  const urlData = await getUrl(code) as UrlData | null

  if (!urlData) {
    // Not a valid short code - let Nuxt handle (will show 404)
    return
  }

  // Increment click counter
  urlData.clicks++
  await setUrl(code, urlData)

  // Redirect to original URL
  return sendRedirect(event, urlData.originalUrl, 301)
})
