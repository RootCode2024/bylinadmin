<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <!-- En-tête -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p class="text-gray-600 mt-2">Gérez les paramètres de votre boutique en ligne</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Navigation latérale -->
          <div class="lg:col-span-1">
            <nav class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <ul class="space-y-2">
                <li v-for="item in navigation" :key="item.id">
                  <button
                    @click="activeSection = item.id"
                    :class="[
                      'w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium',
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    ]"
                  >
                    <div class="flex items-center gap-3">
                      <component :is="item.icon" class="w-5 h-5" />
                      <span>{{ item.name }}</span>
                    </div>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <!-- Contenu principal -->
          <div class="lg:col-span-3">
            <!-- Section Général -->
            <div v-if="activeSection === 'general'" class="space-y-6">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full"></div>
                  <h2 class="text-xl font-semibold text-gray-900">Informations de la boutique</h2>
                </div>

                <form @submit.prevent="saveGeneralSettings" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Nom de la boutique *</label>
                      <input
                        v-model="settings.general.storeName"
                        type="text"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ma Boutique"
                        required
                      />
                    </div>

                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Email de contact *</label>
                      <input
                        v-model="settings.general.contactEmail"
                        type="email"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="contact@maboutique.com"
                        required
                      />
                    </div>

                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Téléphone</label>
                      <input
                        v-model="settings.general.phone"
                        type="tel"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="+229 01 23 45 67 89"
                      />
                    </div>

                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Devise *</label>
                      <select
                        v-model="settings.general.currency"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="XOF">FCFA (XOF)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="USD">Dollar US (USD)</option>
                      </select>
                    </div>

                    <div class="space-y-2 md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Adresse</label>
                      <textarea
                        v-model="settings.general.address"
                        rows="3"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Adresse complète de votre boutique"
                      ></textarea>
                    </div>

                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Pays</label>
                      <select
                        v-model="settings.general.country"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="BJ">Bénin</option>
                        <option value="FR">France</option>
                        <option value="SN">Sénégal</option>
                        <option value="CI">Côte d'Ivoire</option>
                      </select>
                    </div>

                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Ville</label>
                      <input
                        v-model="settings.general.city"
                        type="text"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Cotonou"
                      />
                    </div>
                  </div>

                  <div class="flex justify-end">
                    <button
                      type="submit"
                      :disabled="saving"
                      class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2"
                    >
                      <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Section Paiement -->
            <div v-if="activeSection === 'payments'" class="space-y-6">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-2 h-8 bg-gradient-to-b from-green-600 to-green-700 rounded-full"></div>
                  <h2 class="text-xl font-semibold text-gray-900">Méthodes de paiement</h2>
                </div>

                <div class="space-y-6">
                  <!-- Carte Bancaire -->
                  <div class="flex items-center justify-between p-6 border border-gray-200 rounded-2xl">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CreditCard class="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">Paiement par carte</h3>
                        <p class="text-sm text-gray-600">Acceptez les paiements par carte bancaire</p>
                      </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="settings.payments.creditCardEnabled"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <!-- Mobile Money -->
                  <div class="flex items-center justify-between p-6 border border-gray-200 rounded-2xl">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Smartphone class="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">Mobile Money</h3>
                        <p class="text-sm text-gray-600">Paiement par Mobile Money</p>
                      </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="settings.payments.mobileMoneyEnabled"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <!-- Paiement à la livraison -->
                  <div class="flex items-center justify-between p-6 border border-gray-200 rounded-2xl">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Truck class="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">Paiement à la livraison</h3>
                        <p class="text-sm text-gray-600">Le client paie lors de la réception</p>
                      </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="settings.payments.cashOnDeliveryEnabled"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <!-- Virement bancaire -->
                  <div class="flex items-center justify-between p-6 border border-gray-200 rounded-2xl">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Banknote class="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">Virement bancaire</h3>
                        <p class="text-sm text-gray-600">Paiement par virement bancaire</p>
                      </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="settings.payments.bankTransferEnabled"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Configuration Mobile Money -->
              <div v-if="settings.payments.mobileMoneyEnabled" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 class="text-lg font-medium text-gray-900 mb-6">Configuration Mobile Money</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Numéro MTN Mobile Money</label>
                    <input
                      v-model="settings.payments.mtnNumber"
                      type="tel"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+229 97 12 34 56"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Numéro Moov Money</label>
                    <input
                      v-model="settings.payments.moovNumber"
                      type="tel"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+229 67 12 34 56"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Livraison -->
            <div v-if="activeSection === 'shipping'" class="space-y-6">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-2 h-8 bg-gradient-to-b from-orange-600 to-orange-700 rounded-full"></div>
                  <h2 class="text-xl font-semibold text-gray-900">Options de livraison</h2>
                </div>

                <div class="space-y-6">
                  <!-- Livraison standard -->
                  <div class="p-6 border border-gray-200 rounded-2xl">
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Truck class="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 class="font-medium text-gray-900">Livraison standard</h3>
                          <p class="text-sm text-gray-600">Livraison en 3-5 jours ouvrables</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="settings.shipping.standardEnabled"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div v-if="settings.shipping.standardEnabled" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Coût (XOF)</label>
                        <input
                          v-model="settings.shipping.standardCost"
                          type="number"
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="1500"
                        />
                      </div>
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Délai (jours)</label>
                        <input
                          v-model="settings.shipping.standardDays"
                          type="number"
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="3"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Livraison express -->
                  <div class="p-6 border border-gray-200 rounded-2xl">
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <Zap class="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 class="font-medium text-gray-900">Livraison express</h3>
                          <p class="text-sm text-gray-600">Livraison en 24h</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="settings.shipping.expressEnabled"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div v-if="settings.shipping.expressEnabled" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Coût (XOF)</label>
                        <input
                          v-model="settings.shipping.expressCost"
                          type="number"
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="3000"
                        />
                      </div>
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Délai (heures)</label>
                        <input
                          v-model="settings.shipping.expressHours"
                          type="number"
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="24"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Livraison gratuite -->
                  <div class="p-6 border border-gray-200 rounded-2xl">
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Gift class="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 class="font-medium text-gray-900">Livraison gratuite</h3>
                          <p class="text-sm text-gray-600">Offrez la livraison gratuite</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="settings.shipping.freeEnabled"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div v-if="settings.shipping.freeEnabled" class="mt-4">
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Seuil minimum pour livraison gratuite (XOF)</label>
                        <input
                          v-model="settings.shipping.freeThreshold"
                          type="number"
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="25000"
                        />
                        <p class="text-sm text-gray-500">Laisser vide pour toujours gratuit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Notifications -->
            <div v-if="activeSection === 'notifications'" class="space-y-6">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-2 h-8 bg-gradient-to-b from-purple-600 to-purple-700 rounded-full"></div>
                  <h2 class="text-xl font-semibold text-gray-900">Préférences de notification</h2>
                </div>

                <div class="space-y-6">
                  <!-- Notifications email -->
                  <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-900">Notifications par email</h3>

                    <div class="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                      <div>
                        <h4 class="font-medium text-gray-900">Nouvelles commandes</h4>
                        <p class="text-sm text-gray-600">Recevoir un email pour chaque nouvelle commande</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="settings.notifications.email.newOrders"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div class="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                      <div>
                        <h4 class="font-medium text-gray-900">Avis clients</h4>
                        <p class="text-sm text-gray-600">Recevoir un email pour chaque nouvel avis</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="settings.notifications.email.newReviews"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div class="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                      <div>
                        <h4 class="font-medium text-gray-900">Messages clients</h4>
                        <p class="text-sm text-gray-600">Recevoir un email pour chaque nouveau message</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="settings.notifications.email.customerMessages"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>

                  <!-- Notifications push -->
                  <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-900">Notifications push</h3>

                    <div class="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                      <div>
                        <h4 class="font-medium text-gray-900">Alertes importantes</h4>
                        <p class="text-sm text-gray-600">Recevoir des notifications push pour les alertes</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="settings.notifications.push.importantAlerts"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div class="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                      <div>
                        <h4 class="font-medium text-gray-900">Promotions</h4>
                        <p class="text-sm text-gray-600">Recevoir des notifications pour les promotions</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="settings.notifications.push.promotions"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Avancé -->
            <div v-if="activeSection === 'advanced'" class="space-y-6">
              <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full"></div>
                  <h2 class="text-xl font-semibold text-gray-900">Paramètres avancés</h2>
                </div>

                <div class="space-y-6">
                  <!-- Maintenance -->
                  <div class="p-6 border border-gray-200 rounded-2xl">
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <h3 class="font-medium text-gray-900">Mode maintenance</h3>
                        <p class="text-sm text-gray-600">Votre boutique sera inaccessible aux visiteurs</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="settings.advanced.maintenanceMode"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div v-if="settings.advanced.maintenanceMode" class="mt-4 space-y-4">
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Message de maintenance</label>
                        <textarea
                          v-model="settings.advanced.maintenanceMessage"
                          rows="3"
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Notre boutique est en cours de maintenance. Nous serons de retour bientôt !"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Analytics -->
                  <div class="p-6 border border-gray-200 rounded-2xl">
                    <h3 class="font-medium text-gray-900 mb-4">Google Analytics</h3>
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">ID de suivi Google Analytics</label>
                      <input
                        v-model="settings.advanced.googleAnalyticsId"
                        type="text"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  <!-- API -->
                  <div class="p-6 border border-gray-200 rounded-2xl">
                    <h3 class="font-medium text-gray-900 mb-4">Clés API</h3>
                    <div class="space-y-4">
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Clé API Stripe</label>
                        <input
                          v-model="settings.advanced.stripeApiKey"
                          type="password"
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="sk_live_..."
                        />
                      </div>
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Clé API SMS</label>
                        <input
                          v-model="settings.advanced.smsApiKey"
                          type="password"
                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Votre clé API SMS"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notification -->
    <div
      v-if="showToast"
      class="fixed top-6 right-6 p-4 rounded-xl shadow-lg z-50 transition-all duration-300 animate-in slide-in-from-right"
      :class="{
        'bg-green-500 text-white': toastType === 'success',
        'bg-red-500 text-white': toastType === 'error'
      }"
    >
      <div class="flex items-center gap-3">
        <svg v-if="toastType === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span class="font-medium">{{ toastMessage }}</span>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import api from '@/api/axiosConfig.js'
import {
  Settings,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Smartphone,
  Zap,
  Gift,
  Banknote
} from 'lucide-vue-next'

// Navigation
const navigation = [
  { id: 'general', name: 'Général', icon: Settings },
  { id: 'payments', name: 'Paiements', icon: CreditCard },
  { id: 'shipping', name: 'Livraison', icon: Truck },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'advanced', name: 'Avancé', icon: Shield }
]

const activeSection = ref('general')
const saving = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Paramètres par défaut
const settings = reactive({
  general: {
    storeName: '',
    contactEmail: '',
    phone: '',
    currency: 'XOF',
    address: '',
    country: 'BJ',
    city: ''
  },
  payments: {
    creditCardEnabled: false,
    mobileMoneyEnabled: false,
    cashOnDeliveryEnabled: false,
    bankTransferEnabled: false,
    mtnNumber: '',
    moovNumber: ''
  },
  shipping: {
    standardEnabled: true,
    standardCost: 1500,
    standardDays: 3,
    expressEnabled: false,
    expressCost: 3000,
    expressHours: 24,
    freeEnabled: false,
    freeThreshold: 25000
  },
  notifications: {
    email: {
      newOrders: true,
      newReviews: true,
      customerMessages: true
    },
    push: {
      importantAlerts: true,
      promotions: false
    }
  },
  advanced: {
    maintenanceMode: false,
    maintenanceMessage: '',
    googleAnalyticsId: '',
    stripeApiKey: '',
    smsApiKey: ''
  }
})

// Charger les paramètres
const loadSettings = async () => {
  try {
    const response = await api.get('/api/admin/admin/settings')
    if (response.data.status === 'success') {
      Object.assign(settings, response.data.settings)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    showNotification('Erreur lors du chargement des paramètres', 'error')
  }
}

// Sauvegarder les paramètres généraux
const saveGeneralSettings = async () => {
  saving.value = true
  try {
    const response = await api.put('/api/admin/settings/general', settings.general)
    if (response.data.status === 'success') {
      showNotification('Paramètres généraux sauvegardés', 'success')
    }
  } catch (error) {
    console.error('Error saving general settings:', error)
    showNotification('Erreur lors de la sauvegarde', 'error')
  } finally {
    saving.value = false
  }
}

// Sauvegarder les paramètres de paiement
const savePaymentSettings = async () => {
  try {
    const response = await api.put('/api/admin/settings/payments', settings.payments)
    if (response.data.status === 'success') {
      showNotification('Paramètres de paiement sauvegardés', 'success')
    }
  } catch (error) {
    console.error('Error saving payment settings:', error)
    showNotification('Erreur lors de la sauvegarde', 'error')
  }
}

// Sauvegarder les paramètres de livraison
const saveShippingSettings = async () => {
  try {
    const response = await api.put('/api/admin/settings/shipping', settings.shipping)
    if (response.data.status === 'success') {
      showNotification('Paramètres de livraison sauvegardés', 'success')
    }
  } catch (error) {
    console.error('Error saving shipping settings:', error)
    showNotification('Erreur lors de la sauvegarde', 'error')
  }
}

// Sauvegarder les paramètres de notification
const saveNotificationSettings = async () => {
  try {
    const response = await api.put('/api/admin/settings/notifications', settings.notifications)
    if (response.data.status === 'success') {
      showNotification('Paramètres de notification sauvegardés', 'success')
    }
  } catch (error) {
    console.error('Error saving notification settings:', error)
    showNotification('Erreur lors de la sauvegarde', 'error')
  }
}

// Sauvegarder les paramètres avancés
const saveAdvancedSettings = async () => {
  try {
    const response = await api.put('/api/admin/settings/advanced', settings.advanced)
    if (response.data.status === 'success') {
      showNotification('Paramètres avancés sauvegardés', 'success')
    }
  } catch (error) {
    console.error('Error saving advanced settings:', error)
    showNotification('Erreur lors de la sauvegarde', 'error')
  }
}

// Sauvegarder automatiquement quand les paramètres changent
const watchSettings = () => {
  // Général
  Object.keys(settings.general).forEach(key => {
    // Implémentez watch si nécessaire
  })

  // Paiements
  Object.keys(settings.payments).forEach(key => {
    // Implémentez watch si nécessaire
  })
}

// Notification
const showNotification = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

// Cycle de vie
onMounted(() => {
  loadSettings()
  watchSettings()
})
</script>
