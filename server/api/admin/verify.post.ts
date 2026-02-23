import { getUrl, getAllUrls } from '../utils/storage'

interface UrlData {
  code: string
  originalUrl: string
  alias?: string
  createdAt: string
  clicks: number
}

// Admin password - in production, use environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'snipurl-admin-2024'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { password } = body

  if (password !== ADMIN_PASSWORD) {
    throw createError({
      statusCode: 401,
      message: 'Invalid password'
    })
  }

  return { success: true }
})
