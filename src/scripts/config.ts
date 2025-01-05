import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

export const config = {
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY,
  },
  cor: {
    apiKey: process.env.VITE_COR_API_KEY,
    clientSecret: process.env.VITE_COR_CLIENT_SECRET,
  },
  factorial: {
    apiKey: process.env.VITE_FACTORIAL_API_KEY,
  },
};

// Validación de configuración
Object.entries(config).forEach(([service, values]) => {
  Object.entries(values).forEach(([key, value]) => {
    if (!value) {
      throw new Error(`Missing configuration: ${service}.${key}`);
    }
  });
});