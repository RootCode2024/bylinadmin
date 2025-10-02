<template>
  <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white/90">
      {{ title }}
    </h2>
    <nav>
      <ol class="flex items-center gap-1.5">
        <!-- Breadcrumbs dynamiques -->
        <li v-for="(breadcrumb, index) in breadcrumbs" :key="index">
          <div class="flex items-center gap-1.5">
            <!-- Lien si ce n'est pas le dernier élément -->
            <router-link
              v-if="index < breadcrumbs.length - 1"
              :to="breadcrumb.href"
              class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {{ breadcrumb.name }}
              <svg
                class="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </router-link>

            <!-- Texte simple pour le dernier élément -->
            <span
              v-else
              class="text-sm text-gray-800 dark:text-white/90 font-medium"
            >
              {{ breadcrumb.name }}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// Interface des props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
/* Styles pour les transitions au hover */
.transition-colors {
  transition-property: color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Style pour les liens actifs */


/* Responsive pour mobile */
@media (max-width: 640px) {
  .flex-wrap {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .gap-1\.5 {
    gap: 0.25rem;
  }
}
</style>
