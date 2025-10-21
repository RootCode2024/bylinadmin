<template>
  <AdminLayout>
    <div class="grid grid-cols-12 gap-6">
      <!-- Header -->
      <div class="col-span-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Profil Administrateur</h1>
            <p class="text-sm text-gray-600 mt-1">Gérez vos informations personnelles et les paramètres de votre compte</p>
          </div>
          <button
            @click="refresh"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
          >
            <p class="flex space-x-3 justify-end"><RefreshCcw class="w-5 h-5" /><span>Refresh</span></p>
          </button>
        </div>
      </div>

      <!-- Colonne gauche - Informations principales -->
      <div class="col-span-12 lg:col-span-8 space-y-6">
        <!-- Carte Informations personnelles -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-8 border-b border-gray-100">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full"></div>
              <h2 class="text-xl font-semibold text-gray-900">Informations personnelles</h2>
            </div>

            <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nom complet -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Nom complet</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Votre nom complet"
                  />
                </div>

                <!-- Téléphone -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+229 01 52 01 04 42"
                  />
                </div>

                <!-- Genre -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Genre</label>
                  <select
                    v-model="form.gender"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Sélectionner</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                  </select>
                </div>

                <!-- Pays -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Pays</label>
                  <select
                    v-model="form.country_code"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="BJ">Bénin</option>
                    <option value="FR">France</option>
                    <option value="SN">Sénégal</option>
                    <option value="CI">Côte d'Ivoire</option>
                  </select>
                </div>

                <!-- Langue -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Langue</label>
                  <select
                    v-model="form.language"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <!-- Fuseau horaire -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Fuseau horaire</label>
                  <select
                    v-model="form.timezone"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="Africa/Porto-Novo">Africa/Porto-Novo</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <!-- Statut du compte -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Statut du compte</label>
                  <div class="flex items-center">
                    <span
                      :class="{
                        'bg-green-100 text-green-800 border-green-200': user.status === 'active',
                        'bg-yellow-100 text-yellow-800 border-yellow-200': user.status === 'pending',
                        'bg-red-100 text-red-800 border-red-200': user.status === 'banned' || user.status === 'suspended'
                      }"
                      class="px-4 py-2 rounded-xl border text-sm font-medium capitalize"
                    >
                      {{ getStatusText(user.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Bio -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  v-model="form.bio"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Décrivez-vous en quelques mots..."
                ></textarea>
                <p class="text-sm text-gray-500">Partagez quelques informations sur vous-même</p>
              </div>

              <button
                type="submit"
                :disabled="isLoadingProfile"
                class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                <span v-if="isLoadingProfile">Mis à jour en cours ...</span>
                <span v-else>Mettre à jour</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Carte Date de naissance -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-8 border-b border-gray-100">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-2 h-8 bg-gradient-to-b from-purple-600 to-purple-700 rounded-full"></div>
              <h2 class="text-xl font-semibold text-gray-900">Date de naissance</h2>
            </div>

            <form @submit.prevent="updateBirthDate" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Date de naissance -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Date de naissance</label>
                  <input
                    v-model="birthDateForm.birth_date"
                    type="date"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <p class="text-sm text-gray-500" v-if="birthDateForm.birth_date">
                    Date actuelle : <span class="font-bold text-black text-lg">{{ formatDateDisplay(birthDateForm.birth_date) }}</span>
                  </p>
                  <p v-if="birthdayInfo" class="text-sm text-purple-600 font-medium">
                    <span v-if="birthdayInfo.is_today">🎉 Joyeux anniversaire !</span>
                    <span v-else>🎂 Prochain anniversaire dans : {{ birthdayInfo.days_remaining }} jour(s)</span>
                    <span class="text-gray-500 text-xs block mt-1">
                      ({{ birthdayInfo.age }} ans le {{ formatDateDisplay(birthdayInfo.next_birthday) }})
                    </span>
                  </p>
                </div>

                <!-- Mot de passe pour confirmation -->
                <div class="space-y-2" v-if="birthDateForm.birth_date && birthDateForm.birth_date !== user.birth_date">
                  <label class="block text-sm font-medium text-gray-700">
                    Confirmez votre mot de passe
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="birthDateForm.password"
                    type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <p class="text-sm text-gray-500">
                    Pour des raisons de sécurité, veuillez confirmer votre mot de passe pour modifier votre date de naissance.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                :disabled="!birthDateForm.birth_date || birthDateForm.birth_date === user.birth_date || !birthDateForm.password || isLoadingBirthDate"
                class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                <span class="" v-if="isLoadingBirthDate">Mis à jour en cours ...</span><span v-else>Mettre à jour</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Carte Email -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-8 border-b border-gray-100">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-2 h-8 bg-gradient-to-b from-green-600 to-green-700 rounded-full"></div>
              <h2 class="text-xl font-semibold text-gray-900">Adresse Email</h2>
            </div>

            <div class="space-y-6">
              <!-- Email actuel -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Email actuel</label>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-gray-700">{{ user.email }}</span>
                  <span
                    v-if="user.email_verified_at"
                    class="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                  >
                    Vérifié
                  </span>
                  <span
                    v-else
                    class="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full"
                  >
                    Non vérifié
                  </span>
                </div>
              </div>

              <!-- Formulaire de changement d'email -->
              <form @submit.prevent="updateEmail" class="space-y-4">
                <!-- Nouvel email -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Nouvel email</label>
                  <input
                    v-model="emailForm.new_email"
                    type="email"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="nouveau@exemple.com"
                    required
                  />
                </div>

                <!-- Confirmation du mot de passe -->
                <div class="space-y-2" v-if="emailForm.new_email && emailForm.new_email !== user.email">
                  <label class="block text-sm font-medium text-gray-700">
                    Confirmez votre mot de passe
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="emailForm.password"
                    type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Entrez votre mot de passe actuel"
                    required
                  />
                  <p class="text-sm text-gray-500">
                    Pour des raisons de sécurité, veuillez confirmer votre mot de passe pour changer votre adresse email.
                  </p>
                </div>

                <button
                  type="submit"
                  :disabled="!emailForm.new_email || emailForm.new_email === user.email || !emailForm.password || isLoadingEmail"
                  class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  <span class="" v-if="isLoadingEmail">Mis à jour en cours ...</span><span v-else>Mettre à jour</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Carte Mot de passe -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-2 h-8 bg-gradient-to-b from-orange-600 to-orange-700 rounded-full"></div>
              <h2 class="text-xl font-semibold text-gray-900">Mot de passe</h2>
            </div>

            <div class="space-y-8">
              <!-- Section Mot de passe -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900">Changer le mot de passe</h3>
                <form @submit.prevent="updatePassword" class="space-y-4">
                  <input
                    v-model="passwordForm.current_password"
                    type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Mot de passe actuel"
                  />
                  <input
                    v-model="passwordForm.new_password"
                    type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nouveau mot de passe"
                  />
                  <input
                    v-model="passwordForm.new_password_confirmation"
                    type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirmer le mot de passe"
                  />
                  <button
                    type="submit"
                    :disabled="isLoadingPassword || (passwordForm.current_password == '') || (passwordForm.new_password == '') || (passwordForm.new_password_confirmation == '')"
                    class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    <span v-if="isLoadingPassword">Mis à jour en cours ...</span>
                    <span v-else>Mettre à jour</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Carte Suppression de compte -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-8 border-b border-gray-100">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-2 h-8 bg-gradient-to-b from-red-600 to-red-700 rounded-full"></div>
              <h2 class="text-xl font-semibold text-gray-900">Suppression de compte</h2>
            </div>

            <div class="space-y-4">
              <p class="text-sm text-gray-600">
                La suppression de votre compte est irréversible. Toutes vos données seront définitivement perdues.
              </p>
              <button
                @click="initDeleteAccount"
                class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
              >
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne droite - Avatar et vérifications -->
      <div class="col-span-12 lg:col-span-4 space-y-6">
        <!-- Carte Avatar -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-2 h-8 bg-gradient-to-b from-purple-600 to-purple-700 rounded-full"></div>
            <h2 class="text-xl font-semibold text-gray-900">Photo de profil</h2>
          </div>

          <div class="flex flex-col items-center">
            <div class="relative mb-6">
              <img
                :src="user.avatar_url || getDefaultImage(user.name)"
                :alt="user.name"
                class="w-32 h-32 rounded-2xl object-cover border-4 border-gray-100 shadow-md"
              />
              <button
                @click="triggerAvatarUpload"
                class="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
              >
                <RotateCw class="w-5 h-5 animate-spin" v-if="isLoadingImage" />
                <ImageUp class="w-5 h-5" v-else />
              </button>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarUpload"
              />
            </div>

            <p class="text-sm text-gray-600 text-center leading-relaxed">
              Cliquez sur l'icône pour changer votre photo de profil<br>
              <span class="text-gray-500">Formats supportés: JPEG, PNG, JPG, GIF, WebP (max 2MB)</span>
            </p>
          </div>
        </div>

        <!-- Carte Vérifications -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-2 h-8 bg-gradient-to-b from-orange-600 to-orange-700 rounded-full"></div>
            <h2 class="text-xl font-semibold text-gray-900">Vérifications</h2>
          </div>

          <div class="space-y-4">
            <!-- Email vérifié -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700">Email vérifié</span>
              </div>
              <div v-if="user.email_verified_at" class="flex items-center text-green-600 font-medium">
                <Check class="w-5 h-5 mr-1" />
                <span class="text-sm">Oui</span>
              </div>
              <div v-else class="flex items-center text-red-600 font-medium">
                <X class="w-5 h-5 mr-1" />
                <span class="text-sm">Non</span>
              </div>
            </div>

            <!-- Téléphone vérifié -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700">Téléphone vérifié</span>
              </div>
              <div v-if="user.phone_verified_at" class="flex items-center text-green-600 font-medium">
                <Check class="w-5 h-5 mr-1" />
                <span class="text-sm">Oui</span>
              </div>
              <div v-else class="flex items-center text-red-600 font-medium">
                <X class="w-5 h-5 mr-1" />
                <span class="text-sm">Non</span>
              </div>
            </div>

            <!-- Date de naissance vérifiée -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700">Date de naissance</span>
              </div>
              <span
                :class="{
                  'text-green-600': user.birth_date_verification_status === 'verified',
                  'text-yellow-600': user.birth_date_verification_status === 'pending',
                  'text-red-600': user.birth_date_verification_status === 'rejected'
                }"
                class="text-sm font-medium capitalize"
              >
                {{ getVerificationStatusText(user.birth_date_verification_status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de suppression de compte -->
    <div v-if="showDeleteModal" class="no-scrollbar fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
      <div class="no-scrollbar w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-900 lg:p-10">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-900">Confirmer la suppression</h3>
        </div>

        <div class="p-6 space-y-6">
          <!-- Étape 1: Confirmation simple -->
          <div v-if="deleteStep === 1">
            <p class="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront définitivement perdues.
            </p>
            <div class="flex gap-3">
              <button
                @click="showDeleteModal = false"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Annuler
              </button>
              <button
                @click="proceedToCaptcha"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
              >
                Continuer
              </button>
            </div>
          </div>

          <!-- Étape 2: CAPTCHA -->
          <div v-if="deleteStep === 2">
            <p class="text-gray-600 mb-4">
              Pour confirmer la suppression, veuillez saisir le code suivant :
            </p>

            <div class="bg-gray-100 p-4 rounded-xl text-center mb-4">
              <div class="text-2xl font-bold tracking-widest text-gray-800 select-none">
                {{ captchaCode }}
              </div>
              <button
                @click="generateCaptcha"
                class="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Regénérer
              </button>
            </div>

            <div class="space-y-3">
              <input
                v-model="captchaInput"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-center uppercase"
                placeholder="Saisissez le code ci-dessus"
                maxlength="6"
              />
              <button
                @click="validateCaptcha"
                :disabled="!captchaInput || captchaInput.length !== 6"
                class="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Valider le code
              </button>
            </div>
          </div>

          <!-- Étape 3: Sélection du nouveau Super Admin (si applicable) -->
          <div v-if="deleteStep === 3">
            <p class="text-gray-600 mb-4">
              Vous êtes actuellement Super Admin. Veuillez sélectionner un nouvel administrateur qui deviendra Super Admin après votre départ.
            </p>

            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                Nouveau Super Admin
              </label>
              <select
                v-model="selectedNewSuperAdmin"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Sélectionner un administrateur</option>
                <option
                  v-for="admin in availableAdmins"
                  :key="admin.id"
                  :value="admin.id"
                >
                  {{ admin.name }} - {{ admin.email }}
                </option>
              </select>

              <div class="flex gap-3 mt-4">
                <button
                  @click="deleteStep = 2"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Retour
                </button>
                <button
                  @click="confirmFinalDeletion"
                  :disabled="!selectedNewSuperAdmin"
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Confirmer la suppression
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notification -->
    <div
      v-if="showToast"
      class="fixed top-28 right-6 p-4 rounded-xl shadow-lg z-50 transition-all duration-300 animate-in slide-in-from-right"
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
import { ref, reactive, onMounted, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import api from '@/api/axiosConfig.js'
import { useAuthStore } from '@/stores/auth'
import { ImageUp, Check, X, RotateCw, RefreshCcw } from 'lucide-vue-next'

const authStore = useAuthStore()

// Réactifs
const user = ref({})
const form = reactive({})
const errors = reactive({})
const isSaving = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const avatarInput = ref()

const isLoadingPassword = ref(false)
const isLoadingEmail = ref(false)
const isLoadingBirthDate = ref(false)
const isLoadingProfile = ref(false)
const isLoadingImage = ref(false)

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const emailForm = reactive({
  new_email: '',
  password: ''
})

const birthDateForm = reactive({
  birth_date: '',
  password: ''
})

// Variables pour la suppression de compte
const showDeleteModal = ref(false)
const deleteStep = ref(1)
const captchaCode = ref('')
const captchaInput = ref('')
const availableAdmins = ref([])
const selectedNewSuperAdmin = ref('')


const refresh = async () => {
  window.location.reload(true)
}

// Fonctions principales
const updateProfile = async () => {
  isLoadingProfile.value = true
  try {
    const { data } = await api.patch('/profile', {
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      bio: form.bio,
      country_code: form.country_code,
      language: form.language,
      timezone: form.timezone,
    })
    showNotification('Informations mises à jour avec succès', 'success')
    user.value = data.user
  } catch (error) {
    console.error(error)
    showNotification('Erreur lors de la mise à jour du profil', 'error')
  } finally {
    isLoadingProfile.value = false
  }
}

const updateBirthDate = async () => {
  isLoadingBirthDate.value = true
  try {
    const response = await api.patch('/profile/birthdate', {
      birth_date: birthDateForm.birth_date,
      password: birthDateForm.password
    })
    console.log('Date de naissance mis à jour : ', response)
    showNotification('Date de naissance mise à jour avec succès', 'success')
    user.value.birth_date = response.user.birth_date
    user.value.birth_date_verification_status = response.user.birth_date_verification_status
  } catch (error) {
    console.error(error)
    showNotification('Erreur lors de la mise à jour de la date de naissance', 'error')
  } finally {
    isLoadingBirthDate.value = false
  }
}

const updateEmail = async () => {
  isLoadingEmail.value = true
  try {
    // Validation
    if (!emailForm.password) {
      showNotification('Veuillez confirmer votre mot de passe', 'error')
      return
    }

    if (emailForm.new_email === user.value.email) {
      showNotification('Le nouvel email doit être différent de l\'email actuel', 'error')
      return
    }

    const response = await api.patch('/profile/email', {
      email: emailForm.new_email,
      password: emailForm.password
    })

    console.log('Response de email change : ', response)

    showNotification('Email mis à jour avec succès. Un email de vérification a été envoyé.', 'success')

    // Réinitialiser le formulaire
    emailForm.new_email = ''
    emailForm.password = ''

    // Mettre à jour l'utilisateur
    user.value.email = response.user.email
    user.value.email_verified_at = null // Réinitialiser la vérification

  } catch (error) {
    console.error(error)

    if (error.response?.data?.message) {
      showNotification(error.response.data.message, 'error')
    } else {
      showNotification('Erreur lors de la mise à jour de l\'email', 'error')
    }
  } finally {
    isLoadingEmail.value = false
  }
}

const updatePassword = async () => {
  isLoadingPassword.value = true
  try {
    const response = await api.patch('/profile/password', {
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
      new_password_confirmation: passwordForm.new_password_confirmation,
    })

    console.log('Profile Password : ', response)
    showNotification('Mot de passe modifié avec succès', 'success')

    // Réinitialiser le formulaire
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.new_password_confirmation = ''

  } catch (error) {
    console.error('Update password error:', error)

    // Gestion améliorée des erreurs
    let errorMessage = 'Erreur lors de la mise à jour du mot de passe'

    if (error.response?.data?.errors) {
      // Extraire les messages d'erreur de validation
      const errors = error.response.data.errors
      errorMessage = Object.values(errors).flat().join(', ')
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Erreur de connexion. Veuillez vérifier votre connexion internet.'
    }

    showNotification(errorMessage, 'error')
  } finally {
    isLoadingPassword.value = false
  }
}

// Fonctions pour la suppression de compte
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaCode.value = result
}

const initDeleteAccount = () => {
  showDeleteModal.value = true
  deleteStep.value = 1
  captchaInput.value = ''
  selectedNewSuperAdmin.value = ''
  generateCaptcha()
}

const proceedToCaptcha = () => {
  deleteStep.value = 2
}

const validateCaptcha = () => {
  if (captchaInput.value.toUpperCase() === captchaCode.value) {
    // Vérifier si l'utilisateur est Super Admin
    if (authStore.isSuperAdmin) {
      loadAvailableAdmins()
      deleteStep.value = 3
    } else {
      confirmFinalDeletion()
    }
  } else {
    showNotification('Code incorrect. Veuillez réessayer.', 'error')
    generateCaptcha()
    captchaInput.value = ''
  }
}

const loadAvailableAdmins = async () => {
  try {
    const response = await api.get('/api/admin/admins')
    console.log('Les administrateurs : ', response)
    availableAdmins.value = response.data.filter(admin =>
      admin.id !== user.value.id
    )
  } catch (error) {
    console.error('Error loading admins:', error)
    showNotification('Erreur lors du chargement des administrateurs', 'error')
  }
}

const confirmFinalDeletion = async () => {
  try {
    const payload = {};

    // Seulement ajouter new_super_admin_id si l'utilisateur est super admin
    if (authStore.isSuperAdmin && selectedNewSuperAdmin.value) {
      payload.new_super_admin_id = selectedNewSuperAdmin.value;
    }

    // Utiliser la bonne URL - supprimer le profil de l'utilisateur connecté
    const response = await api.delete('/api/admin/profile', { data: payload });

    console.log(response)

    showNotification('Compte supprimé avec succès', 'success');
    showDeleteModal.value = false;

    // Rediriger vers la page de connexion
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);

  } catch (error) {
    console.error('Delete account error:', error);

    let errorMessage = 'Erreur lors de la suppression du compte';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      // Correction de la gestion des erreurs
      const errors = error.response.data.errors;
      if (errors && typeof errors === 'object') {
        errorMessage = Object.values(errors).flat().join(', ');
      } else {
        errorMessage = 'Erreur de validation';
      }
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      errorMessage = 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
    }

    showNotification(errorMessage, 'error');

    // Revenir à l'étape 1 en cas d'erreur
    deleteStep.value = 1;
    generateCaptcha();
    captchaInput.value = '';
    selectedNewSuperAdmin.value = '';
  }
}

// Ajoutez cette variable réactive avec les autres réactifs
const birthdayInfo = ref(null);

// Fonction corrigée pour calculer les infos d'anniversaire
const calculateBirthdayInfo = (date) => {
  try {
    if (!date) {
      birthdayInfo.value = null;
      return;
    }

    const birthDate = new Date(date);
    if (isNaN(birthDate.getTime())) {
      birthdayInfo.value = null;
      return;
    }

    const today = new Date();

    // Normaliser les dates (ignorer l'heure)
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const birthDateNormalized = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());

    // Calculer le prochain anniversaire
    const nextBirthday = new Date(
      todayNormalized.getFullYear(),
      birthDateNormalized.getMonth(),
      birthDateNormalized.getDate()
    );

    // Si l'anniversaire est déjà passé cette année, prendre l'année suivante
    if (nextBirthday < todayNormalized) {
      nextBirthday.setFullYear(todayNormalized.getFullYear() + 1);
    }

    // Calculer la différence en jours
    const diffTime = nextBirthday.getTime() - todayNormalized.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculer l'âge
    const age = nextBirthday.getFullYear() - birthDateNormalized.getFullYear();

    birthdayInfo.value = {
      days_remaining: diffDays,
      next_birthday: nextBirthday,
      age: age,
      is_today: diffDays === 0
    };

  } catch (error) {
    console.error('Erreur dans calculateBirthdayInfo:', error);
    birthdayInfo.value = null;
  }
}

// Fonction pour formater l'affichage de la date
const formatDateDisplay = (date) => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erreur dans formatDateDisplay:', error);
    return '';
  }
}

// Charger les données utilisateur
const loadUserData = async () => {
  try {
    const response = await api.get('/api/admin/profile')

    if (response.status === 'success') {
      user.value = response.user

      // Initialiser le formulaire avec les données utilisateur
      Object.assign(form, {
        name: user.value.name || '',
        email: user.value.email || '',
        phone: user.value.phone || '',
        gender: user.value.gender || '',
        bio: user.value.bio || '',
        country_code: user.value.country_code || 'BJ',
        language: user.value.language || 'fr',
        timezone: user.value.timezone || 'Africa/Porto-Novo'
      })

      // Initialiser le formulaire de date de naissance
      birthDateForm.birth_date = user.value.birth_date || ''

      // Calculer les infos d'anniversaire
      calculateBirthdayInfo(user.value.birth_date);
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    showNotification('Erreur lors du chargement des données du profil', 'error')
  }
}

const getDefaultImage = (name) => {
  const initials = name ? name.charAt(0).toUpperCase() : 'U'
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128`
}

// Sauvegarder le profil
// const saveProfile = async () => {
//   isSaving.value = true
//   Object.keys(errors).forEach(key => delete errors[key])

//   try {
//     const response = await api.patch('/profile', form)

//     if (response.status === 'success') {
//       user.value = response.user
//       showNotification('Profil mis à jour avec succès', 'success')
//     }
//   } catch (error) {
//     console.error('Save profile error:', error)

//     if (error.response?.data?.errors) {
//       Object.assign(errors, error.response.data.errors)
//     }

//     showNotification(
//       error.response?.data?.message || 'Erreur lors de la sauvegarde du profil',
//       'error'
//     )
//   } finally {
//     isSaving.value = false
//   }
// }

// Gérer l'upload d'avatar
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = async (event) => {
  isLoadingImage.value = true
  const file = event.target.files[0]
  if (!file) return

  // Validation côté client
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
  const maxSize = 2 * 1024 * 1024 // 2MB

  if (!validTypes.includes(file.type)) {
    showNotification('Format de fichier non supporté. Utilisez JPEG, PNG, JPG, GIF ou WebP', 'error')
    return
  }

  if (file.size > maxSize) {
    showNotification('Le fichier est trop volumineux (max 2MB)', 'error')
    return
  }

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post('/api/admin/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.status === 'success') {
      user.value.avatar_url = response.user.avatar_url
      showNotification('Photo de profil mise à jour avec succès', 'success')
    }

    // Reset l'input file
    event.target.value = ''

  } catch (error) {
    console.error('Upload error:', error)

    let errorMessage = 'Erreur lors de l\'upload de l\'avatar'

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      errorMessage = Object.values(errors).flat().join(', ')
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    showNotification(errorMessage, 'error')
  } finally {
    isLoadingImage.value = false
  }
}

// Utilitaires
const getStatusText = (status) => {
  const statusMap = {
    active: 'Actif',
    pending: 'En attente',
    banned: 'Banni',
    suspended: 'Suspendu'
  }
  return statusMap[status] || status
}

const getVerificationStatusText = (status) => {
  const statusMap = {
    verified: 'Vérifié',
    pending: 'En attente de vérification',
    rejected: 'Rejeté',
    unverified: 'Non vérifié'
  }
  return statusMap[status] || status
}

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
  loadUserData()
})

// Watchers
watch(
  () => emailForm.new_email,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      emailForm.password = ''
    }
  }
)

// Watchers pour la date de naissance
watch(
  () => birthDateForm.birth_date,
  (newDate) => {
    calculateBirthdayInfo(newDate);
  }
);

watch(
  () => user.value.birth_date,
  (newDate) => {
    calculateBirthdayInfo(newDate);
  },
  { immediate: true }
);
</script>
