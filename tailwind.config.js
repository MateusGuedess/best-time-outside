/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Tokens semânticos (decisão 007): o nome descreve o papel, não a cor.
      // Os valores vêm das variáveis CSS em global.css.
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        score: {
          good: "rgb(var(--color-score-good) / <alpha-value>)",
          ok: "rgb(var(--color-score-ok) / <alpha-value>)",
          bad: "rgb(var(--color-score-bad) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
