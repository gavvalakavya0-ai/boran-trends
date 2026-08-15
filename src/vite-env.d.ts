/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_UPI_ID?: string;
  readonly VITE_MERCHANT_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
