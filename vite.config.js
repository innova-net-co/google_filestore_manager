import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import expressApp from './server/index.js'

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno del archivo .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'express-api-middleware',
        configureServer(server) {
          // Task 2.2: Inyectar la aplicación Express como middleware de Vite
          // Definimos que solo atienda peticiones que empiecen con /api
          server.middlewares.use((req, res, next) => {
            if (req.url.startsWith('/api')) {
              // Marcamos que estamos en entorno VITE para evitar logs duplicados o comportamientos de servidor independiente
              process.env.VITE = 'true';
              expressApp(req, res, next);
            } else {
              next();
            }
          });
        }
      }
    ],
    server: {
      port: 5173,
      // Task 4.3: Eliminamos la configuración de proxy ya que ahora se maneja vía middleware directo
    },
  };
})
