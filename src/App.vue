<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const showConnectionStatus = ref(false)

onMounted(() => {

  // Montrer le statut de connexion en développement
  showConnectionStatus.value = import.meta.env.DEV
})
</script>
