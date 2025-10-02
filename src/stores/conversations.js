// stores/conversations.js - Version corrigée avec les erreurs fixées
import { defineStore } from 'pinia'
import api from '@/api/axiosConfig'

export const useConversationsStore = defineStore('conversations', {
  state: () => ({
    conversations: [],
    selectedConversation: null,
    loading: false,
    sendingMessage: false,
    stats: {
      total: 0,
      active: 0,
      archived: 0,
      unread: 0,
      high_priority: 0
    },
    filters: {
      status: 'all',
      search: '',
      priority: null
    },
    unreadCount: 0,
    typingUsers: new Set(),
    onlineUsers: new Set()
  }),

  getters: {
    filteredConversations: (state) => {
      let filtered = [...state.conversations]

      // Filtre par statut
      switch (state.filters.status) {
        case 'unread':
          filtered = filtered.filter(c => c.unread_count > 0)
          break
        case 'archived':
          filtered = filtered.filter(c => c.status === 'archived')
          break
        case 'priority':
          filtered = filtered.filter(c => c.priority === 'high')
          break
        case 'active':
          filtered = filtered.filter(c => c.status === 'active')
          break
      }

      // Filtre par recherche
      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase()
        filtered = filtered.filter(c =>
          c.client.name?.toLowerCase().includes(searchTerm) ||
          c.client.name?.toLowerCase().includes(searchTerm) ||
          c.client.email?.toLowerCase().includes(searchTerm) ||
          c.last_message?.content?.toLowerCase().includes(searchTerm)
        )
      }

      // Trier par dernière activité
      return filtered.sort((a, b) =>
        new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at)
      )
    },

    statusFilters: (state) => [
      { value: 'all', label: 'Toutes', count: state.conversations.length },
      { value: 'unread', label: 'Non lues', count: state.conversations.filter(c => c.unread_count > 0).length }, // Correction de la typo 'unread'
      { value: 'archived', label: 'Archivées', count: state.conversations.filter(c => c.status === 'archived').length },
      { value: 'priority', label: 'Priorité', count: state.conversations.filter(c => c.priority === 'high').length }
    ]
  },

  actions: {
    // Charger toutes les conversations depuis l'API
    async loadConversations() {
      this.loading = true
      try {
        const response = await api.get('/conversations', {
          params: this.filters
        })

        if (response.success) {
          this.conversations = response.data
          this.stats = response.stats || this.stats
        } else {
          // Si pas de données côté serveur, initialiser avec tableau vide
          this.conversations = []
          this.stats = {
            total: 0,
            active: 0,
            archived: 0,
            unread: 0,
            high_priority: 0
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error)

        // En cas d'erreur API, initialiser avec données vides pour éviter les crashes
        this.conversations = []
        this.stats = {
          total: 0,
          active: 0,
          archived: 0,
          unread: 0,
          high_priority: 0
        }

        // Ne pas throw l'erreur pour éviter de casser l'interface
        // throw error
      } finally {
        this.loading = false
      }
    },

    // Créer ou récupérer une conversation avec un client
    async findOrCreateConversation(clientId) {
      this.loading = true
      try {
        const response = await api.post('/conversations/find-or-create', {
          client_id: clientId
        })

        if (response.success) {
          const conversation = response.data

          // Ajouter à la liste si pas déjà présente
          const existingIndex = this.conversations.findIndex(c => c.id === conversation.id)
          if (existingIndex === -1) {
            this.conversations.unshift(conversation)
          } else {
            this.conversations[existingIndex] = conversation
          }

          // Sélectionner la conversation
          this.selectedConversation = conversation

          return conversation
        } else {
          throw new Error('Erreur lors de la création de conversation')
        }
      } catch (error) {
        console.error('Erreur lors de la création de conversation:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Sélectionner une conversation et charger ses messages
    async selectConversation(conversationId) {
      try {
        const response = await api.get(`/conversations/${conversationId}`)

        if (response.success) {
          this.selectedConversation = response.data

          // Mettre à jour dans la liste
          const index = this.conversations.findIndex(c => c.id === conversationId)
          if (index !== -1) {
            this.conversations[index] = {
              ...this.conversations[index],
              unread_count: 0
            }
          }

          return this.selectedConversation
        } else {
          throw new Error('Conversation non trouvée')
        }
      } catch (error) {
        console.error('Erreur lors de la sélection de conversation:', error)
        throw error
      }
    },

    // Envoyer un message via l'API
    async sendMessage(conversationId, content, attachments = []) {
      if (!content.trim() && attachments.length === 0) return

      this.sendingMessage = true
      try {
        const formData = new FormData()
        formData.append('content', content)

        attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file)
        })

        const response = await api.post(`/conversations/${conversationId}/messages`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.success) {
          const message = response.data

          // Ajouter le message à la conversation sélectionnée
          if (this.selectedConversation && this.selectedConversation.id === conversationId) {
            if (!this.selectedConversation.messages) {
              this.selectedConversation.messages = []
            }
            this.selectedConversation.messages.push(message)
            this.selectedConversation.last_message = {
              id: message.id,
              content: message.content,
              created_at: message.created_at,
              sender: message.sender,
              status: message.status
            }
            this.selectedConversation.last_message_at = message.created_at
          }

          // Mettre à jour dans la liste des conversations
          const conversationIndex = this.conversations.findIndex(c => c.id === conversationId)
          if (conversationIndex !== -1) {
            this.conversations[conversationIndex].last_message = {
              id: message.id,
              content: message.content,
              created_at: message.created_at,
              sender: message.sender,
              status: message.status
            }
            this.conversations[conversationIndex].last_message_at = message.created_at

            // Déplacer en haut de la liste
            const [conversation] = this.conversations.splice(conversationIndex, 1)
            this.conversations.unshift(conversation)
          }

          return message
        } else {
          throw new Error('Erreur lors de l\'envoi du message')
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
        throw error
      } finally {
        this.sendingMessage = false
      }
    },

    // Marquer une conversation comme lue
    async markAsRead(conversationId) {
      try {
        const response = await api.patch(`/conversations/${conversationId}/read`)

        if (response.success) {
          const index = this.conversations.findIndex(c => c.id === conversationId)
          if (index !== -1) {
            this.conversations[index].unread_count = 0
          }

          if (this.selectedConversation && this.selectedConversation.id === conversationId) {
            this.selectedConversation.unread_count = 0
          }
        }
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error)
      }
    },

    // Archiver/désarchiver une conversation
    async toggleArchive(conversationId) {
      try {
        const response = await api.patch(`/conversations/${conversationId}/archive`)

        if (response.success) {
          const updatedConversation = response.data
          const index = this.conversations.findIndex(c => c.id === conversationId)

          if (index !== -1) {
            this.conversations[index] = updatedConversation
          }

          if (this.selectedConversation && this.selectedConversation.id === conversationId) {
            this.selectedConversation = updatedConversation

            // Si archivée, fermer la conversation
            if (updatedConversation.status === 'archived') {
              this.selectedConversation = null
            }
          }

          return updatedConversation
        } else {
          throw new Error('Erreur lors de l\'archivage')
        }
      } catch (error) {
        console.error('Erreur lors de l\'archivage:', error)
        throw error
      }
    },

    // Changer la priorité
    async changePriority(conversationId, priority) {
      try {
        const response = await api.patch(`/conversations/${conversationId}/priority`, {
          priority
        })

        if (response.success) {
          const updatedConversation = response.data
          const index = this.conversations.findIndex(c => c.id === conversationId)

          if (index !== -1) {
            this.conversations[index] = updatedConversation
          }

          if (this.selectedConversation && this.selectedConversation.id === conversationId) {
            this.selectedConversation = updatedConversation
          }

          return updatedConversation
        } else {
          throw new Error('Erreur lors du changement de priorité')
        }
      } catch (error) {
        console.error('Erreur lors du changement de priorité:', error)
        throw error
      }
    },

    // Rechercher dans les conversations
    async searchConversations(query) {
      if (!query || query.length < 2) {
        return []
      }

      try {
        const response = await api.get('/conversations/search', {
          params: { query }
        })

        if (response.success) {
          return response.data
        }
        return []
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
        return []
      }
    },

    // Obtenir le nombre de messages non lus
    async getUnreadCount() {
      try {
        const response = await api.get('/conversations/unread-count')

        if (response.success) {
          this.unreadCount = response.data.unread_count
          return this.unreadCount
        }
      } catch (error) {
        console.error('Erreur lors du comptage des non lus:', error)
      }
    },

    // Supprimer une conversation
    async deleteConversation(conversationId) {
      try {
        const response = await api.delete(`/conversations/${conversationId}`)

        if (response.success) {
          // Retirer de la liste
          this.conversations = this.conversations.filter(c => c.id !== conversationId)

          // Fermer si c'était la conversation sélectionnée
          if (this.selectedConversation && this.selectedConversation.id === conversationId) {
            this.selectedConversation = null
          }

          return true
        } else {
          throw new Error('Erreur lors de la suppression')
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        throw error
      }
    },

    // Mettre à jour les filtres et recharger
    updateFilters(newFilters) {
      Object.assign(this.filters, newFilters)
      this.loadConversations()
    },

    // Fermer la conversation sélectionnée
    closeSelectedConversation() {
      this.selectedConversation = null
    },

    // Ajouter un message reçu (pour WebSocket/temps réel)
    addReceivedMessage(message) {
      const conversationId = message.conversation_id

      // Ajouter à la conversation sélectionnée si c'est la bonne
      if (this.selectedConversation && this.selectedConversation.id === conversationId) {
        if (!this.selectedConversation.messages) {
          this.selectedConversation.messages = []
        }
        this.selectedConversation.messages.push(message)
        this.selectedConversation.last_message = {
          id: message.id,
          content: message.content,
          created_at: message.created_at,
          sender: message.sender,
          status: message.status
        }
      }

      // Mettre à jour dans la liste
      const conversationIndex = this.conversations.findIndex(c => c.id === conversationId)
      if (conversationIndex !== -1) {
        this.conversations[conversationIndex].last_message = {
          id: message.id,
          content: message.content,
          created_at: message.created_at,
          sender: message.sender,
          status: message.status
        }
        this.conversations[conversationIndex].last_message_at = message.created_at

        // Incrémenter le compteur si ce n'est pas la conversation active
        if (!this.selectedConversation || this.selectedConversation.id !== conversationId) {
          this.conversations[conversationIndex].unread_count++
        }

        // Déplacer en haut
        const [conversation] = this.conversations.splice(conversationIndex, 1)
        this.conversations.unshift(conversation)
      }
    },

    // Gérer les indicateurs de frappe
    setUserTyping(conversationId, userId, isTyping) {
      const key = `${conversationId}-${userId}`
      if (isTyping) {
        this.typingUsers.add(key)
      } else {
        this.typingUsers.delete(key)
      }
    },

    // Gérer les utilisateurs en ligne
    setUserOnline(userId, isOnline) {
      if (isOnline) {
        this.onlineUsers.add(userId)
      } else {
        this.onlineUsers.delete(userId)
      }

      // Mettre à jour le statut dans les conversations
      this.conversations.forEach(conversation => {
        if (conversation.client.id === userId) {
          conversation.client.is_online = isOnline
          if (!isOnline) {
            conversation.client.last_seen = new Date().toISOString()
          }
        }
      })

      // Mettre à jour dans la conversation sélectionnée
      if (this.selectedConversation && this.selectedConversation.client.id === userId) {
        this.selectedConversation.client.is_online = isOnline
        if (!isOnline) {
          this.selectedConversation.client.last_seen = new Date().toISOString()
        }
      }
    },

    // Réinitialiser le store
    reset() {
      this.conversations = []
      this.selectedConversation = null
      this.loading = false
      this.sendingMessage = false
      this.stats = {
        total: 0,
        active: 0,
        archived: 0,
        unread: 0,
        high_priority: 0
      }
      this.filters = {
        status: 'all',
        search: '',
        priority: null
      }
      this.unreadCount = 0
      this.typingUsers.clear()
      this.onlineUsers.clear()
    }
  }
})
