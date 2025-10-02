<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="max-w-md w-full bg-white shadow-md rounded-lg p-6">
      <h1 class="text-2xl font-bold text-center mb-4">403 Interdit</h1>
      <p class="text-gray-600 text-center mb-6">Vous n'avez pas la permission d'accéder à cette page.</p>
      <div class="flex justify-center">
        <router-link to="/signin" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Aller à l'Accueil</router-link>
      </div>
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.</p>
      </div>
    </div>
  </div>
  <div class="fixed bottom-0 left-0 right-0 bg-gray-100 text-center py-2">
    <p class="text-sm text-gray-600">© 2025 Votre Nom d'Entreprise. Tous droits réservés.</p>
  </div>
</template>
