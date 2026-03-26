<template>
  <button
    class="theme-toggle"
    :class="{ 'is-dark': colorMode.value === 'dark' }"
    @click="toggleColorMode"
    :title="colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <div class="toggle-track">
      <div class="toggle-icons">
        <v-icon size="14" class="icon-sun">mdi-white-balance-sunny</v-icon>
        <v-icon size="14" class="icon-moon">mdi-moon-waning-crescent</v-icon>
      </div>
      <div class="toggle-thumb"></div>
    </div>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped>
.theme-toggle {
  --toggle-width: 56px;
  --toggle-height: 28px;
  --thumb-size: 22px;
  --padding: 3px;

  position: relative;
  width: var(--toggle-width);
  height: var(--toggle-height);
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  outline: none;
}

.toggle-track {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--color-slate-200);
  border-radius: var(--toggle-height);
  transition: background-color var(--transition-base);
}

.is-dark .toggle-track {
  background: var(--color-slate-700);
}

.toggle-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}

.icon-sun {
  color: var(--color-amber-500);
  opacity: 1;
  transition: opacity var(--transition-base);
}

.is-dark .icon-sun {
  opacity: 0.4;
}

.icon-moon {
  color: var(--color-slate-400);
  opacity: 0.4;
  transition: opacity var(--transition-base);
}

.is-dark .icon-moon {
  color: var(--color-amber-400);
  opacity: 1;
}

.toggle-thumb {
  position: absolute;
  top: var(--padding);
  left: var(--padding);
  width: var(--thumb-size);
  height: var(--thumb-size);
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06);
  transition: transform var(--transition-base);
}

.is-dark .toggle-thumb {
  transform: translateX(calc(var(--toggle-width) - var(--thumb-size) - var(--padding) * 2));
  background: var(--color-slate-900);
}

/* Focus state */
.theme-toggle:focus-visible .toggle-track {
  box-shadow: 0 0 0 3px var(--accent-primary);
}

/* Hover state */
.theme-toggle:hover .toggle-thumb {
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.15), 0 2px 4px rgb(0 0 0 / 0.1);
}
</style>
