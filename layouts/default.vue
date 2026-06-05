<template>
  <v-app>
    <!-- Skip to content link (a11y) -->
    <a href="#main-content" class="skip-to-content">Skip to main content</a>

    <!-- Atmospheric Background -->
    <div class="atmosphere" aria-hidden="true">
      <div class="landscape">
        <div class="mountain mountain--1"></div>
        <div class="mountain mountain--2"></div>
        <div class="mountain mountain--3"></div>
      </div>
      <div class="atmo-orb atmo-orb--1"></div>
      <div class="atmo-orb atmo-orb--2"></div>
      <div class="atmo-orb atmo-orb--3"></div>
      <div class="atmo-orb atmo-orb--4"></div>
      <svg class="grain-overlay" width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>

    <AppSidebar v-model="sidebarOpen" />

    <v-main id="main-content" class="app-main">
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
  background: var(--glass-heavy);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
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

/* ===== Atmospheric Background ===== */
.atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
}

/* Only show atmosphere effects in dark mode */
:root.dark .atmosphere {
  opacity: 1;
}

/* Abstract mountain/landscape shapes */
.landscape {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65%;
}

.mountain {
  position: absolute;
  bottom: 0;
  border-radius: 40% 45% 0 0;
}

.mountain--1 {
  width: 60%;
  height: 100%;
  left: -10%;
  background: linear-gradient(180deg,
    rgba(139, 92, 246, 0.18) 0%,
    rgba(99, 102, 241, 0.10) 40%,
    rgba(147, 197, 253, 0.06) 100%
  );
  filter: blur(2px);
}

.mountain--2 {
  width: 55%;
  height: 85%;
  right: -8%;
  background: linear-gradient(180deg,
    rgba(168, 85, 247, 0.14) 0%,
    rgba(129, 140, 248, 0.08) 50%,
    rgba(165, 180, 252, 0.05) 100%
  );
  filter: blur(1px);
}

.mountain--3 {
  width: 40%;
  height: 60%;
  left: 25%;
  background: linear-gradient(180deg,
    rgba(251, 113, 133, 0.08) 0%,
    rgba(196, 181, 253, 0.06) 100%
  );
  border-radius: 35% 50% 0 0;
}

/* Floating color orbs */
.atmo-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  will-change: transform;
}

.atmo-orb--1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(251, 113, 133, 0.25) 0%, transparent 70%);
  top: 5%;
  right: 10%;
  animation: float-a 25s ease-in-out infinite;
}

.atmo-orb--2 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.20) 0%, transparent 70%);
  top: 35%;
  left: -5%;
  animation: float-b 30s ease-in-out infinite;
}

.atmo-orb--3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%);
  bottom: 15%;
  right: 25%;
  animation: float-c 20s ease-in-out infinite;
}

.atmo-orb--4 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 70%);
  top: 60%;
  left: 40%;
  animation: float-d 28s ease-in-out infinite;
}

@keyframes float-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, 20px) scale(1.06); }
  66% { transform: translate(20px, -15px) scale(0.95); }
}

@keyframes float-b {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(40px, -25px) scale(1.08); }
}

@keyframes float-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40% { transform: translate(-25px, -30px) scale(1.05); }
  70% { transform: translate(15px, 15px) scale(0.96); }
}

@keyframes float-d {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-20px, 30px) scale(1.1); }
}

/* Noise grain texture */
.grain-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.04;
  mix-blend-mode: overlay;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .atmo-orb { animation: none; }
}

/* Dark mode: deeper orb colors, lower opacity */
:root.dark .mountain--1 {
  background: linear-gradient(180deg,
    rgba(139, 92, 246, 0.08) 0%,
    rgba(99, 102, 241, 0.04) 40%,
    transparent 100%
  );
}

:root.dark .mountain--2 {
  background: linear-gradient(180deg,
    rgba(168, 85, 247, 0.06) 0%,
    rgba(129, 140, 248, 0.03) 50%,
    transparent 100%
  );
}

:root.dark .mountain--3 {
  background: linear-gradient(180deg,
    rgba(251, 113, 133, 0.04) 0%,
    transparent 100%
  );
}

:root.dark .atmo-orb--1 {
  background: radial-gradient(circle, rgba(251, 113, 133, 0.10) 0%, transparent 70%);
}

:root.dark .atmo-orb--2 {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
}

:root.dark .atmo-orb--3 {
  background: radial-gradient(circle, rgba(34, 211, 238, 0.06) 0%, transparent 70%);
}

:root.dark .atmo-orb--4 {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.05) 0%, transparent 70%);
}

:root.dark .grain-overlay {
  opacity: 0.02;
}

/* ===== Main Content ===== */
.app-main {
  min-height: 100vh;
  background: transparent;
  position: relative;
}

.main-content {
  position: relative;
  z-index: 1;
  padding: 40px 24px 24px;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

/* Offset for floating sidebar (280px width + 16px left margin + 16px gap) */
.v-main {
  padding-left: 312px !important;
  padding-top: 0 !important;
}

@media (max-width: 960px) {
  .main-content {
    padding: 20px 16px;
  }
  .v-main {
    padding-left: 0 !important;
  }
}

@media (max-width: 600px) {
  .main-content {
    padding: 16px 12px;
  }
}
</style>
