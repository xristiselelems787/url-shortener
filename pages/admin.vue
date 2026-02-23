<script setup lang="ts">
interface ShortenedUrl {
  code: string
  originalUrl: string
  alias?: string
  createdAt: string
  clicks: number
}

const password = ref('')
const isAuthenticated = ref(false)
const urls = ref<ShortenedUrl[]>([])
const loading = ref(false)
const error = ref('')

// Check if already authenticated (stored in sessionStorage)
onMounted(() => {
  const auth = sessionStorage.getItem('admin_auth')
  if (auth === 'true') {
    isAuthenticated.value = true
    fetchUrls()
  }
})

async function login() {
  if (!password.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/admin/verify', {
      method: 'POST',
      body: { password: password.value }
    })
    
    if (response.success) {
      isAuthenticated.value = true
      sessionStorage.setItem('admin_auth', 'true')
      await fetchUrls()
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Invalid password'
  } finally {
    loading.value = false
  }
}

async function fetchUrls() {
  loading.value = true
  try {
    urls.value = await $fetch('/api/admin/urls')
  } catch {
    error.value = 'Failed to fetch URLs'
  } finally {
    loading.value = false
  }
}

function logout() {
  isAuthenticated.value = false
  sessionStorage.removeItem('admin_auth')
  password.value = ''
  urls.value = []
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function truncateUrl(url: string, max: number = 50): string {
  return url.length > max ? url.substring(0, max) + '...' : url
}

useHead({
  title: 'Admin - SnipURL'
})
</script>

<template>
  <div class="admin-page">
    <!-- Login Form -->
    <div v-if="!isAuthenticated" class="login-card">
      <h1>🔐 Admin Dashboard</h1>
      <p class="subtitle">Enter password to access</p>
      
      <form @submit.prevent="login" class="login-form">
        <input
          v-model="password"
          type="password"
          placeholder="Admin password"
          class="password-input"
        />
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? '...' : 'Login' }}
        </button>
      </form>
      
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <!-- Dashboard -->
    <div v-else class="dashboard">
      <header class="dashboard-header">
        <h1>📊 URL Statistics</h1>
        <button @click="logout" class="logout-btn">Logout</button>
      </header>

      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{{ urls.length }}</span>
          <span class="stat-label">Total URLs</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ urls.reduce((sum, u) => sum + u.clicks, 0) }}</span>
          <span class="stat-label">Total Clicks</span>
        </div>
      </div>

      <div class="refresh-row">
        <button @click="fetchUrls" class="refresh-btn" :disabled="loading">
          {{ loading ? 'Loading...' : '🔄 Refresh' }}
        </button>
      </div>

      <div v-if="urls.length === 0" class="empty">
        No URLs shortened yet
      </div>

      <div v-else class="url-table-wrapper">
        <table class="url-table">
          <thead>
            <tr>
              <th>Short Code</th>
              <th>Original URL</th>
              <th>Clicks</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="url in urls" :key="url.code">
              <td class="code-cell">
                <span class="code">{{ url.alias || url.code }}</span>
                <span v-if="url.alias" class="alias-badge">alias</span>
              </td>
              <td class="url-cell">
                <a :href="url.originalUrl" target="_blank" class="original-url">
                  {{ truncateUrl(url.originalUrl, 40) }}
                </a>
              </td>
              <td class="clicks-cell">{{ url.clicks }}</td>
              <td class="date-cell">{{ formatDate(url.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #0f0f1a;
  color: #f8fafc;
  padding: 2rem;
  font-family: 'Inter', -apple-system, sans-serif;
}

/* Login Card */
.login-card {
  max-width: 400px;
  margin: 4rem auto;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1.5rem;
  padding: 2.5rem;
  text-align: center;
}

.login-card h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.password-input {
  padding: 1rem;
  background: rgba(15, 15, 26, 0.9);
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-radius: 0.75rem;
  color: #f8fafc;
  font-size: 1rem;
}

.password-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.login-btn {
  padding: 1rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  margin-top: 1rem;
}

/* Dashboard */
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 1.75rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.875rem;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Refresh */
.refresh-row {
  margin-bottom: 1.5rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.5rem;
  color: #a78bfa;
  cursor: pointer;
  font-size: 0.875rem;
}

.refresh-btn:hover {
  background: rgba(139, 92, 246, 0.3);
}

/* Empty State */
.empty {
  text-align: center;
  color: #94a3b8;
  padding: 4rem 2rem;
  background: rgba(26, 26, 46, 0.5);
  border-radius: 1rem;
}

/* Table */
.url-table-wrapper {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1rem;
  overflow: hidden;
}

.url-table {
  width: 100%;
  border-collapse: collapse;
}

.url-table th {
  background: rgba(139, 92, 246, 0.1);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #a78bfa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.url-table td {
  padding: 1rem;
  border-top: 1px solid rgba(139, 92, 246, 0.1);
}

.url-table tr:hover td {
  background: rgba(139, 92, 246, 0.05);
}

.code-cell .code {
  font-weight: 600;
  color: #a78bfa;
}

.alias-badge {
  background: #8b5cf6;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.65rem;
  font-weight: 600;
  margin-left: 0.5rem;
  text-transform: uppercase;
}

.url-cell .original-url {
  color: #94a3b8;
  text-decoration: none;
}

.url-cell .original-url:hover {
  color: #f8fafc;
}

.clicks-cell {
  font-weight: 600;
  color: #10b981;
}

.date-cell {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-bar {
    flex-direction: column;
  }
  
  .url-table-wrapper {
    overflow-x: auto;
  }
  
  .url-table {
    min-width: 600px;
  }
}
</style>
