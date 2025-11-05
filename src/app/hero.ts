// hero.ts
import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        background: '#F5F5F0',
        primary: {
          DEFAULT: '#1976D2',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#424242',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#4CAF50',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#FFC107',
          foreground: '#000000',
        },
        danger: {
          DEFAULT: '#FF5252',
          foreground: '#ffffff',
        },
      },
    },
  },
}) as any;