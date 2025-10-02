<template>
  <div :class="['loading-spinner', sizeClass, colorClass, { 'mx-auto': center }]">
    <div v-for="i in 12" :key="i" :style="`transform: rotate(${i * 30}deg); animation-delay: ${-1.2 + i * 0.1}s`"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white', 'gray', 'black'].includes(value),
  },
  center: {
    type: Boolean,
    default: true,
  },
});

const sizeClass = computed(() => {
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };
  return sizes[props.size];
});

const colorClass = computed(() => {
  const colors = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-green-600 dark:text-green-400',
    white: 'text-white',
    gray: 'text-gray-400 dark:text-gray-500',
    black: 'text-gray-800 dark:text-gray-200',
  };
  return colors[props.color];
});
</script>

<style scoped>
.loading-spinner {
  position: relative;
  display: inline-block;
}

.loading-spinner div {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.loading-spinner div::before {
  content: '';
  display: block;
  margin: 0 auto;
  width: 15%;
  height: 15%;
  background-color: currentColor;
  border-radius: 100%;
  animation: loading-spinner 1.2s infinite ease-in-out both;
}

@keyframes loading-spinner {
  0%, 39%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}
</style>