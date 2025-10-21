import { defineStore } from 'pinia'
import api from '@/api/axiosConfig'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null
  }),

  getters: {
    getOrderById: (state) => (id) => {
      return state.orders.find(order => order.id === id)
    },

    getOrdersByStatus: (state) => (status) => {
      return state.orders.filter(order => order.status === status)
    },

    totalOrdersValue: (state) => {
      return state.orders.reduce((total, order) => total + (order.total || 0), 0)
    }
  },

  actions: {
    /**
     * Récupérer les commandes d'un client
     */
    async getCustomerOrders(customerId, params = {}) {
      try {
        this.loading = true
        this.error = null

        const response = await api.get(`/api/admin/customers/${customerId}/orders`, {
          params: {
            page: params.page || 1,
            per_page: params.per_page || 15,
            search: params.search || '',
            status: params.status || '',
            period: params.period || ''
          }
        })
        console.log(response)

        // Mettre à jour le state si c'est la première page
        if (params.page === 1 || !params.page) {
          this.orders = response.data
        }

        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des commandes'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Récupérer toutes les commandes
     */
    async fetchOrders(params = {}) {
      try {
        this.loading = true
        this.error = null

        const response = await api.get(`/api/admin/orders`, {
          params: {
            page: params.page || 1,
            per_page: params.per_page || 15,
            search: params.search || '',
            status: params.status || '',
            period: params.period || ''
          }
        })
        console.log(response)

        // Mettre à jour le state si c'est la première page
        if (params.page === 1 || !params.page) {
          this.orders = response.data
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des commandes'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Récupérer les détails d'une commande
     */
    async getOrder(orderId) {
      try {
        this.loading = true
        this.error = null

        const response = await api.get(`/api/admin/customers/orders/${orderId}`)
        console.log(response)
        this.currentOrder = response

        // Mettre à jour dans la liste si elle existe
        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          this.orders[index] = response
        }

        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement de la commande'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Mettre à jour le statut d'une commande
     */
    async updateOrderStatus(orderId, status, additional = {}) {
      try {
        const response = await api.patch(`/orders/${orderId}/status`, {
          status,
          ...additional
        })

        // Mettre à jour dans le state
        if (this.currentOrder && this.currentOrder.id === orderId) {
          this.currentOrder.status = status
        }

        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          this.orders[index].status = status
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la mise à jour du statut'
        throw error
      }
    },

    /**
     * Annuler une commande
     */
    async cancelOrder(orderId, data) {
      try {
        const response = await api.post(`/api/admin/orders/${orderId}/cancel`, data)

        // Mettre à jour dans le state
        if (this.currentOrder && this.currentOrder.id === orderId) {
          this.currentOrder.status = 'cancelled'
          this.currentOrder.cancellation_reason = data.reason
        }

        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          this.orders[index].status = 'cancelled'
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'annulation de la commande'
        throw error
      }
    },

    /**
     * Rembourser une commande
     */
    async refundOrder(orderId, data) {
      try {
        const response = await api.post(`/api/admin/orders/${orderId}/refund`, data)

        // Mettre à jour dans le state
        if (this.currentOrder && this.currentOrder.id === orderId) {
          this.currentOrder.status = 'refunded'
          this.currentOrder.refund_amount = data.amount
          this.currentOrder.refund_reason = data.reason
        }

        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          this.orders[index].status = 'refunded'
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du remboursement'
        throw error
      }
    },

    /**
     * Dupliquer une commande
     */
    async duplicateOrder(orderId) {
      try {
        const response = await api.post(`/api/admin/orders/${orderId}/duplicate`)

        // Ajouter la nouvelle commande au début de la liste
        if (response.data) {
          this.orders.unshift(response.data)
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la duplication'
        throw error
      }
    },

    /**
     * Télécharger la facture d'une commande
     */
    async downloadInvoice(orderId, format = 'pdf') {
      try {
        const response = await api.get(`/api/admin/orders/${orderId}/invoice`, {
          params: { format },
          responseType: 'blob'
        })

        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `facture-${orderId}.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du téléchargement'
        throw error
      }
    },

    /**
     * Exporter les commandes d'un client
     */
    async exportCustomerOrders(customerId, params = {}) {
      try {
        const response = await api.get(`/api/admin/customers/${customerId}/orders/export`, {
          params: {
            search: params.search || '',
            status: params.status || '',
            period: params.period || '',
            format: params.format || 'xlsx'
          },
          responseType: 'blob'
        })

        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `commandes-client-${customerId}-${new Date().toISOString().split('T')[0]}.${params.format || 'xlsx'}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'export'
        throw error
      }
    },

    /**
     * Mettre à jour une commande
     */
    async updateOrder(orderId, data) {
      try {
        const response = await api.put(`/api/admin/orders/${orderId}`, data)

        // Mettre à jour dans le state
        if (this.currentOrder && this.currentOrder.id === orderId) {
          Object.assign(this.currentOrder, response.data)
        }

        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          Object.assign(this.orders[index], response.data)
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la mise à jour'
        throw error
      }
    },

    /**
     * Ajouter une note à une commande
     */
    async addOrderNote(orderId, note) {
      try {
        const response = await api.post(`/api/admin/orders/${orderId}/notes`, {
          note,
          type: 'internal' // ou 'customer'
        })

        // Mettre à jour dans le state
        if (this.currentOrder && this.currentOrder.id === orderId) {
          if (!this.currentOrder.notes) {
            this.currentOrder.notes = []
          }
          this.currentOrder.notes.push(response.data)
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'ajout de la note'
        throw error
      }
    },

    /**
     * Mettre à jour l'adresse de livraison
     */
    async updateShippingAddress(orderId, address) {
      try {
        const response = await api.put(`/api/admin/orders/${orderId}/shipping-address`, address)

        // Mettre à jour dans le state
        if (this.currentOrder && this.currentOrder.id === orderId) {
          this.currentOrder.shipping_address = response.data
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la mise à jour de l\'adresse'
        throw error
      }
    },

    /**
     * Ajouter/mettre à jour le numéro de suivi
     */
    async updateTrackingNumber(orderId, trackingNumber, carrier = null) {
      try {
        const response = await api.put(`/api/admin/orders/${orderId}/tracking`, {
          tracking_number: trackingNumber,
          carrier
        })

        // Mettre à jour dans le state
        if (this.currentOrder && this.currentOrder.id === orderId) {
          this.currentOrder.tracking_number = trackingNumber
          if (carrier) {
            this.currentOrder.carrier = carrier
          }
        }

        const index = this.orders.findIndex(order => order.id === orderId)
        if (index !== -1) {
          this.orders[index].tracking_number = trackingNumber
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la mise à jour du suivi'
        throw error
      }
    },

    /**
     * Envoyer une notification au client
     */
    async sendOrderNotification(orderId, type, customMessage = null) {
      try {
        const response = await api.post(`/api/admin/orders/${orderId}/notify`, {
          type, // 'status_update', 'shipped', 'delivered', 'custom'
          message: customMessage
        })

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de l\'envoi de la notification'
        throw error
      }
    },

    /**
     * Récupérer l'historique d'une commande
     */
    async getOrderHistory(orderId) {
      try {
        const response = await api.get(`/api/admin/orders/${orderId}/history`)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement de l\'historique'
        throw error
      }
    },

    /**
     * Supprimer une commande (soft delete)
     */
    async deleteOrder(orderId) {
      try {
        const response = await api.delete(`/api/admin/orders/${orderId}`)

        // Retirer de la liste locale
        this.orders = this.orders.filter(order => order.id !== orderId)

        if (this.currentOrder && this.currentOrder.id === orderId) {
          this.currentOrder = null
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la suppression'
        throw error
      }
    },

    /**
     * Réinitialiser l'état d'erreur
     */
    clearError() {
      this.error = null
    },

    /**
     * Réinitialiser la commande actuelle
     */
    clearCurrentOrder() {
      this.currentOrder = null
    },

    /**
     * Réinitialiser toutes les commandes
     */
    clearOrders() {
      this.orders = []
      this.currentOrder = null
      this.error = null
    }
  }
})
