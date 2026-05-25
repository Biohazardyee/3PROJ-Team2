import "dotenv/config";

export default {
  expo: {
    name: "projet-supcontent-mobile",
    slug: "melodia",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",

    scheme: "projetsupcontentmobile",

    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      supportsTablet: true,
    },

    android: {
      package: "com.biohazardyesorganization.melodia",

      scheme: "projetsupcontentmobile",

      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "projetsupcontentmobile",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],

      config: {
        usesCleartextTraffic: true,
        networkSecurityConfig: "./network_security_config.xml",
      },

      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    androidStatusBar: {
      backgroundColor: "#1C1C28",
      barStyle: "light-content",
      translucent: false,
    },

    androidNavigationBar: {
      backgroundColor: "#1C1C28",
      barStyle: "light-content",
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: ["expo-router", "expo-font", "expo-web-browser"],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,

      router: {},

      eas: {
        projectId: "a961ba89-48ee-4ea9-b8da-8772ef87999f",
      },
    },

    owner: "biohazardyes-organization",
  },
};

console.log("APP CONFIG API URL =", process.env.EXPO_PUBLIC_API_URL);
