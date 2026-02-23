<script setup lang="ts">
interface ShortenedUrl {
  code: string
  originalUrl: string
  alias?: string
  createdAt: string
  clicks: number
}

const url = ref('')
const alias = ref('')
const loading = ref(false)
const result = ref<{ shortUrl: string; code: string } | null>(null)
const error = ref('')
const recentUrls = ref<ShortenedUrl[]>([])

const config = useRuntimeConfig()

async function shortenUrl() {
  if (!url.value) return
  
  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await $fetch('/api/shorten', {
      method: 'POST',
      body: {
        url: url.value,
        alias: alias.value || undefined
      }
    })
    
    result.value = response as { shortUrl: string; code: string }
    url.value = ''
    alias.value = ''
    
    // Refresh recent URLs
    await fetchRecentUrls()
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to shorten URL'
  } finally {
    loading.value = false
  }
}

async function fetchRecentUrls() {
  try {
    recentUrls.value = await $fetch('/api/urls')
  } catch {
    // Ignore errors
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

onMounted(() => {
  fetchRecentUrls()
})

useHead({
  title: 'URL Shortener',
})
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>🔗 URL Shortener</h1>
      <p class="subtitle">Fast, simple, with custom aliases</p>
    </header>

    <main class="main">
      <form @submit.prevent="shortenUrl" class="form">
        <div class="input-group">
          <label for="url">Long URL</label>
          <input
            id="url"
            v-model="url"
            type="url"
            placeholder="https://example.com/very/long/url/here"
            required
          />
        </div>

        <div class="input-group">
          <label for="alias">Custom Alias (optional)</label>
          <input
            id="alias"
            v-model="alias"
            type="text"
            placeholder="my-custom-link"
            pattern="[a-zA-Z0-9-_]+"
            title="Letters, numbers, hyphens and underscores only"
          />
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Shortening...' : 'Shorten URL' }}
        </button>
      </form>

      <div v-if="error" class="error">
        {{ error }}
      </div>

      <div v-if="result" class="result">
        <h3>Your shortened URL:</h3>
        <div class="result-url">
          <a :href="result.shortUrl" target="_blank">{{ result.shortUrl }}</a>
          <button @click="copyToClipboard(result.shortUrl)" class="btn-copy">
            📋 Copy
          </button>
        </div>
      </div>

      <section v-if="recentUrls.length > 0" class="recent">
        <h2>Recent URLs</h2>
        <div class="url-list">
          <div v-for="item in recentUrls" :key="item.code" class="url-item">
            <div class="url-info">
              <a :href="`/${item.code}`" target="_blank" class="short-link">
                /{{ item.code }}
              </a>
              <span v-if="item.alias" class="alias-badge">{{ item.alias }}</span>
              <span class="clicks">{{ item.clicks }} clicks</span>
            </div>
            <div class="original-url">{{ item.originalUrl }}</div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>Built with Nuxt 3 • Deployed on Vercel</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --bg: #0f172a;
  --bg-card: #1e293b;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: #334155;
  --error: #ef4444;
  --success: #22c55e;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.6;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.main {
  flex: 1;
}

.form {
  background: var(--bg-card);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-muted);
}

.input-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg);
  color: var(--text);
  transition: border-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.input-group input::placeholder {
  color: var(--text-muted);
}

.btn-primary {
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  color: var(--error);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.result {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid var(--success);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.result h3 {
  margin-bottom: 0.75rem;
  color: var(--success);
}

.result-url {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.result-url a {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  word-break: break-all;
}

.btn-copy {
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.btn-copy:hover {
  background: var(--border);
}

.recent h2 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.url-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.url-item {
  background: var(--bg-card);
  padding: 1rem 1.25rem;
  border-radius: 8px;
}

.url-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.short-link {
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}

.short-link:hover {
  text-decoration: underline;
}

.alias-badge {
  background: var(--primary);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.clicks {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.original-url {
  color: var(--text-muted);
  font-size: 0.875rem;
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer {
  text-align: center;
  padding-top: 2rem;
  margin-top: 3rem;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.75rem;
  }

  .form {
    padding: 1.25rem;
  }
}
</style>
