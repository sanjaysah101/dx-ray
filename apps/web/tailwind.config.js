/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#12121a',
        'surface-2': '#1a1a2e',
        border: '#2a2a3e',
        'text-primary': '#e4e4ef',
        'text-muted': '#8888a0',
        cyan: '#00d4ff',
        'dx-green': '#00e676',
        'dx-yellow': '#ffd600',
        'dx-red': '#ff5252',
        'dx-purple': '#b388ff',
        'dx-blue': '#448aff',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
