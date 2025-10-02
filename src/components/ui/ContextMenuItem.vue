<template>
  <button
    @click="$emit('click')"
    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>
