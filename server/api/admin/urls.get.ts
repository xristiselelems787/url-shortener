import { getAllUrls } from '../../utils/storage'

// Admin password check middleware
function checkAuth(event: any): boolean {
  const auth = getHeader(event, 'x-admin-auth')
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'snipurl-admin-2024'
  return auth === ADMIN_PASSWORD
}

export default defineEventHandler(async (event) => {
  // Simple session check via sessionStorage on client
  // For better security, implement proper JWT/session
  
  const urls = await getAllUrls()
  return urls
})
