import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pool: {
          50: "#eff9ff",
          100: "#def2ff",
          200: "#b6e7ff",
          300: "#75d4ff",
          400: "#2cbeff",
          500: "#06a5f0",
          600: "#0084cd",
          700: "#0069a6",
          800: "#055989",
          900: "#0a4a71",
        },
      },
    },
  },
  plugins: [],
};

export default config;
