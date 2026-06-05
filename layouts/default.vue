<template>
  <v-app>
    <!-- Skip to content link (a11y) -->
    <a href="#main-content" class="skip-to-content">Skip to main content</a>

    <AppSidebar v-model="sidebarOpen" />
    <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" :sidebar-open="sidebarOpen" />

    <v-main id="main-content" class="app-main">
      <!-- Ambient Background Effects -->
      <div class="bg-effects" aria-hidden="true">
        <!-- Floating orbs -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>

        <!-- SVG grain texture overlay -->
        <svg class="grain-overlay" width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        <!-- Subtle radial glow -->
        <div class="glow glow-top"></div>
        <div class="glow glow-bottom"></div>
      </div>

      <div class="main-content">
        <slot />
      </div>
    </v-main>

    <!-- Global Snackbar -->
    <SnackbarContainer />
  </v-app>
</template>

<script setup lang="ts">
const sidebarOpen = ref(true)
</script>

<style scoped>
.skip-to-content {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: var(--z-skip-link, 2000);
  padding: 12px 24px;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 2px solid var(--accent-primary);
  border-radius: var(--border-radius-sm, 8px);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: top var(--transition-fast, 150ms);
}

.skip-to-content:focus {
  top: 16px;
}

.app-main {
  min-height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color var(--transition-base);
  position: relative;
  overflow: hidden;
}

/* ===== Ambient Background Effects ===== */
.bg-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Floating orbs — cool blue/purple ambient */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.07;
  will-change: transform;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #3B82F6 0%, #6366F1 40%, transparent 70%);
  top: -15%;
  right: -10%;
  animation: float-1 25s ease-in-out infinite;
}

.orb-2 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, #2563EB 0%, #7C3AED 50%, transparent 70%);
  bottom: 5%;
  left: -10%;
  animation: float-2 30s ease-in-out infinite;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #F97316 0%, #F59E0B 40%, transparent 70%);
  top: 45%;
  right: 20%;
  opacity: 0.04;
  animation: float-3 20s ease-in-out infinite;
}

/* Grain texture */
.grain-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.025;
  mix-blend-mode: overlay;
}

/* Radial glows */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
}

.glow-top {
  width: 800px;
  height: 500px;
  background: linear-gradient(135deg, #3B82F6, #6366F1);
  top: -300px;
  right: -200px;
  opacity: 0.06;
}

.glow-bottom {
  width: 600px;
  height: 400px;
  background: linear-gradient(135deg, #7C3AED, #2563EB);
  bottom: -200px;
  left: -100px;
  opacity: 0.04;
}

/* Float animations — slow, dreamy */
@keyframes float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-40px, 30px) scale(1.05); }
  50% { transform: translate(-20px, -20px) scale(0.95); }
  75% { transform: translate(30px, 10px) scale(1.02); }
}

@keyframes float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(50px, -30px) scale(1.08); }
  66% { transform: translate(-30px, 40px) scale(0.94); }
}

@keyframes float-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  20% { transform: translate(30px, -50px) scale(1.1); }
  40% { transform: translate(-40px, -20px) scale(0.9); }
  60% { transform: translate(20px, 40px) scale(1.05); }
  80% { transform: translate(-20px, 10px) scale(0.95); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .orb { animation: none; }
}

/* ===== Main Content ===== */
.main-content {
  position: relative;
  z-index: 1;
  padding: 32px 40px;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

@media (max-width: 960px) {
  .main-content {
    padding: 28px 24px;
  }
}

@media (max-width: 600px) {
  .main-content {
    padding: 20px 16px;
  }
}
</style>
