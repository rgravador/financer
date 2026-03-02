<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="6" lg="4" xl="3">
            <!-- Logo -->
            <div class="text-center mb-8">
              <v-img
                src="/logo.png"
                alt="Ascendent"
                max-height="60"
                max-width="200"
                contain
                class="mx-auto"
              />
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
  </v-app>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}
</style>
