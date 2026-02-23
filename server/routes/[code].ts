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

  if (!code) {
    throw createError({
      statusCode: 400,
      message: 'Code is required'
    })
  }

  // Ignore API routes and static files
  if (code.startsWith('_') || code.startsWith('api') || code.includes('.')) {
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
