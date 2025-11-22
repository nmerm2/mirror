import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image', '@pinia/nuxt', '@nuxtjs/color-mode'],
  css: ['./app/assets/css/main.css'],
  vite: { plugins: [tailwindcss(),], },
  colorMode: {
    classSuffix: ''
  },
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/mirror/' : '/',
  }
})