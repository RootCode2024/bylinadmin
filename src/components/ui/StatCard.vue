<template>
  <div class="p-4 bg-white rounded-lg shadow dark:bg-gray-800 border-l-4"
       :class="[trendPositive ? 'border-green-500' : 'border-red-500']">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
          {{ title }}
        </p>
        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
          {{ value }}
        </p>
      </div>
      <div class="bg-blue-100 p-3 rounded-full border dark:bg-blue-900/30">
        <span class="text-xl">
          <ShoppingBag v-if="icon === 'ShoppingBag'" />
          <Handshake v-if="icon === 'Handshake'" />
          <Truck v-if="icon === 'Truck'" />
          <Circle v-if="icon === 'Circle'" />
          <Percent v-if="icon === 'Percent'" />
          <PackageOpen v-if="icon === 'PackageOpen'" />
        </span>
      </div>
    </div>
    <div v-if="trend" class="mt-2 flex items-center">
      <span :class="[trendPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']">
        {{ trendPositive ? '↑' : '↓' }} {{ trend }}
      </span>
      <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
        vs période précédente
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    default: "Circle"
  },
  trend: {
    type: String,
    default: ''
  },
  trendPositive: {
    type: Boolean,
    default: false
  }
})


import { ShoppingBag, PackageOpen, Handshake, Truck, Circle, Percent } from 'lucide-vue-next';
</script>
