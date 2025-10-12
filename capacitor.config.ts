import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mawroos.mathquiz',
  appName: 'Math Quiz Generator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
