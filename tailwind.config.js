/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        collective: {
          navy: "#050A18",
          obsidian: "#0A0F1E",
          elevated: "#0D1326",
          surface: "#111827",
          gold: "#D4A843",
          teal: "#00D9B5",
          ink: "#F5F5F5",
          silver: "#8B9BAE",
          border: "#1A2540"
        }
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        elevated: "0 24px 80px rgba(0, 0, 0, 0.35)",
        focus: "0 0 0 3px rgba(0, 217, 181, 0.28)"
      },
      keyframes: {
        reveal: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } }
      },
      animation: {
        reveal: "reveal 500ms cubic-bezier(.2,.8,.2,1) both",
        shimmer: "shimmer 1.8s linear infinite"
      }
    }
  },
  plugins: []
};
