<template>
  <div class="repayments-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-group">
          <h1 class="page-title">Repayments</h1>
          <p class="page-subtitle">
            Track and manage loan repayments
          </p>
        </div>
      </div>
    </div>

    <!-- Coming Soon Placeholder -->
    <div class="coming-soon-container">
      <div class="coming-soon-illustration">
        <v-icon size="80" color="primary">mdi-cash-check</v-icon>
      </div>
      <h3 class="coming-soon-title">Coming Soon</h3>
      <p class="coming-soon-message">
        The repayments management module is currently under development.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_officer'],
})
</script>

<style scoped>
.repayments-page {
  padding: 0;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 36px;
}

.header-content {
  flex: 1;
}

.header-title-group {
  margin-bottom: 16px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  line-height: 1.5;
}

/* Coming Soon */
.coming-soon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.coming-soon-illustration {
  width: 140px;
  height: 140px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.coming-soon-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 12px 0;
}

.coming-soon-message {
  color: rgba(var(--v-theme-on-surface), 0.6);
  max-width: 400px;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
}
</style>
