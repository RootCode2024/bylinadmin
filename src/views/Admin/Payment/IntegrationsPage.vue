<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntegrationCard
          v-for="integration in availableIntegrations"
          :key="integration.id"
          :integration="integration"
          :connected="isConnected(integration.id)"
          @connect="handleConnect"
        />
      </div>

      <!-- Logs d'intégration -->
      <div class="mt-8">
        <h3 class="text-lg font-medium mb-4">Activité récente</h3>
        <div class="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
          <div v-for="log in integrationLogs" :key="log.id" class="mb-3 last:mb-0 pb-3 border-b last:border-b-0 dark:border-gray-600">
            <div class="flex justify-between">
              <span class="text-sm font-medium">{{ log.action }}</span>
              <span class="text-xs text-gray-500">{{ formatDateTime(log.timestamp) }}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ log.details }}</p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import IntegrationCard from '@/components/integrations/IntegrationCard.vue'

const currentPageTitle = ref("Gestion des Intégrations")

// Données
const availableIntegrations = ref([
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Paiements en ligne sécurisés',
    icon: '💳',
    connected: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Paiements internationaux',
    icon: '🌍',
    connected: false
  },
  // Plus d'intégrations...
])

const integrationLogs = ref([
  {
    id: 1,
    action: 'Synchronisation Stripe',
    details: '15 nouvelles transactions importées',
    timestamp: '2023-06-15T14:30:00',
    status: 'success'
  },
  // Plus de logs...
])

// Méthodes
const isConnected = (id) => {
  const integration = availableIntegrations.value.find(i => i.id === id)
  return integration?.connected || false
}

const handleConnect = (id) => {
  const integration = availableIntegrations.value.find(i => i.id === id)
  if (integration) {
    integration.connected = !integration.connected

    // Ajouter un log
    integrationLogs.value.unshift({
      id: Date.now(),
      action: integration.connected ? `Connecté à ${integration.name}` : `Déconnecté de ${integration.name}`,
      details: integration.connected ? 'Intégration activée avec succès' : 'Intégration désactivée',
      timestamp: new Date().toISOString(),
      status: 'info'
    })
  }
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR')
}
</script>
