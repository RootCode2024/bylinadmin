<template>
  <div>
    <div class="flex items-center justify-center min-h-screen">
      <div class="w-full max-w-md">
        <router-link to="/" class="block mb-4">
          <img src="@/assets/images/logo-placeholder.png" alt="Logo" class="mx-auto h-12 w-auto">
        </router-link>
        <h1 class="text-2xl font-bold text-center mb-6">Forgot Password</h1>
        <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow-md">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="email"
              type="email"
              id="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
          </div>
          <button
            type="submit"
            class="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send Reset Link
          </button>
        </form>
        <p class="mt-4 text-center text-sm text-gray-600">
          Remembered your password? <router-link to="/login" class="text-blue-600 hover:text-blue-800">Login</router-link>
        </p>
      </div>
    </div>
    <div class="fixed bottom-0 left-0 right-0 bg-gray-100 text-center py-2">
      <p class="text-sm text-gray-600">© 2023 Your Company Name. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
const router = useRouter();
const { forgotPassword } = useAuth();
const email = ref('');
const handleSubmit = async () => {
  try {
    await forgotPassword(email.value);
    alert('Password reset link sent to your email.');
    router.push('/login');
  } catch (error) {
    console.error('Error sending password reset link:', error);
    alert('Failed to send password reset link. Please try again.');
  }
};
</script>
