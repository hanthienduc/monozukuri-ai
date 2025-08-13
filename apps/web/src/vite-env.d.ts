/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_ENABLE_WEBSOCKET: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_PWA: string
  readonly VITE_DEBUG: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_CSP_NONCE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}