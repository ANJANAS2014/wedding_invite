import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function copyStaticFiles() {
  const roots = ['assets', 'resized_couple_photos'];
  return {
    name: 'copy-static-files',
    generateBundle() {
      for (const root of roots) {
        const sourceRoot = join(process.cwd(), root);
        const addFiles = (directory: string) => {
          for (const entry of readdirSync(directory)) {
            const sourcePath = join(directory, entry);
            if (statSync(sourcePath).isDirectory()) {
              addFiles(sourcePath);
            } else {
              this.emitFile({
                type: 'asset',
                fileName: relative(process.cwd(), sourcePath).replaceAll('\\', '/'),
                source: readFileSync(sourcePath),
              });
            }
          }
        };
        addFiles(sourceRoot);
      }

      this.emitFile({
        type: 'asset',
        fileName: 'links.html',
        source: readFileSync(join(process.cwd(), 'links.html')),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyStaticFiles()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
