<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="6" lg="4" xl="3">
            <!-- Logo -->
            <div class="text-center mb-8">
              <div class="logo-container">
                <v-icon size="48" color="white">mdi-finance</v-icon>
                <h1 class="logo-text">Ascendent</h1>
              </div>
            </div>

            <!-- Auth Card -->
            <v-card elevation="2">
              <slot />
            </v-card>

            <!-- Footer -->
            <div class="text-center mt-4">
              <p class="text-caption text-medium-emphasis">
                &copy; {{ new Date().getFullYear() }} Ascendent. All rights reserved.
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Global Snackbar -->
    <SnackbarContainer />
  </v-app>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 32px;
  font-weight: 600;
  color: white;
  margin: 0;
}
</style>
