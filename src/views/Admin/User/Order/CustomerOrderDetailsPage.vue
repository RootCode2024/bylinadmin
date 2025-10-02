<template>
  <AdminLayout>
    <PageBreadcrumb
      :title="pageTitle"
      :breadcrumbs="breadcrumbs"
    />

    <!-- En-tête de la commande -->
    <div class="bg-white rounded-lg shadow mb-6 dark:bg-gray-800">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="goBack"
              class="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowLeftIcon class="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Commande #{{ order?.order_number }}
              </h1>
              <div class="flex items-center space-x-4 mt-1">
                <p class="text-gray-600 dark:text-gray-400">
                  {{ formatDate(order?.created_at) }}
                </p>
                <span v-if="order" :class="getOrderStatusClass(order.status)" class="px-3 py-1 text-sm font-semibold rounded-full">
                  {{ getOrderStatusLabel(order.status) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="canEditOrder"
              @click="editOrder"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Modifier
            </button>
            <div class="relative">
              <button
                @click="showActionsMenu = !showActionsMenu"
                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
              >
                Actions
                <ChevronDownIcon class="h-4 w-4 ml-2" />
              </button>
              <div
                v-if="showActionsMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600"
              >
                <div class="py-1">
                  <button
                    @click="printOrder"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Imprimer la facture
                  </button>
                  <button
                    @click="downloadInvoice"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Télécharger PDF
                  </button>
                  <button
                    @click="duplicateOrder"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Dupliquer la commande
                  </button>
                  <button
                    v-if="canRefund"
                    @click="initiateRefund"
                    class="block w-full text-left px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Rembourser
                  </button>
                  <button
                    v-if="canCancel"
                    @click="confirmCancelOrder"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Annuler la commande
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 dark:bg-red-900/20 dark:border-red-800">
      <div class="flex">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-3 mt-0.5" />
        <div class="text-red-700 dark:text-red-400">
          <p class="font-medium">Erreur</p>
          <p class="text-sm mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">Chargement des détails...</span>
    </div>

    <!-- Contenu principal -->
    <div v-if="!loading && order" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="xl:col-span-2 space-y-6">

        <!-- Informations client -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Informations client</h2>
          </div>
          <div class="p-6">
            <div class="flex items-center space-x-4">
              <img
                v-if="order.user?.avatar_url"
                class="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                :src="order.user?.avatar_url"
                :alt="`Avatar de ${order.user?.name}`"
                @error="handleImageError"
              >
              <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ order.user?.name }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400">{{ order.user?.email }}</p>
                <p class="text-gray-600 dark:text-gray-400">{{ order.user?.phone }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500 dark:text-gray-400">Client depuis</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(order.user?.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Articles de la commande -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              Articles ({{ order.items?.length || 0 }})
            </h2>
          </div>
          <div class="p-6">
            <div v-if="order.items && order.items.length > 0" class="space-y-4">
              <div v-for="item in order.items" :key="item.id" class="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <img
                  v-if="item.product?.image_url"
                  class="h-16 w-16 rounded-lg object-cover"
                  :src="item.product?.image_url"
                  :alt="item.product?.name"
                  @error="handleProductImageError"
                >
                <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                  <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ item.product?.name }}
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    SKU: {{ item.product?.sku }}
                  </p>
                  <div v-if="item.variant" class="text-sm text-gray-600 dark:text-gray-400">
                    Variante: {{ item.variant }}
                  </div>
                </div>
                <div class="text-center">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Quantité</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ item.quantity }}</p>
                </div>
                <div class="text-center">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Prix unitaire</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency(item.unit_price) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency(item.total_price) }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <ShoppingBagIcon class="mx-auto h-12 w-12 text-gray-400" />
              <p class="mt-2 text-gray-500 dark:text-gray-400">Aucun article dans cette commande</p>
            </div>
          </div>
        </div>

        <!-- Adresses -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Adresse de facturation -->
          <div class="bg-white rounded-lg shadow dark:bg-gray-800">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Adresse de facturation</h3>
            </div>
            <div class="p-6">
              <div v-if="order.billing_address" class="space-y-2">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ order.billing_address.street_line }}
                </p>
                <p v-if="order.billing_address.landmark" class="text-gray-600 dark:text-gray-400 italic">
                  {{ order.billing_address.landmark }}
                </p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ order.billing_address.city }}
                </p>
                <p v-if="order.billing_address.postal_code" class="text-gray-600 dark:text-gray-400">
                  {{ order.billing_address.postal_code }}
                </p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ getCountryName(order.billing_address.country_code) }}
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ order.billing_address.phone }}
                </p>
              </div>
              <p v-else class="text-gray-500 dark:text-gray-400">Aucune adresse de facturation</p>
            </div>
          </div>

          <!-- Adresse de livraison -->
          <div class="bg-white rounded-lg shadow dark:bg-gray-800">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Adresse de livraison</h3>
            </div>
            <div class="p-6">
              <div v-if="order.shipping_address" class="space-y-2">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ order.shipping_address.street_line }}
                </p>
                <p v-if="order.shipping_address.landmark" class="text-gray-600 dark:text-gray-400 italic">
                  {{ order.shipping_address.landmark }}
                </p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ order.shipping_address.city }}
                </p>
                <p v-if="order.shipping_address.postal_code" class="text-gray-600 dark:text-gray-400">
                  {{ order.shipping_address.postal_code }}
                </p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ getCountryName(order.shipping_address.country_code) }}
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ order.shipping_address.phone }}
                </p>
              </div>
              <p v-else class="text-gray-500 dark:text-gray-400">Aucune adresse de livraison</p>
            </div>
          </div>
        </div>

        <!-- Notes et commentaires -->
        <div v-if="order.notes || order.customer_notes" class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Notes</h3>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="order.customer_notes">
              <h4 class="font-medium text-gray-900 dark:text-white mb-2">Notes du client</h4>
              <p class="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {{ order.customer_notes }}
              </p>
            </div>
            <div v-if="order.notes">
              <h4 class="font-medium text-gray-900 dark:text-white mb-2">Notes internes</h4>
              <p class="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {{ order.notes }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar droite -->
      <div class="space-y-6">

        <!-- Résumé de la commande -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Résumé</h3>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Sous-total</span>
                <span class="text-gray-900 dark:text-white">{{ formatCurrency(order.subtotal) }}</span>
              </div>
              <div v-if="order.tax_amount > 0" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Taxes</span>
                <span class="text-gray-900 dark:text-white">{{ formatCurrency(order.tax_amount) }}</span>
              </div>
              <div v-if="order.shipping_amount > 0" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Livraison</span>
                <span class="text-gray-900 dark:text-white">{{ formatCurrency(order.shipping_amount) }}</span>
              </div>
              <div v-if="order.discount_amount > 0" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Remise</span>
                <span class="text-green-600 dark:text-green-400">-{{ formatCurrency(order.discount_amount) }}</span>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div class="flex justify-between">
                  <span class="text-lg font-medium text-gray-900 dark:text-white">Total</span>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatCurrency(order.total) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statut et suivi -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Statut et suivi</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut actuel
                </label>
                <span :class="getOrderStatusClass(order.status)" class="px-3 py-2 text-sm font-semibold rounded-full">
                  {{ getOrderStatusLabel(order.status) }}
                </span>
              </div>

              <div v-if="order.tracking_number">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro de suivi
                </label>
                <div class="flex items-center space-x-2">
                  <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                    {{ order.tracking_number }}
                  </code>
                  <button
                    @click="copyTrackingNumber"
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div v-if="order.delivery_date">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de livraison prévue
                </label>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(order.delivery_date) }}
                </p>
              </div>

              <div v-if="canUpdateStatus">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Changer le statut
                </label>
                <select
                  v-model="newStatus"
                  @change="updateOrderStatus"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="">Sélectionner un statut</option>
                  <option v-for="status in availableStatuses" :key="status.value" :value="status.value">
                    {{ status.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations système -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Informations système</h3>
          </div>
          <div class="p-6 space-y-3">
            <div>
              <span class="text-sm text-gray-500 dark:text-gray-400">ID de commande:</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white ml-2">{{ order.id }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-500 dark:text-gray-400">Créée le:</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white ml-2">
                {{ formatDateTime(order.created_at) }}
              </span>
            </div>
            <div>
              <span class="text-sm text-gray-500 dark:text-gray-400">Mise à jour:</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white ml-2">
                {{ formatDateTime(order.updated_at) }}
              </span>
            </div>
            <div v-if="order.payment_method">
              <span class="text-sm text-gray-500 dark:text-gray-400">Paiement:</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white ml-2">
                {{ order.payment_method }}
              </span>
            </div>
            <div v-if="order.shipping_method">
              <span class="text-sm text-gray-500 dark:text-gray-400">Livraison:</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white ml-2">
                {{ order.shipping_method }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Actions rapides</h3>
          </div>
          <div class="p-6 space-y-3">
            <button
              @click="sendOrderUpdate"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Envoyer une mise à jour au client
            </button>
            <button
              @click="viewCustomer"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Voir le profil client
            </button>
            <button
              @click="viewAllOrders"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Voir toutes les commandes du client
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'annulation -->
    <Modal v-if="showCancelModal" @close="showCancelModal = false">
      <template #header>
        <div class="flex items-center">
          <div class="flex-shrink-0 h-8 w-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
            <ExclamationTriangleIcon class="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Annuler la commande
          </h2>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.
          </p>
          <div>
            <label for="cancellation_reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Raison de l'annulation *
            </label>
            <textarea
              id="cancellation_reason"
              v-model="cancellationReason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              placeholder="Expliquez la raison de l'annulation..."
            ></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="showCancelModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              @click="confirmOrderCancellation"
              :disabled="!cancellationReason.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer l'annulation
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Modal de remboursement -->
    <Modal v-if="showRefundModal" @close="showRefundModal = false">
      <template #header>
        <div class="flex items-center">
          <div class="flex-shrink-0 h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3">
            <CurrencyDollarIcon class="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Rembourser la commande
          </h2>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-300">
            Montant total de la commande: {{ formatCurrency(order?.total) }}
          </p>
          <div>
            <label for="refund_amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Montant à rembourser *
            </label>
            <input
              id="refund_amount"
              v-model.number="refundAmount"
              type="number"
              :max="order?.total"
              min="0"
              step="1"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
              placeholder="Montant en FCFA"
            />
          </div>
          <div>
            <label for="refund_reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Raison du remboursement *
            </label>
            <textarea
              id="refund_reason"
              v-model="refundReason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
              placeholder="Expliquez la raison du remboursement..."
            ></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="showRefundModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              @click="confirmRefund"
              :disabled="!refundAmount || !refundReason.trim() || refundAmount > order?.total"
              class="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer le remboursement
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Modal from '@/components/ui/Modal.vue'
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  ClipboardIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'
import { useOrdersStore } from '@/stores/orders'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

// État local
const loading = ref(true)
const error = ref('')
const order = ref(null)
const showActionsMenu = ref(false)
const showCancelModal = ref(false)
const showRefundModal = ref(false)
const cancellationReason = ref('')
const refundAmount = ref(0)
const refundReason = ref('')
const newStatus = ref('')

// Computed
const pageTitle = computed(() => {
  return order.value ? `Commande #${order.value.order_number}` : 'Détails de la commande'
})

const breadcrumbs = computed(() => [
  { name: 'Accueil', href: '/' },
  { name: 'Clients', href: '/customers' },
  { name: order.value?.user?.name || 'Client', href: `/customers/${route.params.customerId}` },
  { name: 'Commandes', href: `/customer/${route.params.customerId}/orders` },
  { name: `#${order.value?.order_number || 'Commande'}`, href: '#' }
])

const canEditOrder = computed(() => {
  return order.value && ['pending', 'processing'].includes(order.value.status)
})

const canCancel = computed(() => {
  return order.value && ['pending', 'processing'].includes(order.value.status)
})

const canRefund = computed(() => {
  return order.value && ['delivered', 'shipped'].includes(order.value.status)
})

const canUpdateStatus = computed(() => {
  return order.value && !['cancelled', 'refunded'].includes(order.value.status)
})

const availableStatuses = computed(() => {
  if (!order.value) return []

  const current = order.value.status
  const statuses = []

  switch (current) {
    case 'pending':
      statuses.push(
        { value: 'processing', label: 'En traitement' },
        { value: 'cancelled', label: 'Annulée' }
      )
      break
    case 'processing':
      statuses.push(
        { value: 'shipped', label: 'Expédiée' },
        { value: 'cancelled', label: 'Annulée' }
      )
      break
    case 'shipped':
      statuses.push(
        { value: 'delivered', label: 'Livrée' }
      )
      break
  }

  return statuses
})

// Méthodes utilitaires
const formatCurrency = (amount) => {
  if (!amount) return '0 FCFA'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

const handleProductImageError = (event) => {
  event.target.src = '/images/default-product.png'
}

const getOrderStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
  return classes[status] || classes.pending
}

const getOrderStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refunded: 'Remboursée'
  }
  return labels[status] || 'En attente'
}

const getCountryName = (countryCode) => {
  const countries = {
    BJ: 'Bénin',
    NG: 'Nigeria',
    TG: 'Togo',
    GH: 'Ghana',
    CI: 'Côte d\'Ivoire',
    BF: 'Burkina Faso',
    ML: 'Mali',
    NE: 'Niger',
    SN: 'Sénégal',
    FR: 'France',
    US: 'États-Unis',
    CA: 'Canada'
  }
  return countries[countryCode] || countryCode
}

// Actions
const loadOrderData = async () => {
  try {
    loading.value = true
    error.value = ''

    const orderId = route.params.orderId
    order.value = await ordersStore.getOrder(orderId)

    // Initialiser le montant de remboursement avec le total de la commande
    refundAmount.value = order.value.total

  } catch (err) {
    error.value = 'Erreur lors du chargement des détails de la commande'
    console.error('Error loading order:', err)
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async () => {
  if (!newStatus.value) return

  try {
    await ordersStore.updateOrderStatus(order.value.id, newStatus.value)

    // Mettre à jour localement
    order.value.status = newStatus.value
    newStatus.value = ''
    showActionsMenu.value = false

  } catch (err) {
    error.value = 'Erreur lors de la mise à jour du statut'
    console.error('Error updating order status:', err)
  }
}

const confirmCancelOrder = () => {
  cancellationReason.value = ''
  showCancelModal.value = true
  showActionsMenu.value = false
}

const confirmOrderCancellation = async () => {
  try {
    await ordersStore.cancelOrder(order.value.id, {
      reason: cancellationReason.value
    })

    // Mettre à jour localement
    order.value.status = 'cancelled'
    showCancelModal.value = false
    cancellationReason.value = ''

  } catch (err) {
    error.value = 'Erreur lors de l\'annulation de la commande'
    console.error('Error canceling order:', err)
  }
}

const initiateRefund = () => {
  refundAmount.value = order.value.total
  refundReason.value = ''
  showRefundModal.value = true
  showActionsMenu.value = false
}

const confirmRefund = async () => {
  try {
    await ordersStore.refundOrder(order.value.id, {
      amount: refundAmount.value,
      reason: refundReason.value
    })

    // Mettre à jour localement
    order.value.status = 'refunded'
    showRefundModal.value = false
    refundAmount.value = 0
    refundReason.value = ''

  } catch (err) {
    error.value = 'Erreur lors du remboursement'
    console.error('Error refunding order:', err)
  }
}

const duplicateOrder = async () => {
  try {
    const newOrder = await ordersStore.duplicateOrder(order.value.id)

    // Rediriger vers la nouvelle commande
    router.push({
      name: 'customer-order-details',
      params: {
        customerId: route.params.customerId,
        orderId: newOrder.id
      }
    })

  } catch (err) {
    error.value = 'Erreur lors de la duplication de la commande'
    console.error('Error duplicating order:', err)
  }
}

const printOrder = () => {
  const printUrl = `/admin/orders/${order.value.id}/print`
  window.open(printUrl, '_blank')
}

const downloadInvoice = async () => {
  try {
    await ordersStore.downloadInvoice(order.value.id)
  } catch (err) {
    error.value = 'Erreur lors du téléchargement de la facture'
    console.error('Error downloading invoice:', err)
  }
}

const copyTrackingNumber = async () => {
  try {
    await navigator.clipboard.writeText(order.value.tracking_number)
    // Optionnel : afficher un toast de confirmation
  } catch (err) {
    console.error('Error copying tracking number:', err)
  }
}

const sendOrderUpdate = () => {
  // Implémenter l'envoi de mise à jour au client
  router.push({
    name: 'send-order-update',
    params: { orderId: order.value.id }
  })
}

const editOrder = () => {
  router.push({
    name: 'order-edit',
    params: { orderId: order.value.id }
  })
}

const viewCustomer = () => {
  router.push({
    name: 'details-customer',
    params: { customerId: route.params.customerId }
  })
}

const viewAllOrders = () => {
  router.push({
    name: 'customer-orders',
    params: { customerId: route.params.customerId }
  })
}

const goBack = () => {
  router.push({
    name: 'order-lists',
    params: { customerId: route.params.customerId }
  })
}

// Fermer le menu d'actions quand on clique ailleurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showActionsMenu.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadOrderData()
  document.addEventListener('click', handleClickOutside)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Animations personnalisées */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Styles pour les menus dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Style pour le code de suivi */
code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
