import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agroikemba.representantes',
  appName: 'AgroIkemba Reps',
  webDir: 'dist',
  
  // Hot-reload para desenvolvimento
  server: {
    url: process.env.NODE_ENV === 'development' 
      ? 'https://c3fd88f5-deed-4c49-874f-a30ae9501862.lovableproject.com?forceHideBadge=true'
      : undefined,
    cleartext: true
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