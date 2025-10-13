import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axiosConfig'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // State
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)
  const roles = ref(JSON.parse(localStorage.getItem('roles')) || [])
  const permissions = ref(JSON.parse(localStorage.getItem('permissions')) || [])
  const returnUrl = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isSuperAdmin = computed(() => roles.value.includes('superadmin'))
  const isAdmin = computed(() => roles.value.includes('admin'))
  const isManager = computed(() => roles.value.includes('manager'))
  const isAuthorized = computed(() => isAdmin.value || isManager.value)

  // Actions
  async function login(credentials) {
    try {
      isLoading.value = true
      error.value = null

      // 2. Send login request
      const response = await api.post('/login', credentials, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      // console.log('La reponse apres le login : ', response)


      // 3. Process response - MODIFIED HERE
      if (!response?.token) {
        throw new Error(response?.message || 'Authentification échouée')
      }

      token.value = response.token
      user.value = response.user
      roles.value = response.roles || []
      permissions.value = response.permissions || []

      // // 4. Save to localStorage
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('roles', JSON.stringify(roles.value))
      localStorage.setItem('permissions', JSON.stringify(permissions.value))

      // // 5. Redirect
      router.push(returnUrl.value || '/')
      return response.data

    } catch (err) {
      console.error('Login error details:', {
        error: err,
        response: err.response,
        config: err.config
      })

      error.value = err.response?.message ||
                  err.response?.error ||
                  err.message ||
                  'Erreur de connexion'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser() {
    try {
      if (!token.value) return;

      const response = await api.get('/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      });

      // Version flexible (selon la structure de l'API)
      user.value = response?.user
      roles.value = response?.roles
      permissions.value = response?.permissions

      // Mise à jour du localStorage
      localStorage.setItem('user', JSON.stringify(user.value));
      localStorage.setItem('roles', JSON.stringify(roles.value));
      localStorage.setItem('permissions', JSON.stringify(permissions.value));

      return response
    } catch (err) {
      console.error("Erreur fetchUser :", err);
      // On ne déconnecte pas automatiquement (évite les bugs d'actualisation)
      // On pourrait juste afficher un avertissement
      error.value = "Impossible de rafraîchir les données utilisateur";
    }
  }

  async function logout() {
    try {
      await api.post('/logout', null, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    } finally {
      clearAuthData()
      router.push('/signin')
    }
  }

  function clearAuthData() {
    token.value = null
    user.value = null
    roles.value = []
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('roles')
    localStorage.removeItem('permissions')
  }

  function hasRole(role) {
    return roles.value.includes(role)
  }

  function hasPermission(permission) {
    return permissions.value.includes(permission)
  }

  // Initialisation
  if (token.value) {
    // On charge d'abord les données en cache
    user.value = JSON.parse(localStorage.getItem('user')) || null;
    roles.value = JSON.parse(localStorage.getItem('roles')) || [];
    permissions.value = JSON.parse(localStorage.getItem('permissions')) || [];

    // Puis on tente une MAJ silencieuse (sans bloquer l'UI)
    fetchUser(); // En arrière-plan
  }

  return {
    // State
    user,
    token,
    roles,
    permissions,
    returnUrl,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isManager,
    isAuthorized,

    // Actions
    login,
    logout,
    fetchUser,
    clearAuthData,
    hasRole,
    hasPermission
  }
})
