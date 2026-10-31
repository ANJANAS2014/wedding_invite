import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// All static assets live in /public and are served & copied to dist as-is:
//   public/images/<section>/...  (cover, backgrounds, gallery, couple, venues)
//   public/audio/…               (background music)
//   public/icons/…               (favicon)
// No custom copy step is needed — remove this comment if you re-add one.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
