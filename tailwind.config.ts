import { heroui } from '@heroui/react'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F5F0',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
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
        dark: {
          colors: {
            primary: {
              DEFAULT: '#2196F3',
              foreground: '#ffffff',
            },
            secondary: {
              DEFAULT: '#424242',
              foreground: '#ffffff',
            },
          },
        },
      },
    }) as any,
  ],
}
export default config
