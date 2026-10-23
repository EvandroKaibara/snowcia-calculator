import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' deixa a pasta dist funcionar em qualquer hospedagem estática, na raiz ou em subpasta.
export default defineConfig({ plugins: [react()], base: './' })
