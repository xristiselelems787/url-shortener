import { getUrl, setUrl } from '../utils/storage'

interface UrlData {
  code: string
  originalUrl: string
  alias?: string
  createdAt: string
  clicks: number
}

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  // Skip if no code or if it's a reserved path
  if (!code || code.startsWith('_') || code === 'api') {
    return
  }

  // Skip static files (contain dots)
  if (code.includes('.')) {
    return
  }

  // Skip common paths that shouldn't be treated as short codes
  const reservedPaths = ['favicon', 'robots', 'sitemap', '_nuxt', '__nuxt']
  if (reservedPaths.some(p => code.startsWith(p))) {
    return
  }

  const urlData = await getUrl(code) as UrlData | null

  if (!urlData) {
    throw createError({
      statusCode: 404,
      message: 'URL not found'
    })
  }

  // Increment click counter
  urlData.clicks++
  await setUrl(code, urlData)

  // Redirect to original URL
  return sendRedirect(event, urlData.originalUrl, 301)
})
