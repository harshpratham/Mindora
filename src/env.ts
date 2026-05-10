type RequiredEnv = {
  VITE_ENVIRONMENT: string;
  VITE_FUNCTIONS_NAMESPACE: string;
  VITE_API_BASE_URL: string;
};

function requireEnv(name: keyof RequiredEnv): string {
  const value = import.meta.env[name] ?? process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  environment: requireEnv('VITE_ENVIRONMENT'),
  functionsNamespace: requireEnv('VITE_FUNCTIONS_NAMESPACE'),
  apiBaseUrl: requireEnv('VITE_API_BASE_URL'),
} as const;
