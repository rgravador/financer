<template>
  <div class="page-header">
    <h1 class="page-title">Tenant Management</h1>
    <p class="page-subtitle">Manage all tenants and their configurations</p>
  </div>

  <div class="placeholder-content">
    <v-icon size="64" color="grey">mdi-office-building</v-icon>
    <h2>Tenants Page</h2>
    <p>This page is under construction.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  color: #6b7280;
}

.placeholder-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.placeholder-content p {
  font-size: 16px;
  margin: 0;
}
</style>
