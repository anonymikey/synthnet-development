import type { Config } from "tailwindcss";

/**
 * Design tokens live in src/app/globals.css as space-separated RGB channels
 * so Tailwind opacity modifiers (bg-accent/10) keep working.
 */
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: token("ink"),
        surface: token("surface"),
        raised: token("raised"),
        line: token("line"),
        fg: token("fg"),
        muted: token("muted"),
        accent: token("accent"),
        "accent-ink": token("accent-ink"),
        signal: token("signal"),
        success: token("success"),
        warning: token("warning"),
        danger: token("danger"),
        info: token("info"),
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgb(255 255 255 / 0.03) inset, 0 10px 28px -16px rgb(0 0 0 / 0.7)",
        pop: "0 24px 60px -20px rgb(0 0 0 / 0.8)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
