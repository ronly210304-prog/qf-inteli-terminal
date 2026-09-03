import type { Config } from "tailwindcss";

// QF Inteli Terminal design tokens.
// Palette: institutional market-terminal, not a SaaS dashboard.
// Base is near-black/charcoal, text is desaturated white, and the
// three accent colors (green/yellow/cyan) plus one warning color
// (orange) carry all semantic meaning — up/down/neutral/alert.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        term: {
          black: "#050607",       // page background
          charcoal: "#101316",    // panel background
          panel: "#14181C",       // raised panel / card background
          border: "#262B30",      // hairline separators / grid lines
          borderdim: "#1B1F23",   // faint internal dividers
          gray: "#6B7280",        // secondary text
          graydim: "#3F454C",     // disabled / placeholder text
          white: "#E7E9EC",       // primary text
          green: "#4E9E6E",       // gains / positive / bullish
          red: "#C4553F",         // losses / negative / bearish
          yellow: "#C6A344",      // watch / neutral-alert
          cyan: "#4C97A3",        // secondary data / links
          orange: "#C07A3F",      // warnings / high-importance events
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "'JetBrains Mono'",
          "Menlo",
          "Consolas",
          "'Liberation Mono'",
          "monospace",
        ],
      },
      fontSize: {
        micro: ["0.6875rem", { lineHeight: "0.9375rem" }],
        term: ["0.8125rem", { lineHeight: "1.125rem" }],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "2px",
      },
      spacing: {
        px2: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
