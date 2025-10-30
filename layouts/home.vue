<template>
  <v-layout class="rounded rounded-md border">
    <v-navigation-drawer>
      <v-list nav>
        <v-list-item title="Navigation drawer" link />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar title="Application bar" />

    <v-main class="d-flex align-center justify-center" height="300">
      <v-container>
        <v-sheet
          border="dashed md"
          color="surface-light"
          height="200"
          rounded="lg"
          width="100%"
        />
      </v-container>
    </v-main>
  </v-layout>
</template>
