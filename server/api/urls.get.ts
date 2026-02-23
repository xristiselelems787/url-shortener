import { getAllUrls } from '../utils/storage'

export default defineEventHandler(async () => {
  return await getAllUrls()
})
