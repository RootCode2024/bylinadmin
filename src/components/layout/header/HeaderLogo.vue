<template>
  <router-link to="/" class="lg:hidden">
    <img class="dark:hidden" src="/logo.png" alt="Logo" />
    <img class="hidden dark:block" src="/logo.png" alt="Logo" />
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
