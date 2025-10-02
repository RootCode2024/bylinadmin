import { ref, computed } from 'vue'
import { useShippingStore } from '@/stores/shippings'

export function useShippingCalculator() {
  const shippingStore = useShippingStore()
  
  const selectedCountry = ref('')
  const orderAmount = ref(0)
  const calculationResult = ref(null)
  const isCalculating = ref(false)
  const calculationError = ref(null)

  const canCalculate = computed(() => {
    return selectedCountry.value && orderAmount.value > 0
  })

  const calculate = async () => {
    if (!canCalculate.value) return

    isCalculating.value = true
    calculationError.value = null

    try {
      const result = await shippingStore.calculateShipping(selectedCountry.value, orderAmount.value)
      
      if (result.success) {
        calculationResult.value = result.data
      } else {
        calculationError.value = result.error
        calculationResult.value = null
      }
    } catch (error) {
      calculationError.value = 'Erreur lors du calcul des frais de livraison'
      calculationResult.value = null
    } finally {
      isCalculating.value = false
    }
  }

  const reset = () => {
    selectedCountry.value = ''
    orderAmount.value = 0
    calculationResult.value = null
    calculationError.value = null
  }

  return {
    selectedCountry,
    orderAmount,
    calculationResult,
    isCalculating,
    calculationError,
    canCalculate,
    calculate,
    reset
  }
}