<template>
  <Modal v-if="show" @close="closeModal" size="lg" :fullScreenBackdrop="true">
    <template #header>
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">
        Nouveau message
      </h2>
    </template>

    <template #body>
      <div class="no-scrollbar relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900 lg:p-10">
      <form @submit.prevent="sendMessage" class="space-y-6">
        <!-- Destinataire -->
        <div>
          <label for="recipient" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Destinataire <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              id="recipient"
              v-model="recipientSearch"
              type="text"
              @input="searchRecipients"
              placeholder="Rechercher un client..."
              class="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            >
            <ul v-if="filteredRecipients.length > 0 && recipientSearch"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 max-h-60 overflow-auto">
              <li v-for="recipient in filteredRecipients"
                  :key="recipient.id"
                  @click="selectRecipient(recipient)"
                  class="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <img :src="recipient.avatar_url || '/images/default-avatar.png'"
                     class="w-8 h-8 rounded-full mr-3"
                     alt="">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ recipient.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ recipient.email }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div v-if="selectedRecipient" class="flex items-center mt-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
            <img :src="selectedRecipient.avatar_url || '/images/default-avatar.png'"
                 class="w-10 h-10 rounded-full mr-3"
                 alt="">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ selectedRecipient.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ selectedRecipient.email }}
              </p>
            </div>
            <button type="button"
                    @click="removeRecipient"
                    class="ml-auto p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Sujet -->
        <div>
          <label for="subject" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Sujet
          </label>
          <input
            id="subject"
            v-model="form.subject"
            type="text"
            placeholder="Objet du message..."
            class="w-full p-2.5 border rounded-lg"
          >
        </div>

        <!-- Message -->
        <div>
          <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Message <span class="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            v-model="form.message"
            rows="6"
            placeholder="Écrivez votre message ici..."
            class="w-full p-2.5 border rounded-lg"
            required
          ></textarea>
        </div>

        <!-- Pièces jointes -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Pièces jointes
          </label>
          <div class="flex items-center justify-center w-full">
            <label for="attachments"
                   class="flex flex-col items-center justify-center w-full p-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
              <div class="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  PDF, DOC, JPG, PNG (max. 5MB)
                </p>
              </div>
              <input id="attachments" type="file" class="hidden" multiple @change="handleFileUpload">
            </label>
          </div>
          <div v-if="attachments.length > 0" class="mt-3 space-y-2">
            <div v-for="(file, index) in attachments" :key="index" class="flex items-center p-2 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div class="flex-1 truncate">
                <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                  {{ file.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(file.size) }}
                </p>
              </div>
              <button type="button"
                      @click="removeAttachment(index)"
                      class="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            :disabled="isSending || !canSend"
          >
            <span v-if="isSending" class="flex items-center">
              <svg class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi...
            </span>
            <span v-else>Envoyer</span>
          </button>
        </div>
      </form>
    </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'

const props = defineProps({
  show: Boolean,
  clients: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'send'])

// Form data
const form = ref({
  recipient: null,
  subject: '',
  message: ''
})

// Recipient search
const recipientSearch = ref('')
const selectedRecipient = ref(null)
const filteredRecipients = ref([])

// Attachments
const attachments = ref([])

// State
const isSending = ref(false)

// Computed
const canSend = computed(() => {
  return selectedRecipient.value && form.value.message.trim().length > 0
})

// Methods
const searchRecipients = () => {
  if (!recipientSearch.value) {
    filteredRecipients.value = []
    return
  }

  const searchTerm = recipientSearch.value.toLowerCase()
  filteredRecipients.value = props.clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm)
  ).slice(0, 5) // Limit to 5 results
}

const selectRecipient = (recipient) => {
  selectedRecipient.value = recipient
  recipientSearch.value = ''
  filteredRecipients.value = []
}

const removeRecipient = () => {
  selectedRecipient.value = null
  recipientSearch.value = ''
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  const validFiles = files.filter(file => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const isValidType = validTypes.includes(file.type)
    const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB

    if (!isValidType) {
      alert(`Le type de fichier ${file.name} n'est pas supporté`)
      return false
    }

    if (!isValidSize) {
      alert(`Le fichier ${file.name} dépasse la taille maximale de 5MB`)
      return false
    }

    return true
  })

  attachments.value = [...attachments.value, ...validFiles]
  event.target.value = '' // Reset input
}

const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const sendMessage = async () => {
  if (!canSend.value) return

  try {
    isSending.value = true

    const messageData = {
      recipient: selectedRecipient.value,
      subject: form.value.subject,
      message: form.value.message,
      attachments: attachments.value
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('send', messageData)
    closeModal()
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    isSending.value = false
  }
}

const resetForm = () => {
  form.value = {
    recipient: null,
    subject: '',
    message: ''
  }
  selectedRecipient.value = null
  recipientSearch.value = ''
  filteredRecipients.value = []
  attachments.value = []
  isSending.value = false
}
</script>
