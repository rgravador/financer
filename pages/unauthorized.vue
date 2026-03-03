<template>
  <div class="unauthorized-container">
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card elevation="2" class="text-center pa-8">
            <v-icon size="80" color="error" class="mb-4">
              mdi-lock-alert
            </v-icon>

            <h1 class="text-h4 mb-4">Access Denied</h1>
            <p class="text-body-1 mb-6">
              You don't have permission to access this page.
            </p>

            <div class="d-flex gap-3 justify-center">
              <v-btn
                color="navy"
                @click="goBack"
              >
                Go Back
              </v-btn>

              <v-btn
                variant="outlined"
                @click="goHome"
              >
                Go Home
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.unauthorized-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}
</style>
