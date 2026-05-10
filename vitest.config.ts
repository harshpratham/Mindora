import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    'import.meta.env.VITE_ENVIRONMENT': '"test"',
    'import.meta.env.VITE_FUNCTIONS_NAMESPACE': '"make-server-c6b9db5d"',
    'import.meta.env.VITE_API_BASE_URL': '"http://localhost:8787"',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
