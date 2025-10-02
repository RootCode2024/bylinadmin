import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axiosConfig'
import { useAuthStore } from './auth'

export const useDashboardStore = defineStore('dashboard', () => {
  const authStore = useAuthStore()

  // State
  const totalCustomers = ref(null)
  const totalOrders = ref(null)
  const recentOrders = ref(null)
  const returnUrl = ref(null)
  const transactions = ref(null)
  const transactionsRefunds = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Actions

  async function fetchDashboard() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/dashboard-stats', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      console.log("Réponse fetchDashboard :", response);
      const data = response

      totalCustomers.value = data.total_customers || null
      totalOrders.value = data.total_orders || null
      recentOrders.value = data.recent_orders || null
    } catch (err) {
      console.error("Erreur fetchDashboard :", err);
      error.value = "Impossible de charger les données du tableau de bord";
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTransactions() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/transactions', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      console.log("Réponse fetchTransactions :", response);
      const data = response

      transactions.value = data || null

      transactionsRefunds.value = data.filter(tx => tx.status === 'refunded') || null

      // Traitez les données des transactions ici si nécessaire
    } catch (err) {
      console.error("Erreur fetchTransactions :", err);
      error.value = "Impossible de charger les transactions";
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    totalCustomers,
    totalOrders,
    recentOrders,
    transactions,
    transactionsRefunds,
    returnUrl,
    isLoading,
    error,

    // Actions
    fetchDashboard,
    fetchTransactions
  }
})
