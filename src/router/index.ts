import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes : [
    // 🔓 Routes Publiques
    {
      path: '/signin',
      name: 'login',
      component: () => import('@/views/Auth/Signin.vue'),
      meta: { requiresAuth: false, title: 'Connexion' }
    },
    {
      path: '/signup',
      name: 'register',
      component: () => import('@/views/Auth/Signup.vue'),
      meta: { requiresAuth: false, title: 'Inscription' }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/Auth/ForgotPassword.vue'),
      meta: { requiresAuth: false, title: 'Mot de passe oublié' }
    },

    // 🔐 Routes protégées accessibles à tous les rôles autorisés
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/Ecommerce.vue'),
      meta: { requiresAuth: true, title: 'Tableau de bord', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/Notification/Index.vue'),
      meta: { requiresAuth: true, title: 'Notifications', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Admin/ProfilePage.vue'),
      meta: { requiresAuth: true, title: 'Profil', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Admin/SettingsPage.vue'),
      meta: { requiresAuth: true, title: 'Paramètres', roles: ['superadmin', 'admin'] }
    },
    {
      path: '/categories_and_brands',
      name: 'categories-and-brands',
      component: () => import('@/views/Admin/CategoryAndBrand/CategoriesAndBrandsPage.vue'),
      meta: { requiresAuth: true, title: 'Catégories et marques', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/customers',
      name: 'customers',
      component: () => import('@/views/Admin/User/CustomersPage.vue'),
      meta: { requiresAuth: true, title: 'Liste des clients', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/customers/:customerId',
      name: 'details-customer',
      component: () => import('@/views/Admin/User/CustomerDetailsPage.vue'),
      meta: { requiresAuth: true, title: 'Détails client', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/customers/:customerId/edit',
      name: 'edit-customer',
      component: () => import('@/views/Admin/User/CustomerEditPage.vue'),
      meta: { requiresAuth: true, title: 'Mis à jour client', roles: ['superadmin', 'admin'] }
    },
    {
      path: '/attributes',
      name: 'attributes',
      component: () => import('@/views/Admin/CategoryAndBrand/ColorsAndSizesPage.vue'),
      meta: { requiresAuth: true, title: 'Attributs produits', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/Admin/Product/ProductsPage.vue'),
      meta: { requiresAuth: true, title: 'Produits', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/collections',
      name: 'collections',
      component: () => import('@/views/Admin/Collection/CollectionsPage.vue'),
      meta: { requiresAuth: true, title: 'Collections', roles: ['superadmin', 'admin'] }
    },
    {
      path: '/collections/create',
      name: 'create-collection',
      component: () => import('@/views/Admin/Collection/CreateCollectionPage.vue'),
      meta: { requiresAuth: true, title: 'Créer une Collection' }
    },
    {
      path: '/collections/:id/edit',
      name: 'edit-collection',
      component: () => import('@/views/Admin/Collection/EditCollectionPage.vue'),
      meta: { requiresAuth: true, title: 'Modifier la Collection' }
    },
    {
      path: '/collections/:id/products',
      name: 'collection-products',
      component: () => import('@/views/Admin/Collection/CollectionProductsPage.vue'),
      meta: { requiresAuth: true, title: 'Gérer les Produits' }
    },
    {
      path: '/collections/:id/analytics',
      name: 'collection-analytics',
      component: () => import('@/views/Admin/Collection/CollectionAnalyticsPage.vue'),
      meta: { requiresAuth: true, title: 'Analytiques de la Collection' }
    },
    {
      path: '/add-product',
      name: 'add-product',
      component: () => import('@/views/Admin/Product/AddProductPage.vue'),
      meta: { requiresAuth: true, title: 'Ajouter produit', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/products/:productId/edit',
      name: 'edit-product',
      component: () => import('@/views/Admin/Product/EditProductPage.vue'),
      meta: { requiresAuth: true, title: 'Editer produit', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/products/:productId/duplicate',
      name: 'duplicate-product',
      component: () => import('@/views/Admin/Product/DuplicateProductPage.vue'),
      meta: { requiresAuth: true, title: 'Dupliquer produit', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/messaging',
      name: 'messaging',
      component: () => import('@/views/Admin/User/MessageriePage.vue'),
      meta: { requiresAuth: true, title: 'Messagerie', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/products/reviews',
      name: 'products/reviews',
      component: () => import('@/views/Admin/Review/Index.vue'),
      meta: { requiresAuth: true, title: 'Avis clients', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/shipping-settings',
      name: 'shipping-settings',
      component: () => import('@/views/Admin/Shipping/ShippingSettingsPage.vue'),
      meta: { requiresAuth: true, title: 'Paramètres livraison', roles: ['superadmin'] }
    },
    {
      path: '/delivery-settings',
      name: 'delivery-settings',
      component: () => import('@/views/Admin/Shipping/DeliverySettingsPage.vue'),
      meta: { requiresAuth: true, title: 'livraison', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/shipping-tracking',
      name: 'shipping-tracking',
      component: () => import('@/views/Admin/Shipping/ShippingTrackingPage.vue'),
      meta: { requiresAuth: true, title: 'Suivi expéditions', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/delay-management',
      name: 'delay-management',
      component: () => import('@/views/Admin/Shipping/DelayManagementPage.vue'),
      meta: { requiresAuth: true, title: 'Gestion retards', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/views/Admin/Payment/TransactionsPage.vue'),
      meta: { requiresAuth: true, title: 'Transactions', roles: ['superadmin', 'admin'] }
    },
    {
      path: '/refunds',
      name: 'refunds',
      component: () => import('@/views/Admin/Payment/RefundsPage.vue'),
      meta: { requiresAuth: true, title: 'Remboursements', roles: ['superadmin', 'admin'] }
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: () => import('@/views/Admin/Payment/InvoicesPage.vue'),
      meta: { requiresAuth: true, title: 'Factures', roles: ['superadmin', 'admin', 'manager'] }
    },
    {
      path: '/integrations',
      name: 'integrations',
      component: () => import('@/views/Admin/Payment/IntegrationsPage.vue'),
      meta: { requiresAuth: true, title: 'Intégrations', roles: ['superadmin', 'admin'] }
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/Admin/Order/OrdersPage.vue'),
      meta: { requiresAuth: true, title: 'Commandes', roles: ['superadmin', 'admin'] }
    },
    {
      path: '/customer/:customerId/orders',
      name: 'order-lists',
      component: () => import('@/views/Admin/User/Order/CustomerOrdersPage.vue'),
      meta: { requiresAuth: true, title: 'Commandes Client', roles: ['superadmin', 'admin'] }
    },
    {
      path: '/customer/:customerId/order/:orderId',
      name: 'order-details',
      component: () => import('@/views/Admin/User/Order/CustomerOrderDetailsPage.vue'),
      meta: { requiresAuth: true, title: 'Commande Client', roles: ['superadmin', 'admin'] }
    },

    // 🔐 Routes admin only
    {
      path: '/users',
      name: 'user-management',
      component: () => import('@/views/Admin/Users.vue'),
      meta: { requiresAuth: true, title: 'Gestion utilisateurs', roles: ['superadmin', 'admin'] }
    },

    // ⚠️ Routes d’erreur
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('@/views/Errors/Forbidden.vue'),
      meta: { title: 'Accès refusé' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/Errors/FourZeroFour.vue'),
      meta: { title: 'Page introuvable' }
    }
  ]
})

// Global auth guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth as boolean
  const allowedRoles = to.meta.roles as string[] || []
  const isPublicRoute = !requiresAuth

  // Définir le titre de la page
  const setPageTitle = (title: string) => {
    document.title = `${title} | Bylin`
  }

  // 1. Check public routes
  if (isPublicRoute) {
    setPageTitle(to.meta.title as string)
    return next()
  }

  // 2. Check authentication
  if (!authStore.isAuthenticated) {
    try {
      await authStore.fetchUser()

      // Si toujours pas authentifié après fetch
      if (!authStore.isAuthenticated) {
        return next({
          name: 'login',
          query: { redirect: to.fullPath },
          replace: true
        })
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error)
      return next({
        name: 'login',
        query: { redirect: to.fullPath },
        replace: true
      })
    }
  }

  // 3. Empêcher l'accès aux routes d'authentification lorsque déjà authentifié
  const authRouteNames = ['login', 'register', 'forgot-password']
  if (authRouteNames.includes(to.name as string) && authStore.isAuthenticated) {
    return next('/')
  }

  // 4. Check roles si nécessaire
  if (allowedRoles.length > 0) {
    const userRoles = authStore.roles || []
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role))

    if (!hasRequiredRole) {
      console.warn(`Accès refusé. Rôles requis: ${allowedRoles.join(', ')}. Rôles utilisateur: ${userRoles.join(', ')}`)
      setPageTitle('Accès refusé')
      return next('/forbidden')
    }
  }

  // 5. Navigation autorisée
  setPageTitle(to.meta.title as string)
  next()
})

// Gestion des erreurs de navigation
router.onError((error) => {
  console.error('Erreur de navigation:', error)

  // Ignorer les erreurs de navigation dupliquée
  if (error.name === 'NavigationDuplicated') {
    return
  }

  // Rediriger vers la page 404 pour les autres erreurs
  router.push('/not-found')
})

export default router
