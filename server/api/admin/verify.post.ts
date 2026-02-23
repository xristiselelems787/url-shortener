import { getUrl, setUrl } from '../utils/storage'

interface UrlData {
  code: string
  originalUrl: string
  alias?: string
  createdAt: string
  clicks: number
}

// Admin password from environment or fallback
const getAdminPassword = () => process.env.ADMIN_PASSWORD || 'snipurl-admin-2024'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { password } = body

  if (password !== getAdminPassword()) {
    throw createError({
      statusCode: 401,
      message: 'Invalid password'
    })
  }

  // Return a simple token (timestamp-based, valid for session)
  const token = Buffer.from(`${Date.now()}:${password}`).toString('base64')
  
  return { success: true, token }
})
