import { getAllUrls } from '../../utils/storage'

// Admin password from environment or fallback
const getAdminPassword = () => process.env.ADMIN_PASSWORD || 'snipurl-admin-2024'

function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [timestamp, password] = decoded.split(':')
    
    // Check password
    if (password !== getAdminPassword()) return false
    
    // Check if token is not too old (24 hours)
    const tokenTime = parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in ms
    if (Date.now() - tokenTime > maxAge) return false
    
    return true
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  // Get token from Authorization header or query
  const authHeader = getHeader(event, 'authorization') || getHeader(event, 'x-admin-token')
  const queryToken = getQuery(event).token as string
  
  const token = authHeader?.replace('Bearer ', '') || queryToken
  
  if (!token || !verifyToken(token)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  
  const urls = await getAllUrls()
  return urls
})
