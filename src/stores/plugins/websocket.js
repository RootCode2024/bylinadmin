import websocketService from '@/services/websocket'

export function websocketPlugin({ store }) {
  // Écouter les changements dans le store des conversations
  if (store.$id === 'conversations') {
    // Rejoindre les canaux WebSocket quand les conversations sont chargées
    store.$subscribe((mutation, state) => {
      if (mutation.type === 'direct' && mutation.events?.key === 'conversations') {
        // Rejoindre toutes les conversations chargées
        setTimeout(() => {
          websocketService.joinUserConversations()
        }, 100)
      }

      // Rejoindre le canal quand une conversation est sélectionnée
      if (mutation.type === 'direct' && mutation.events?.key === 'selectedConversation') {
        const conversation = state.selectedConversation
        if (conversation) {
          websocketService.joinConversation(conversation.id)
        }
      }
    })
  }
}
