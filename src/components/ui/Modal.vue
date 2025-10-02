<template>
  <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-[99999]">
    <!-- Backdrop -->
    <div
      v-if="fullScreenBackdrop"
      class="fixed inset-0 h-full w-full bg-gray-500/75 dark:bg-gray-900/80 backdrop-blur-[2px]"
      aria-hidden="true"
      @click="$emit('close')"
    ></div>

    <!-- Modal Container - OPTIMISÉ pour votre formulaire -->
    <div class="relative w-full mx-auto p-4 min-h-0" :class="width">
      <!-- Modal Content - Structure flexbox optimisée -->
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh] min-h-0">
        
        <!-- Header (conditionnel) - Fixe en haut -->
        <div
          v-if="$slots.header"
          class="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <slot name="header"></slot>
        </div>

        <!-- Body - Zone de scroll avec padding interne -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <!-- CORRECTION IMPORTANTE: Padding géré ici pour éviter les conflits avec le toggle -->
          <div class="px-6 py-6">
            <slot name="body"></slot>
            <slot></slot> <!-- Slot par défaut si body n'est pas utilisé -->
          </div>
        </div>

        <!-- Footer (conditionnel) - Fixe en bas -->
        <div
          v-if="$slots.footer"
          class="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
        >
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ModalProps {
  fullScreenBackdrop?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  width?: string;
}

withDefaults(defineProps<ModalProps>(), {
  fullScreenBackdrop: true,
  showHeader: true,
  showFooter: true,
  width: 'max-w-[95%] md:max-w-[80%] lg:max-w-[60%] xl:max-w-[50%]',
});

defineEmits(['close']);
</script>