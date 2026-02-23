// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  
  app: {
    head: {
      title: 'URL Shortener',
      meta: [
        { name: 'description', content: 'Fast and simple URL shortener with custom aliases' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  nitro: {
    storage: {
      urls: {
        driver: 'fs',
        base: './data'
      }
    }
  }
})
