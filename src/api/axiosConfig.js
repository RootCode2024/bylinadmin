import axios from 'axios'

// URL de base sans le /customer pour les routes globales
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/admin', '') || 'https://api.bylin-style.com'

// Création de l'instance Axios
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔐 Cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Fonction pour récupérer le cookie CSRF
function getCsrfToken() {
  return decodeURIComponent(document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1] || '')
}

// Intercepteur de requête
api.interceptors.request.use((config) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2)
  // config.headers['X-Request-ID'] = requestId

  // Pour les méthodes non-GET, ajouter le header X-XSRF-TOKEN
  if (config.method !== 'get') {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken
      console.log('🛡️ CSRF token added to headers')
    } else {
      console.warn('⚠️ No CSRF token found in cookies')
    }
  }

  console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
    hasCsrfHeader: !!config.headers['X-XSRF-TOKEN'],
    csrfTokenLength: config.headers['X-XSRF-TOKEN']?.length || 0
  })

  return config
}, (error) => {
  console.error('❌ [API Request Error]', error)
  return Promise.reject(error)
})

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`)
    return response.data
  },
  async (error) => {
    const { response, config } = error

    if (response) {
      console.log(`❌ [API Error] ${response.status} ${config?.url}`, {
        message: response.data?.message,
        exception: response.data?.exception
      })

      // Gestion spécifique des erreurs CSRF
      if (response.status === 419) {
        console.warn('🔄 CSRF Token mismatch, attempting to refresh...')

        try {
          // Régénérer le token CSRF
          const csrfUrl = '/sanctum/csrf-cookie'
          await axios.get(csrfUrl, {
            baseURL: BASE_URL,
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            }
          })

          console.log('✅ CSRF token refreshed, retrying request...')

          // Réessayer la requête originale avec le nouveau token
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              'X-XSRF-TOKEN': getCsrfToken() // Utiliser le nouveau token
            }
          }

          return api(retryConfig)
        } catch (csrfError) {
          console.error('❌ Failed to refresh CSRF token:', csrfError)
          return Promise.reject(new Error('Unable to refresh CSRF token. Please refresh the page.'))
        }
      }

      // Gestion des erreurs d'authentification
      if (response.status === 401) {
        console.warn('🔐 Authentication required')
        try {
          const { useAuthStore } = await import('@/stores/auth')
          const authStore = useAuthStore()
          authStore.cleanupAuthState()
        } catch (e) {
          console.log('Auth store not available for cleanup')
        }
      }
    } else {
      console.error('❌ [API Network Error]', error.message)
    }

    return Promise.reject(error)
  }
)

export default api
