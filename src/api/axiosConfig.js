// src/api/axiosConfig.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// 1. Configuration de base avec des paramètres optimisés
const api = axios.create({
  baseURL: 'https://stagging.bylin-style.com/api/admin',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // À activer si vous utilisez des cookies de session
})

// 2. Intercepteur de requête avancé
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2)

    // Ajout des headers communs
    config.headers['X-Request-ID'] = requestId
    config.headers['X-Correlation-ID'] = authStore.correlationId || requestId

    // Gestion du token d'authentification
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      config.transformRequest = [(data) => data];
    }

    // Optimisation pour les requêtes GET
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(), // Cache buster
        _v: import.meta.env.VITE_APP_VERSION
      }
    }

    return config
  },
  (error) => {
    // Journalisation des erreurs de requête
    console.error('[API] Request Error:', error)
    return Promise.reject(error)
  }
)

// 3. Intercepteur de réponse complet
// Update the response interceptor to better handle errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { response } = error

    if (response) {
      // Handle 419 CSRF token mismatch
      if (response.status === 419) {
        try {
          // await axios.get('https://stagging.bylin-style.com/sanctum/csrf-cookie', {
          //   // withCredentials: true
          // });
          // Retry the original request
          return api(error.config);
        } catch (csrfError) {
          console.error('Failed to refresh CSRF token:', csrfError);
        }
      }

      // Handle validation errors
      if (response.status === 422) {
        const errors = response.data.errors
        const firstError = Object.values(errors)[0][0]
        error.message = firstError || 'Validation error'
      }

      // Handle 401 unauthorized
      if (response?.status === 401) {
        const authStore = useAuthStore();
        authStore.clearAuthData();
        window.location.href = "/signin"; // Redirection forcée
      }
    }

    return Promise.reject(error)
  }
)

// 4. Méthodes étendues pour l'e-commerce
api.ecommerce = {
  endpoints: {
    checkout: '/checkout',
    inventory: '/inventory',
    payment: '/payment',
    products: '/products'
  },

  // Gestion des requêtes batch avec timeout individuel
  batchRequests: async (requests, timeout = 10000) => {
    const cancelToken = axios.CancelToken
    const source = cancelToken.source()

    // Configuration des requêtes avec timeout individuel
    const configuredRequests = requests.map(req => ({
      ...req,
      cancelToken: source.token,
      timeout: req.timeout || timeout
    }))

    // Timeout global
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        source.cancel('Batch request timeout')
        reject(new Error('Batch request timeout'))
      }, timeout * 2)
    )

    try {
      return await Promise.race([
        axios.all(configuredRequests.map(req => api(req))),
        timeoutPromise
      ])
    } catch (error) {
      if (axios.isCancel(error)) {
        throw {
          isCancelled: true,
          message: 'Batch request cancelled',
          details: error.message
        }
      }
      throw error
    }
  },

  // Gestion des requêtes critiques
  criticalRequest: async (config, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await api({
          ...config,
          headers: {
            ...config.headers,
            'X-Critical-Request': 'true',
            'X-Retry-Count': i
          }
        })
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  },

  // Annulation de requête améliorée
  createCancelToken: () => {
    return axios.CancelToken.source()
  },

  // Méthode pour les uploads de fichiers
  uploadFile: (file, config = {}) => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/upload', formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60s pour les uploads
    })
  }
}

// 5. Méthodes utilitaires
api.setAuthToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

api.clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization']
}

api.setBaseURL = (url) => {
  api.defaults.baseURL = url
}

export default api
