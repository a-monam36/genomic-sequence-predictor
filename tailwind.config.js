/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bio: {
          bg: "#030712",
          darker: "#010409",
          card: "rgba(13, 23, 42, 0.75)",
          cyan: "#06b6d4",
          neon: "#00f2fe",
          electric: "#38bdf8",
          emerald: "#10b981",
          amber: "#f59e0b",
          coral: "#f43f5e",
          purple: "#a855f7",
          glow: "rgba(0, 242, 254, 0.35)",
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(0, 242, 254, 0.2)',
        'neon-glow': '0 0 25px rgba(0, 242, 254, 0.5)',
        'neon-coral': '0 0 20px rgba(244, 63, 94, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'subtle-float': 'subtleFloat 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.5))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 24px rgba(0, 242, 254, 0.9))' },
        },
        subtleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

