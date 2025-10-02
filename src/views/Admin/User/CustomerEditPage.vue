<template>
  <AdminLayout>
    <PageBreadcrumb
      :title="pageTitle"
      :breadcrumbs="breadcrumbs"
    />

    <!-- En-tête de modification -->
    <div class="bg-white rounded-lg shadow mb-6 dark:bg-gray-800">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <img
                v-if="form.avatar_url"
                class="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                :src="form.avatar_url"
                :alt="`Avatar de ${form.name}`"
                @error="handleImageError"
              >
              <div v-else class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-center">
                <span class="text-gray-400" style="font-size: 10px;">Aucune image</span>
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Modifier le client
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mt-1">
                {{ form.name || 'Chargement...' }}
              </p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              @click="goBack"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Annuler
            </button>
            <button
              @click="saveClient"
              :disabled="saving || !isFormValid"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Message d'erreur global -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 dark:bg-red-900/20 dark:border-red-800">
      <div class="flex">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-3 mt-0.5" />
        <div class="text-red-700 dark:text-red-400">
          <h3 class="font-medium">Une erreur s'est produite</h3>
          <p class="text-sm mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">Chargement des données...</span>
    </div>

    <!-- Formulaire principal -->
    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Informations personnelles -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Informations personnelles</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet *
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white',
                    errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  ]"
                  @blur="validateField('name')"
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.name }}</p>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white',
                    errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  ]"
                  @blur="validateField('email')"
                />
                <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.email }}</p>
              </div>

              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white',
                    errors.phone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  ]"
                  @blur="validateField('phone')"
                />
                <p v-if="errors.phone" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.phone }}</p>
              </div>

              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genre
                </label>
                <select
                  id="gender"
                  v-model="form.gender"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Sélectionner</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label for="birth_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de naissance
                </label>
                <input
                  id="birth_date"
                  v-model="form.birth_date"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />

                <!-- Vérification de la date de naissance -->
                <div v-if="form.birth_date" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Statut de vérification
                    </label>
                    <select
                      v-model="form.birth_date_verification_status"
                      class="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                    >
                      <option value="unverified">Non vérifié</option>
                      <option value="verified">Vérifié</option>
                      <option value="rejected">Rejeté</option>
                    </select>
                  </div>

                  <span
                    :class="{
                      'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200': form.birth_date_verification_status === 'unverified',
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': form.birth_date_verification_status === 'verified',
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': form.birth_date_verification_status === 'rejected'
                    }"
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ getBirthDateVerificationLabel(form.birth_date_verification_status) }}
                  </span>

                  <div v-if="form.birth_date_verification_status === 'rejected'" class="mt-3">
                    <label for="birth_date_rejection_reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Raison du rejet
                    </label>
                    <textarea
                      id="birth_date_rejection_reason"
                      v-model="form.birth_date_rejection_reason"
                      rows="2"
                      class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Expliquez pourquoi la date de naissance a été rejetée..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bio -->
            <div class="mt-6">
              <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Biographie
              </label>
              <textarea
                id="bio"
                v-model="form.bio"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Informations supplémentaires sur le client..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Localisation et préférences -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Localisation et préférences</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="country_code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pays
                </label>
                <select
                  id="country_code"
                  v-model="form.country_code"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="BJ">Bénin</option>
                  <option value="NG">Nigeria</option>
                  <option value="TG">Togo</option>
                  <option value="GH">Ghana</option>
                  <option value="CI">Côte d'Ivoire</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="ML">Mali</option>
                  <option value="NE">Niger</option>
                  <option value="SN">Sénégal</option>
                  <option value="FR">France</option>
                  <option value="US">États-Unis</option>
                  <option value="CA">Canada</option>
                </select>
              </div>

              <div>
                <label for="language" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Langue
                </label>
                <select
                  id="language"
                  v-model="form.language"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label for="timezone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuseau horaire
                </label>
                <select
                  id="timezone"
                  v-model="form.timezone"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Africa/Porto-Novo">Africa/Porto-Novo (Bénin)</option>
                  <option value="Africa/Lagos">Africa/Lagos (Nigeria)</option>
                  <option value="Africa/Lome">Africa/Lome (Togo)</option>
                  <option value="Africa/Accra">Africa/Accra (Ghana)</option>
                  <option value="Africa/Abidjan">Africa/Abidjan (Côte d'Ivoire)</option>
                  <option value="Africa/Ouagadougou">Africa/Ouagadougou (Burkina Faso)</option>
                  <option value="Africa/Bamako">Africa/Bamako (Mali)</option>
                  <option value="Africa/Niamey">Africa/Niamey (Niger)</option>
                  <option value="Africa/Dakar">Africa/Dakar (Sénégal)</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Toronto">America/Toronto</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Adresses du client -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Adresses du client</h2>
          </div>
          <div class="p-6">
            <div v-if="clientAddresses && clientAddresses.length > 0" class="space-y-4">
              <div v-for="address in clientAddresses" :key="address.id" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <span
                      :class="{
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': address.type === 'billing',
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': address.type === 'shipping'
                      }"
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ address.type === 'billing' ? 'Facturation' : 'Livraison' }}
                    </span>
                    <span v-if="address.is_default" class="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 text-xs font-semibold rounded-full">
                      Par défaut
                    </span>
                  </div>
                  <button
                    @click="editAddress(address)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Modifier
                  </button>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p class="font-medium text-gray-900 dark:text-white">{{ address.street_line }}</p>
                  <p v-if="address.landmark" class="italic">{{ address.landmark }}</p>
                  <p>{{ address.city }}, {{ getCountryName(address.country_code) }}</p>
                  <p v-if="address.postal_code">{{ address.postal_code }}</p>
                  <p class="font-medium">{{ address.phone }}</p>
                </div>
              </div>
              <button
                @click="addNewAddress"
                class="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                + Ajouter une nouvelle adresse
              </button>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-gray-500 dark:text-gray-400 mb-4">Aucune adresse enregistrée</p>
              <button
                @click="addNewAddress"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Ajouter la première adresse
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar droite -->
      <div class="space-y-6">

        <!-- Statut du compte -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Statut du compte</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  id="status"
                  v-model="form.status"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Actif</option>
                  <option value="pending">En attente</option>
                  <option value="suspended">Suspendu</option>
                  <option value="banned">Banni</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut actuel
                </label>
                <span :class="getStatusClass(form.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusLabel(form.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations système -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Informations système</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Code de parrainage</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                {{ form.referral_code || '-' }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Points fidélité</label>
              <div class="mt-1 flex items-center space-x-2">
                <input
                  v-model.number="form.points_balance"
                  type="number"
                  min="0"
                  class="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <span class="text-sm text-gray-500 dark:text-gray-400">points</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email vérifié</label>
              <div class="mt-1 flex items-center space-x-2">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ form.email_verified_at ? formatDate(form.email_verified_at) : 'Non vérifié' }}
                </p>
                <span
                  :class="form.email_verified_at ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ form.email_verified_at ? 'Vérifié' : 'Non vérifié' }}
                </span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone vérifié</label>
              <div class="mt-1 flex items-center space-x-2">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ form.phone_verified_at ? formatDate(form.phone_verified_at) : 'Non vérifié' }}
                </p>
                <span
                  :class="form.phone_verified_at ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ form.phone_verified_at ? 'Vérifié' : 'Non vérifié' }}
                </span>
              </div>
            </div>

            <div v-if="form.google_id">
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Compte Google</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                Connecté (ID: {{ form.google_id }})
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Date d'inscription</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(form.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="bg-white rounded-lg shadow dark:bg-gray-800">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Actions rapides</h2>
          </div>
          <div class="p-6 space-y-3">
            <button
              @click="resetPassword"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Réinitialiser le mot de passe
            </button>
            <button
              v-if="!form.email_verified_at"
              @click="resendEmailVerification"
              class="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-lg dark:text-blue-300 dark:hover:bg-blue-900/20"
            >
              Renvoyer l'email de vérification
            </button>
            <button
              v-if="!form.phone_verified_at"
              @click="resendPhoneVerification"
              class="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-lg dark:text-blue-300 dark:hover:bg-blue-900/20"
            >
              Renvoyer la vérification SMS
            </button>
            <button
              @click="manageAddresses"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Gérer les adresses
            </button>
            <button
              @click="viewClientDetails"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Voir les détails complets
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Message de succès -->
    <div v-if="showSuccess" class="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
      <div class="flex items-center">
        <CheckCircleIcon class="h-5 w-5 mr-2" />
        <span>Client modifié avec succès!</span>
      </div>
    </div>

    <!-- Modal de confirmation -->
    <Modal v-if="showConfirmModal" @close="closeModal">
      <template #header>
        <div class="flex items-center">
          <div :class="confirmModal.iconClass" class="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center mr-3">
            <component :is="confirmModal.icon" class="h-4 w-4" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ confirmModal.title }}
          </h2>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-300">
            {{ confirmModal.message }}
          </p>

          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              @click="confirmAction"
              :class="confirmModal.actionClass"
              class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white"
            >
              {{ confirmModal.actionText }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import Modal from '@/components/ui/Modal.vue'
import { ExclamationTriangleIcon, CheckCircleIcon, KeyIcon } from '@heroicons/vue/24/outline'
import { useCustomersStore } from '@/stores/customers'

const route = useRoute()
const router = useRouter()
const customersStore = useCustomersStore()

// État local
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const showSuccess = ref(false)
const showConfirmModal = ref(false)
const clientAddresses = ref([])

// Formulaire réactif basé sur le schéma de base de données
const form = reactive({
  id: null,
  name: '',
  email: '',
  phone: '',
  google_id: '',
  birth_date: '',
  birth_date_verification_status: 'unverified',
  birth_date_rejection_reason: '',
  gender: '',
  avatar_url: '',
  bio: '',
  status: 'pending',
  country_code: 'BJ',
  language: 'fr',
  timezone: 'Africa/Porto-Novo',
  referral_code: '',
  points_balance: 0,
  email_verified_at: null,
  phone_verified_at: null,
  created_at: '',
  updated_at: '',
  deleted_at: null
})

const errors = reactive({})

const confirmModal = ref({
  title: '',
  message: '',
  actionText: '',
  actionClass: '',
  iconClass: '',
  icon: null,
  action: null
})

// Computed
const pageTitle = computed(() => {
  return form.name ? `Modifier: ${form.name}` : 'Modifier le client'
})

const breadcrumbs = computed(() => [
  { name: 'Accueil', href: '/' },
  { name: 'Clients', href: '/customers' },
  { name: form.name || 'Modifier', href: '#' }
])

const isFormValid = computed(() => {
  return form.name && form.email && Object.keys(errors).length === 0
})

// Méthodes utilitaires
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    banned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return classes[status] || classes.pending
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Actif',
    pending: 'En attente',
    suspended: 'Suspendu',
    banned: 'Banni'
  }
  return labels[status] || 'En attente'
}

const getBirthDateVerificationLabel = (status) => {
  const labels = {
    unverified: 'Non vérifié',
    verified: 'Vérifié',
    rejected: 'Rejeté'
  }
  return labels[status] || 'Non vérifié'
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

// Validation
const validateField = (fieldName) => {
  switch (fieldName) {
    case 'name':
      if (!form.name.trim()) {
        errors.name = 'Le nom est requis'
      } else if (form.name.length < 2) {
        errors.name = 'Le nom doit contenir au moins 2 caractères'
      } else {
        delete errors.name
      }
      break

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!form.email.trim()) {
        errors.email = 'L\'email est requis'
      } else if (!emailRegex.test(form.email)) {
        errors.email = 'Format d\'email invalide'
      } else {
        delete errors.email
      }
      break

    case 'phone':
      if (form.phone && form.phone.length < 8) {
        errors.phone = 'Numéro de téléphone invalide'
      } else {
        delete errors.phone
      }
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('email')
  validateField('phone')
  return Object.keys(errors).length === 0
}

// Actions principales
const loadClientData = async () => {
  try {
    loading.value = true
    error.value = ''

    const clientId = route.params.customerId
    const client = await customersStore.getCustomer(clientId)

    // Remplir le formulaire avec les données du client
    Object.assign(form, {
      id: client.id,
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      google_id: client.google_id || '',
      birth_date: client.birth_date || '',
      birth_date_verification_status: client.birth_date_verification_status || 'unverified',
      birth_date_rejection_reason: client.birth_date_rejection_reason || '',
      gender: client.gender || '',
      avatar_url: client.avatar_url || '',
      bio: client.bio || '',
      status: client.status || 'pending',
      country_code: client.country_code || 'BJ',
      language: client.language || 'fr',
      timezone: client.timezone || 'Africa/Porto-Novo',
      referral_code: client.referral_code || '',
      points_balance: client.points_balance || 0,
      email_verified_at: client.email_verified_at || null,
      phone_verified_at: client.phone_verified_at || null,
      created_at: client.created_at || '',
      updated_at: client.updated_at || '',
      deleted_at: client.deleted_at || null
    })

    // Charger les adresses du client
    if (client.addresses) {
      clientAddresses.value = client.addresses
    }

  } catch (err) {
    error.value = 'Erreur lors du chargement des données du client'
    console.error('Error loading client:', err)
  } finally {
    loading.value = false
  }
}

const saveClient = async () => {
  if (!validateForm()) {
    return
  }

  try {
    saving.value = true
    error.value = ''

    await customersStore.updateCustomer(form.id, form)

    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      router.push({ name: 'details-customer', params: { customerId: form.id } })
    }, 2000)

  } catch (err) {
    error.value = 'Erreur lors de la sauvegarde des modifications'
    console.error('Error saving client:', err)
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'details-customer', params: { customerId: route.params.customerId } })
}

// Actions rapides
const resetPassword = () => {
  showModal(
    'Réinitialiser le mot de passe',
    'Êtes-vous sûr de vouloir réinitialiser le mot de passe de ce client ? Un nouveau mot de passe temporaire sera envoyé par email.',
    'Réinitialiser',
    'bg-blue-600 hover:bg-blue-700',
    'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    KeyIcon,
    async () => {
      try {
        await customersStore.resetPassword(form.id)
        console.log('Mot de passe réinitialisé avec succès')
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error)
      }
    }
  )
}

const resendEmailVerification = async () => {
  try {
    await customersStore.resendEmailVerification(form.id)
    console.log('Email de vérification envoyé avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error)
  }
}

const resendPhoneVerification = async () => {
  try {
    await customersStore.resendPhoneVerification(form.id)
    console.log('SMS de vérification envoyé avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error)
  }
}

const addNewAddress = () => {
  router.push({ name: 'customer-add-address', params: { customerId: form.id } })
}

const editAddress = (address) => {
  router.push({
    name: 'customer-edit-address',
    params: {
      customerId: form.id,
      addressId: address.id
    }
  })
}

const manageAddresses = () => {
  router.push({ name: 'customer-addresses', params: { customerId: form.id } })
}

const viewClientDetails = () => {
  router.push({ name: 'details-customer', params: { customerId: form.id } })
}

// Gestion des modals
const showModal = (title, message, actionText, actionClass, iconClass, icon, action) => {
  confirmModal.value = {
    title,
    message,
    actionText,
    actionClass,
    iconClass,
    icon,
    action
  }
  showConfirmModal.value = true
}

const closeModal = () => {
  showConfirmModal.value = false
}

const confirmAction = () => {
  if (confirmModal.value.action) {
    confirmModal.value.action()
  }
  closeModal()
}

// Lifecycle
onMounted(() => {
  loadClientData()
})
</script>

<style scoped>
/* Animations personnalisées */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Style responsive pour mobile */
@media (max-width: 640px) {
  .mobile-stack {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
