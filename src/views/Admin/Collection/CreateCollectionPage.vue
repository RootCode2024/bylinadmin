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
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Créer une Collection</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Ajoutez une nouvelle collection à votre catalogue
            </p>
          </div>
          <div class="flex gap-3 mt-4 sm:mt-0">
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

      <!-- Formulaire de création -->
      <div class="max-w-4xl mx-auto">
        <form @submit.prevent="submitForm" class="space-y-8" enctype="multipart/form-data">
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
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors',
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  ]"
                  placeholder="Ex: Collection Printemps 2024"
                  required
                  @input="generateMetaTitle"
                >
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
              </div>

              <!-- Référence -->
              <div>
                <label for="ref" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Référence *
                </label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    id="ref"
                    v-model="form.ref"
                    :class="[
                      'flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors',
                      errors.ref ? 'border-red-500' : 'border-gray-300'
                    ]"
                    placeholder="Ex: COL202401"
                    required
                  >
                  <button
                    type="button"
                    @click="generateReference"
                    class="px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800 transition-colors"
                    title="Générer une référence"
                  >
                    <ArrowPathIcon class="w-4 h-4" />
                  </button>
                </div>
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
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors',
                    errors.theme ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                >
                  <option value="">Sélectionnez un thème</option>
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
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors',
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  ]"
                  placeholder="Décrivez cette collection..."
                ></textarea>
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
              </div>
            </div>
          </div>

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
                  <div v-if="coverImagePreview" class="border rounded-lg p-4">
                    <img :src="coverImagePreview" alt="Aperçu couverture" class="max-h-48 mx-auto rounded-lg">
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
                  <div v-if="bannerImagePreview" class="border rounded-lg p-4">
                    <img :src="bannerImagePreview" alt="Aperçu bannière" class="max-h-48 mx-auto rounded-lg">
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
                  </div>
                </div>
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
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors',
                    errors.season ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                >
                  <option value="">Sélectionnez une saison</option>
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
                <select
                  id="year"
                  v-model="form.year"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors',
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  ]"
                  required
                >
                  <option value="">Sélectionnez une année</option>
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
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
                  v-model.number="form.position"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  placeholder="0"
                >
                <p class="mt-1 text-xs text-gray-500">Plus le nombre est petit, plus la collection apparaît en premier</p>
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
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors',
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
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                >
                <p class="mt-1 text-xs text-gray-500">Laissez vide si la collection n'a pas de date de fin</p>
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
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
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
                  v-model.number="form.max_products_display"
                  min="1"
                  max="200"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  required
                >
              </div>

              <!-- Options d'affichage -->
              <div class="md:col-span-2">
                <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0">
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

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="form.auto_add_new_products"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Ajout automatique des nouveaux produits</span>
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
                <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0">
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

          <!-- SEO -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Optimisation SEO
            </h2>

            <div class="space-y-6">
              <!-- Meta title -->
              <div>
                <label for="meta_title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  v-model="form.meta_title"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  placeholder="Titre pour les moteurs de recherche"
                >
                <p class="mt-1 text-xs text-gray-500">Recommandé: 50-60 caractères</p>
                <p class="mt-1 text-xs text-gray-500" :class="form.meta_title.length > 60 ? 'text-red-500' : 'text-green-500'">
                  {{ form.meta_title.length }} caractères
                </p>
              </div>

              <!-- Meta description -->
              <div>
                <label for="meta_description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  id="meta_description"
                  v-model="form.meta_description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  placeholder="Description pour les moteurs de recherche"
                ></textarea>
                <p class="mt-1 text-xs text-gray-500">Recommandé: 150-160 caractères</p>
                <p class="mt-1 text-xs text-gray-500" :class="form.meta_description.length > 160 ? 'text-red-500' : 'text-green-500'">
                  {{ form.meta_description.length }} caractères
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <router-link
              to="/collections"
              class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors text-center"
            >
              Annuler
            </router-link>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? 'Création en cours...' : 'Créer la collection' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/vue/24/outline'
import api from '@/api/axiosConfig'

const router = useRouter()
const currentPageTitle = ref("Créer une Collection")

// États
const loading = ref(false)
const successMessage = ref(null)
const errorMessage = ref(null)
const errors = ref({})

// Prévisualisations d'images
const coverImagePreview = ref('')
const bannerImagePreview = ref('')

// Fichiers sélectionnés
const coverImageFile = ref(null)
const bannerImageFile = ref(null)

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
  meta_title: '',
  meta_description: '',
  auto_add_new_products: false,
  auto_add_criteria: {}
})

// Années pour le sélecteur
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 6 }, (_, i) => currentYear + i)
})

// Soumission du formulaire
const submitForm = async () => {
  try {
    loading.value = true
    errors.value = {}
    successMessage.value = null
    errorMessage.value = null

    // Validation basique
    if (!form.value.name.trim()) {
      errors.value.name = 'Le nom de la collection est requis'
      loading.value = false
      return
    }

    if (!form.value.ref.trim()) {
      errors.value.ref = 'La référence est requise'
      loading.value = false
      return
    }

    if (!form.value.theme) {
      errors.value.theme = 'Le thème est requis'
      loading.value = false
      return
    }

    if (!form.value.season) {
      errors.value.season = 'La saison est requise'
      loading.value = false
      return
    }

    if (!form.value.year) {
      errors.value.year = 'L\'année est requise'
      loading.value = false
      return
    }

    if (!form.value.start_date) {
      errors.value.start_date = 'La date de début est requise'
      loading.value = false
      return
    }

    // Validation des dates
    if (form.value.end_date && form.value.end_date < form.value.start_date) {
      errors.value.end_date = 'La date de fin ne peut pas être antérieure à la date de début'
      loading.value = false
      return
    }

    // Création FormData pour envoyer les fichiers
    const formData = new FormData()

    // Ajouter tous les champs du formulaire
    Object.keys(form.value).forEach(key => {
      if (key !== 'cover_image' && key !== 'banner_image') {
        // Convertir les booléens en 1/0 pour Laravel
        if (typeof form.value[key] === 'boolean') {
          formData.append(key, form.value[key] ? '1' : '0')
        } else if (form.value[key] !== null && form.value[key] !== undefined) {
          formData.append(key, form.value[key])
        }
      }
    })

    // Ajouter les fichiers s'ils existent
    if (coverImageFile.value) {
      formData.append('cover_image', coverImageFile.value)
    }
    if (bannerImageFile.value) {
      formData.append('banner_image', bannerImageFile.value)
    }

    // Debug: Afficher le contenu de FormData
    console.log('FormData content:')
    for (let [key, value] of formData.entries()) {
      console.log(key + ': ' + value + ' (type: ' + typeof value + ')')
    }

    const response = await api.post('/api/admin/collections', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    console.log('Reponse apres post : ', response)

    if (response?.success) {
      successMessage.value = 'Collection créée avec succès!'

      // Redirection après un délai
      setTimeout(() => {
        router.push('/collections')
      }, 1500)
    } else {
      errorMessage.value = response?.message || 'Erreur lors de la création'
    }

  } catch (error) {
    console.error('Erreur lors de la création:', error)

    if (error.response?.errors) {
      errors.value = error.response.errors
    } else {
      errorMessage.value = error.response?.message || 'Erreur lors de la création de la collection'
    }
  } finally {
    loading.value = false
  }
}

// Générer automatiquement la référence
const generateReference = () => {
  const year = new Date().getFullYear()
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  form.value.ref = `COL${year}${month}${random}`
}

// Références pour les inputs file
const coverInput = ref(null)
const bannerInput = ref(null)

// Méthodes pour la gestion des images
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

  successMessage.value = `Image ${type === 'cover' ? 'de couverture' : 'de bannière'} sélectionnée`
  setTimeout(() => successMessage.value = null, 3000)
}

const removeImage = (type) => {
  if (type === 'cover') {
    coverImageFile.value = null
    coverImagePreview.value = ''
    if (coverInput.value) coverInput.value.value = ''
  } else if (type === 'banner') {
    bannerImageFile.value = null
    bannerImagePreview.value = ''
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

// Générer le meta title à partir du nom
const generateMetaTitle = () => {
  if (form.value.name && !form.value.meta_title) {
    form.value.meta_title = `${form.value.name} - Votre Marque`
  }
}

// Initialisation
onMounted(() => {
  // Générer une référence par défaut
  generateReference()

  // Date de début par défaut : aujourd'hui
  const today = new Date().toISOString().split('T')[0]
  form.value.start_date = today
})

// Watcher pour la date de début
watch(() => form.value.start_date, (newDate) => {
  if (form.value.end_date && form.value.end_date < newDate) {
    form.value.end_date = ''
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Styles pour le drag and drop */
.border-dashed:hover {
  border-color: #3b82f6;
}
</style>
