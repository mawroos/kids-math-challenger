import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    
    const env = loadEnv(mode, '.', '');
    
    // Use root base path for mobile builds, otherwise use GitHub Pages path
    const isMobileBuild = process.env.MOBILE_BUILD === 'true';
    
    return {
      base: isMobileBuild ? '/' : '/kids-math-challenger/',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY) 
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
