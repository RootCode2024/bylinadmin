<template>
  <Modal 
    :show="show" 
    @close="$emit('close')" 
    size="lg"
    icon="truck"
    icon-color="purple"
  >
    <!-- Header content -->
    <template #header>
      <div class="text-center">
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Assigner un livreur
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Expédition: {{ shipment?.tracking_number }}
        </p>
      </div>
    </template>

    <!-- Main content -->
    <form @submit.prevent="assignDelivery" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sélectionner un livreur
        </label>
        <select
          v-model="form.deliveryId"
          required
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Choisir un livreur</option>
          <option v-for="delivery in deliveries" :key="delivery.id" :value="delivery.id">
            {{ delivery.name }} - {{ delivery.type }} ({{ delivery.rating }}/5)
          </option>
        </select>
      </div>

      <div v-if="form.deliveryId" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
        <div class="text-sm">
          <p class="font-medium text-gray-900 dark:text-white">Informations du livreur:</p>
          <div class="mt-1 space-y-1 text-gray-600 dark:text-gray-400">
            <p>Téléphone: {{ selectedDelivery?.phone }}</p>
            <p>Type: {{ selectedDelivery?.type }}</p>
            <p>Véhicule: {{ selectedDelivery?.vehicle_type }}</p>
            <p>Taux de réussite: {{ selectedDelivery?.success_rate }}%</p>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date de livraison estimée
        </label>
        <input
          v-model="form.estimatedDeliveryAt"
          type="datetime-local"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
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
          @click="assignDelivery"
          :disabled="loading || !form.deliveryId"
          class="inline-flex w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="animate-spin mr-2">⟳</span>
          Assigner
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { useShipmentsStore } from '@/stores/shippings'

const props = defineProps({
  show: Boolean,
  shipment: Object,
  deliveries: Array
})

const emit = defineEmits(['close', 'assigned'])

const shipmentsStore = useShipmentsStore()
const loading = ref(false)

const form = ref({
  deliveryId: '',
  estimatedDeliveryAt: ''
})

const selectedDelivery = computed(() => {
  return props.deliveries.find(d => d.id == form.value.deliveryId)
})

const assignDelivery = async () => {
  if (!form.value.deliveryId) return

  loading.value = true
  try {
    const updatedShipment = await shipmentsStore.assignDelivery(
      props.shipment.id,
      form.value.deliveryId,
      form.value.estimatedDeliveryAt || null
    )
    
    emit('assigned', updatedShipment)
    emit('close')
    resetForm()
  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    deliveryId: '',
    estimatedDeliveryAt: ''
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