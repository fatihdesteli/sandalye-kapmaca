import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sandalyekapmaca.app',
  appName: 'Sandalye Kapmaca',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#282c34',
      showSpinner: false,
    },
  },
};

export default config;
