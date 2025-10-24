import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agroikemba.representantes',
  appName: 'AgroIkemba Reps',
  webDir: 'dist',
  
  // Hot-reload desabilitado para build nativo
  server: {
    url: undefined, // Build local - app carrega bundle nativo
    cleartext: true,
    androidScheme: 'https'
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
  },
};

export default config;