<template>
  <AdminLayout>
    <PageBreadcrumb
      :title="currentPageTitle"
      :breadcrumbs="breadcrumbs"
    />

    <div class="flex h-[calc(100vh-180px)] bg-white rounded-xl shadow-lg overflow-hidden dark:bg-gray-800">
      <!-- Sidebar des conversations -->
      <div class="w-94 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <!-- Header sidebar -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Messages
            </h2>
            <div class="flex items-center space-x-2">
              <button
                @click="refreshConversations"
                :disabled="conversationsStore.loading"
                class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': conversationsStore.loading }" />
              </button>
              <button
                @click="startNewConversation"
                class="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <PlusIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Barre de recherche -->
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              v-model="searchConversation"
              @input="handleSearch"
              type="text"
              placeholder="Rechercher une conversation..."
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
          </div>
        </div>

        <!-- Filtres -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div class="flex space-x-2">
            <button
              v-for="filter in conversationsStore.statusFilters"
              :key="filter.value"
              @click="selectedFilter = filter.value"
              :class="{
                'bg-blue-600 text-white': selectedFilter === filter.value,
                'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500': selectedFilter !== filter.value
              }"
              class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
            >
              {{ filter.label }}
              <span v-if="filter.count > 0" class="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {{ filter.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Liste des conversations -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="conversationsStore.loading && conversationsStore.conversations.length === 0" class="p-4">
            <div class="animate-pulse space-y-4">
              <div v-for="i in 5" :key="i" class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="conversationsStore.filteredConversations.length === 0" class="p-8 text-center">
            <ChatBubbleLeftRightIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Aucune conversation
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ searchConversation ? 'Aucun résultat trouvé.' : 'Commencez une nouvelle conversation.' }}
            </p>
            <button
              v-if="!searchConversation"
              @click="startNewConversation"
              class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nouveau message
            </button>
          </div>

          <div v-else>
            <div
              v-for="conversation in conversationsStore.filteredConversations"
              :key="conversation.id"
              @click="selectConversation(conversation.id)"
              :class="{
                'bg-blue-50 border-r-2 border-blue-500 dark:bg-blue-900/20': conversationsStore.selectedConversation?.id === conversation.id,
                'hover:bg-gray-50 dark:hover:bg-gray-700': conversationsStore.selectedConversation?.id !== conversation.id
              }"
              class="flex items-center p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors relative"
            >
              <!-- Indicateur de messages non lus -->
              <div v-if="conversation.unread_count > 0" class="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>

              <div class="flex-shrink-0 relative">
                <img
                  v-if="conversation.client.avatar_url"
                  :src="conversation.client.avatar_url"
                  class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  :alt="`Avatar de ${conversation.client.name}`"
                  @error="handleImageError"
                >
                <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                  <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
                </div>
                <!-- Indicateur de statut en ligne -->
                <div
                  v-if="conversation.client.is_online"
                  class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
                ></div>
              </div>

              <div class="ml-3 flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ conversation.client.name }}
                  </p>
                  <div class="flex items-center space-x-2">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatTimeAgo(conversation.last_message?.created_at || conversation.created_at) }}
                    </p>
                    <div v-if="conversation.priority === 'high'" class="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                    <span v-if="conversation.last_message?.sender === 'admin'" class="text-blue-600 dark:text-blue-400">Vous: </span>
                    {{ conversation.last_message?.content || 'Nouvelle conversation' }}
                  </p>
                  <div class="flex items-center space-x-1 ml-2">
                    <span v-if="conversation.unread_count > 0" class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                      {{ conversation.unread_count > 99 ? '99+' : conversation.unread_count }}
                    </span>
                    <span v-if="conversation.status === 'archived'" class="text-gray-400 dark:text-gray-500">
                      <ArchiveBoxIcon class="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Zone de conversation -->
      <div class="flex-1 flex flex-col">
        <div v-if="conversationsStore.selectedConversation" class="flex-1 flex flex-col">
          <!-- En-tête de conversation -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img
                  v-if="conversationsStore.selectedConversation.client.avatar_url"
                  :src="conversationsStore.selectedConversation.client.avatar_url"
                  class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  :alt="`Avatar de ${conversationsStore.selectedConversation.client.name}`"
                  @error="handleImageError"
                >
                <div v-else class="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-center">
                  <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    {{ conversationsStore.selectedConversation.client.name }}
                  </h3>
                  <div class="flex items-center space-x-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ conversationsStore.selectedConversation.client.email }}
                    </p>
                    <span
                      v-if="conversationsStore.selectedConversation.client.is_online"
                      class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900/20 dark:text-green-300"
                    >
                      <div class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                      En ligne
                    </span>
                    <span
                      v-else-if="conversationsStore.selectedConversation.client.last_seen"
                      class="text-xs text-gray-500 dark:text-gray-400"
                    >
                      Vu {{ formatTimeAgo(conversationsStore.selectedConversation.client.last_seen) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <!-- Boutons d'action -->
                <button
                  @click="viewClientProfile"
                  class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Voir le profil client"
                >
                  <UserIcon class="h-5 w-5" />
                </button>
                <button
                  @click="toggleConversationArchive"
                  class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  :title="conversationsStore.selectedConversation.status === 'archived' ? 'Désarchiver' : 'Archiver'"
                >
                  <ArchiveBoxIcon class="h-5 w-5" />
                </button>
                <button
                  @click="closeConversation"
                  class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900" ref="messagesContainer">
            <div
              v-for="message in conversationsStore.selectedConversation.messages"
              :key="message.id"
              :class="{
                'flex justify-end': message.sender === 'admin',
                'flex justify-start': message.sender === 'client'
              }"
            >
              <div
                :class="{
                  'bg-blue-500 text-white': message.sender === 'admin',
                  'bg-white text-gray-900 dark:bg-gray-700 dark:text-white': message.sender === 'client'
                }"
                class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm relative"
              >
                <!-- Contenu du message -->
                <div v-if="message.type === 'text'" class="space-y-2">
                  <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>

                  <!-- Fichiers joints -->
                  <div v-if="message.attachments && message.attachments.length > 0" class="space-y-2">
                    <div
                      v-for="attachment in message.attachments"
                      :key="attachment.id"
                      class="flex items-center space-x-2 p-2 bg-black/10 rounded-lg"
                    >
                      <PaperClipIcon class="h-4 w-4" />
                      <a
                        :href="attachment.url"
                        target="_blank"
                        class="text-sm hover:underline truncate"
                      >
                        {{ attachment.name }}
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Horodatage et statut -->
                <div
                  :class="{
                    'text-blue-100': message.sender === 'admin',
                    'text-gray-500 dark:text-gray-400': message.sender === 'client'
                  }"
                  class="flex items-center justify-between text-xs mt-2"
                >
                  <span>{{ formatTime(message.created_at) }}</span>
                  <div v-if="message.sender === 'admin'" class="flex items-center space-x-1">
                    <CheckIcon v-if="message.status === 'sent'" class="h-3 w-3" />
                    <div v-else-if="message.status === 'delivered'" class="flex space-x-1">
                      <CheckIcon class="h-3 w-3" />
                      <CheckIcon class="h-3 w-3 -ml-1" />
                    </div>
                    <div v-else-if="message.status === 'read'" class="flex space-x-1 text-blue-200">
                      <CheckIcon class="h-3 w-3" />
                      <CheckIcon class="h-3 w-3 -ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Indicateur de frappe -->
            <div v-if="isTyping" class="flex justify-start">
              <div class="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl shadow-sm">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Zone de saisie -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <form @submit.prevent="sendMessage" class="flex items-end space-x-3">
              <!-- Bouton d'upload -->
              <button
                type="button"
                @click="$refs.fileInput.click()"
                class="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <PaperClipIcon class="h-5 w-5" />
              </button>
              <input
                ref="fileInput"
                type="file"
                multiple
                @change="handleFileUpload"
                class="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              >

              <!-- Zone de texte -->
              <div class="flex-1 relative">
                <textarea
                  v-model="newMessage"
                  @keydown.enter.exact.prevent="sendMessage"
                  @keydown.enter.shift.exact="newMessage += '\n'"
                  @input="handleTyping"
                  rows="1"
                  placeholder="Écrivez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32 overflow-y-auto"
                  style="min-height: 44px;"
                ></textarea>

                <!-- Fichiers en cours d'upload -->
                <div v-if="uploadingFiles.length > 0" class="absolute bottom-full left-0 right-0 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-t-lg">
                  <div class="space-y-1">
                    <div v-for="file in uploadingFiles" :key="file.name" class="flex items-center justify-between text-xs">
                      <span class="truncate">{{ file.name }}</span>
                      <button @click="removeUploadingFile(file)" class="text-red-500 hover:text-red-700">
                        <XMarkIcon class="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bouton d'envoi -->
              <button
                type="submit"
                :disabled="(!newMessage.trim() && uploadingFiles.length === 0) || conversationsStore.sendingMessage"
                class="p-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon class="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        <!-- État vide -->
        <div v-else class="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
          <div class="text-center max-w-sm mx-auto p-8">
            <ChatBubbleLeftRightIcon class="mx-auto h-16 w-16 text-gray-400" />
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Aucune conversation sélectionnée
            </h3>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Sélectionnez une conversation existante dans la liste ou créez-en une nouvelle pour commencer à échanger avec vos clients.
            </p>
            <button
              @click="startNewConversation"
              class="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Nouveau message
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour sélectionner un utilisateur -->
    <UserListModal
      :show="showUserListModal"
      :multiple="false"
      title="Sélectionner un client"
      :role-filter="['customer']"
      @close="handleCloseModal"
      @select="handleUserSelection"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { debounce } from 'lodash'
import { useConversationsStore } from '@/stores/conversations'
import { useWebSocket } from '@/services/websocket'
import { useNotifications } from '@/composables/useNotifications'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import UserListModal from '@/components/users/UserListModal.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ArchiveBoxIcon,
  XMarkIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const conversationsStore = useConversationsStore()
const { websocketService, joinConversation, leaveConversation, sendTypingIndicator } = useWebSocket()
const { addNotification } = useNotifications()

// État local
const currentPageTitle = ref("Messagerie")
const searchConversation = ref('')
const newMessage = ref('')
const showUserListModal = ref(false)
const selectedFilter = ref('all')
const isTyping = ref(false)
const uploadingFiles = ref([])
const messagesContainer = ref(null)
const typingTimeout = ref(null)

// Breadcrumbs
const breadcrumbs = computed(() => [
  { name: 'Messagerie', href: '#' }
])

// Méthodes utilitaires (restent les mêmes)
const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Actions principales
const refreshConversations = async () => {
  await conversationsStore.loadConversations()
  // Rejoindre les nouveaux canaux WebSocket
  setTimeout(() => {
    websocketService.joinUserConversations()
  }, 100)
}

const selectConversation = async (id) => {
  try {
    // Quitter l'ancien canal si existe
    if (conversationsStore.selectedConversation) {
      leaveConversation(conversationsStore.selectedConversation.id)
    }

    // Sélectionner la nouvelle conversation
    await conversationsStore.selectConversation(id)

    // Rejoindre le nouveau canal WebSocket
    joinConversation(id)

    scrollToBottom()
  } catch (error) {
    console.error('Erreur lors de la sélection de conversation:', error)
    addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de charger la conversation'
    })
  }
}

const closeConversation = () => {
  // Quitter le canal WebSocket
  if (conversationsStore.selectedConversation) {
    leaveConversation(conversationsStore.selectedConversation.id)
  }
  conversationsStore.closeSelectedConversation()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() && uploadingFiles.value.length === 0) return
  if (!conversationsStore.selectedConversation) return

  const messageContent = newMessage.value.trim()
  const files = [...uploadingFiles.value]

  // Réinitialiser
  newMessage.value = ''
  uploadingFiles.value = []

  // Arrêter l'indicateur de frappe
  clearTypingTimeout()

  try {
    await conversationsStore.sendMessage(
      conversationsStore.selectedConversation.id,
      messageContent,
      files
    )
    scrollToBottom()

    addNotification({
      type: 'success',
      title: 'Message envoyé',
      message: 'Votre message a été envoyé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error)
    // Remettre le message en cas d'erreur
    newMessage.value = messageContent
    uploadingFiles.value = files

    addNotification({
      type: 'error',
      title: 'Erreur d\'envoi',
      message: 'Impossible d\'envoyer le message. Veuillez réessayer.'
    })
  }
}

// Gestion de l'indicateur de frappe avec WebSocket
const handleTyping = debounce(() => {
  if (!conversationsStore.selectedConversation || !newMessage.value.trim()) return

  // Envoyer l'indicateur de frappe via WebSocket
  sendTypingIndicator(conversationsStore.selectedConversation.id)

  // Simuler l'indicateur local (sera remplacé par les vraies données WebSocket)
  isTyping.value = true

  clearTypingTimeout()
  typingTimeout.value = setTimeout(() => {
    isTyping.value = false
  }, 3000)
}, 500)

const clearTypingTimeout = () => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
    typingTimeout.value = null
  }
  isTyping.value = false
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  uploadingFiles.value = [...uploadingFiles.value, ...files]
  event.target.value = ''
}

const removeUploadingFile = (file) => {
  uploadingFiles.value = uploadingFiles.value.filter(f => f !== file)
}

const startNewConversation = () => {
  showUserListModal.value = true
}

const handleCloseModal = () => {
  showUserListModal.value = false
}

const handleUserSelection = async (selectedUsers) => {
  if (selectedUsers.length === 0) {
    showUserListModal.value = false
    return
  }

  const selectedUser = selectedUsers[0]

  try {
    const conversation = await conversationsStore.findOrCreateConversation(selectedUser.id)

    // Rejoindre le canal WebSocket pour la nouvelle conversation
    joinConversation(conversation.id)

    scrollToBottom()
    showUserListModal.value = false

    addNotification({
      type: 'success',
      title: 'Conversation créée',
      message: `Conversation avec ${selectedUser.name} ${selectedUser.name} ouverte`
    })
  } catch (error) {
    console.error('Erreur lors de la création de conversation:', error)
    showUserListModal.value = false

    addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de créer la conversation'
    })
  }
}

const toggleConversationArchive = async () => {
  if (!conversationsStore.selectedConversation) return

  try {
    await conversationsStore.toggleArchive(conversationsStore.selectedConversation.id)

    addNotification({
      type: 'success',
      title: 'Conversation mise à jour',
      message: conversationsStore.selectedConversation.status === 'archived'
        ? 'Conversation archivée'
        : 'Conversation restaurée'
    })
  } catch (error) {
    console.error('Erreur lors de l\'archivage:', error)
    addNotification({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de modifier le statut de la conversation'
    })
  }
}

const viewClientProfile = () => {
  if (conversationsStore.selectedConversation?.client?.id) {
    router.push({
      name: 'customer-details',
      params: { customerId: conversationsStore.selectedConversation.client.id }
    })
  }
}

// Gestion de la recherche
const handleSearch = debounce(() => {
  conversationsStore.updateFilters({ search: searchConversation.value })
}, 300)

// Surveillance des filtres
watch(selectedFilter, (newFilter) => {
  conversationsStore.updateFilters({ status: newFilter })
})

// Surveillance des messages pour auto-scroll
watch(() => conversationsStore.selectedConversation?.messages?.length, () => {
  scrollToBottom()
})

// Gestion des paramètres de route pour ouvrir directement une conversation
const handleRouteParams = async () => {
  const { clientId, conversationId } = route.query

  if (clientId) {
    try {
      const conversation = await conversationsStore.findOrCreateConversation(parseInt(clientId))
      joinConversation(conversation.id)
      router.replace({ query: {} })
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de conversation:', error)
    }
  } else if (conversationId) {
    try {
      await conversationsStore.selectConversation(parseInt(conversationId))
      joinConversation(parseInt(conversationId))
      router.replace({ query: {} })
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de conversation:', error)
    }
  }
}

// Gestion des événements clavier globaux
const handleGlobalKeydown = (event) => {
  // Échapper pour fermer la conversation
  if (event.key === 'Escape' && conversationsStore.selectedConversation) {
    closeConversation()
  }

  // Ctrl/Cmd + Enter pour envoyer rapidement
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    sendMessage()
  }
}

// Lifecycle
onMounted(async () => {
  // Charger les conversations
  await conversationsStore.loadConversations()

  // Gérer les paramètres de route
  await handleRouteParams()

  // Rejoindre les canaux WebSocket pour toutes les conversations
  setTimeout(() => {
    websocketService.joinUserConversations()
  }, 100)

  // Ajouter les écouteurs d'événements globaux
  document.addEventListener('keydown', handleGlobalKeydown)

  // Demander la permission pour les notifications
  websocketService.requestNotificationPermission()
})

onUnmounted(() => {
  // Nettoyer les timeouts
  clearTypingTimeout()

  // Nettoyer les URLs d'objets créées pour les fichiers
  uploadingFiles.value.forEach(file => {
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
  })

  // Quitter tous les canaux WebSocket
  websocketService.leaveAllConversations()

  // Supprimer les écouteurs globaux
  document.removeEventListener('keydown', handleGlobalKeydown)
})

// Surveillance de la connexion WebSocket
watch(() => websocketService.isConnected, (isConnected) => {
  if (!isConnected) {
    addNotification({
      type: 'warning',
      title: 'Connexion perdue',
      message: 'Tentative de reconnexion en cours...',
      persistent: true
    })
  } else {
    addNotification({
      type: 'success',
      title: 'Reconnecté',
      message: 'La connexion temps réel a été rétablie'
    })
  }
})
</script>

<style scoped>
/* Mêmes styles que précédemment */
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s ease-in-out infinite both;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

textarea {
  field-sizing: content;
  resize: none;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.new-message {
  animation: slideInFromBottom 0.3s ease-out;
}

@media (max-width: 768px) {
  .w-94 {
    width: 100%;
    position: absolute;
    z-index: 10;
    height: 100%;
  }

  .flex-1 {
    display: none;
  }

  .conversation-selected .w-94 {
    display: none;
  }

  .conversation-selected .flex-1 {
    display: flex;
  }
}
</style>
