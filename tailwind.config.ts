import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "verto_bg": "#111111",
        "verto_border": "#323634",
        "verto_green": "#BDEC65",
        "verto_blue": "#6ACEC4",
        "verto_blue_light": "#80D6AA",
        "verto_green_light": "#A7E57F"
      }
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;