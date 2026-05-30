import { createLogger, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

const logger = createLogger();
const warn = logger.warn;

logger.warn = (message, options) => {
  if (
    message.includes(
      'Both `rollupOptions` and `rolldownOptions` were specified by "crx:content-scripts" plugin',
    )
  ) {
    return;
  }

  warn(message, options);
};

export default defineConfig({
  customLogger: logger,
  plugins: [react(), tailwindcss(), crx({ manifest })],
});
