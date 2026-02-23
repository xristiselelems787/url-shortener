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
const copied = ref(false)
const showHistory = ref(true)

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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

onMounted(() => {
  fetchRecentUrls()
})

useHead({
  title: 'SnipURL - Modern URL Shortener',
  meta: [
    { name: 'description', content: 'Fast, modern URL shortener with custom aliases and analytics' }
  ]
})
</script>

<template>
  <div class="app">
    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="gradient-orb gradient-orb-1"></div>
      <div class="gradient-orb gradient-orb-2"></div>
      <div class="gradient-orb gradient-orb-3"></div>
    </div>

    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="logo">
          <span class="logo-icon">✂️</span>
          <span class="logo-text">SnipURL</span>
        </div>
        <p class="tagline">Shorten. Share. Track.</p>
      </header>

      <!-- Main Card -->
      <main class="main-card">
        <!-- Input Section -->
        <div class="input-section">
          <div class="input-wrapper">
            <div class="input-icon">🔗</div>
            <input
              v-model="url"
              type="url"
              placeholder="Paste your long URL here..."
              class="url-input"
              @keyup.enter="shortenUrl"
            />
          </div>

          <div class="options-row">
            <div class="alias-wrapper">
              <span class="alias-prefix">snip.io/</span>
              <input
                v-model="alias"
                type="text"
                placeholder="custom-alias"
                class="alias-input"
                pattern="[a-zA-Z0-9-_]+"
              />
            </div>

            <button 
              @click="shortenUrl" 
              :disabled="loading || !url"
              class="shorten-btn"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-else>Shorten</span>
            </button>
          </div>
        </div>

        <!-- Error State -->
        <Transition name="fade">
          <div v-if="error" class="error-toast">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>
        </Transition>

        <!-- Success State -->
        <Transition name="slide-up">
          <div v-if="result" class="result-card">
            <div class="result-header">
              <span class="success-icon">✅</span>
              <span>Your shortened URL is ready!</span>
            </div>
            <div class="result-url-box">
              <a :href="result.shortUrl" target="_blank" class="result-link">
                {{ result.shortUrl }}
              </a>
              <button 
                @click="copyToClipboard(result.shortUrl)" 
                class="copy-btn"
                :class="{ 'copied': copied }"
              >
                {{ copied ? '✓ Copied!' : '📋 Copy' }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- History Toggle -->
        <button 
          v-if="recentUrls.length > 0"
          @click="showHistory = !showHistory" 
          class="history-toggle"
        >
          <span>Recent Links</span>
          <span class="chevron" :class="{ 'rotated': showHistory }">▼</span>
        </button>

        <!-- History Section -->
        <Transition name="slide-down">
          <div v-if="showHistory && recentUrls.length > 0" class="history-section">
            <TransitionGroup name="list" tag="div" class="url-list">
              <div 
                v-for="item in recentUrls" 
                :key="item.code" 
                class="url-card"
              >
                <div class="url-card-main">
                  <div class="short-url">
                    <span class="domain">snip.io/</span>
                    <span class="code">{{ item.alias || item.code }}</span>
                    <span v-if="item.alias" class="badge">alias</span>
                  </div>
                  <div class="meta">
                    <span class="clicks">
                      <span class="clicks-icon">👁️</span>
                      {{ item.clicks }} clicks
                    </span>
                    <span class="date">{{ formatDate(item.createdAt) }}</span>
                  </div>
                </div>
                <div class="original-url">
                  <span class="domain-badge">{{ getDomain(item.originalUrl) }}</span>
                  <span class="url-text">{{ truncateUrl(item.originalUrl, 40) }}</span>
                </div>
                <button 
                  @click="copyToClipboard(`https://${result?.shortUrl.split('//')[1]?.split('/')[0] || 'snip.io'}/${item.code}`)"
                  class="mini-copy-btn"
                >
                  📋
                </button>
              </div>
            </TransitionGroup>
          </div>
        </Transition>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <p>Built with 🔥 by <strong>0xAssist</strong></p>
        <p class="footer-note">Powered by Nuxt 3 + Vercel</p>
      </footer>
    </div>
  </div>
</template>

<style>
/* Reset & Base */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #8b5cf6;
  --primary-light: #a78bfa;
  --primary-dark: #7c3aed;
  --accent: #06b6d4;
  --bg: #0f0f1a;
  --bg-card: rgba(26, 26, 46, 0.8);
  --bg-input: rgba(15, 15, 26, 0.9);
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --border: rgba(139, 92, 246, 0.2);
  --success: #10b981;
  --error: #ef4444;
  --gradient-1: #8b5cf6;
  --gradient-2: #06b6d4;
  --gradient-3: #ec4899;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Background Effects */
.app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.bg-effects {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}

.gradient-orb-1 {
  width: 600px;
  height: 600px;
  background: var(--gradient-1);
  top: -200px;
  left: -200px;
}

.gradient-orb-2 {
  width: 500px;
  height: 500px;
  background: var(--gradient-2);
  bottom: -150px;
  right: -150px;
  animation-delay: -7s;
}

.gradient-orb-3 {
  width: 400px;
  height: 400px;
  background: var(--gradient-3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, -50px) scale(1.1); }
  50% { transform: translate(-30px, 30px) scale(0.9); }
  75% { transform: translate(40px, 40px) scale(1.05); }
}

/* Container */
.container {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 2.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.logo-text {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--gradient-1), var(--gradient-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  color: var(--text-muted);
  font-size: 1.1rem;
  font-weight: 500;
}

/* Main Card */
.main-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Input Section */
.input-section {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.input-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  opacity: 0.5;
}

.url-input {
  width: 100%;
  padding: 1.25rem 1.25rem 1.25rem 3.5rem;
  background: var(--bg-input);
  border: 2px solid var(--border);
  border-radius: 1rem;
  font-size: 1rem;
  color: var(--text);
  transition: all 0.3s ease;
}

.url-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
}

.url-input::placeholder {
  color: var(--text-muted);
}

.options-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.alias-wrapper {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 2px solid var(--border);
  border-radius: 1rem;
  padding: 0 1.25rem;
  transition: all 0.3s ease;
}

.alias-wrapper:focus-within {
  border-color: var(--primary);
}

.alias-prefix {
  color: var(--text-muted);
  font-size: 0.9rem;
  white-space: nowrap;
}

.alias-input {
  flex: 1;
  padding: 1rem 0.5rem;
  background: transparent;
  border: none;
  font-size: 1rem;
  color: var(--text);
}

.alias-input:focus {
  outline: none;
}

.alias-input::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
}

.shorten-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 120px;
}

.shorten-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.5);
}

.shorten-btn:active:not(:disabled) {
  transform: translateY(0);
}

.shorten-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Toast */
.error-toast {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--error);
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 1.25rem;
}

/* Result Card */
.result-card {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--success);
  font-weight: 500;
}

.success-icon {
  font-size: 1.25rem;
}

.result-url-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.result-link {
  flex: 1;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  word-break: break-all;
  transition: color 0.2s;
}

.result-link:hover {
  color: var(--primary-light);
}

.copy-btn {
  padding: 0.75rem 1.25rem;
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-btn:hover {
  background: var(--border);
}

.copy-btn.copied {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

/* History Toggle */
.history-toggle {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.chevron {
  transition: transform 0.3s;
  font-size: 0.75rem;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* History Section */
.history-section {
  margin-top: 1rem;
}

.url-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.url-card {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  position: relative;
  transition: all 0.2s;
}

.url-card:hover {
  border-color: var(--primary);
}

.url-card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.short-url {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1rem;
}

.short-url .domain {
  color: var(--text-muted);
}

.short-url .code {
  font-weight: 600;
  color: var(--primary-light);
}

.badge {
  background: var(--primary);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 0.5rem;
}

.meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.clicks {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.clicks-icon {
  font-size: 0.9rem;
}

.original-url {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.domain-badge {
  background: rgba(139, 92, 246, 0.2);
  color: var(--primary-light);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
}

.url-text {
  color: var(--text-muted);
}

.mini-copy-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  font-size: 0.9rem;
}

.url-card:hover .mini-copy-btn {
  opacity: 1;
}

/* Footer */
.footer {
  text-align: center;
  padding-top: 3rem;
  margin-top: auto;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer strong {
  color: var(--text);
}

.footer-note {
  font-size: 0.8rem;
  margin-top: 0.25rem;
  opacity: 0.7;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive */
@media (max-width: 640px) {
  .container {
    padding: 1.5rem 1rem;
  }

  .logo-text {
    font-size: 2rem;
  }

  .main-card {
    padding: 1.5rem;
    border-radius: 1rem;
  }

  .options-row {
    flex-direction: column;
  }

  .alias-wrapper {
    min-width: 100%;
  }

  .shorten-btn {
    width: 100%;
  }

  .url-card-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .meta {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
