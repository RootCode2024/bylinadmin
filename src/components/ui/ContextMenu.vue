<template>
  <div 
    v-if="show"
    class="fixed z-50 bg-white shadow-lg rounded-md py-1 w-48 dark:bg-gray-800 dark:border dark:border-gray-700"
    :style="{ top: `${y}px`, left: `${x}px` }"
    @click.stop
  >
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  x: Number,
  y: Number
})

const emit = defineEmits(['close'])

// Fermer le menu quand on clique ailleurs
const handleClickOutside = () => {
  emit('close')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>