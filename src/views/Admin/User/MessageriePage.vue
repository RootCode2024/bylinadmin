<template>
  <AdminLayout>
    <PageBreadcrumb
      :title="currentPageTitle"
      :breadcrumbs="breadcrumbs"
    />
    <p>Papa</p>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"

const currentPageTitle = ref("Messagerie")


// Breadcrumbs
const breadcrumbs = computed(() => [
  { name: 'Messagerie', href: '#' }
])
</script>