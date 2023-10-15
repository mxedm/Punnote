import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.queercoded.punnote',
  appName: 'punnote',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
  resources: {
    icon: 'assets/logo-dark.png',
    splash: 'assets/splash-dark.png'
  }
};

export default config;
