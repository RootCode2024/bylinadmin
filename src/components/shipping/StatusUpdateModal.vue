<template>
  <Modal 
    :show="show" 
    @close="$emit('close')" 
    size="lg"
    icon="clipboard"
    icon-color="blue"
  >
    <!-- Header content -->
    <template #header>
      <div class="text-center">
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Mettre à jour le statut
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Expédition: {{ shipment?.tracking_number }}
        </p>
      </div>
    </template>

    <!-- Main content -->
    <form @submit.prevent="updateStatus" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nouveau statut
        </label>
        <select
          v-model="form.status"
          required
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Sélectionner un statut</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (optionnel)
        </label>
        <textarea
          v-model="form.notes"
          rows="3"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Ajouter des notes sur ce changement de statut..."
        ></textarea>
      </div>

      <div v-if="form.status === 'delivered'" class="space-y-3">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preuve de livraison
        </label>
        <input
          type="file"
          @change="handleFileUpload"
          accept="image/*"
          multiple
          class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
        >
        <p class="text-xs text-gray-500 dark:text-gray-400">Images de la livraison (signature, photo, etc.)</p>
      </div>
    </form>

    <!-- Footer content -->
    <template #footer>
      <div class="grid grid-flow-row-dense grid-cols-2 gap-3">
        <button
          type="button"
          @click="$emit('close')"
          class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          type="submit"
          @click="updateStatus"
          :disabled="loading || !form.status"
          class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="animate-spin mr-2">⟳</span>
          Mettre à jour
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { useShipmentsStore } from '@/stores/shippings'

const props = defineProps({
  show: Boolean,
  shipment: Object,
  statusOptions: Array
})

const emit = defineEmits(['close', 'updated'])

const shipmentsStore = useShipmentsStore()
const loading = ref(false)

const form = ref({
  status: '',
  notes: '',
  deliveryProof: []
})

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  form.value.deliveryProof = files
}

const updateStatus = async () => {
  if (!form.value.status) return

  loading.value = true
  try {
    const updatedShipment = await shipmentsStore.updateShipmentStatus(
      props.shipment.id,
      form.value.status,
      form.value.notes,
      form.value.deliveryProof.length > 0 ? form.value.deliveryProof : null
    )
    
    emit('updated', updatedShipment)
    emit('close')
    resetForm()
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    status: '',
    notes: '',
    deliveryProof: []
  }
}

watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
/* Add any custom styles if needed */
</style>