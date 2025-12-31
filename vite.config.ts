import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { cpSync, existsSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-publico-folder',
      closeBundle() {
        const src = resolve(__dirname, 'Publico');
        const dest = resolve(__dirname, 'dist', 'Publico');

        if (!existsSync(src)) {
          console.warn('⚠️ Pasta "Publico" não encontrada. Nada foi copiado.');
          return;
        }

        try {
          cpSync(src, dest, { recursive: true });
          console.log('✅ Pasta "Publico" copiada com sucesso para dist/Publico');
        } catch (err) {
          console.error('❌ Erro ao copiar a pasta Publico:', err);
        }
      }
    }
  ]
});
