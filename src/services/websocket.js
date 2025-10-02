// services/websocket.js - Version simplifiée pour vraie API
import { useConversationsStore } from '@/stores/conversations'
import { useAuthStore } from '@/stores/auth'

class WebSocketService {
  constructor() {
    this.conversationsStore = null
    this.authStore = null
    this.channels = new Map()
    this.isConnected = false
    this.heartbeatInterval = null
  }

  /**
   * Initialiser la connexion WebSocket
   */
  init() {
    if (typeof window === 'undefined') return

    this.conversationsStore = useConversationsStore()
    this.authStore = useAuthStore()

    this.isConnected = true
    this.setupHeartbeat()

    console.log('WebSocket service initialisé')
  }

  /**
   * Configuration du heartbeat
   */
  setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        console.debug('WebSocket heartbeat')
      }
    }, 60000)
  }

  /**
   * Rejoindre une conversation spécifique
   */
  joinConversation(conversationId) {
    if (!conversationId) return

    const channelName = `conversation.${conversationId}`

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)
    }

    const channel = {
      name: channelName,
      conversationId: conversationId,
      joined: true
    }

    this.channels.set(channelName, channel)
    console.log(`Rejoint le canal: ${channelName}`)

    return channel
  }

  /**
   * Quitter une conversation
   */
  leaveConversation(conversationId) {
    if (!conversationId) return

    const channelName = `conversation.${conversationId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      this.channels.delete(channelName)
      console.log(`Quitté le canal: ${channelName}`)
    }
  }

  /**
   * Envoyer un indicateur de frappe
   */
  sendTypingIndicator(conversationId) {
    if (!conversationId || !this.authStore.user) return
    console.log(`Indicateur de frappe envoyé pour conversation ${conversationId}`)
  }

  /**
   * Rejoindre toutes les conversations de l'utilisateur
   */
  joinUserConversations() {
    if (!this.conversationsStore.conversations) return

    this.conversationsStore.conversations.forEach(conversation => {
      this.joinConversation(conversation.id)
    })
  }

  /**
   * Quitter toutes les conversations
   */
  leaveAllConversations() {
    this.channels.forEach((channel, channelName) => {
      if (channelName.startsWith('conversation.')) {
        console.log(`Quitté le canal: ${channelName}`)
      }
    })
    this.channels.clear()
  }

  /**
   * Jouer le son de notification
   */
  playNotificationSound() {
    try {
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.value = 0.05

        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.1)

        setTimeout(() => {
          audioContext.close()
        }, 200)
      }
    } catch (error) {
      console.debug('Son de notification non disponible')
    }
  }

  /**
   * Demander la permission pour les notifications
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error)
      return false
    }
  }

  /**
   * Afficher une notification
   */
  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        ...options
      })
    }
  }

  /**
   * Déconnecter WebSocket
   */
  disconnect() {
    this.leaveAllConversations()

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    this.isConnected = false
    console.log('WebSocket déconnecté')
  }

  /**
   * Reconnecter WebSocket
   */
  reconnect() {
    this.disconnect()
    setTimeout(() => {
      this.init()
      if (this.conversationsStore.conversations.length > 0) {
        this.joinUserConversations()
      }
    }, 1000)
  }

  /**
   * Vérifier si connecté
   */
  isSocketConnected() {
    return this.isConnected
  }

  /**
   * Obtenir les statistiques de connexion
   */
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      activeChannels: this.channels.size,
      connectionState: this.isConnected ? 'connected' : 'disconnected'
    }
  }
}

// Instance singleton
const websocketService = new WebSocketService()

export default websocketService

// Composable pour utiliser le service dans les composants Vue
export function useWebSocket() {
  return {
    websocketService,
    joinConversation: (id) => websocketService.joinConversation(id),
    leaveConversation: (id) => websocketService.leaveConversation(id),
    sendTypingIndicator: (id) => websocketService.sendTypingIndicator(id),
    requestNotificationPermission: () => websocketService.requestNotificationPermission(),
    isConnected: () => websocketService.isSocketConnected(),
    getStats: () => websocketService.getConnectionStats()
  }
}
