/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
      },
      fontFamily: {
        jost: ["Jost_400Regular"],
        "jost-thin": ["Jost_200ExtraLight"],
        "jost-light": ["Jost_300Light"],
        "jost-medium": ["Jost_500Medium"],
      },
    },
  },
  plugins: [],
};
