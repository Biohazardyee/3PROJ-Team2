import "dotenv/config";

export default {
  expo: {
    name: "projet-supcontent-mobile",
    slug: "melodia",

    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "a961ba89-48ee-4ea9-b8da-8772ef87999f",
      },
    },
  },
};