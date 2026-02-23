import { nanoid } from 'nanoid'
import { getUrl, setUrl } from '../utils/storage'

interface UrlData {
  code: string
  originalUrl: string
  alias?: string
  createdAt: string
  clicks: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { url, alias } = body

  // Validate URL
  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'URL is required'
    })
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    throw createError({
      statusCode: 400,
      message: 'Invalid URL format'
    })
  }

  // Generate code
  const code = alias || nanoid(6)

  // Validate alias format
  if (alias) {
    if (!/^[a-zA-Z0-9-_]+$/.test(alias)) {
      throw createError({
        statusCode: 400,
        message: 'Alias can only contain letters, numbers, hyphens and underscores'
      })
    }

    // Check if alias already exists
    const existing = await getUrl(code)
    if (existing) {
      throw createError({
        statusCode: 409,
        message: 'This alias is already taken'
      })
    }
  }

  // Check if random code collision
  if (!alias) {
    let attempts = 0
    let existing = await getUrl(code)
    let finalCode = code
    
    while (existing && attempts < 5) {
      finalCode = nanoid(6)
      existing = await getUrl(finalCode)
      if (!existing) break
      attempts++
    }
  }

  // Store the URL
  const urlData: UrlData = {
    code,
    originalUrl: url,
    alias: alias || undefined,
    createdAt: new Date().toISOString(),
    clicks: 0
  }

  await setUrl(code, urlData)

  // Get the host from headers
  const host = getRequestHeader(event, 'host') || 'localhost:3000'
  const protocol = getRequestHeader(event, 'x-forwarded-proto') || 'https'
  const shortUrl = `${protocol}://${host}/${code}`

  return {
    shortUrl,
    code
  }
})
