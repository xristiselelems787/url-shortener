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

  const urlData = await storage.getItem<UrlData>(`urls:${code}`)

  if (!urlData) {
    throw createError({
      statusCode: 404,
      message: 'URL not found'
    })
  }

  // Increment click counter
  urlData.clicks++
  await storage.setItem(`urls:${code}`, urlData)

  // Redirect to original URL
  return sendRedirect(event, urlData.originalUrl, 301)
})
