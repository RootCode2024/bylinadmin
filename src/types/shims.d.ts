declare module '@/stores/auth' {
  import { DefineStoreOptions } from 'pinia'

  export interface User {
    id: number
    name: string
    email: string
    roles: string[]
  }

  export const useAuthStore: DefineStoreOptions<'auth', any, any, any>
}

// Pour les modules JavaScript
declare module '*.js'

// Pour NodeJS.Timeout
interface Timeout {
  ref(): void
  unref(): void
}

declare global {
  interface Window {
    // Ajoutez ici les propriétés globales window si nécessaire
  }
}
