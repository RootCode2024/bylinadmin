<template>
  <AdminLayout>
    <PageBreadcrumb :title="currentPageTitle" />

    <div class="px-6 py-8 bg-white dark:bg-gray-900 min-h-screen">
      <!-- Messages de succès/erreur -->
      <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center">
          <CheckCircleIcon class="w-5 h-5 text-green-400 mr-3" />
          <p class="text-sm text-green-700">{{ successMessage }}</p>
          <button @click="successMessage = null" class="ml-auto text-green-400 hover:text-green-600">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <ExclamationTriangleIcon class="w-5 h-5 text-red-400 mr-3" />
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
          <button @click="errorMessage = null" class="ml-auto text-red-400 hover:text-red-600">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex flex-col justify-between mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Modifier la Collection</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ collection?.name }}
            </p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
            <router-link
              :to="`/collections/${collectionId}`"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm transition-colors"
            >
              <EyeIcon class="w-5 h-5" />
              Voir les détails
            </router-link>
            <router-link
              to="/collections"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm transition-colors"
            >
              <ArrowLeftIcon class="w-5 h-5" />
              Retour aux collections
            </router-link>
          </div>
        </div>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="flex justify-center py-12">
        <ArrowPathIcon class="w-8 h-8 animate-spin text-blue-600" />
      </div>

      <!-- Formulaire d'édition -->
      <div v-else-if="collection" class="max-w-7xl mx-auto">
        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Images -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Images
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Image de couverture -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image de couverture
                </label>

                <div class="space-y-4">
                  <!-- Aperçu -->
                  <div v-if="coverImagePreview || form.cover_image" class="border rounded-lg p-4 min-h-72">
                    <img
                      :src="coverImagePreview || getFullImageUrl(form.cover_image)"
                      alt="Aperçu couverture"
                      class="max-h-48 mx-auto rounded-lg object-cover"
                    >
                    <button
                      type="button"
                      @click="removeImage('cover')"
                      class="mt-2 w-full px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-800 transition-colors"
                    >
                      Supprimer l'image
                    </button>
                  </div>

                  <!-- Upload -->
                  <div
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-colors hover:border-blue-400"
                    @drop.prevent="handleDrop($event, 'cover')"
                    @dragover.prevent
                  >
                    <input
                      type="file"
                      ref="coverInput"
                      @change="handleFileSelect($event, 'cover')"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      class="hidden"
                    >
                    <div class="text-center">
                      <PhotoIcon class="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <button
                        type="button"
                        @click="openFilePicker('cover')"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        Choisir un fichier
                      </button>
                      <p class="text-xs text-gray-500 mt-1">PNG, JPG, WebP - 5MB max</p>
                      <p class="text-xs text-gray-500">ou glissez-déposez une image</p>
                    </div>
                    <div v-if="uploading.cover" class="mt-2">
                      <div class="flex items-center justify-center space-x-2 text-sm text-blue-600">
                        <ArrowPathIcon class="w-4 h-4 animate-spin" />
                        <span>Upload en cours...</span>
                      </div>
                    </div>
                  </div>

                  <!-- URL alternative -->
                  <div>
                    <p class="text-sm text-gray-500 mb-2">Ou entrez une URL :</p>
                    <input
                      type="text"
                      readonly
                      v-model="form.cover_image"
                      placeholder="https://example.com/cover.jpg"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                    >
                  </div>
                </div>
              </div>

              <!-- Image de bannière -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image de bannière
                </label>

                <div class="space-y-4">
                  <!-- Aperçu -->
                  <div v-if="bannerImagePreview || form.banner_image" class="border rounded-lg p-4 min-h-72">
                    <img
                      :src="bannerImagePreview || getFullImageUrl(form.banner_image)"
                      alt="Aperçu bannière"
                      class="max-h-48 mx-auto rounded-lg object-cover"
                    >
                    <button
                      type="button"
                      @click="removeImage('banner')"
                      class="mt-2 w-full px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-800 transition-colors"
                    >
                      Supprimer l'image
                    </button>
                  </div>

                  <!-- Upload -->
                  <div
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 transition-colors hover:border-blue-400"
                    @drop.prevent="handleDrop($event, 'banner')"
                    @dragover.prevent
                  >
                    <input
                      type="file"
                      ref="bannerInput"
                      @change="handleFileSelect($event, 'banner')"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      class="hidden"
                    >
                    <div class="text-center">
                      <PhotoIcon class="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <button
                        type="button"
                        @click="openFilePicker('banner')"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        Choisir un fichier
                      </button>
                      <p class="text-xs text-gray-500 mt-1">PNG, JPG, WebP - 10MB max</p>
                      <p class="text-xs text-gray-500">ou glissez-déposez une image</p>
                    </div>
                    <div v-if="uploading.banner" class="mt-2">
                      <div class="flex items-center justify-center space-x-2 text-sm text-blue-600">
                        <ArrowPathIcon class="w-4 h-4 animate-spin" />
                        <span>Upload en cours...</span>
                      </div>
                    </div>
                  </div>

                  <!-- URL alternative -->
                  <div>
                    <p class="text-sm text-gray-500 mb-2">Ou entrez une URL :</p>
                    <input
                      type="text"
                      v-model="form.banner_image"
                      readonly
                      placeholder="https://example.com/banner.jpg"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Informations de base -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Informations de base
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nom de la collection -->
              <div class="md:col-span-2">
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de la collection *
                </label>
                <input
                  type="text"
                  id="name"
                  v-model="form.name"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                >
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
              </div>

              <!-- Référence -->
              <div>
                <label for="ref" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Référence *
                </label>
                <input
                  type="text"
                  id="ref"
                  v-model="form.ref"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                    errors.ref ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                >
                <p v-if="errors.ref" class="mt-1 text-sm text-red-600">{{ errors.ref }}</p>
              </div>

              <!-- Thème -->
              <div>
                <label for="theme" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thème *
                </label>
                <select
                  id="theme"
                  v-model="form.theme"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                    errors.theme ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                >
                  <option value="moderne">Moderne</option>
                  <option value="vintage">Vintage</option>
                  <option value="classique">Classique</option>
                  <option value="boheme">Bohème</option>
                  <option value="urbain">Urbain</option>
                  <option value="traditionnel">Traditionnel</option>
                  <option value="floral">Floral</option>
                  <option value="hiver">Hiver</option>
                </select>
                <p v-if="errors.theme" class="mt-1 text-sm text-red-600">{{ errors.theme }}</p>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="4"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  ]"
                ></textarea>
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
              </div>
            </div>
          </div>

          <!-- Période et saison -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Période et saison
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Saison -->
              <div>
                <label for="season" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saison *
                </label>
                <select
                  id="season"
                  v-model="form.season"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                    errors.season ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                >
                  <option value="printemps">Printemps</option>
                  <option value="ete">Été</option>
                  <option value="automne">Automne</option>
                  <option value="hiver">Hiver</option>
                </select>
                <p v-if="errors.season" class="mt-1 text-sm text-red-600">{{ errors.season }}</p>
              </div>

              <!-- Année -->
              <div>
                <label for="year" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Année *
                </label>
                <input
                  type="number"
                  id="year"
                  v-model="form.year"
                  min="2020"
                  max="2030"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                >
                <p v-if="errors.year" class="mt-1 text-sm text-red-600">{{ errors.year }}</p>
              </div>

              <!-- Position -->
              <div>
                <label for="position" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position d'affichage
                </label>
                <input
                  type="number"
                  id="position"
                  v-model="form.position"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
              </div>

              <!-- Date de début -->
              <div>
                <label for="start_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  id="start_date"
                  v-model="form.start_date"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white',
                    errors.start_date ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                >
                <p v-if="errors.start_date" class="mt-1 text-sm text-red-600">{{ errors.start_date }}</p>
              </div>

              <!-- Date de fin -->
              <div>
                <label for="end_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  id="end_date"
                  v-model="form.end_date"
                  :min="form.start_date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
              </div>
            </div>
          </div>

          <!-- Configuration d'affichage -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Configuration d'affichage
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Type de mise en page -->
              <div>
                <label for="layout_type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de mise en page *
                </label>
                <select
                  id="layout_type"
                  v-model="form.layout_type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="grid">Grille</option>
                  <option value="carousel">Carrousel</option>
                  <option value="masonry">Mosaïque</option>
                </select>
              </div>

              <!-- Produits maximum -->
              <div>
                <label for="max_products_display" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Produits maximum à afficher *
                </label>
                <input
                  type="number"
                  id="max_products_display"
                  v-model="form.max_products_display"
                  min="1"
                  max="200"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
              </div>

              <!-- Options d'affichage -->
              <div class="md:col-span-2">
                <div class="flex items-center space-x-6">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="form.show_prices"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Afficher les prix</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="form.show_badges"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Afficher les badges</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Statut et visibilité -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Statut et visibilité
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Statut -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Statut de la collection
                </label>
                <div class="space-y-3">
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="form.is_active"
                      :value="true"
                      class="text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="form.is_active"
                      :value="false"
                      class="text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                  </label>
                </div>
              </div>

              <!-- Visibilité -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Visibilité
                </label>
                <div class="space-y-3">
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="form.is_visible"
                      :value="true"
                      class="text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Visible</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="form.is_visible"
                      :value="false"
                      class="text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Masquée (Brouillon)</span>
                  </label>
                </div>
              </div>

              <!-- Mise en avant -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Mise en avant
                </label>
                <div class="flex items-center space-x-6">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="form.is_featured"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Collection vedette</span>
                  </label>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="form.is_trending"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Collection tendance</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="confirmSingleDelete()"
              class="px-6 py-3 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-800 transition-colors"
            >
              Supprimer la collection
            </button>

            <div class="flex space-x-4">
              <router-link
                to="/collections"
                class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </router-link>
              <button
                type="submit"
                :disabled="updating"
                class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowPathIcon v-if="updating" class="w-4 h-4 mr-2 animate-spin" />
                {{ updating ? 'Mise à jour...' : 'Mettre à jour' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Collection non trouvée -->
      <div v-else class="text-center py-12">
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Collection non trouvée</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          La collection que vous essayez de modifier n'existe pas.
        </p>
        <div class="mt-6">
          <router-link
            to="/collections"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            Retour aux collections
          </router-link>
        </div>
      </div>

      <ConfirmationModal
        v-if="showDeleteModal"
        @confirm="deleteCollection"
        @cancel="closeDeleteModal"
        :title="deleteModalTitle"
        :message="deleteModalMessage"
        :isLoading="isDeleting"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/vue/24/outline'
import api from '@/api/axiosConfig'

const route = useRoute()
const router = useRouter()
const currentPageTitle = ref("Modifier la Collection")

// États
const loading = ref(true)
const updating = ref(false)
const collection = ref(null)
const successMessage = ref(null)
const errorMessage = ref(null)
const errors = ref({})

const showDeleteModal = ref(false)
const closeDeleteModal = () => showDeleteModal.value = false
const deleteModalTitle = ref('Confirmer la suppression')
const deleteModalMessage = ref('Êtes-vous sûr de vouloir supprimer cette collection ? Cette action est irréversible.')
const isDeleting = ref(false)

// Gestion des images
const coverImagePreview = ref('')
const bannerImagePreview = ref('')
const uploading = ref({
  cover: false,
  banner: false
})

// Références pour les inputs file
const coverInput = ref(null)
const bannerInput = ref(null)

// Fichiers sélectionnés
const coverImageFile = ref(null)
const bannerImageFile = ref(null)

// ID de la collection
const collectionId = computed(() => route.params.id)

// Formulaire
const form = ref({
  name: '',
  ref: '',
  description: '',
  theme: '',
  season: '',
  year: new Date().getFullYear(),
  start_date: '',
  end_date: '',
  position: 0,
  layout_type: 'grid',
  max_products_display: 50,
  show_prices: true,
  show_badges: true,
  is_active: true,
  is_visible: true,
  is_featured: false,
  is_trending: false,
  cover_image: '',
  banner_image: ''
})

// Méthodes utilitaires
const getFullImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `http://localhost:8000${path}`
}

// Gestion des images
const openFilePicker = (type) => {
  if (type === 'cover') {
    coverInput.value?.click()
  } else if (type === 'banner') {
    bannerInput.value?.click()
  }
}

const handleFileSelect = (event, type) => {
  const file = event.target.files[0]
  if (file) {
    validateAndProcessImage(file, type)
  }
}

const validateAndProcessImage = (file, type) => {
  // Validation du type de fichier
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    errorMessage.value = 'Veuillez sélectionner une image valide (PNG, JPG, JPEG, WebP)'
    setTimeout(() => errorMessage.value = null, 5000)
    return
  }

  // Validation de la taille (5MB pour couverture, 10MB pour bannière)
  const maxSize = type === 'cover' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size > maxSize) {
    errorMessage.value = `L'image est trop volumineuse. Taille maximum: ${type === 'cover' ? '5MB' : '10MB'}`
    setTimeout(() => errorMessage.value = null, 5000)
    return
  }

  // Stocker le fichier
  if (type === 'cover') {
    coverImageFile.value = file
  } else if (type === 'banner') {
    bannerImageFile.value = file
  }

  // Créer une URL pour la prévisualisation
  const imageUrl = URL.createObjectURL(file)

  if (type === 'cover') {
    coverImagePreview.value = imageUrl
  } else if (type === 'banner') {
    bannerImagePreview.value = imageUrl
  }

  // Effacer l'URL existante si un fichier est sélectionné
  if (type === 'cover') {
    form.value.cover_image = ''
  } else if (type === 'banner') {
    form.value.banner_image = ''
  }

  successMessage.value = `Image ${type === 'cover' ? 'de couverture' : 'de bannière'} sélectionnée`
  setTimeout(() => successMessage.value = null, 3000)
}

const removeImage = (type) => {
  if (type === 'cover') {
    coverImageFile.value = null
    coverImagePreview.value = ''
    form.value.cover_image = ''
    if (coverInput.value) coverInput.value.value = ''
  } else if (type === 'banner') {
    bannerImageFile.value = null
    bannerImagePreview.value = ''
    form.value.banner_image = ''
    if (bannerInput.value) bannerInput.value.value = ''
  }
}

const handleDrop = (event, type) => {
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    validateAndProcessImage(file, type)
  }
}

// Upload des images vers le serveur
const uploadImage = async (file, type) => {
  try {
    uploading.value[type] = true

    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)

    const response = await api.post('/api/admin/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response?.success) {
      return response.url
    }
  } catch (error) {
    console.error(`Erreur upload image ${type}:`, error)
    throw error
  } finally {
    uploading.value[type] = false
  }
}

// Charger la collection
const fetchCollection = async () => {
  try {
    loading.value = true
    const response = await api.get(`/api/admin/collections/${collectionId.value}`)

    console.log('Données de la collection:', response)

    if (response?.success) {
      collection.value = response.data

      // Remplir le formulaire avec les données existantes
      Object.keys(form.value).forEach(key => {
        if (collection.value[key] !== undefined) {
          form.value[key] = collection.value[key]
        }
      })

      // Formater les dates pour l'input date
      if (form.value.start_date) {
        form.value.start_date = new Date(form.value.start_date).toISOString().split('T')[0]
      }
      if (form.value.end_date) {
        form.value.end_date = new Date(form.value.end_date).toISOString().split('T')[0]
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    errorMessage.value = 'Erreur lors du chargement de la collection'
  } finally {
    loading.value = false
  }
}

// Soumission du formulaire
const submitForm = async () => {
  try {
    updating.value = true
    errors.value = {}
    successMessage.value = null
    errorMessage.value = null

    // Upload des images si des fichiers ont été sélectionnés
    if (coverImageFile.value) {
      try {
        const coverUrl = await uploadImage(coverImageFile.value, 'cover')
        form.value.cover_image = coverUrl
      } catch (error) {
        errorMessage.value = 'Erreur lors de l\'upload de l\'image de couverture'
        updating.value = false
        return
      }
    }

    if (bannerImageFile.value) {
      try {
        const bannerUrl = await uploadImage(bannerImageFile.value, 'banner')
        form.value.banner_image = bannerUrl
      } catch (error) {
        errorMessage.value = 'Erreur lors de l\'upload de l\'image de bannière'
        updating.value = false
        return
      }
    }

    const response = await api.put(`/api/admin/collections/${collectionId.value}`, form.value)

    if (response?.success) {
      successMessage.value = 'Collection mise à jour avec succès!'
      // Recharger les données
      await fetchCollection()

      // Réinitialiser les prévisualisations
      coverImagePreview.value = ''
      bannerImagePreview.value = ''
      coverImageFile.value = null
      bannerImageFile.value = null
    } else {
      errorMessage.value = response?.message || 'Erreur lors de la mise à jour'
    }

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)

    if (error.response?.errors) {
      errors.value = error.response.errors
    } else {
      errorMessage.value = error.response?.message || 'Erreur lors de la mise à jour de la collection'
    }
  } finally {
    updating.value = false
  }
}

// Confirmation de suppression
function confirmSingleDelete() {
  showDeleteModal.value = true
}

// Suppression de la collection
const deleteCollection = async () => {
  try {

    isDeleting.value = true

    const response = await api.delete(`/api/admin/collections/${collectionId.value}`)

    if (response?.success) {
      router.push('/collections')
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    errorMessage.value = 'Erreur lors de la suppression de la collection'
  } finally {
    isDeleting.value = false
    closeDeleteModal()
  }
}

// Initialisation
onMounted(() => {
  fetchCollection()
})
</script>
