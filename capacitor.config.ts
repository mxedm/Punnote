import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'con.queercoded.punnote',
  appName: 'punnote',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
