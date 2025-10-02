<template>
  <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 sm:px-6">
    <!-- Mobile version -->
    <div class="flex justify-between flex-1 sm:hidden">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        :class="{
          'cursor-not-allowed opacity-50': currentPage === 1,
          'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage > 1
        }"
        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600"
      >
        Précédent
      </button>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        :class="{
          'cursor-not-allowed opacity-50': currentPage === totalPages,
          'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage < totalPages
        }"
        class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600"
      >
        Suivant
      </button>
    </div>

    <!-- Desktop version -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          Affichage de
          <span class="font-medium">{{ from }}</span>
          à
          <span class="font-medium">{{ to }}</span>
          sur
          <span class="font-medium">{{ totalItems }}</span>
          résultats
        </p>
      </div>
      <div>
        <nav class="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="{
              'cursor-not-allowed opacity-50': currentPage === 1,
              'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage > 1
            }"
            class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600"
          >
            <span class="sr-only">Précédent</span>
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Dynamic page numbers -->
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="page === '...'"
              disabled
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600"
            >
              ...
            </button>
            <button
              v-else
              @click="changePage(page)"
              :aria-current="page === currentPage ? 'page' : undefined"
              :class="{
                'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400': page === currentPage,
                'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700': page !== currentPage
              }"
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium border"
            >
              {{ page }}
            </button>
          </template>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="{
              'cursor-not-allowed opacity-50': currentPage === totalPages,
              'hover:bg-gray-50 dark:hover:bg-gray-700': currentPage < totalPages
            }"
            class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600"
          >
            <span class="sr-only">Suivant</span>
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    validator: value => value >= 1
  },
  totalItems: {
    type: Number,
    required: true,
    validator: value => value >= 0
  },
  perPage: {
    type: Number,
    required: true,
    validator: value => value >= 1
  }
})

const emit = defineEmits(['page-changed'])

// Calculated values
const totalPages = computed(() => Math.ceil(props.totalItems / props.perPage))
const from = computed(() => Math.min(props.totalItems, (props.currentPage - 1) * props.perPage + 1))
const to = computed(() => Math.min(props.totalItems, props.currentPage * props.perPage))

// Generate visible page numbers with ellipsis
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5 // Maximum visible page numbers
  const halfVisible = Math.floor(maxVisible / 2)

  // Simple case: less pages than max visible
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
    return pages
  }

  // Complex case: need ellipsis
  let start = Math.max(1, props.currentPage - halfVisible)
  let end = Math.min(totalPages.value, props.currentPage + halfVisible)

  // Adjust if we're at the start or end
  if (props.currentPage <= halfVisible + 1) {
    end = maxVisible
  } else if (props.currentPage >= totalPages.value - halfVisible) {
    start = totalPages.value - maxVisible + 1
  }

  // Always show first page
  if (start > 1) {
    pages.push(1)
    if (start > 2) {
      pages.push('...')
    }
  }

  // Middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Always show last page
  if (end < totalPages.value) {
    if (end < totalPages.value - 1) {
      pages.push('...')
    }
    pages.push(totalPages.value)
  }

  return pages
})

// Change page handler
const changePage = (page) => {
  if (page < 1 || page > totalPages.value || page === props.currentPage) return
  emit('page-changed', page)
}
</script>
